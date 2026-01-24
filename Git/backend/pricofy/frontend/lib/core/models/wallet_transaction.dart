// Wallet Transaction Model

import 'package:intl/intl.dart';

class WalletTransaction {
  final String id;
  final int amountCents; // Negative = credit (add funds), positive = debit (charge)
  final String currency;
  final String description;
  final DateTime createdAt;
  final String type;

  WalletTransaction({
    required this.id,
    required this.amountCents,
    required this.currency,
    required this.description,
    required this.createdAt,
    required this.type,
  });

  /// Formatted amount string
  String get formatted => NumberFormat.currency(
        symbol: currency == 'eur' ? '€' : '\$',
        decimalDigits: 2,
      ).format(amountCents / 100);

  /// Is this a credit (add funds) transaction?
  bool get isCredit => amountCents < 0;

  factory WalletTransaction.fromJson(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'] as String,
      amountCents: json['amount'] as int,
      currency: json['currency'] as String? ?? 'eur',
      description: json['description'] as String,
      createdAt: DateTime.fromMillisecondsSinceEpoch(
        (json['created'] as int) * 1000,
      ),
      type: json['type'] as String? ?? 'unknown',
    );
  }
}

