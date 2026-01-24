// BFF API Client
//
// Updated API client for BFF architecture
// - Uses BFF endpoints instead of direct API Gateway
// - Manages anonymous sessions via BFF
// - Handles both anonymous and authenticated requests

import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import 'package:http_parser/http_parser.dart';
import 'api_exception.dart';
export 'api_exception.dart';
import 'package:amplify_flutter/amplify_flutter.dart' hide ApiException;
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:flutter/foundation.dart' show kDebugMode, debugPrint;
import '../models/request.dart';
import '../models/user.dart';
import '../../config/api_config.dart' as app_config;
import '../services/session_service.dart';
import 'bff_session_manager.dart';
import 'interceptors/recaptcha_interceptor.dart';

class BffApiClient {
  late final Dio _dio;
  final String _baseUrl;
  late final BffSessionManager _sessionManager;
  final SessionService _anonSessionService = SessionService();
  String? _cognitoToken;
  bool _isAuthenticated = false;

  BffApiClient({required String baseUrl})
      : _baseUrl = baseUrl {
    _sessionManager = BffSessionManager(bffBaseUrl: baseUrl);

    _dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    // Pretty logger in debug mode
    if (kDebugMode) {
      _dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseBody: true,
          responseHeader: false,
          error: true,
          compact: true,
        ),
      );
    }

    // Add reCAPTCHA interceptor
    _dio.interceptors.add(RecaptchaInterceptor());

    // Add authentication interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // ALWAYS ensure we have a valid session (for TLS fingerprint validation)
          try {
            await _sessionManager.ensureValidSession();
            final sessionToken = await _sessionManager.getSessionToken();
            if (sessionToken != null) {
              options.headers['X-Session-Token'] = sessionToken;
              if (kDebugMode) debugPrint('[BFF Client] ✅ Session token added');
            } else {
              if (kDebugMode) debugPrint('[BFF Client] ⚠️ No session token available');
            }
          } catch (e) {
            if (kDebugMode) debugPrint('[BFF Client] ❌ Session error: $e');
            // Reject the request with a clear error
            return handler.reject(
              DioException(
                requestOptions: options,
                error: 'Failed to create session: $e',
                type: DioExceptionType.unknown,
              ),
            );
          }

          // Check if user is authenticated via Cognito
          _isAuthenticated = false;
          try {
            final session = await Amplify.Auth.fetchAuthSession();
            if (session.isSignedIn) {
              final cognitoSession = session as CognitoAuthSession;
              final idToken = cognitoSession.userPoolTokensResult.value.idToken;
              _cognitoToken = idToken.raw;
              options.headers['Authorization'] = 'Bearer $_cognitoToken';
              _isAuthenticated = true;
              if (kDebugMode) debugPrint('[BFF Client] ✅ Cognito JWT added');
            }
          } catch (e) {
            // Expected for anonymous users or when tokens are not available
            if (kDebugMode) debugPrint('[BFF Client] No Cognito session (anonymous user)');
          }

          // For anonymous users, add the anonymous session ID
          if (!_isAuthenticated) {
            final anonSessionId = await _anonSessionService.getOrCreateSessionId();
            options.headers['X-Anon-Session-Id'] = anonSessionId;
            if (kDebugMode) debugPrint('[BFF Client] ✅ Anonymous session ID added: $anonSessionId');
          }

          return handler.next(options);
        },
        onError: (error, handler) async {
          // Log errors but don't retry - let the UI handle it
          if (kDebugMode) {
            print('[BFF Client] Error ${error.response?.statusCode}: ${error.message}');
          }
          return handler.next(error);
        },
      ),
    );
  }

  /// Check if user is currently authenticated
  bool get isAuthenticated => _isAuthenticated;

  /// Submit search request
  /// Uses /public/search for anonymous users, /private/search for authenticated
  /// [userLanguage] is the user's UI language (e.g., "en", "es") for variant translation
  /// [sources] - Optional list of scrapers in format "scraper:COUNTRY" (e.g., ["wallapop:ES", "vinted:FR"]).
  ///             If empty (default), backend uses SSM configuration based on user's country.
  Future<Map<String, dynamic>> submitSearch({
    required String searchText,
    String searchType = 'normal',
    List<String> sources = const [], // Empty = backend decides based on user country
    String? userLanguage,
    String? country, // Explicit country code from LocationProvider
    Map<String, double>? gps, // GPS coords from LocationProvider (postal centroid)
  }) async {
    try {
      // Check auth state before making the request
      await _checkAuthState();

      final endpoint = _isAuthenticated
          ? app_config.ApiConfig.privateSearchEndpoint
          : app_config.ApiConfig.publicSearchEndpoint;

      if (kDebugMode) {
        debugPrint('[BFF Client] Search endpoint: $endpoint (auth: $_isAuthenticated, lang: $userLanguage, country: $country, hasGps: ${gps != null})');
      }

      final data = <String, dynamic>{
        'searchText': searchText,
        'searchType': searchType,
      };

      // Only include sources if explicitly provided (non-empty)
      // Empty sources = backend uses SSM config based on user's country
      if (sources.isNotEmpty) {
        data['sources'] = sources;
      }

      // Add userLanguage if provided (for variant translation)
      if (userLanguage != null && userLanguage.isNotEmpty) {
        data['userLanguage'] = userLanguage;
      }

      // Add country if provided (from LocationProvider)
      if (country != null && country.isNotEmpty) {
        data['country'] = country;
      }

      // Add GPS if provided (postal code centroid from LocationProvider)
      // This allows search-service to skip location-service call
      if (gps != null && gps['lat'] != null && gps['lon'] != null) {
        data['gps'] = gps;
      }

      final response = await _dio.post(endpoint, data: data);

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error starting search');
    }
  }

  /// Check authentication state (refresh _isAuthenticated)
  Future<void> _checkAuthState() async {
    try {
      final session = await Amplify.Auth.fetchAuthSession();
      _isAuthenticated = session.isSignedIn;
    } catch (e) {
      _isAuthenticated = false;
    }
  }

  /// Submit evaluation request with photos
  Future<Map<String, dynamic>> submitEvaluationWithPhotos(
    Map<String, dynamic> formData,
    List<dynamic> photos, // List<XFile>
  ) async {
    try {
      // Build multipart form data
      final formDataToSend = FormData();

      // Add all fields, converting complex types to JSON
      formData.forEach((key, value) {
        if (value != null) {
          String stringValue;
          if (value is String || value is num || value is bool) {
            stringValue = value.toString();
          } else {
            stringValue = jsonEncode(value);
          }
          formDataToSend.fields.add(MapEntry(key, stringValue));
        }
      });

      // Add photos if any
      for (int i = 0; i < photos.length; i++) {
        final photo = photos[i];
        final bytes = await photo.readAsBytes();
        final filename = photo.name;

        formDataToSend.files.add(
          MapEntry(
            'fotos',
            MultipartFile.fromBytes(
              bytes,
              filename: filename,
              contentType: _getMediaType(filename),
            ),
          ),
        );
      }

      final response = await _dio.post(
        app_config.ApiConfig.submitRequestEndpoint,
        data: formDataToSend,
        options: Options(headers: {'Content-Type': 'multipart/form-data'}),
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al enviar la solicitud de evaluación');
    }
  }

  MediaType? _getMediaType(String filename) {
    final extension = filename.split('.').last.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return MediaType('image', 'jpeg');
      case 'png':
        return MediaType('image', 'png');
      case 'gif':
        return MediaType('image', 'gif');
      case 'webp':
        return MediaType('image', 'webp');
      default:
        return null;
    }
  }

  /// Get search results - fetches ALL results for a search
  /// Uses /public/search/results/{id} for anonymous, /private/search/results/{id} for authenticated
  ///
  /// Query parameters:
  /// - [scrapers]: Optional list of scrapers to filter by (for incremental loading)
  /// - [cancelToken]: Optional token to cancel the request
  ///
  /// Note: Filtering, sorting, and pagination are done client-side.
  /// This endpoint returns all results without server-side processing.
  Future<Map<String, dynamic>> getResults(
    String searchId, {
    List<String>? scrapers,
    CancelToken? cancelToken,
  }) async {
    try {
      // Check auth state before making the request
      await _checkAuthState();

      final baseEndpoint = _isAuthenticated
          ? app_config.ApiConfig.privateSearchResultsEndpoint
          : app_config.ApiConfig.publicSearchResultsEndpoint;

      final endpoint = '$baseEndpoint/$searchId';

      // Build query parameters - only scrapers for incremental loading
      final queryParams = <String, dynamic>{};
      if (scrapers != null && scrapers.isNotEmpty) {
        queryParams['scrapers'] = scrapers.join(',');
      }

      if (kDebugMode) {
        debugPrint('[BFF Client] Results endpoint: $endpoint (auth: $_isAuthenticated, scrapers: $scrapers)');
      }

      final response = await _dio.get(
        endpoint,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
        cancelToken: cancelToken,
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) {
        rethrow; // Let caller handle cancellation
      }
      throw _handleDioError(e, 'Error al obtener los resultados');
    }
  }

  /// Get search status (lightweight polling for scraper progress)
  /// Returns scraper progress without full results - optimized for polling
  /// [cancelToken] can be used to cancel the request (for polling cancellation)
  Future<Map<String, dynamic>> getStatus(String searchId, {CancelToken? cancelToken}) async {
    try {
      await _checkAuthState();

      final baseEndpoint = _isAuthenticated
          ? app_config.ApiConfig.privateSearchStatusEndpoint
          : app_config.ApiConfig.publicSearchStatusEndpoint;

      final endpoint = '$baseEndpoint/$searchId';

      if (kDebugMode) {
        debugPrint('[BFF Client] Status endpoint: $endpoint (auth: $_isAuthenticated)');
      }

      final response = await _dio.get(endpoint, cancelToken: cancelToken);

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) {
        rethrow; // Let caller handle cancellation
      }
      throw _handleDioError(e, 'Error al obtener el estado de la búsqueda');
    }
  }

  /// Get search history
  /// Uses /public/search/history (limited to 10) for anonymous
  /// Uses /private/search/history (full history with pagination) for authenticated
  Future<Map<String, dynamic>> getSearchHistory({int limit = 20, String? cursor}) async {
    try {
      await _checkAuthState();

      final endpoint = _isAuthenticated
          ? app_config.ApiConfig.privateSearchHistoryEndpoint
          : app_config.ApiConfig.publicSearchHistoryEndpoint;

      // Anonymous users are limited to 10 results max (enforced by backend too)
      final effectiveLimit = _isAuthenticated ? limit : (limit > 10 ? 10 : limit);

      if (kDebugMode) {
        debugPrint('[BFF Client] History endpoint: $endpoint (auth: $_isAuthenticated, limit: $effectiveLimit)');
      }

      final response = await _dio.get(
        endpoint,
        queryParameters: {
          'limit': effectiveLimit,
          // cursor only for authenticated users (pagination)
          if (cursor != null && _isAuthenticated) 'cursor': cursor,
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener el historial de búsquedas');
    }
  }

  /// Get user profile (authenticated)
  Future<User> getUserProfile() async {
    try {
      final response = await _dio.get(app_config.ApiConfig.userProfileEndpoint);
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener el perfil');
    }
  }

  /// Update user profile (authenticated)
  Future<User> updateUserProfile(Map<String, dynamic> data) async {
    try {
      final response = await _dio.put(
        app_config.ApiConfig.userProfileEndpoint,
        data: data,
      );
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al actualizar el perfil');
    }
  }

  /// Get user evaluations (authenticated)
  Future<List<dynamic>> getUserEvaluations() async {
    try {
      final response = await _dio.get(app_config.ApiConfig.userEvaluationsEndpoint);
      return response.data['evaluations'] as List<dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener las evaluaciones');
    }
  }

  /// Submit contact form
  Future<Map<String, dynamic>> submitContact({
    required String nombre,
    required String email,
    required String telefono,
    required String comentario,
  }) async {
    try {
      final response = await _dio.post(
        app_config.ApiConfig.contactEndpoint,
        data: {
          'nombre': nombre,
          'email': email,
          'telefono': telefono,
          'comentario': comentario,
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al enviar el formulario de contacto');
    }
  }

  /// Handle Dio errors and extract error code + message from BFF response
  ///
  /// BFF response format: { error: { code: "ERROR_CODE", message: "debug message" } }
  /// - code: Used for i18n translation in UI
  /// - message: Technical message for debugging (logged to console)
  ApiException _handleDioError(DioException e, String defaultMessage) {
    final statusCode = e.response?.statusCode;

    // Try to extract error from BFF response format: { error: { code, message } }
    if (e.response?.data != null) {
      final data = e.response!.data;
      if (data is Map<String, dynamic>) {
        final errorObj = data['error'];

        // New format: { error: { code, message } }
        if (errorObj is Map<String, dynamic>) {
          final code = errorObj['code'] as String? ?? 'INTERNAL_ERROR';
          final message = errorObj['message'] as String? ?? defaultMessage;

          // Log debug message to console
          if (kDebugMode) {
            debugPrint('[BFF Error] $code: $message');
          }

          return ApiException(
            message: message,
            code: code,
            statusCode: statusCode,
          );
        }

        // Legacy format: { error: "message" } or { code: "X", message: "Y" }
        final legacyCode = data['code'] as String?;
        final legacyError = data['error'] as String?;
        final legacyMessage = data['message'] as String?;

        if (legacyCode != null || legacyError != null) {
          return ApiException(
            message: legacyMessage ?? legacyError ?? defaultMessage,
            code: legacyCode ?? _statusCodeToErrorCode(statusCode),
            statusCode: statusCode,
          );
        }
      }
    }

    // Handle connection/timeout errors
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return ApiException(
        message: 'Connection timeout',
        code: 'TIMEOUT',
        statusCode: 408,
      );
    }
    if (e.type == DioExceptionType.connectionError) {
      return ApiException(
        message: 'Connection error',
        code: 'CONNECTION_ERROR',
        statusCode: null,
      );
    }

    // Fallback: use status code to determine error code
    return ApiException(
      message: defaultMessage,
      code: _statusCodeToErrorCode(statusCode),
      statusCode: statusCode,
    );
  }

  /// Convert HTTP status code to standardized error code
  String _statusCodeToErrorCode(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'RATE_LIMITED';
      case 500:
        return 'INTERNAL_ERROR';
      case 502:
      case 503:
      case 504:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'INTERNAL_ERROR';
    }
  }

  /// Detect country from IP
  Future<Map<String, dynamic>> detectCountry() async {
    try {
      final response = await _dio.get(app_config.ApiConfig.detectCountryEndpoint);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al detectar el país');
    }
  }

  /// Detect location from IP and optional GPS coordinates
  ///
  /// If GPS coordinates are provided (from browser geolocation), the backend
  /// will use them to get the nearest postal code centroid.
  /// Otherwise, it uses IP-based geolocation.
  ///
  /// Returns location data including:
  /// - coords: { lat, lon } - postal code centroid
  /// - postalCode: nearest postal code
  /// - municipality: city name
  /// - countryCode: ISO 3166-1 alpha-2
  /// - source: 'postal_centroid' | 'capital_fallback' | 'ip_approximate'
  Future<Map<String, dynamic>> detectLocation({
    double? lat,
    double? lon,
  }) async {
    try {
      // Use POST to send optional GPS in body
      final Map<String, dynamic> body = {};
      if (lat != null && lon != null) {
        body['lat'] = lat;
        body['lon'] = lon;
      }

      final response = await _dio.post(
        app_config.ApiConfig.detectLocationEndpoint,
        data: body.isNotEmpty ? body : null,
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error detecting location');
    }
  }

  /// Clear session (logout)
  Future<void> clearSession() async {
    await _sessionManager.clearSession();
    _cognitoToken = null;
  }

  // ========================================
  // Profile methods (aliases for compatibility)
  // ========================================

  /// Get profile (alias for getUserProfile)
  Future<User> getProfile() async {
    return getUserProfile();
  }

  /// Update profile with named parameters
  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
  }) async {
    final data = <String, dynamic>{};
    if (firstName != null) data['firstName'] = firstName;
    if (lastName != null) data['lastName'] = lastName;
    if (phone != null) data['phone'] = phone;
    return updateUserProfile(data);
  }

  // ========================================
  // Evaluation methods
  // ========================================

  /// Get my evaluations (authenticated)
  Future<List<Request>> getMyEvaluations() async {
    try {
      final response = await _dio.get(app_config.ApiConfig.userEvaluationsEndpoint);
      final list = response.data['evaluations'] as List<dynamic>;
      return list.map((json) => Request.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener mis evaluaciones');
    }
  }

  /// Get evaluation detail
  Future<Map<String, dynamic>> getEvaluationDetail(String evaluationId) async {
    try {
      final response = await _dio.get('${app_config.ApiConfig.userEvaluationsEndpoint}/$evaluationId');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener el detalle de la evaluación');
    }
  }

  // ========================================
  // Auth methods
  // ========================================

  /// Initialize Login (Unified Login/Signup)
  /// Creates user in Cognito if doesn't exist, validates email
  /// Note: reCAPTCHA token is automatically added by RecaptchaInterceptor
  Future<Map<String, dynamic>> initLogin(String email) async {
    try {
      final response = await _dio.post(
        '/auth/init-login',
        data: {'email': email},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al inicializar login');
    }
  }

  /// Send verification code
  /// Initiates Cognito custom auth flow and sends code via email
  /// Returns session token needed for verifyCode
  /// [language] is the user's UI language code for email localization (e.g., "es", "en")
  /// Note: reCAPTCHA token is automatically added by RecaptchaInterceptor
  Future<Map<String, dynamic>> sendCode(String email, {String? language}) async {
    try {
      final response = await _dio.post(
        '/auth/send-code',
        data: {
          'email': email,
          if (language != null) 'language': language,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al enviar código');
    }
  }

  /// Verify code and get JWT tokens
  /// Returns access, id, and refresh tokens on success
  /// Note: reCAPTCHA token is automatically added by RecaptchaInterceptor
  Future<Map<String, dynamic>> verifyCode(String email, String code, String session) async {
    try {
      final response = await _dio.post(
        '/auth/verify-code',
        data: {
          'email': email,
          'code': code,
          'session': session,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al verificar código');
    }
  }

  // ========================================
  // Admin methods (requires admin group)
  // ========================================

  /// Get all solicitudes (admin only)
  Future<List<dynamic>> getAllSolicitudes() async {
    try {
      final response = await _dio.get('/admin/searches');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener solicitudes');
    }
  }

  /// Get all contactos (admin only)
  Future<List<dynamic>> getAllContactos() async {
    try {
      final response = await _dio.get('/admin/contacts');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener contactos');
    }
  }

  /// Get all users (admin only)
  Future<List<dynamic>> getAllUsers() async {
    try {
      final response = await _dio.get('/admin/users');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al obtener usuarios');
    }
  }

  /// Delete user (admin only)
  Future<Map<String, dynamic>> deleteUser(String userId) async {
    try {
      final response = await _dio.delete('/admin/users/$userId');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al eliminar usuario');
    }
  }

  /// Update user profile (admin only)
  Future<Map<String, dynamic>> updateAdminUserProfile(
    String userId, {
    String? firstName,
    String? lastName,
    String? phone,
  }) async {
    try {
      final response = await _dio.put(
        '/admin/users/$userId',
        data: {
          if (firstName != null) 'firstName': firstName,
          if (lastName != null) 'lastName': lastName,
          if (phone != null) 'phone': phone,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al actualizar perfil de usuario');
    }
  }

  /// Update user group (admin only)
  Future<Map<String, dynamic>> updateUserGroup(
    String userId, {
    required String group,
  }) async {
    try {
      final response = await _dio.put(
        '/admin/users/$userId/group',
        data: {'group': group},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error al actualizar grupo de usuario');
    }
  }

  // ========================================
  // Generic methods for services
  // ========================================

  /// Generic GET request
  Future<Map<String, dynamic>> get(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: headers != null ? Options(headers: headers) : null,
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error en la solicitud');
    }
  }

  /// Generic POST request
  Future<Map<String, dynamic>> post(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: headers != null ? Options(headers: headers) : null,
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e, 'Error en la solicitud');
    }
  }
}
