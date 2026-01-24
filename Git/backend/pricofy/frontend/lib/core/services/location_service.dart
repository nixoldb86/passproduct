// Location Service
//
// Detects user location using:
// 1. Web: IP geolocation (MaxMind via API)
// 2. Mobile: GPS (if permissions granted) + fallback to IP
//
// Privacy-compliant:
// - Only city + postal code stored (no street/number)
// - GDPR compliant (data minimization)
// - User anonymous at neighborhood level
//
// Architecture:
// Flutter → pricofy-api (public) → pricofy-location-service (private)
// ↑                          ↑
// [API Key]                  [IAM Role]

import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode;
import 'package:geolocator/geolocator.dart';
import '../api/bff_api_client.dart';
import '../models/detected_location.dart';
import '../models/coordinates.dart';

class LocationService {
  final BffApiClient _apiClient;
  
  DetectedLocation? _cachedLocation;
  DateTime? _cacheTimestamp;
  
  // Cache validity: 1 hour
  static const Duration _cacheValidity = Duration(hours: 1);

  LocationService(this._apiClient);

  /// Detect user location (main entry point)
  /// 
  /// Strategy:
  /// - Web: IP detection only
  /// - Mobile: GPS first (if permissions), fallback to IP
  /// 
  /// Returns DetectedLocation with city, postal code, country, coords.
  /// Caches result for 1 hour.
  Future<DetectedLocation?> detectLocation({bool forceRefresh = false}) async {
    // Return cached if valid and not force refresh
    if (!forceRefresh && _isCacheValid()) {
      if (kDebugMode) print('📍 [Location] Returning cached location');
      return _cachedLocation;
    }

    if (kDebugMode) print('📍 [Location] Detecting location...');

    // Mobile: Try GPS first
    if (!kIsWeb) {
      try {
        final gpsCoords = await _getGpsCoordinates();
        if (gpsCoords != null) {
          if (kDebugMode) print('✅ [Location] GPS coords obtained');
          
          // Reverse geocode GPS coords to get city/postal code
          final location = await _reverseGeocode(gpsCoords);
          if (location != null) {
            _cacheLocation(location);
            return location;
          }
        }
      } catch (e) {
        if (kDebugMode) print('⚠️ [Location] GPS failed, falling back to IP: $e');
      }
    }

    // Fallback: IP geolocation (works on web and mobile)
    final ipLocation = await _detectLocationByIp();
    if (ipLocation != null) {
      _cacheLocation(ipLocation);
    }
    
    return ipLocation;
  }

  /// Detect location by IP (backend MaxMind)
  /// Calls pricofy-api which invokes pricofy-location-service
  Future<DetectedLocation?> _detectLocationByIp() async {
    try {
      if (kDebugMode) print('🌐 [Location] Detecting via IP...');
      
      final response = await _apiClient.get('/detect-location');
      
      if (response['success'] == true && response['location'] != null) {
        final location = DetectedLocation.fromJson(response['location']);
        if (kDebugMode) print('✅ [Location] IP detection successful: ${location.cityCountry}');
        return location;
      }
      
      if (kDebugMode) print('⚠️ [Location] IP detection returned no location');
      return null;
    } catch (e) {
      if (kDebugMode) print('❌ [Location] IP detection failed: $e');
      return null;
    }
  }

  /// Get GPS coordinates (mobile only)
  /// Requests permission if needed
  Future<Coordinates?> _getGpsCoordinates() async {
    if (kIsWeb) return null;

    try {
      // Check if location services are enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (kDebugMode) print('⚠️ [Location] Location services disabled');
        return null;
      }

      // Check permission
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (kDebugMode) print('⚠️ [Location] GPS permission denied');
          return null;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        if (kDebugMode) print('⚠️ [Location] GPS permission permanently denied');
        return null;
      }

      // Get position
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      final coords = Coordinates(
        lat: position.latitude,
        lon: position.longitude,
      );

      if (kDebugMode) print('✅ [Location] GPS coords: ${coords.lat}, ${coords.lon}');
      return coords;

    } catch (e) {
      if (kDebugMode) print('❌ [Location] GPS error: $e');
      return null;
    }
  }

  /// Reverse geocode coords to city/postal code
  /// 
  /// Uses pricofy-location-service reverse-geocode endpoint
  /// (finds nearest postal code in Spanish static DB using Haversine)
  Future<DetectedLocation?> _reverseGeocode(Coordinates coords) async {
    try {
      if (kDebugMode) print('🔄 [Location] Reverse geocoding via /reverse-geocode...');
      
      // Call backend reverse-geocode endpoint
      final response = await _apiClient.post(
        '/reverse-geocode',
        data: {
          'lat': coords.lat,
          'lon': coords.lon,
        },
      );

      if (response['success'] == true) {
        final location = DetectedLocation(
          ip: 'GPS',
          city: response['city'],
          region: response['provincia'],
          country: response['country'],
          countryCode: 'ES',
          postalCode: response['postalCode'],
          coords: coords,
          timezone: null,
          accuracyRadius: 1, // GPS is very accurate
        );

        if (kDebugMode) print('✅ [Location] Reverse geocode: ${location.cityCountry}, CP: ${location.postalCode}');
        return location;
      }

      if (kDebugMode) print('⚠️ [Location] Reverse geocode returned no location');
      return null;

    } catch (e) {
      if (kDebugMode) print('❌ [Location] Reverse geocode failed: $e');
      return null;
    }
  }

  /// Check if cache is valid
  bool _isCacheValid() {
    if (_cachedLocation == null || _cacheTimestamp == null) {
      return false;
    }
    
    final age = DateTime.now().difference(_cacheTimestamp!);
    return age < _cacheValidity;
  }

  /// Cache location with timestamp
  void _cacheLocation(DetectedLocation location) {
    _cachedLocation = location;
    _cacheTimestamp = DateTime.now();
  }

  /// Clear cache (force new detection on next call)
  void clearCache() {
    _cachedLocation = null;
    _cacheTimestamp = null;
    if (kDebugMode) print('🗑️ [Location] Cache cleared');
  }

  /// Check if GPS is available and permitted
  Future<bool> isGpsAvailable() async {
    if (kIsWeb) return false;

    try {
      // Check if service enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return false;

      // Check permission
      final permission = await Geolocator.checkPermission();
      return permission == LocationPermission.always ||
             permission == LocationPermission.whileInUse;
    } catch (e) {
      return false;
    }
  }

  /// Request GPS permission explicitly
  Future<bool> requestGpsPermission() async {
    if (kIsWeb) return false;

    try {
      final permission = await Geolocator.requestPermission();
      return permission == LocationPermission.always ||
             permission == LocationPermission.whileInUse;
    } catch (e) {
      if (kDebugMode) print('❌ [Location] Permission request failed: $e');
      return false;
    }
  }

  /// Get cached location (if available)
  DetectedLocation? get cachedLocation => _cachedLocation;

  /// Check if location is cached and valid
  bool get hasCachedLocation => _isCacheValid();
}

