// Stripe Configuration

import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class StripeConfig {
  static const String publishableKeyTest = 'pk_test_51SU3DtFnpAFoDSaR7irqSvXnL0bu6zGMRzqoRk15IyowhRWUFbJlBfGOMQA0MObhhiU79frLd0sOv5ip3caZGb0100H0PFC8cE';
  static const String publishableKeyLive = 'pk_live_xxx'; // Replace with actual live key when going to production

  static String get publishableKey {
    // Use test key for development
    return publishableKeyTest;
  }

  static Future<void> initialize() async {
    Stripe.publishableKey = publishableKey;

    // Platform-specific configuration (skip on web)
    if (!kIsWeb) {
      Stripe.merchantIdentifier = 'merchant.com.pricofy';
      Stripe.urlScheme = 'pricofy';
    }

    await Stripe.instance.applySettings();
  }
}

