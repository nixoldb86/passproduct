// Dio interceptor that automatically adds reCAPTCHA tokens to requests
// 
// This interceptor maps API endpoints to their corresponding reCAPTCHA actions
// and automatically obtains and injects the token into request headers.
// 
// Usage:
// ```dart
// _dio.interceptors.add(RecaptchaInterceptor());
// ```

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kDebugMode, debugPrint;
import '../../services/recaptcha_service.dart';

class RecaptchaInterceptor extends Interceptor {
  /// Map of API endpoints to reCAPTCHA actions
  ///
  /// NOTE: Only endpoints that REQUIRE reCAPTCHA on the backend should be listed here.
  /// Authenticated endpoints (user already logged in) don't need reCAPTCHA.
  /// Admin endpoints don't need reCAPTCHA (admin already verified).
  /// Read-only endpoints for own data don't need reCAPTCHA.
  final Map<String, String> _actionMap = {
    // User endpoints - only updates need reCAPTCHA
    // '/user/profile': - NO reCAPTCHA for GET (reading own data)
    // '/user/evaluations': - NO reCAPTCHA (reading own data)

    // Wallet endpoints - only financial operations need reCAPTCHA
    // '/api/v1/wallet/balance': - NO reCAPTCHA (reading own data)
    '/api/v1/wallet/add-funds': 'wallet_add_funds',
    // '/api/v1/wallet/transactions': - NO reCAPTCHA (reading own data)

    // Subscription endpoints - only create needs reCAPTCHA
    // '/api/v1/subscriptions': - NO reCAPTCHA for GET (reading own data)
    // '/api/v1/subscriptions/usage': - NO reCAPTCHA (reading own data)

    // Payment method endpoints - no reCAPTCHA (user authenticated)
    // '/api/v1/payments/payment-methods': - NO reCAPTCHA

    // Invoice endpoints - no reCAPTCHA (reading own data)
    // '/api/v1/payments/invoices': - NO reCAPTCHA

    // Pricing - no reCAPTCHA (public data)
    // '/api/v1/payments/pricing': - NO reCAPTCHA

    // Public endpoints - NEED reCAPTCHA (abuse protection)
    '/contact': 'contact',
    '/submit-request': 'submit_request',

    // Auth endpoints - NEED reCAPTCHA (abuse protection)
    '/auth/init-login': 'init_login',
    '/auth/send-code': 'send_code',
    '/auth/verify-code': 'verify_code',
    '/auth/signup': 'signup',

    // Promo/Waitlist endpoints - NEED reCAPTCHA (abuse protection)
    '/promo/register': 'promo',
    '/promo/status': 'promo',
    '/promo/update-steps': 'promo',

    // Session creation - no reCAPTCHA (PoW is the protection)
    // '/session/create': - NO reCAPTCHA

    // Location endpoints - no reCAPTCHA, just session validation

    // Search endpoints (legacy)
    '/search': 'submit_request',
    // '/search/results': - NO reCAPTCHA (reading own results)

    // Public search endpoints (anonymous users)
    '/public/search': 'submit_request',
    '/public/search/results': 'get_results',
    '/public/search/history': 'get_history',

    // Private search endpoints (authenticated users)
    '/private/search': 'submit_request',
    // '/private/search/results': - NO reCAPTCHA (user authenticated)
    // '/private/search/history': - NO reCAPTCHA (user authenticated)

    // Pricing (alternative path) - no reCAPTCHA (public data)
    // '/payments/pricing': - NO reCAPTCHA

    // Admin endpoints - NO reCAPTCHA (admin already verified, rate limit sufficient)
    // '/admin/users': - NO reCAPTCHA
    // '/admin/searches': - NO reCAPTCHA
    // '/admin/contacts': - NO reCAPTCHA
  };

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Try to find action in static map
    String? action = _actionMap[options.path];

    // Handle dynamic routes based on path and method
    // Only add reCAPTCHA for operations that truly need protection
    if (action == null) {
      // Financial operations - NEED reCAPTCHA
      if (options.path.startsWith('/api/v1/subscriptions') && options.method == 'POST') {
        action = 'subscription_create';
      }
      // User profile UPDATE - needs reCAPTCHA (modification)
      else if (options.path.startsWith('/user/profile') && options.method == 'PUT') {
        action = 'user_profile_update';
      }
      // Public search results with dynamic searchId - /public/search/results/{searchId}
      else if (options.path.startsWith('/public/search/results/')) {
        action = 'get_results';
      }
      // Private search results with dynamic searchId - /private/search/results/{searchId}
      else if (options.path.startsWith('/private/search/results/')) {
        // No reCAPTCHA for authenticated users reading their own results
        action = null;
      }
      // NOTE: Admin endpoints, payment method management, invoice viewing, etc.
      // don't need reCAPTCHA - the user is already authenticated and verified
    }

    // If we have an action, get and inject reCAPTCHA token
    if (action != null) {
      try {
        final recaptchaToken = await RecaptchaService.execute(action);
        if (recaptchaToken != null && recaptchaToken.isNotEmpty) {
          options.headers['X-Recaptcha-Token'] = recaptchaToken;
          if (kDebugMode) debugPrint('[RC-INT] ✅ Token added for $action');
        } else {
          if (kDebugMode) debugPrint('[RC-INT] ⚠️ Empty token for $action');
        }
      } catch (e) {
        if (kDebugMode) debugPrint('[RC-INT] ❌ Error getting reCAPTCHA token: $e');
        // Continue without token - backend will handle the error
      }
    }

    handler.next(options);
  }
}

