// Result Filter - Abstract base class for all filters
//
// Extensible filter architecture for client-side result filtering.
// Each filter implements a single responsibility (price, distance, platform, etc.)
// and can be combined by the FilterEngine.

import '../models/search_result.dart';

/// Abstract base class for all result filters
abstract class ResultFilter {
  /// Unique identifier for this filter type (e.g., 'price', 'distance', 'platform')
  String get id;

  /// Display name for UI (localized externally)
  String get displayName;

  /// Check if a result matches this filter
  bool matches(SearchResult result);

  /// Check if this filter is active (has any constraints)
  bool get isActive;
}

/// Filter for price range
class PriceRangeFilter implements ResultFilter {
  final double? min;
  final double? max;

  const PriceRangeFilter({this.min, this.max});

  @override
  String get id => 'price';

  @override
  String get displayName => 'Price';

  @override
  bool get isActive => min != null || max != null;

  @override
  bool matches(SearchResult result) {
    if (min != null && result.price < min!) return false;
    if (max != null && result.price > max!) return false;
    return true;
  }

  PriceRangeFilter copyWith({double? min, double? max, bool clearMin = false, bool clearMax = false}) {
    return PriceRangeFilter(
      min: clearMin ? null : (min ?? this.min),
      max: clearMax ? null : (max ?? this.max),
    );
  }

  @override
  String toString() => 'PriceRangeFilter(min: $min, max: $max)';
}

/// Filter for maximum distance from search origin
class DistanceFilter implements ResultFilter {
  final double? maxDistance; // in km

  const DistanceFilter({this.maxDistance});

  @override
  String get id => 'distance';

  @override
  String get displayName => 'Distance';

  @override
  bool get isActive => maxDistance != null;

  @override
  bool matches(SearchResult result) {
    if (maxDistance == null) return true;
    // Results without distance data are excluded when a distance limit is set
    if (result.distance == null) return false;
    return result.distance! <= maxDistance!;
  }

  DistanceFilter copyWith({double? maxDistance, bool clear = false}) {
    return DistanceFilter(maxDistance: clear ? null : (maxDistance ?? this.maxDistance));
  }

  @override
  String toString() => 'DistanceFilter(maxDistance: $maxDistance)';
}

/// Filter for platforms (Wallapop, Milanuncios, etc.)
class PlatformFilter implements ResultFilter {
  final Set<String> platforms;

  const PlatformFilter({this.platforms = const {}});

  /// Create from a list of platform strings
  factory PlatformFilter.fromList(List<String> platforms) {
    return PlatformFilter(platforms: platforms.map((p) => p.toLowerCase()).toSet());
  }

  @override
  String get id => 'platform';

  @override
  String get displayName => 'Platform';

  @override
  bool get isActive => platforms.isNotEmpty;

  @override
  bool matches(SearchResult result) {
    if (platforms.isEmpty) return true;
    return platforms.contains(result.platform.toLowerCase());
  }

  PlatformFilter copyWith({Set<String>? platforms, bool clear = false}) {
    return PlatformFilter(platforms: clear ? const {} : (platforms ?? this.platforms));
  }

  /// Add a platform to the filter
  PlatformFilter add(String platform) {
    return PlatformFilter(platforms: {...platforms, platform.toLowerCase()});
  }

  /// Remove a platform from the filter
  PlatformFilter remove(String platform) {
    final newPlatforms = Set<String>.from(platforms);
    newPlatforms.remove(platform.toLowerCase());
    return PlatformFilter(platforms: newPlatforms);
  }

  @override
  String toString() => 'PlatformFilter(platforms: $platforms)';
}

/// Filter for countries (ES, FR, IT, PT, etc.)
class CountryFilter implements ResultFilter {
  final Set<String> countries;

  const CountryFilter({this.countries = const {}});

  /// Create from a list of country codes
  factory CountryFilter.fromList(List<String> countries) {
    return CountryFilter(countries: countries.map((c) => c.toUpperCase()).toSet());
  }

  @override
  String get id => 'country';

  @override
  String get displayName => 'Country';

  @override
  bool get isActive => countries.isNotEmpty;

  @override
  bool matches(SearchResult result) {
    if (countries.isEmpty) return true;
    if (result.countryCode == null) return false;
    return countries.contains(result.countryCode!.toUpperCase());
  }

  CountryFilter copyWith({Set<String>? countries, bool clear = false}) {
    return CountryFilter(countries: clear ? const {} : (countries ?? this.countries));
  }

  /// Add a country to the filter
  CountryFilter add(String country) {
    return CountryFilter(countries: {...countries, country.toUpperCase()});
  }

  /// Remove a country from the filter
  CountryFilter remove(String country) {
    final newCountries = Set<String>.from(countries);
    newCountries.remove(country.toUpperCase());
    return CountryFilter(countries: newCountries);
  }

  @override
  String toString() => 'CountryFilter(countries: $countries)';
}

/// Filter for text search within results
class TextSearchFilter implements ResultFilter {
  final String query;

  const TextSearchFilter({this.query = ''});

  @override
  String get id => 'text';

  @override
  String get displayName => 'Text Search';

  @override
  bool get isActive => query.isNotEmpty;

  @override
  bool matches(SearchResult result) {
    if (query.isEmpty) return true;

    final lowerQuery = query.toLowerCase();
    return result.title.toLowerCase().contains(lowerQuery) ||
        (result.description?.toLowerCase().contains(lowerQuery) ?? false) ||
        (result.location?.toLowerCase().contains(lowerQuery) ?? false);
  }

  TextSearchFilter copyWith({String? query, bool clear = false}) {
    return TextSearchFilter(query: clear ? '' : (query ?? this.query));
  }

  @override
  String toString() => 'TextSearchFilter(query: $query)';
}

/// Filter for condition (new, like_new, good, used, acceptable)
class ConditionFilter implements ResultFilter {
  final Set<String> conditions;

  const ConditionFilter({this.conditions = const {}});

  /// Create from a list of condition strings
  factory ConditionFilter.fromList(List<String> conditions) {
    return ConditionFilter(conditions: conditions.map((c) => c.toLowerCase()).toSet());
  }

  @override
  String get id => 'condition';

  @override
  String get displayName => 'Condition';

  @override
  bool get isActive => conditions.isNotEmpty;

  @override
  bool matches(SearchResult result) {
    if (conditions.isEmpty) return true;
    if (result.condition == null) return false;
    return conditions.contains(result.condition!.toLowerCase());
  }

  ConditionFilter copyWith({Set<String>? conditions, bool clear = false}) {
    return ConditionFilter(conditions: clear ? const {} : (conditions ?? this.conditions));
  }

  /// Add a condition to the filter
  ConditionFilter add(String condition) {
    return ConditionFilter(conditions: {...conditions, condition.toLowerCase()});
  }

  /// Remove a condition from the filter
  ConditionFilter remove(String condition) {
    final newConditions = Set<String>.from(conditions);
    newConditions.remove(condition.toLowerCase());
    return ConditionFilter(conditions: newConditions);
  }

  @override
  String toString() => 'ConditionFilter(conditions: $conditions)';
}

/// Filter for brand
class BrandFilter implements ResultFilter {
  final Set<String> brands;

  const BrandFilter({this.brands = const {}});

  /// Create from a list of brand strings
  factory BrandFilter.fromList(List<String> brands) {
    return BrandFilter(brands: brands.map((b) => b.toLowerCase()).toSet());
  }

  @override
  String get id => 'brand';

  @override
  String get displayName => 'Brand';

  @override
  bool get isActive => brands.isNotEmpty;

  @override
  bool matches(SearchResult result) {
    if (brands.isEmpty) return true;
    if (result.brand == null) return false;
    return brands.contains(result.brand!.toLowerCase());
  }

  BrandFilter copyWith({Set<String>? brands, bool clear = false}) {
    return BrandFilter(brands: clear ? const {} : (brands ?? this.brands));
  }

  /// Add a brand to the filter
  BrandFilter add(String brand) {
    return BrandFilter(brands: {...brands, brand.toLowerCase()});
  }

  /// Remove a brand from the filter
  BrandFilter remove(String brand) {
    final newBrands = Set<String>.from(brands);
    newBrands.remove(brand.toLowerCase());
    return BrandFilter(brands: newBrands);
  }

  @override
  String toString() => 'BrandFilter(brands: $brands)';
}

/// Filter for size (clothing sizes from Vinted)
class SizeFilter implements ResultFilter {
  final Set<String> sizes;

  const SizeFilter({this.sizes = const {}});

  /// Create from a list of size strings
  factory SizeFilter.fromList(List<String> sizes) {
    // Keep original case for sizes (S, M, L, XL, 42, etc.)
    return SizeFilter(sizes: sizes.toSet());
  }

  @override
  String get id => 'size';

  @override
  String get displayName => 'Size';

  @override
  bool get isActive => sizes.isNotEmpty;

  @override
  bool matches(SearchResult result) {
    if (sizes.isEmpty) return true;
    if (result.size == null) return false;
    return sizes.contains(result.size);
  }

  SizeFilter copyWith({Set<String>? sizes, bool clear = false}) {
    return SizeFilter(sizes: clear ? const {} : (sizes ?? this.sizes));
  }

  /// Add a size to the filter
  SizeFilter add(String size) {
    return SizeFilter(sizes: {...sizes, size});
  }

  /// Remove a size from the filter
  SizeFilter remove(String size) {
    final newSizes = Set<String>.from(sizes);
    newSizes.remove(size);
    return SizeFilter(sizes: newSizes);
  }

  @override
  String toString() => 'SizeFilter(sizes: $sizes)';
}

/// Shipping mode options for filtering
enum ShippingMode {
  /// Show all items regardless of shipping option
  all,
  /// Show only items that can be shipped
  shippingOnly,
  /// Show only items that require pickup (no shipping)
  pickupOnly,
}

/// Filter for shipping/pickup availability
class ShippingFilter implements ResultFilter {
  final ShippingMode mode;

  const ShippingFilter({this.mode = ShippingMode.all});

  @override
  String get id => 'shipping';

  @override
  String get displayName => 'Shipping';

  @override
  bool get isActive => mode != ShippingMode.all;

  @override
  bool matches(SearchResult result) {
    switch (mode) {
      case ShippingMode.all:
        return true;
      case ShippingMode.shippingOnly:
        return result.isShippable;
      case ShippingMode.pickupOnly:
        return !result.isShippable;
    }
  }

  ShippingFilter copyWith({ShippingMode? mode, bool clear = false}) {
    return ShippingFilter(mode: clear ? ShippingMode.all : (mode ?? this.mode));
  }

  @override
  String toString() => 'ShippingFilter(mode: $mode)';
}
