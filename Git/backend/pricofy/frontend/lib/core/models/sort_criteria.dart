// Sort Criteria Model
//
// Represents a single sort criterion with field and direction.
// Supports multi-criteria sorting (e.g., sort by price first, then by distance).

import 'search_filters.dart' show SortField, SortOrder;

/// A single sort criterion
class SortCriteria {
  final SortField field;
  final SortOrder order;

  const SortCriteria({
    required this.field,
    required this.order,
  });

  /// Create default relevance sorting
  static const SortCriteria defaultRelevance = SortCriteria(
    field: SortField.relevance,
    order: SortOrder.desc,
  );

  /// Create a copy with modified values
  SortCriteria copyWith({SortField? field, SortOrder? order}) {
    return SortCriteria(
      field: field ?? this.field,
      order: order ?? this.order,
    );
  }

  /// Check if this is the default relevance sorting
  bool get isDefault => field == SortField.relevance;

  /// Get API string for the field
  String? get fieldString {
    switch (field) {
      case SortField.price:
        return 'price';
      case SortField.date:
        return 'date';
      case SortField.distance:
        return 'distance';
      case SortField.relevance:
      case SortField.platform:
        return null; // Server default
    }
  }

  /// Get API string for the order
  String get orderString => order == SortOrder.asc ? 'asc' : 'desc';

  /// Display label for the field (for UI)
  /// Pass the l10n object to get proper localization
  String getFieldLabel(dynamic l10n) {
    switch (field) {
      case SortField.price:
        return l10n.sortPrice;
      case SortField.date:
        return l10n.sortDate;
      case SortField.distance:
        return l10n.sortDistance;
      case SortField.relevance:
        return l10n.sortRelevance;
      case SortField.platform:
        return l10n.sortPlatform;
    }
  }

  /// Arrow icon for sort direction
  String get directionArrow => order == SortOrder.asc ? '↑' : '↓';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SortCriteria &&
          runtimeType == other.runtimeType &&
          field == other.field &&
          order == other.order;

  @override
  int get hashCode => field.hashCode ^ order.hashCode;

  @override
  String toString() => 'SortCriteria($field, $order)';
}

/// Extension on `List<SortCriteria>` for API serialization
extension SortCriteriaListExtension on List<SortCriteria> {
  /// Convert list to comma-separated sortBy string for API
  /// Returns null if empty or only relevance sorting
  String? toSortByString() {
    final fields = where((c) => c.fieldString != null)
        .map((c) => c.fieldString!)
        .toList();
    return fields.isEmpty ? null : fields.join(',');
  }

  /// Convert list to comma-separated sortOrder string for API
  /// Returns null if no valid fields
  String? toSortOrderString() {
    final orders = where((c) => c.fieldString != null)
        .map((c) => c.orderString)
        .toList();
    return orders.isEmpty ? null : orders.join(',');
  }

  /// Check if has any non-default sorting
  bool get hasActiveSorting => any((c) => !c.isDefault);

  /// Count of active sort criteria (non-default)
  int get activeSortCount => where((c) => !c.isDefault).length;
}
