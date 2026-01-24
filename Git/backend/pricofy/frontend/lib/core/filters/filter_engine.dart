// Filter Engine - Composable client-side filtering
//
// Manages multiple filters and applies them efficiently to search results.
// Filters are applied with AND logic (all must match).

import '../models/search_result.dart';
import '../models/search_filters.dart';
import 'result_filter.dart';

/// Engine for applying multiple filters to search results
class FilterEngine {
  final Map<String, ResultFilter> _filters = {};

  /// Get all active filters
  Map<String, ResultFilter> get filters => Map.unmodifiable(_filters);

  /// Get a specific filter by ID
  ResultFilter? getFilter(String id) => _filters[id];

  /// Add or update a filter
  void setFilter(ResultFilter filter) {
    if (filter.isActive) {
      _filters[filter.id] = filter;
    } else {
      _filters.remove(filter.id);
    }
  }

  /// Remove a filter by ID
  void removeFilter(String id) {
    _filters.remove(id);
  }

  /// Clear all filters
  void clearAll() {
    _filters.clear();
  }

  /// Check if any filters are active
  bool get hasActiveFilters => _filters.values.any((f) => f.isActive);

  /// Count of active filters
  int get activeFilterCount => _filters.values.where((f) => f.isActive).length;

  /// Apply all filters to results (AND logic - all must match)
  List<SearchResult> apply(List<SearchResult> results) {
    if (_filters.isEmpty) return results;

    return results.where((result) {
      return _filters.values.every((filter) => filter.matches(result));
    }).toList();
  }

  /// Apply filters from SearchFilters model (for compatibility)
  void applyFromSearchFilters(SearchFilters searchFilters, {String? textQuery}) {
    clearAll();

    // Price filter
    if (searchFilters.minPrice != null || searchFilters.maxPrice != null) {
      setFilter(PriceRangeFilter(
        min: searchFilters.minPrice,
        max: searchFilters.maxPrice,
      ));
    }

    // Distance filter
    if (searchFilters.maxDistance != null) {
      setFilter(DistanceFilter(maxDistance: searchFilters.maxDistance));
    }

    // Platform filter
    if (searchFilters.platforms.isNotEmpty) {
      setFilter(PlatformFilter.fromList(searchFilters.platforms));
    }

    // Country filter
    if (searchFilters.countries.isNotEmpty) {
      setFilter(CountryFilter.fromList(searchFilters.countries));
    }

    // Condition filter
    if (searchFilters.conditions.isNotEmpty) {
      setFilter(ConditionFilter.fromList(searchFilters.conditions));
    }

    // Brand filter
    if (searchFilters.brands.isNotEmpty) {
      setFilter(BrandFilter.fromList(searchFilters.brands));
    }

    // Size filter
    if (searchFilters.sizes.isNotEmpty) {
      setFilter(SizeFilter.fromList(searchFilters.sizes));
    }

    // Shipping filter
    if (searchFilters.hasShipping != null) {
      final mode = searchFilters.hasShipping! ? ShippingMode.shippingOnly : ShippingMode.pickupOnly;
      setFilter(ShippingFilter(mode: mode));
    }

    // Text search filter
    if (textQuery != null && textQuery.isNotEmpty) {
      setFilter(TextSearchFilter(query: textQuery));
    }
  }

  /// Convert current filters to SearchFilters model (for UI compatibility)
  SearchFilters toSearchFilters() {
    final priceFilter = _filters['price'] as PriceRangeFilter?;
    final distanceFilter = _filters['distance'] as DistanceFilter?;
    final platformFilter = _filters['platform'] as PlatformFilter?;
    final countryFilter = _filters['country'] as CountryFilter?;
    final conditionFilter = _filters['condition'] as ConditionFilter?;
    final brandFilter = _filters['brand'] as BrandFilter?;
    final sizeFilter = _filters['size'] as SizeFilter?;
    final shippingFilter = _filters['shipping'] as ShippingFilter?;

    // Convert ShippingMode to bool?
    bool? hasShipping;
    if (shippingFilter != null && shippingFilter.isActive) {
      hasShipping = shippingFilter.mode == ShippingMode.shippingOnly;
    }

    return SearchFilters(
      minPrice: priceFilter?.min,
      maxPrice: priceFilter?.max,
      maxDistance: distanceFilter?.maxDistance,
      platforms: platformFilter?.platforms.toList() ?? [],
      countries: countryFilter?.countries.toList() ?? [],
      conditions: conditionFilter?.conditions.toList() ?? [],
      brands: brandFilter?.brands.toList() ?? [],
      sizes: sizeFilter?.sizes.toList() ?? [],
      hasShipping: hasShipping,
    );
  }

  /// Get text search query
  String get textQuery {
    final textFilter = _filters['text'] as TextSearchFilter?;
    return textFilter?.query ?? '';
  }

  @override
  String toString() => 'FilterEngine(filters: ${_filters.keys.join(', ')})';
}
