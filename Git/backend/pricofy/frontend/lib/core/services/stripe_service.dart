// Stripe Service
//
// Handles direct interaction with Stripe SDK.

import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

class PaymentException implements Exception {
  final String message;
  final String code;

  PaymentException({required this.message, required this.code});

  @override
  String toString() => 'PaymentException: $message (code: $code)';
}

class StripeService {
  /// Confirm payment with PaymentIntent
  Future<PaymentIntent> confirmPayment({
    required String clientSecret,
  }) async {
    try {
      return await Stripe.instance.confirmPayment(
        paymentIntentClientSecret: clientSecret,
        data: const PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );
    } on StripeException catch (e) {
      throw PaymentException(
        message: e.error.localizedMessage ?? 'Payment failed',
        code: e.error.code.toString(),
      );
    }
  }

  /// Present payment sheet (native UI)
  Future<void> presentPaymentSheet({
    required String clientSecret,
    required String merchantDisplayName,
  }) async {
    await Stripe.instance.initPaymentSheet(
      paymentSheetParameters: SetupPaymentSheetParameters(
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: merchantDisplayName,
        style: ThemeMode.system,
        appearance: PaymentSheetAppearance(
          primaryButton: PaymentSheetPrimaryButtonAppearance(
            colors: PaymentSheetPrimaryButtonTheme(
              light: PaymentSheetPrimaryButtonThemeColors(
                background: Colors.blue,
                text: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );

    await Stripe.instance.presentPaymentSheet();
  }
}

