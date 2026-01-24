// Location Provider
//
// Detects user location lazily on first search (GPS on mobile, IP on desktop).
// Stores location in memory (NOT persistent - re-detects on reload for VPN/travel support).
// Provides location data to SearchProvider for searches.

import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

import '../api/bff_api_client.dart';
import '../models/user_location.dart';
import '../models/coordinates.dart';

// Conditional import for web-specific geolocation
// On web: uses direct JavaScript interop (bypasses geolocator bugs)
// On native: stub returns null (uses geolocator package)
import '../utils/web_geolocation_stub.dart'
    if (dart.library.js_interop) '../utils/web_geolocation_web.dart';

/// Status of location detection
enum LocationStatus {
  /// Initial state, detection not started
  unknown,

  /// Actively detecting location (GPS or IP)
  detecting,

  /// Location successfully detected
  detected,

  /// Detection failed, using fallback
  error,
}

/// Provider for user location detection and storage.
///
/// Detects location LAZILY on first search:
/// 1. SearchProvider calls ensureLocationDetected() before searching
/// 2. Attempts GPS detection via browser/device (shows permission dialog)
/// 3. Calls BFF /detect-location with GPS (or IP-only if GPS denied)
/// 4. Stores result in memory for subsequent searches
///
/// Location is NOT persisted - re-detects on app reload to support VPN/travel.
class LocationProvider extends ChangeNotifier {
  final BffApiClient _apiClient;

  LocationStatus _status = LocationStatus.unknown;
  UserLocation? _location;
  String? _errorMessage;

  /// Completer to track ongoing detection (allows multiple callers to wait)
  Completer<void>? _detectionCompleter;

  LocationProvider({required BffApiClient apiClient}) : _apiClient = apiClient;
  // Note: Detection is lazy - called via ensureLocationDetected() on first search

  // Getters for status
  LocationStatus get status => _status;
  bool get isDetecting => _status == LocationStatus.detecting;
  bool get isDetected => _status == LocationStatus.detected;
  bool get hasError => _status == LocationStatus.error;
  String? get errorMessage => _errorMessage;

  // Getters for location data
  UserLocation? get location => _location;
  String? get countryCode => _location?.countryCode;
  String? get postalCode => _location?.postalCode;
  String? get municipality => _location?.municipality;
  Coordinates? get coords => _location?.coords;

  /// True if we have precise postal code centroid coordinates
  bool get hasPreciseLocation => _location?.hasPreciseCoords ?? false;

  /// True if the detected country is fully supported for geocoding
  bool get isFullySupported => _location?.isFullySupported ?? false;

  /// Location source for debugging/display
  LocationSource? get source => _location?.source;

  /// GPS coordinates for search requests.
  /// Returns null if no valid coordinates available.
  /// Validates that coordinates are not (0,0) and are within valid ranges.
  Map<String, double>? get gpsForSearch {
    final coords = _location?.coords;
    if (coords == null || !coords.isValid) return null;
    return {
      'lat': coords.lat,
      'lon': coords.lon,
    };
  }

  /// Ensures location is detected before proceeding.
  ///
  /// Call this before any operation that needs location data (e.g., search).
  /// - If already detected, returns immediately
  /// - If detection is in progress, waits for it to complete
  /// - If not started, initiates detection and waits
  ///
  /// This method is safe to call multiple times concurrently.
  Future<void> ensureLocationDetected() async {
    // Already detected successfully - return immediately
    // Note: If status is 'error', we retry detection (user may have fixed permissions)
    if (_status == LocationStatus.detected) {
      return;
    }

    // Detection already in progress - wait for it
    if (_detectionCompleter != null) {
      await _detectionCompleter!.future;
      return;
    }

    // Start detection
    await _initLocation();
  }

  /// Initialize location detection.
  /// Called lazily on first search, not on app load.
  Future<void> _initLocation() async {
    // Create completer so other callers can wait
    _detectionCompleter = Completer<void>();

    _status = LocationStatus.detecting;
    notifyListeners();

    try {
      // Step 1: Try to get GPS from browser/device
      // This may show permission dialog and wait for user response
      Coordinates? gpsCoords = await _tryGpsDetection();

      // Step 2: Call BFF /detect-location with GPS (or IP-only if no GPS)
      final result = await _apiClient.detectLocation(
        lat: gpsCoords?.lat,
        lon: gpsCoords?.lon,
      );

      // Step 3: Parse and store result
      _location = UserLocation.fromJson(result);
      _status = LocationStatus.detected;
      _errorMessage = null;

      if (kDebugMode) {
        print('LocationProvider: Detected location - '
            'country: ${_location?.countryCode}, '
            'source: ${_location?.source}, '
            'coords: ${_location?.coords}');
      }
    } catch (e) {
      // Detection failed, use fallback
      _status = LocationStatus.error;
      _errorMessage = e.toString();
      _location = UserLocation.fallback();

      if (kDebugMode) {
        print('LocationProvider: Detection failed, using fallback - $e');
      }
    }

    // Complete the future so any waiters can proceed
    _detectionCompleter?.complete();
    _detectionCompleter = null;

    notifyListeners();
  }

  /// Attempt to get GPS coordinates from browser/device.
  /// Returns null if GPS is unavailable or permission denied.
  ///
  /// On WEB: Uses direct JavaScript interop to call browser's Geolocation API.
  /// This bypasses Flutter's geolocator package which has a known bug where
  /// the Future doesn't properly resolve after first permission grant.
  ///
  /// On NATIVE: Uses geolocator package normally.
  Future<Coordinates?> _tryGpsDetection() async {
    // WEB: Use direct JavaScript interop (bypasses geolocator bugs)
    if (isWebPlatform()) {
      if (kDebugMode) {
        print('LocationProvider: [WEB] Using direct browser Geolocation API');
      }
      return await getWebGeolocation(timeoutSeconds: 10);
    }

    // NATIVE (iOS/Android): Use geolocator package
    return await _tryGpsDetectionNative();
  }

  /// Native platform GPS detection using geolocator package.
  Future<Coordinates?> _tryGpsDetectionNative() async {
    try {
      if (kDebugMode) {
        print('LocationProvider: [1/4] Checking if location services enabled...');
      }

      // Check if location services are enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (kDebugMode) {
          print('LocationProvider: Location services disabled');
        }
        return null;
      }

      if (kDebugMode) {
        print('LocationProvider: [2/4] Location services OK, checking permission...');
      }

      // Check/request permission
      LocationPermission permission = await Geolocator.checkPermission();

      if (kDebugMode) {
        print('LocationProvider: [2b/4] Current permission: $permission');
      }

      if (permission == LocationPermission.denied) {
        if (kDebugMode) {
          print('LocationProvider: [2c/4] Requesting permission...');
        }
        permission = await Geolocator.requestPermission();
        if (kDebugMode) {
          print('LocationProvider: [2d/4] Permission after request: $permission');
        }
        if (permission == LocationPermission.denied) {
          if (kDebugMode) {
            print('LocationProvider: GPS permission denied by user');
          }
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (kDebugMode) {
          print('LocationProvider: GPS permission permanently denied');
        }
        return null;
      }

      if (kDebugMode) {
        print('LocationProvider: [3/4] Permission granted! Getting position...');
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        locationSettings: LocationSettings(
          accuracy: LocationAccuracy.low,
          timeLimit: Duration(seconds: 10),
        ),
      );

      if (kDebugMode) {
        print('LocationProvider: [4/4] GPS detected - '
            'lat: ${position.latitude}, lon: ${position.longitude}');
      }

      return Coordinates(
        lat: position.latitude,
        lon: position.longitude,
      );
    } on TimeoutException {
      if (kDebugMode) {
        print('LocationProvider: GPS timeout, will use IP fallback');
      }
      return null;
    } catch (e) {
      if (kDebugMode) {
        print('LocationProvider: GPS detection failed - $e');
      }
      return null;
    }
  }

  /// Force re-detection of location.
  /// Useful after user changes VPN or travels.
  Future<void> refreshLocation() async {
    await _initLocation();
  }
}
