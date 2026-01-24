// Subscription Provider
//
// State management for subscription operations.

import 'package:flutter/foundation.dart';
import '../models/subscription.dart';
import '../models/subscription_usage.dart';
import '../models/pricing_plan.dart' show PricingConfig;
import '../api/bff_api_client.dart';
import '../api/payment_api_extensions.dart';
import '../services/stripe_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  final BffApiClient _apiClient;
  final StripeService _stripeService;

  Subscription? _subscription;
  SubscriptionUsage? _usage;
  PricingConfig? _pricing;
  bool _isLoading = false;
  String? _error;

  SubscriptionProvider({
    required BffApiClient apiClient,
    required StripeService stripeService,
  })  : _apiClient = apiClient,
        _stripeService = stripeService;

  Subscription? get subscription => _subscription;
  SubscriptionUsage? get usage => _usage;
  PricingConfig? get pricing => _pricing;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load subscription
  Future<void> loadSubscription() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final subscriptions = await _apiClient.listSubscriptions();
      _subscription = subscriptions.isNotEmpty ? subscriptions.first : null;
    } catch (e) {
      _error = 'Failed to load subscription: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load usage
  Future<void> loadUsage() async {
    try {
      _usage = await _apiClient.getSubscriptionUsage();
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load usage: $e';
      notifyListeners();
    }
  }

  /// Load pricing
  Future<void> loadPricing() async {
    try {
      _pricing = await _apiClient.getPricing();
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load pricing: $e';
      notifyListeners();
    }
  }

  /// Create subscription
  Future<bool> createSubscription(String priceId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _apiClient.createSubscription(priceId);

      // If clientSecret is present, confirm payment
      if (result['clientSecret'] != null) {
        await _stripeService.presentPaymentSheet(
          clientSecret: result['clientSecret'] as String,
          merchantDisplayName: 'Pricofy',
        );
      }

      // Reload subscription
      await loadSubscription();
      await loadUsage();

      return true;
    } catch (e) {
      _error = 'Failed to create subscription: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Cancel subscription
  Future<bool> cancelSubscription({bool immediate = false}) async {
    if (_subscription == null) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiClient.cancelSubscription(_subscription!.id, immediate: immediate);
      await loadSubscription();
      return true;
    } catch (e) {
      _error = 'Failed to cancel subscription: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

