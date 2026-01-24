// Result Comparator - Abstract base class for sorting
//
// Extensible comparator architecture for client-side result sorting.
// Each comparator handles a single field (price, date, distance, etc.)
// and can be combined by the SortEngine for multi-criteria sorting.

import '../models/search_result.dart';
import '../models/search_filters.dart' show SortField;

/// Abstract base class for all result comparators
abstract class ResultComparator {
  /// Unique identifier for this comparator (e.g., 'price', 'date')
  String get id;

  /// Display name for UI (localized externally)
  String get displayName;

  /// Compare two results (returns negative if a < b, positive if a > b, 0 if equal)
  int compare(SearchResult a, SearchResult b);

  /// Get the corresponding SortField for this comparator
  SortField get sortField;
}

/// Comparator for price sorting
class PriceComparator implements ResultComparator {
  @override
  String get id => 'price';

  @override
  String get displayName => 'Price';

  @override
  SortField get sortField => SortField.price;

  @override
  int compare(SearchResult a, SearchResult b) {
    return a.price.compareTo(b.price);
  }
}

/// Comparator for date/publish time sorting
class DateComparator implements ResultComparator {
  @override
  String get id => 'date';

  @override
  String get displayName => 'Date';

  @override
  SortField get sortField => SortField.date;

  @override
  int compare(SearchResult a, SearchResult b) {
    final aDate = a.publishedAt ?? DateTime(1970);
    final bDate = b.publishedAt ?? DateTime(1970);
    return aDate.compareTo(bDate);
  }
}

/// Comparator for distance sorting
class DistanceComparator implements ResultComparator {
  @override
  String get id => 'distance';

  @override
  String get displayName => 'Distance';

  @override
  SortField get sortField => SortField.distance;

  @override
  int compare(SearchResult a, SearchResult b) {
    // Null distance = sort to end
    if (a.distance == null && b.distance == null) return 0;
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance!.compareTo(b.distance!);
  }
}

/// Comparator for relevance score sorting
class RelevanceComparator implements ResultComparator {
  @override
  String get id => 'relevance';

  @override
  String get displayName => 'Relevance';

  @override
  SortField get sortField => SortField.relevance;

  @override
  int compare(SearchResult a, SearchResult b) {
    // Higher relevance = better (so we reverse the comparison)
    final aScore = a.relevanceScore ?? 0;
    final bScore = b.relevanceScore ?? 0;
    return bScore.compareTo(aScore); // Descending by default
  }
}

/// Comparator for platform name sorting
class PlatformComparator implements ResultComparator {
  @override
  String get id => 'platform';

  @override
  String get displayName => 'Platform';

  @override
  SortField get sortField => SortField.platform;

  @override
  int compare(SearchResult a, SearchResult b) {
    return a.platform.toLowerCase().compareTo(b.platform.toLowerCase());
  }
}

/// Factory to get a comparator by SortField
ResultComparator getComparatorForField(SortField field) {
  switch (field) {
    case SortField.price:
      return PriceComparator();
    case SortField.date:
      return DateComparator();
    case SortField.distance:
      return DistanceComparator();
    case SortField.relevance:
      return RelevanceComparator();
    case SortField.platform:
      return PlatformComparator();
  }
}
