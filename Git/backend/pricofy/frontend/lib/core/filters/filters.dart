// Filters Module - Client-side filtering and sorting
//
// Provides extensible architecture for filtering and sorting search results
// entirely on the client side, without backend calls.
//
// Usage:
//   final filterEngine = FilterEngine();
//   filterEngine.setFilter(PriceRangeFilter(min: 10, max: 100));
//   filterEngine.setFilter(PlatformFilter.fromList(['wallapop']));
//   final filtered = filterEngine.apply(results);
//
//   final sortEngine = SortEngine();
//   sortEngine.setSingleCriterion(PriceComparator(), SortOrder.asc);
//   final sorted = sortEngine.apply(filtered);

export 'result_filter.dart';
export 'filter_engine.dart';
export 'result_comparator.dart';
export 'sort_engine.dart';
