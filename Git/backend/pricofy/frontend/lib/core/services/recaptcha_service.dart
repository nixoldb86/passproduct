// reCAPTCHA Service
//
// Conditional export for web vs non-web platforms.
// Web uses dart:js_interop, non-web uses stub.

export 'recaptcha_service_stub.dart'
    if (dart.library.js_interop) 'recaptcha_service_web.dart';
