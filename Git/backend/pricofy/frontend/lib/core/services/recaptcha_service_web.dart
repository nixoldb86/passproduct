// reCAPTCHA Service (Web Implementation)
//
// Executes reCAPTCHA v3 challenges for bot protection.
// Only active on web platform.
//
// Requires executeRecaptcha() function defined in index.html.

import 'dart:async';
import 'package:flutter/foundation.dart' show kDebugMode, debugPrint;
// ignore: avoid_web_libraries_in_flutter
import 'dart:js_interop' as js;

/// Service for executing reCAPTCHA v3 challenges
class RecaptchaService {
  /// Execute reCAPTCHA v3 challenge and get token
  ///
  /// @param action - Action identifier (e.g., 'login', 'submit_request')
  /// @returns Token string or null if failed
  static Future<String?> execute(String action) async {
    try {
      // Call window.executeRecaptcha(action) using dart:js_interop
      final promise = _executeRecaptcha(action.toJS);

      // Convert JS Promise to Dart Future
      final token = (await promise.toDart).toDart;

      if (token.isNotEmpty) {
        if (kDebugMode) debugPrint('[reCAPTCHA] Token obtained for action: $action');
        return token;
      } else {
        if (kDebugMode) debugPrint('[reCAPTCHA] Empty token received for action: $action');
        return null;
      }
    } catch (e) {
      if (kDebugMode) debugPrint('[reCAPTCHA] Exception executing $action: $e');
      return null;
    }
  }
}

/// External JavaScript function declaration
///
/// This function is defined in index.html and calls grecaptcha.execute()
@js.JS('executeRecaptcha')
external js.JSPromise<js.JSString> _executeRecaptcha(js.JSString action);
