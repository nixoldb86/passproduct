// Wallet Provider
//
// State management for wallet operations.

import 'package:flutter/foundation.dart';
import '../models/wallet_balance.dart';
import '../models/wallet_transaction.dart';
import '../api/bff_api_client.dart';
import '../api/payment_api_extensions.dart';
import '../services/stripe_service.dart';

class WalletProvider extends ChangeNotifier {
  final BffApiClient _apiClient;
  final StripeService _stripeService;

  WalletBalance? _balance;
  List<WalletTransaction> _transactions = [];
  bool _isLoading = false;
  String? _error;

  WalletProvider({
    required BffApiClient apiClient,
    required StripeService stripeService,
  })  : _apiClient = apiClient,
        _stripeService = stripeService;

  WalletBalance? get balance => _balance;
  List<WalletTransaction> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load wallet balance
  Future<void> loadBalance() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _balance = await _apiClient.getWalletBalance();
    } catch (e) {
      _error = 'Failed to load balance: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Add funds to wallet
  Future<bool> addFunds(int amountCents) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // 1. Create PaymentIntent in backend
      final clientSecret = await _apiClient.createAddFundsIntent(amountCents);

      // 2. Confirm with Stripe
      await _stripeService.presentPaymentSheet(
        clientSecret: clientSecret,
        merchantDisplayName: 'Pricofy',
      );

      // 3. Wait for webhook processing
      await Future.delayed(const Duration(seconds: 2));

      // 4. Reload balance
      await loadBalance();

      return true;
    } catch (e) {
      _error = 'Failed to add funds: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load transactions
  Future<void> loadTransactions() async {
    try {
      _transactions = await _apiClient.getWalletTransactions();
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load transactions: $e';
      notifyListeners();
    }
  }
}

