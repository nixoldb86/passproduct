// Pricing Plan Model

class PricingPlan {
  final String id;
  final String name;
  final int priceCents;
  final int? evaluations; // null for unlimited
  final String stripePriceId;

  PricingPlan({
    required this.id,
    required this.name,
    required this.priceCents,
    this.evaluations,
    required this.stripePriceId,
  });

  factory PricingPlan.fromJson(Map<String, dynamic> json) {
    return PricingPlan(
      id: json['id'] as String,
      name: json['name'] as String,
      priceCents: json['price_cents'] as int,
      evaluations: json['evaluations'] as int?,
      stripePriceId: json['stripe_price_id'] as String,
    );
  }
}

class PricingConfig {
  final int evaluationCostCents;
  final String currency;
  final List<PricingPlan> plans;

  PricingConfig({
    required this.evaluationCostCents,
    required this.currency,
    required this.plans,
  });

  factory PricingConfig.fromJson(Map<String, dynamic> json) {
    return PricingConfig(
      evaluationCostCents: json['evaluation_cost_cents'] as int,
      currency: json['currency'] as String? ?? 'eur',
      plans: (json['plans'] as List)
          .map((plan) => PricingPlan.fromJson(plan as Map<String, dynamic>))
          .toList(),
    );
  }
}

