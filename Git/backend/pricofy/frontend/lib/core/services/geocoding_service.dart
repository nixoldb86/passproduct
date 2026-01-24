// Geocoding Service
//
// Converts text locations to geographic coordinates.
// Used for calculating distances in evaluation detail screen.
//
// Privacy-compliant:
// - Only city + postal code (no street/number)
// - GDPR compliant
//
// Architecture:
// Flutter → pricofy-api (public) → pricofy-location-service (private)

import 'dart:math';
import '../api/bff_api_client.dart';
import '../models/coordinates.dart';
import 'package:flutter/foundation.dart' show kDebugMode;

class GeocodingService {
  final BffApiClient _apiClient;

  // Cache to avoid repeated calls for same location
  final Map<String, Coordinates?> _cache = {};

  GeocodingService(this._apiClient);

  /// Geocode a location string to coordinates
  /// 
  /// Examples:
  /// - "Madrid, España" → {lat: 40.4168, lon: -3.7038}
  /// - "Madrid, 28001, España" → more precise coords
  /// 
  /// Returns null if location not found.
  /// Results are cached to improve performance.
  Future<Coordinates?> geocode(String location) async {
    // Normalize location (trim, lowercase for cache key)
    final normalizedLocation = location.trim().toLowerCase();
    
    // Check cache
    if (_cache.containsKey(normalizedLocation)) {
      if (kDebugMode) print('📍 [Geocoding] Cache hit: $location');
      return _cache[normalizedLocation];
    }

    try {
      if (kDebugMode) print('🌐 [Geocoding] Geocoding: $location');
      
      final response = await _apiClient.post(
        '/geocode',
        data: {'location': location},
      );

      if (response['success'] == true && response['coords'] != null) {
        final coords = Coordinates.fromJson(response['coords']);
        _cache[normalizedLocation] = coords;
        if (kDebugMode) print('✅ [Geocoding] Success: ${coords.lat}, ${coords.lon}');
        return coords;
      }

      // Location not found
      if (kDebugMode) print('⚠️ [Geocoding] Location not found: $location');
      _cache[normalizedLocation] = null;
      return null;
    } catch (e) {
      if (kDebugMode) print('❌ [Geocoding] Error: $e');
      // Don't cache errors
      return null;
    }
  }

  /// Geocode multiple locations in batch
  /// 
  /// More efficient than calling geocode() multiple times.
  /// Results are cached individually.
  Future<Map<String, Coordinates?>> geocodeBatch(List<String> locations) async {
    final results = <String, Coordinates?>{};
    
    for (final location in locations) {
      results[location] = await geocode(location);
    }
    
    return results;
  }

  /// Calculate distance between two coordinates using Haversine formula
  /// Returns distance in kilometers
  double calculateDistance(Coordinates a, Coordinates b) {
    const earthRadiusKm = 6371.0;

    final dLat = _toRadians(b.lat - a.lat);
    final dLon = _toRadians(b.lon - a.lon);

    final lat1 = _toRadians(a.lat);
    final lat2 = _toRadians(b.lat);

    final aHav = sin(dLat / 2) * sin(dLat / 2) +
        sin(dLon / 2) * sin(dLon / 2) * cos(lat1) * cos(lat2);
    final c = 2 * atan2(sqrt(aHav), sqrt(1 - aHav));

    return earthRadiusKm * c;
  }

  /// Format distance for display
  /// 
  /// Examples:
  /// - 0.5 km → "500 m"
  /// - 5.3 km → "5.3 km"
  /// - 123.7 km → "124 km"
  String formatDistance(double km) {
    if (km < 1) {
      return '${(km * 1000).round()} m';
    } else if (km < 10) {
      return '${km.toStringAsFixed(1)} km';
    } else {
      return '${km.round()} km';
    }
  }

  /// Convert degrees to radians
  double _toRadians(double degrees) {
    return degrees * pi / 180;
  }

  /// Clear geocoding cache
  void clearCache() {
    _cache.clear();
    if (kDebugMode) print('🗑️ [Geocoding] Cache cleared');
  }

  /// Get cache size (for debugging)
  int get cacheSize => _cache.length;

  /// Get cache hit rate (for optimization)
  double getCacheHitRate() {
    if (_cache.isEmpty) return 0.0;
    
    final hits = _cache.values.where((v) => v != null).length;
    return hits / _cache.length;
  }
}

