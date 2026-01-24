// BFF Session Manager (Singleton)
//
// Manages anonymous user sessions with deterministic puzzle challenge-response.
// NOT a real PoW - the goal is obfuscation, not CPU cost.
// TLS fingerprinting is the real anti-bot barrier.
//
// Features:
// - Singleton pattern - shared across all BffApiClient instances
// - Completer pattern - multiple waiters share single session creation
// - Proactive refresh - timer + visibility listener renew before expiration
// - 10 minute TTL with 7 minute proactive refresh
// - Works with both web (memory) and mobile (secure storage)

import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/pow_service.dart';
import '../../config/api_config.dart';
import '../../shared/utils/visibility_detector.dart';

class BffSessionInfo {
  final String sessionToken;
  final int expiresIn; // seconds
  final DateTime createdAt;

  BffSessionInfo({
    required this.sessionToken,
    required this.expiresIn,
    required this.createdAt,
  });

  factory BffSessionInfo.fromJson(Map<String, dynamic> json) {
    return BffSessionInfo(
      sessionToken: json['sessionToken'] as String,
      expiresIn: json['expiresIn'] as int? ?? 600, // Default 10 minutes
      createdAt: DateTime.now(),
    );
  }

  bool get isExpired {
    final expirationTime = createdAt.add(Duration(seconds: expiresIn));
    // Consider expired 2 minutes before actual expiration
    return DateTime.now().isAfter(expirationTime.subtract(const Duration(minutes: 2)));
  }

  DateTime get expiresAt {
    return createdAt.add(Duration(seconds: expiresIn));
  }

  /// Seconds until token is considered expired (with 2 min buffer)
  int get secondsUntilExpired {
    final expirationTime = createdAt.add(Duration(seconds: expiresIn));
    final bufferedExpiration = expirationTime.subtract(const Duration(minutes: 2));
    return bufferedExpiration.difference(DateTime.now()).inSeconds;
  }
}

class BffSessionManager {
  // Singleton instance
  static BffSessionManager? _instance;

  final String bffBaseUrl;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final PoWService _powService = PoWService();
  late final Dio _dio;

  BffSessionInfo? _currentSession;

  // Completer pattern for concurrent waiters
  Completer<String>? _tokenCompleter;

  // Auto-refresh mechanism
  Timer? _refreshTimer;
  StreamSubscription<bool>? _visibilitySubscription;
  bool _autoRefreshStarted = false;

  // Token version for cache invalidation
  int _tokenVersion = 0;

  // Stream controller for token changes
  final StreamController<String> _tokenStreamController =
      StreamController<String>.broadcast();

  static const String _sessionTokenKey = 'bff_session_token';
  static const String _sessionExpiresKey = 'bff_session_expires';

  // Private constructor
  BffSessionManager._internal({required this.bffBaseUrl}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: bffBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );
  }

  // Factory constructor - returns existing instance or creates new one
  factory BffSessionManager({required String bffBaseUrl}) {
    _instance ??= BffSessionManager._internal(bffBaseUrl: bffBaseUrl);
    return _instance!;
  }

  /// Get the singleton instance. Throws if not initialized.
  static BffSessionManager get instance {
    if (_instance == null) {
      throw StateError(
        'BffSessionManager not initialized. Create an instance first with BffSessionManager(bffBaseUrl: url)',
      );
    }
    return _instance!;
  }

  /// Current token version (increments on each refresh)
  int get tokenVersion => _tokenVersion;

  /// Stream that emits new tokens whenever they are refreshed
  Stream<String> get tokenStream => _tokenStreamController.stream;

  /// Get a valid token. Always returns a valid token or throws.
  /// Multiple concurrent callers will wait for the same token creation.
  Future<String> getValidToken() async {
    // If there's already a pending token creation, wait for it
    if (_tokenCompleter != null) {
      if (kDebugMode) print('[Session] Waiting for pending token creation...');
      return _tokenCompleter!.future;
    }

    // If current token is valid, return it immediately
    if (_currentSession != null && !_currentSession!.isExpired) {
      return _currentSession!.sessionToken;
    }

    // Need to create/refresh token - set up completer for concurrent waiters
    _tokenCompleter = Completer<String>();

    try {
      // Try to load from storage first (mobile only)
      await _loadSessionFromStorage();

      // If still invalid, create new session
      if (_currentSession == null || _currentSession!.isExpired) {
        await _createSession();
      }

      final token = _currentSession!.sessionToken;
      _tokenCompleter!.complete(token);
      _tokenStreamController.add(token);

      // Schedule proactive refresh
      _scheduleRefresh();

      return token;
    } catch (e) {
      _tokenCompleter!.completeError(e);
      rethrow;
    } finally {
      _tokenCompleter = null;
    }
  }

  /// Start auto-refresh mechanism (timer + visibility listener).
  /// Call this once after app initialization.
  void startAutoRefresh() {
    if (_autoRefreshStarted) return;
    _autoRefreshStarted = true;

    if (kDebugMode) print('[Session] Starting auto-refresh mechanism');

    // Initialize visibility detector
    VisibilityDetector.instance.initialize();

    // Listen to visibility changes
    _visibilitySubscription = VisibilityDetector.instance.visibilityStream.listen(
      _onVisibilityChange,
    );
  }

  /// Stop auto-refresh mechanism. Call on app dispose.
  void stopAutoRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
    _visibilitySubscription?.cancel();
    _visibilitySubscription = null;
    _autoRefreshStarted = false;

    if (kDebugMode) print('[Session] Stopped auto-refresh mechanism');
  }

  /// Handle visibility change events
  void _onVisibilityChange(bool isVisible) {
    if (!isVisible) {
      // Tab became hidden - cancel timer (it won't run anyway in background)
      _refreshTimer?.cancel();
      _refreshTimer = null;
      if (kDebugMode) print('[Session] Tab hidden, timer cancelled');
      return;
    }

    // Tab became visible
    if (kDebugMode) print('[Session] Tab visible, checking token...');

    // Check if token needs refresh
    if (_currentSession == null || _currentSession!.isExpired) {
      if (kDebugMode) print('[Session] Token expired while hidden, refreshing...');
      // Proactively refresh - don't await, let it happen in background
      _refreshTokenProactively();
    } else {
      // Token still valid, reschedule refresh timer
      _scheduleRefresh();
    }
  }

  /// Schedule proactive token refresh
  void _scheduleRefresh() {
    _refreshTimer?.cancel();

    if (_currentSession == null) return;

    // Calculate time until we should refresh
    final secondsUntilRefresh = _currentSession!.secondsUntilExpired - 60; // 1 min before expiration

    if (secondsUntilRefresh <= 0) {
      // Already need to refresh
      _refreshTokenProactively();
      return;
    }

    if (kDebugMode) {
      print('[Session] Scheduling refresh in ${secondsUntilRefresh}s');
    }

    _refreshTimer = Timer(
      Duration(seconds: secondsUntilRefresh),
      _refreshTokenProactively,
    );
  }

  /// Proactively refresh token (called by timer or visibility change)
  Future<void> _refreshTokenProactively() async {
    // Don't refresh if another refresh is in progress
    if (_tokenCompleter != null) return;

    try {
      if (kDebugMode) print('[Session] Proactive token refresh...');
      await getValidToken(); // This will create new session if needed
      if (kDebugMode) print('[Session] Proactive refresh complete');
    } catch (e) {
      if (kDebugMode) print('[Session] Proactive refresh failed: $e');
      // Don't throw - this is background refresh, errors will be caught on next getValidToken()
    }
  }

  /// Ensure we have a valid session (legacy method for BffApiClient compatibility)
  Future<void> ensureValidSession() async {
    await getValidToken();
  }

  /// Create a new session via puzzle challenge-response
  Future<void> _createSession() async {
    if (kDebugMode) print('[Session] Creating session...');

    // 1. Request challenge (nonce + random type)
    final challengeResp = await _dio.get(ApiConfig.sessionChallengeEndpoint);

    if (challengeResp.statusCode != 200) {
      throw Exception('Failed to get challenge: ${challengeResp.statusCode}');
    }

    final challenge = challengeResp.data as Map<String, dynamic>;
    final nonce = challenge['nonce'] as String;
    final type = challenge['type'] as int;

    if (kDebugMode) {
      print('[Puzzle] Challenge received: type=$type');
    }

    // 2. Solve puzzle according to challenge type (deterministic - instant)
    final startTime = DateTime.now();
    final response = await _powService.solveChallenge(
      nonce: nonce,
      type: type,
    );
    final solveTime = DateTime.now().difference(startTime);

    if (kDebugMode) {
      print('[Puzzle] Solved in ${solveTime.inMilliseconds}ms');
    }

    // 3. Verify response and get session token
    final verifyResp = await _dio.post(
      ApiConfig.sessionVerifyEndpoint,
      data: {
        'nonce': nonce,
        'response': response['response'],
        if (response.containsKey('platform')) 'platform': response['platform'],
        if (response.containsKey('platformProof'))
          'platformProof': response['platformProof'],
      },
    );

    if (verifyResp.statusCode == 200) {
      final data = verifyResp.data as Map<String, dynamic>;
      _currentSession = BffSessionInfo.fromJson(data);
      _tokenVersion++;

      // Store session for mobile
      if (!kIsWeb) {
        await _storage.write(
          key: _sessionTokenKey,
          value: _currentSession!.sessionToken,
        );
        await _storage.write(
          key: _sessionExpiresKey,
          value: _currentSession!.expiresAt.toIso8601String(),
        );
      }

      if (kDebugMode) {
        print('[Session] Session created (expires in ${_currentSession!.expiresIn}s, version $_tokenVersion)');
      }
    } else {
      throw Exception('Failed to verify: ${verifyResp.statusCode} - ${verifyResp.data}');
    }
  }

  /// Load session from storage (mobile only)
  Future<void> _loadSessionFromStorage() async {
    if (kIsWeb) return;

    try {
      final token = await _storage.read(key: _sessionTokenKey);
      final expiresStr = await _storage.read(key: _sessionExpiresKey);

      if (token != null && expiresStr != null) {
        final expiresAt = DateTime.parse(expiresStr);
        final expiresIn = expiresAt.difference(DateTime.now()).inSeconds;

        // Only use stored session if it has positive TTL
        if (expiresIn > 0) {
          _currentSession = BffSessionInfo(
            sessionToken: token,
            expiresIn: expiresIn,
            createdAt: expiresAt.subtract(const Duration(seconds: 600)),
          );

          if (kDebugMode) print('[Session] Loaded session from storage');
        } else {
          if (kDebugMode) print('[Session] Stored session expired, will create new');
        }
      }
    } catch (e) {
      if (kDebugMode) print('[Session] Failed to load session: $e');
    }
  }

  /// Get current session token (legacy method)
  Future<String?> getSessionToken() async {
    try {
      return await getValidToken();
    } catch (e) {
      return null;
    }
  }

  /// Clear session (logout)
  Future<void> clearSession() async {
    _refreshTimer?.cancel();
    _refreshTimer = null;
    _currentSession = null;
    _tokenVersion++;

    if (!kIsWeb) {
      await _storage.delete(key: _sessionTokenKey);
      await _storage.delete(key: _sessionExpiresKey);
    }

    if (kDebugMode) print('[Session] Session cleared');
  }

  /// Check if session is valid
  bool get hasValidSession {
    return _currentSession != null && !_currentSession!.isExpired;
  }

  /// Get cached token synchronously (for backward compatibility)
  /// DEPRECATED: Use getValidToken() instead for robust token handling
  String? get cachedToken => _currentSession?.sessionToken;

  /// Static accessor for cached token (for backward compatibility)
  /// DEPRECATED: Use BffSessionManager.instance.getValidToken() instead
  static String? get staticCachedToken => _instance?.cachedToken;

  /// Dispose resources
  void dispose() {
    stopAutoRefresh();
    _tokenStreamController.close();
    VisibilityDetector.instance.dispose();
  }
}
