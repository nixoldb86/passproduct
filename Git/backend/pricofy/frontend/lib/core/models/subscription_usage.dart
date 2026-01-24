// Subscription Usage Model

class SubscriptionUsage {
  final String month; // YYYY-MM
  final int used;
  final int? limit; // null for unlimited
  final String? tier;

  SubscriptionUsage({
    required this.month,
    required this.used,
    this.limit,
    this.tier,
  });

  /// Remaining evaluations this month
  int? get remaining => limit != null ? (limit! - used).clamp(0, limit!) : null;

  /// Is unlimited?
  bool get isUnlimited => limit == null;

  factory SubscriptionUsage.fromJson(Map<String, dynamic> json) {
    return SubscriptionUsage(
      month: json['month'] as String,
      used: json['used'] as int,
      limit: json['limit'] as int?,
      tier: json['tier'] as String?,
    );
  }
}

