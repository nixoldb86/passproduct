// User Location Model
//
// Represents the detected user location from BFF /detect-location endpoint.
// Contains postal code centroid coordinates and location metadata.

import 'coordinates.dart';

/// Source of location data
enum LocationSource {
  /// Location from postal code centroid (supported countries: ES, FR, DE, IT, PT)
  postalCentroid,

  /// Location from country capital (unsupported countries fallback)
  capitalFallback,

  /// Approximate location from IP (MaxMind, last resort)
  ipApproximate,

  /// Fallback location when detection fails
  fallback,
}

/// User location detected at app load
class UserLocation {
  /// ISO 3166-1 alpha-2 country code (always present if detection succeeded)
  final String countryCode;

  /// Postal code centroid or capital coordinates
  final Coordinates? coords;

  /// Postal code (may be null for unsupported countries or IP-only detection)
  final String? postalCode;

  /// Municipality/city name
  final String? municipality;

  /// How the location was determined
  final LocationSource source;

  const UserLocation({
    required this.countryCode,
    this.coords,
    this.postalCode,
    this.municipality,
    required this.source,
  });

  /// True if we have precise postal code centroid coordinates
  bool get hasPreciseCoords => source == LocationSource.postalCentroid && coords != null;

  /// True if the country is fully supported (has postal code data)
  bool get isFullySupported => source == LocationSource.postalCentroid;

  /// Parse from BFF /detect-location response
  factory UserLocation.fromJson(Map<String, dynamic> json) {
    LocationSource source;
    final sourceStr = json['source'] as String?;
    switch (sourceStr) {
      case 'postal_centroid':
        source = LocationSource.postalCentroid;
        break;
      case 'capital_fallback':
        source = LocationSource.capitalFallback;
        break;
      case 'ip_approximate':
        source = LocationSource.ipApproximate;
        break;
      default:
        source = LocationSource.fallback;
    }

    return UserLocation(
      countryCode: json['countryCode'] as String? ?? 'ES',
      coords: json['coords'] != null
          ? Coordinates.fromJson(json['coords'] as Map<String, dynamic>)
          : null,
      postalCode: json['postalCode'] as String?,
      municipality: json['municipality'] as String?,
      source: source,
    );
  }

  /// Convert to JSON (for API calls)
  Map<String, dynamic> toJson() {
    return {
      'countryCode': countryCode,
      if (coords != null) 'coords': coords!.toJson(),
      if (postalCode != null) 'postalCode': postalCode,
      if (municipality != null) 'municipality': municipality,
      'source': _sourceToString(source),
    };
  }

  String _sourceToString(LocationSource source) {
    switch (source) {
      case LocationSource.postalCentroid:
        return 'postal_centroid';
      case LocationSource.capitalFallback:
        return 'capital_fallback';
      case LocationSource.ipApproximate:
        return 'ip_approximate';
      case LocationSource.fallback:
        return 'fallback';
    }
  }

  /// Fallback location when detection fails (defaults to Spain/Madrid)
  factory UserLocation.fallback() {
    return const UserLocation(
      countryCode: 'ES',
      coords: Coordinates(lat: 40.4168, lon: -3.7038),
      postalCode: '28001',
      municipality: 'Madrid',
      source: LocationSource.fallback,
    );
  }

  @override
  String toString() {
    return 'UserLocation(countryCode: $countryCode, coords: $coords, '
        'postalCode: $postalCode, municipality: $municipality, source: $source)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserLocation &&
        other.countryCode == countryCode &&
        other.coords == coords &&
        other.postalCode == postalCode &&
        other.municipality == municipality &&
        other.source == source;
  }

  @override
  int get hashCode {
    return Object.hash(countryCode, coords, postalCode, municipality, source);
  }
}
