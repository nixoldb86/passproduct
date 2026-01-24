import 'package:flutter_test/flutter_test.dart';
import 'package:pricofy_front_flutter/core/utils/error_translator.dart';
import 'package:pricofy_front_flutter/l10n/app_localizations.dart';
import 'package:pricofy_front_flutter/l10n/app_localizations_es.dart';
import 'package:pricofy_front_flutter/l10n/app_localizations_en.dart';

void main() {
  group('Error Translator', () {
    late AppLocalizations esLocalizations;
    late AppLocalizations enLocalizations;

    setUp(() {
      esLocalizations = AppLocalizationsEs();
      enLocalizations = AppLocalizationsEn();
    });

    group('Spanish translations', () {
      test('BAD_REQUEST returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'BAD_REQUEST');
        expect(result, equals(esLocalizations.errorBadRequest));
      });

      test('UNAUTHORIZED returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'UNAUTHORIZED');
        expect(result, equals(esLocalizations.errorUnauthorized));
      });

      test('FORBIDDEN returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'FORBIDDEN');
        expect(result, equals(esLocalizations.errorForbidden));
      });

      test('NOT_FOUND returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'NOT_FOUND');
        expect(result, equals(esLocalizations.errorNotFound));
      });

      test('VALIDATION_ERROR returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'VALIDATION_ERROR');
        expect(result, equals(esLocalizations.errorValidationError));
      });

      test('RATE_LIMITED returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'RATE_LIMITED');
        expect(result, equals(esLocalizations.errorRateLimited));
      });

      test('PAYMENT_REQUIRED returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'PAYMENT_REQUIRED');
        expect(result, equals(esLocalizations.errorPaymentRequired));
      });

      test('INSUFFICIENT_FUNDS returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'INSUFFICIENT_FUNDS');
        expect(result, equals(esLocalizations.errorInsufficientFunds));
      });

      test('INTERNAL_ERROR returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'INTERNAL_ERROR');
        expect(result, equals(esLocalizations.errorInternalError));
      });

      test('SERVICE_UNAVAILABLE returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'SERVICE_UNAVAILABLE');
        expect(result, equals(esLocalizations.errorServiceUnavailable));
      });

      test('TIMEOUT returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'TIMEOUT');
        expect(result, equals(esLocalizations.errorTimeout));
      });

      test('CONNECTION_ERROR returns Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'CONNECTION_ERROR');
        expect(result, equals(esLocalizations.errorConnectionError));
      });

      test('Unknown error code returns default Spanish message', () {
        final result = translateErrorCode(esLocalizations, 'UNKNOWN_CODE_XYZ');
        expect(result, equals(esLocalizations.errorUnknown));
      });

      test('null error code returns default Spanish message', () {
        final result = translateErrorCode(esLocalizations, null);
        expect(result, equals(esLocalizations.errorUnknown));
      });
    });

    group('English translations', () {
      test('BAD_REQUEST returns English message', () {
        final result = translateErrorCode(enLocalizations, 'BAD_REQUEST');
        expect(result, equals(enLocalizations.errorBadRequest));
      });

      test('UNAUTHORIZED returns English message', () {
        final result = translateErrorCode(enLocalizations, 'UNAUTHORIZED');
        expect(result, equals(enLocalizations.errorUnauthorized));
      });

      test('INTERNAL_ERROR returns English message', () {
        final result = translateErrorCode(enLocalizations, 'INTERNAL_ERROR');
        expect(result, equals(enLocalizations.errorInternalError));
      });
    });

    group('Case insensitivity', () {
      test('lowercase error code works', () {
        final result = translateErrorCode(esLocalizations, 'bad_request');
        expect(result, equals(esLocalizations.errorBadRequest));
      });

      test('mixed case error code works', () {
        final result = translateErrorCode(esLocalizations, 'Bad_Request');
        expect(result, equals(esLocalizations.errorBadRequest));
      });
    });

    group('All error codes have translations', () {
      final errorCodes = [
        'BAD_REQUEST',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'VALIDATION_ERROR',
        'RATE_LIMITED',
        'RECAPTCHA_FAILED',
        'DISPOSABLE_EMAIL',
        'EMAIL_RATE_LIMIT',
        'IP_RATE_LIMIT',
        'PAYMENT_REQUIRED',
        'INSUFFICIENT_FUNDS',
        'INVALID_EMAIL',
        'INTERNAL_ERROR',
        'SERVICE_UNAVAILABLE',
        'TIMEOUT',
        'CONNECTION_ERROR',
      ];

      for (final code in errorCodes) {
        test('$code has Spanish translation', () {
          final result = translateErrorCode(esLocalizations, code);
          expect(result, isNotEmpty);
          expect(result, isNot(equals(esLocalizations.errorUnknown)),
              reason: '$code should have a specific translation');
        });

        test('$code has English translation', () {
          final result = translateErrorCode(enLocalizations, code);
          expect(result, isNotEmpty);
          expect(result, isNot(equals(enLocalizations.errorUnknown)),
              reason: '$code should have a specific translation');
        });
      }
    });
  });
}
