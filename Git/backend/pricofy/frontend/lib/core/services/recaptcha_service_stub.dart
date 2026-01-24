// reCAPTCHA Service Stub
//
// Stub implementation for non-web platforms (mobile, desktop, tests).
// Returns null token since reCAPTCHA is only available on web.

import 'dart:async';
import 'package:flutter/foundation.dart' show kDebugMode, debugPrint;

/// Stub service for executing reCAPTCHA v3 challenges
class RecaptchaService {
  /// Execute reCAPTCHA v3 challenge and get token
  ///
  /// On non-web platforms, always returns null.
  static Future<String?> execute(String action) async {
    if (kDebugMode) {
      debugPrint('[reCAPTCHA] Stub: Not a web platform, skipping action: $action');
    }
    return null;
  }
}
