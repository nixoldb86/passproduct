// API Exception
//
// Custom exception class for API errors with support for error codes
// and specific error type checking.

class ApiException implements Exception {
  final String message;
  final String? code;
  final int? statusCode;

  ApiException({
    required this.message,
    this.code,
    this.statusCode,
  });

  @override
  String toString() => message;

  bool get isDisposableEmail => code == 'DISPOSABLE_EMAIL';
  bool get isEmailRateLimit => code == 'EMAIL_RATE_LIMIT';
  bool get isIpRateLimit => code == 'IP_RATE_LIMIT';
  bool get isRecaptchaFailed => code == 'RECAPTCHA_FAILED' || code == 'RECAPTCHA_ERROR';
}
