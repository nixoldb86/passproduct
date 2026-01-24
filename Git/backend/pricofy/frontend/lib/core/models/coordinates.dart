// Coordinates Model
//
// Represents geographic coordinates (latitude, longitude).
// Used for location detection and distance calculations.

class Coordinates {
  final double lat;
  final double lon;

  const Coordinates({
    required this.lat,
    required this.lon,
  });

  factory Coordinates.fromJson(Map<String, dynamic> json) {
    return Coordinates(
      lat: (json['lat'] as num).toDouble(),
      lon: (json['lon'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lon': lon,
    };
  }

  /// Returns true if coordinates are exactly (0,0), which typically indicates
  /// uninitialized or invalid data (the actual 0,0 point is in the Gulf of Guinea).
  bool get isZero => lat == 0 && lon == 0;

  /// Returns true if coordinates are within valid geographic ranges:
  /// Latitude: -90 to 90, Longitude: -180 to 180
  bool get isInRange => lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

  /// Returns true if coordinates are usable for search:
  /// - Not (0,0) which indicates uninitialized data
  /// - Within valid geographic ranges
  bool get isValid => !isZero && isInRange;

  @override
  String toString() {
    return 'Coordinates(lat: $lat, lon: $lon)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Coordinates &&
        other.lat == lat &&
        other.lon == lon;
  }

  @override
  int get hashCode {
    return Object.hash(lat, lon);
  }
}

