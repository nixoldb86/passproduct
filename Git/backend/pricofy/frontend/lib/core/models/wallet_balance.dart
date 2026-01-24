// Wallet Balance Model

import 'package:intl/intl.dart';

class WalletBalance {
  final int balanceCents;
  final String currency;
  final DateTime updatedAt;

  WalletBalance({
    required this.balanceCents,
    required this.currency,
    required this.updatedAt,
  });

  /// Balance in major currency units (euros)
  double get balanceEuros => balanceCents / 100;

  /// Formatted balance string (e.g., "€47.50")
  String get formatted => NumberFormat.currency(
        symbol: currency == 'eur' ? '€' : '\$',
        decimalDigits: 2,
      ).format(balanceEuros);

  factory WalletBalance.fromJson(Map<String, dynamic> json) {
    return WalletBalance(
      balanceCents: json['balance'] as int,
      currency: json['currency'] as String? ?? 'eur',
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'balance': balanceCents,
      'currency': currency,
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

