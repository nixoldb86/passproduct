// Payment API Extensions
//
// Extends BffApiClient with payment-related methods.
// All methods include reCAPTCHA verification for security (via interceptor).

import 'package:dio/dio.dart';
import '../models/wallet_balance.dart';
import '../models/wallet_transaction.dart';
import '../models/subscription.dart';
import '../models/subscription_usage.dart';
import '../models/pricing_plan.dart';
import 'bff_api_client.dart';

/// Extension for BffApiClient with payment methods
extension BffPaymentApiExtensions on BffApiClient {
  // Access private members via dynamic cast (needed for extension)
  Dio get _dio => (this as dynamic)._dio;
  String _handleError(DioException error) {
    if (error.response?.data != null && error.response?.data is Map) {
      final message = error.response?.data['message'] ?? error.response?.data['error'] ?? error.message;
      return message?.toString() ?? 'Unknown error';
    }
    return error.message ?? 'Unknown error';
  }

  // ========================================
  // Wallet
  // ========================================

  /// Get wallet balance
  Future<WalletBalance> getWalletBalance() async {
    try {
      final response = await _dio.get('/api/v1/wallet/balance');
      return WalletBalance.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Create add funds intent (returns client_secret)
  Future<String> createAddFundsIntent(int amountCents) async {
    try {
      final response = await _dio.post(
        '/api/v1/wallet/add-funds',
        data: {'amount': amountCents, 'currency': 'eur'},
      );
      return response.data['clientSecret'] as String;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get wallet transactions
  Future<List<WalletTransaction>> getWalletTransactions({
    int limit = 20,
    String? startingAfter,
  }) async {
    try {
      final response = await _dio.get(
        '/api/v1/wallet/transactions',
        queryParameters: {
          'limit': limit,
          if (startingAfter != null) 'starting_after': startingAfter
        },
      );
      return (response.data['transactions'] as List)
          .map((json) => WalletTransaction.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ========================================
  // Subscriptions
  // ========================================

  /// List subscriptions
  Future<List<Subscription>> listSubscriptions() async {
    try {
      final response = await _dio.get('/api/v1/subscriptions');
      return (response.data['subscriptions'] as List)
          .map((json) => Subscription.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Create subscription
  Future<Map<String, dynamic>> createSubscription(String priceId) async {
    try {
      final response = await _dio.post(
        '/api/v1/subscriptions',
        data: {'price_id': priceId},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Cancel subscription
  Future<void> cancelSubscription(String subscriptionId, {bool immediate = false}) async {
    try {
      await _dio.delete(
        '/api/v1/subscriptions/$subscriptionId',
        queryParameters: {'immediate': immediate},
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get subscription usage
  Future<SubscriptionUsage> getSubscriptionUsage() async {
    try {
      final response = await _dio.get('/api/v1/subscriptions/usage');
      return SubscriptionUsage.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ========================================
  // Payment Methods
  // ========================================

  /// List payment methods
  Future<List<Map<String, dynamic>>> listPaymentMethods() async {
    try {
      final response = await _dio.get('/api/v1/payments/payment-methods');
      return (response.data['payment_methods'] as List)
          .map((json) => json as Map<String, dynamic>)
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Attach payment method
  Future<void> attachPaymentMethod(String paymentMethodId, {bool setAsDefault = false}) async {
    try {
      await _dio.post(
        '/api/v1/payments/payment-methods',
        data: {
          'payment_method_id': paymentMethodId,
          'set_as_default': setAsDefault
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Detach payment method
  Future<void> detachPaymentMethod(String paymentMethodId) async {
    try {
      await _dio.delete('/api/v1/payments/payment-methods/$paymentMethodId');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ========================================
  // Invoices
  // ========================================

  /// List invoices
  Future<List<Map<String, dynamic>>> listInvoices({
    int limit = 20,
    String? startingAfter,
  }) async {
    try {
      final response = await _dio.get(
        '/api/v1/payments/invoices',
        queryParameters: {
          'limit': limit,
          if (startingAfter != null) 'starting_after': startingAfter
        },
      );
      return (response.data['invoices'] as List)
          .map((json) => json as Map<String, dynamic>)
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get invoice by ID
  Future<Map<String, dynamic>> getInvoice(String invoiceId) async {
    try {
      final response = await _dio.get('/api/v1/payments/invoices/$invoiceId');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ========================================
  // Pricing
  // ========================================

  /// Get pricing configuration
  Future<PricingConfig> getPricing() async {
    try {
      final response = await _dio.get('/api/v1/payments/pricing');
      return PricingConfig.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
}
