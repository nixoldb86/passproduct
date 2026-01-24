// Detected Location Model
//
// Represents user location detected from IP (web) or GPS (mobile).
//
// Privacy-compliant:
// - Only city + postal code (no street/number)
// - GDPR compliant (data minimization)
// - User anonymous at neighborhood level
//
// Accuracy:
// - IP detection: ±5-50km
// - GPS detection: ±10m-1km
// - Postal code improves precision to ±1km

import 'coordinates.dart';

class DetectedLocation {
  /// Source IP address (for logging)
  final String ip;
  
  /// City name (e.g., "Madrid")
  final String? city;
  
  /// Region/State name (e.g., "Community of Madrid")
  final String? region;
  
  /// Region/State code (e.g., "MD")
  final String? regionCode;
  
  /// Country name (e.g., "Spain")
  final String? country;
  
  /// Country ISO code (e.g., "ES")
  final String? countryCode;
  
  /// Postal code (optional, improves precision)
  final String? postalCode;
  
  /// Approximate coordinates
  final Coordinates? coords;
  
  /// Timezone (e.g., "Europe/Madrid")
  final String? timezone;
  
  /// Accuracy radius in kilometers
  final int? accuracyRadius;

  const DetectedLocation({
    required this.ip,
    this.city,
    this.region,
    this.regionCode,
    this.country,
    this.countryCode,
    this.postalCode,
    this.coords,
    this.timezone,
    this.accuracyRadius,
  });

  factory DetectedLocation.fromJson(Map<String, dynamic> json) {
    return DetectedLocation(
      ip: json['ip'] ?? '',
      city: json['city'],
      region: json['region'],
      regionCode: json['regionCode'],
      country: json['country'],
      countryCode: json['countryCode'],
      postalCode: json['postalCode'],
      coords: json['coords'] != null
          ? Coordinates.fromJson(json['coords'])
          : null,
      timezone: json['timezone'],
      accuracyRadius: json['accuracyRadius'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ip': ip,
      'city': city,
      'region': region,
      'regionCode': regionCode,
      'country': country,
      'countryCode': countryCode,
      'postalCode': postalCode,
      'coords': coords?.toJson(),
      'timezone': timezone,
      'accuracyRadius': accuracyRadius,
    };
  }

  /// Get full address string
  /// Format: "City, Region, Country"
  String get fullAddress {
    final parts = <String>[];
    if (city != null) parts.add(city!);
    if (region != null) parts.add(region!);
    if (country != null) parts.add(country!);
    return parts.join(', ');
  }

  /// Get city + country (most common format)
  /// Format: "City, Country"
  String get cityCountry {
    final parts = <String>[];
    if (city != null) parts.add(city!);
    if (country != null) parts.add(country!);
    return parts.join(', ');
  }

  /// Get city with postal code if available
  /// Format: "City (PostalCode)"
  String get cityWithPostalCode {
    if (city == null) return '';
    if (postalCode != null) {
      return '$city ($postalCode)';
    }
    return city!;
  }

  /// Check if location has minimum required data
  bool get isValid {
    return city != null && country != null;
  }

  /// Get accuracy description for UI
  String get accuracyDescription {
    if (accuracyRadius == null) return 'Unknown accuracy';
    if (accuracyRadius! < 5) return 'Very accurate (< 5 km)';
    if (accuracyRadius! < 20) return 'Accurate (< 20 km)';
    if (accuracyRadius! < 50) return 'Approximate (< 50 km)';
    return 'Low accuracy (> 50 km)';
  }

  @override
  String toString() {
    return 'DetectedLocation(city: $city, country: $country, postalCode: $postalCode, accuracy: ${accuracyRadius}km)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DetectedLocation &&
        other.city == city &&
        other.country == country &&
        other.postalCode == postalCode;
  }

  @override
  int get hashCode {
    return Object.hash(city, country, postalCode);
  }
}

