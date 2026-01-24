// Error Translator Utility
//
// Translates API error codes to user-friendly messages using the localization system.
//
// Usage:
// ```dart
// try {
// await api.someMethod();
// } on ApiException catch (e) {
// debugPrint('API Error: ${e.code} - ${e.message}');
// final userMessage = translateErrorCode(context.l10n, e.code);
// showSnackBar(userMessage);
// }
// ```

import '../../l10n/app_localizations.dart';

/// Translates an API error code to a user-friendly localized message.
///
/// [l10n] - The AppLocalizations instance from context.l10n
/// [errorCode] - The error code from ApiException (e.g., 'UNAUTHORIZED', 'RATE_LIMITED')
///
/// Returns a translated string appropriate for display to the user.
String translateErrorCode(AppLocalizations l10n, String? errorCode) {
  if (errorCode == null) {
    return l10n.errorUnknown;
  }

  // Map error codes to translation keys
  switch (errorCode.toUpperCase()) {
    case 'BAD_REQUEST':
      return l10n.errorBadRequest;
    case 'UNAUTHORIZED':
      return l10n.errorUnauthorized;
    case 'FORBIDDEN':
      return l10n.errorForbidden;
    case 'NOT_FOUND':
      return l10n.errorNotFound;
    case 'VALIDATION_ERROR':
      return l10n.errorValidationError;
    case 'RATE_LIMITED':
      return l10n.errorRateLimited;
    case 'RECAPTCHA_FAILED':
      return l10n.errorRecaptchaFailed;
    case 'DISPOSABLE_EMAIL':
      return l10n.errorDisposableEmail;
    case 'EMAIL_RATE_LIMIT':
      return l10n.errorEmailRateLimit;
    case 'IP_RATE_LIMIT':
      return l10n.errorIpRateLimit;
    case 'PAYMENT_REQUIRED':
      return l10n.errorPaymentRequired;
    case 'INSUFFICIENT_FUNDS':
      return l10n.errorInsufficientFunds;
    case 'INVALID_EMAIL':
      return l10n.errorInvalidEmail;
    // Promo/Waitlist errors
    case 'DUPLICATE_EMAIL':
      return l10n.errorDuplicateEmail;
    case 'USER_NOT_FOUND':
      return l10n.errorUserNotFound;
    case 'MISSING_EMAIL':
      return l10n.errorMissingEmail;
    case 'INVALID_STEPS':
      return l10n.errorInvalidSteps;
    case 'MAX_POSITIONS_REACHED':
      return l10n.errorMaxPositionsReached;
    case 'INVALID_REFERRAL':
      return l10n.errorInvalidReferral;
    case 'INTERNAL_ERROR':
      return l10n.errorInternalError;
    case 'SERVICE_UNAVAILABLE':
      return l10n.errorServiceUnavailable;
    case 'TIMEOUT':
    case 'CONNECTION_TIMEOUT':
      return l10n.errorTimeout;
    case 'CONNECTION_ERROR':
      return l10n.errorConnectionError;
    default:
      return l10n.errorUnknown;
  }
}
