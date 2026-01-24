/**
 * Search Filters Model
 *
 * Defines view modes, sort options, and filter criteria
 * for the search results display.
 */

/// View mode for search results display
enum ViewMode { cards, list, map }

/// Fields available for sorting results
enum SortField { relevance, price, date, distance, platform }

/// Sort direction
enum SortOrder { asc, desc }

/// Search filters configuration
class SearchFilters {
  final double? minPrice;
  final double? maxPrice;
  final double? maxDistance; // Maximum distance in km from search origin
  final List<String> platforms;
  final List<String> countries; // Country codes: ES, IT, PT, FR
  final bool? hasShipping;
  final String? location;
  final int? minCondition; // Minimum condition 1-5 stars (null = all)

  // Platform-specific filters (dynamic based on available data)
  final List<String> conditions; // new, like_new, good, used, acceptable
  final List<String> brands;     // Brand names (from Vinted)
  final List<String> sizes;      // Size values (from Vinted)

  const SearchFilters({
    this.minPrice,
    this.maxPrice,
    this.maxDistance,
    this.platforms = const [],
    this.countries = const [],
    this.hasShipping,
    this.location,
    this.minCondition,
    this.conditions = const [],
    this.brands = const [],
    this.sizes = const [],
  });

  /// Create a copy with modified values
  SearchFilters copyWith({
    double? minPrice,
    double? maxPrice,
    double? maxDistance,
    List<String>? platforms,
    List<String>? countries,
    bool? hasShipping,
    String? location,
    int? minCondition,
    List<String>? conditions,
    List<String>? brands,
    List<String>? sizes,
    bool clearMinPrice = false,
    bool clearMaxPrice = false,
    bool clearMaxDistance = false,
    bool clearCountries = false,
    bool clearHasShipping = false,
    bool clearLocation = false,
    bool clearMinCondition = false,
    bool clearConditions = false,
    bool clearBrands = false,
    bool clearSizes = false,
  }) {
    return SearchFilters(
      minPrice: clearMinPrice ? null : (minPrice ?? this.minPrice),
      maxPrice: clearMaxPrice ? null : (maxPrice ?? this.maxPrice),
      maxDistance: clearMaxDistance ? null : (maxDistance ?? this.maxDistance),
      platforms: platforms ?? this.platforms,
      countries: clearCountries ? const [] : (countries ?? this.countries),
      hasShipping: clearHasShipping ? null : (hasShipping ?? this.hasShipping),
      location: clearLocation ? null : (location ?? this.location),
      minCondition: clearMinCondition ? null : (minCondition ?? this.minCondition),
      conditions: clearConditions ? const [] : (conditions ?? this.conditions),
      brands: clearBrands ? const [] : (brands ?? this.brands),
      sizes: clearSizes ? const [] : (sizes ?? this.sizes),
    );
  }

  /// Check if any filters are active
  bool get hasActiveFilters =>
      minPrice != null ||
      maxPrice != null ||
      maxDistance != null ||
      platforms.isNotEmpty ||
      countries.isNotEmpty ||
      hasShipping != null ||
      location != null ||
      minCondition != null ||
      conditions.isNotEmpty ||
      brands.isNotEmpty ||
      sizes.isNotEmpty;

  /// Count of active filters
  int get activeFilterCount {
    int count = 0;
    if (minPrice != null || maxPrice != null) count++;
    if (maxDistance != null) count++;
    if (platforms.isNotEmpty) count += platforms.length;
    if (countries.isNotEmpty) count += countries.length;
    if (hasShipping != null) count++;
    if (location != null) count++;
    if (minCondition != null) count++;
    if (conditions.isNotEmpty) count += conditions.length;
    if (brands.isNotEmpty) count += brands.length;
    if (sizes.isNotEmpty) count += sizes.length;
    return count;
  }

  /// Get empty filters
  static const SearchFilters empty = SearchFilters();

  @override
  String toString() {
    return 'SearchFilters(minPrice: $minPrice, maxPrice: $maxPrice, maxDistance: $maxDistance, platforms: $platforms, countries: $countries, hasShipping: $hasShipping, location: $location, minCondition: $minCondition, conditions: $conditions, brands: $brands, sizes: $sizes)';
  }
}
