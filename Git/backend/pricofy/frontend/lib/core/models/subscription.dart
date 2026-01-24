// Subscription Model

enum SubscriptionTier { free, basic, pro, enterprise }

class Subscription {
  final String id;
  final String priceId;
  final SubscriptionTier tier;
  final String status;
  final DateTime currentPeriodEnd;
  final bool cancelAtPeriodEnd;
  final int amountCents;
  final String currency;

  Subscription({
    required this.id,
    required this.priceId,
    required this.tier,
    required this.status,
    required this.currentPeriodEnd,
    required this.cancelAtPeriodEnd,
    required this.amountCents,
    required this.currency,
  });

  bool get isActive => status == 'active';

  String get tierName {
    switch (tier) {
      case SubscriptionTier.basic:
        return 'Basic';
      case SubscriptionTier.pro:
        return 'Pro';
      case SubscriptionTier.enterprise:
        return 'Enterprise';
      default:
        return 'Free';
    }
  }

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['subscription_id'] as String,
      priceId: json['price_id'] as String,
      tier: _parseTier(json['tier'] as String? ?? 'free'),
      status: json['status'] as String,
      currentPeriodEnd: DateTime.fromMillisecondsSinceEpoch(
        (json['current_period_end'] as int) * 1000,
      ),
      cancelAtPeriodEnd: json['cancel_at_period_end'] as bool? ?? false,
      amountCents: json['amount'] as int? ?? 0,
      currency: json['currency'] as String? ?? 'eur',
    );
  }

  static SubscriptionTier _parseTier(String tier) {
    switch (tier.toLowerCase()) {
      case 'basic':
        return SubscriptionTier.basic;
      case 'pro':
        return SubscriptionTier.pro;
      case 'enterprise':
        return SubscriptionTier.enterprise;
      default:
        return SubscriptionTier.free;
    }
  }
}

