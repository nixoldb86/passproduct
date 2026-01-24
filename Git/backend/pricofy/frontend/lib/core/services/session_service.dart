import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

/// Manages anonymous session IDs for unauthenticated users
///
/// Web: Uses volatile memory (lost on page refresh) to incentivize registration
/// Mobile: Uses SharedPreferences for persistence across app restarts
class SessionService {
  static const String _sessionIdKey = 'pricofy_anon_session_id';
  static final _uuid = Uuid();

  // In-memory session ID for web (volatile - lost on refresh)
  static String? _webSessionId;

  /// Get or create anonymous session ID
  /// Web: Returns in-memory ID (new on each page load)
  /// Mobile: Returns persisted ID from SharedPreferences
  Future<String> getOrCreateSessionId() async {
    if (kIsWeb) {
      // Web: volatile memory only (incentivizes registration)
      _webSessionId ??= 'anon_${_uuid.v4()}';
      return _webSessionId!;
    }

    // Mobile: persist in SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    String? sessionId = prefs.getString(_sessionIdKey);

    if (sessionId == null || sessionId.isEmpty) {
      sessionId = 'anon_${_uuid.v4()}';
      await prefs.setString(_sessionIdKey, sessionId);
    }

    return sessionId;
  }

  /// Get existing session ID (returns null if none)
  Future<String?> getSessionId() async {
    if (kIsWeb) {
      return _webSessionId;
    }

    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_sessionIdKey);
  }

  /// Clear session ID (called after user registers/logs in)
  Future<void> clearSessionId() async {
    if (kIsWeb) {
      _webSessionId = null;
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionIdKey);
  }

  /// Check if user has anonymous session
  Future<bool> hasSession() async {
    final sessionId = await getSessionId();
    return sessionId != null && sessionId.isNotEmpty;
  }
}
