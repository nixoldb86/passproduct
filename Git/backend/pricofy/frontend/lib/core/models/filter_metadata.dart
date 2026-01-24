// Filter Metadata Model
//
// Represents aggregated filter data from the BFF/search-service.
// Contains ranges and available options calculated from ALL search results,
// not just the loaded page - enabling accurate filter UI.

/// Price range bounds for the price filter slider
class PriceRange {
  final double min;
  final double max;

  const PriceRange({required this.min, required this.max});

  factory PriceRange.fromJson(Map<String, dynamic> json) {
    return PriceRange(
      min: (json['min'] as num?)?.toDouble() ?? 0,
      max: (json['max'] as num?)?.toDouble() ?? 2000,
    );
  }

  Map<String, dynamic> toJson() => {'min': min, 'max': max};

  /// Check if this is a valid range (min < max)
  bool get isValid => min < max;

  /// Default price range when no data available
  static const PriceRange defaultRange = PriceRange(min: 0, max: 2000);

  @override
  String toString() => 'PriceRange($min - $max)';
}

/// Distance range bounds for the distance filter slider (in km)
class DistanceRange {
  final double min;
  final double max;

  const DistanceRange({required this.min, required this.max});

  factory DistanceRange.fromJson(Map<String, dynamic> json) {
    return DistanceRange(
      min: (json['min'] as num?)?.toDouble() ?? 0,
      max: (json['max'] as num?)?.toDouble() ?? 500,
    );
  }

  Map<String, dynamic> toJson() => {'min': min, 'max': max};

  /// Check if this is a valid range (min < max)
  bool get isValid => min < max;

  /// Default distance range when no data available
  static const DistanceRange defaultRange = DistanceRange(min: 0, max: 500);

  @override
  String toString() => 'DistanceRange($min - $max km)';
}

/// Aggregated filter metadata from search results
///
/// This data comes from the backend (search-service) and represents
/// the full range of available filter options across ALL search results,
/// not just the currently loaded page.
class FilterMetadata {
  /// Price range bounds (min/max from all results)
  final PriceRange priceRange;

  /// Distance range bounds (null if no results have distance data)
  final DistanceRange? distanceRange;

  /// Available country codes (sorted, e.g., ['ES', 'FR', 'IT'])
  final List<String> countries;

  /// Available platform names (sorted, lowercase, e.g., ['milanuncios', 'wallapop'])
  final List<String> platforms;

  const FilterMetadata({
    required this.priceRange,
    this.distanceRange,
    required this.countries,
    required this.platforms,
  });

  /// Parse from BFF/search-service JSON response
  factory FilterMetadata.fromJson(Map<String, dynamic> json) {
    return FilterMetadata(
      priceRange: json['priceRange'] != null
          ? PriceRange.fromJson(json['priceRange'] as Map<String, dynamic>)
          : PriceRange.defaultRange,
      distanceRange: json['distanceRange'] != null
          ? DistanceRange.fromJson(json['distanceRange'] as Map<String, dynamic>)
          : null,
      countries: (json['countries'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      platforms: (json['platforms'] as List<dynamic>?)
              ?.map((e) => e.toString().toLowerCase())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'priceRange': priceRange.toJson(),
        if (distanceRange != null) 'distanceRange': distanceRange!.toJson(),
        'countries': countries,
        'platforms': platforms,
      };

  /// Check if distance data is available
  bool get hasDistanceData => distanceRange != null;

  /// Check if there are any countries available
  bool get hasCountries => countries.isNotEmpty;

  /// Check if there are any platforms available
  bool get hasPlatforms => platforms.isNotEmpty;

  /// Empty metadata (used as fallback)
  static const FilterMetadata empty = FilterMetadata(
    priceRange: PriceRange.defaultRange,
    distanceRange: null,
    countries: [],
    platforms: [],
  );

  @override
  String toString() =>
      'FilterMetadata(price: $priceRange, distance: $distanceRange, countries: $countries, platforms: $platforms)';
}
