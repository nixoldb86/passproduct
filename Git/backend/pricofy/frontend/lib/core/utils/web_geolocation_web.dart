// Web Geolocation (Web-only implementation)
//
// Direct JavaScript interop for browser Geolocation API.
// Bypasses Flutter's geolocator package which has issues with permission
// callback timing on first grant.
//
// How it works:
// 1. Calls navigator.geolocation.getCurrentPosition() directly
// 2. Browser shows permission popup if needed
// 3. Success/error callbacks properly resolve the Dart Future
// 4. No timeout during permission dialog - only during position acquisition

import 'dart:async';
import 'dart:js_interop';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:web/web.dart' as web;

import '../models/coordinates.dart';

/// Returns true on web platform
bool isWebPlatform() => true;

/// Get current position using direct browser Geolocation API.
///
/// This bypasses Flutter's geolocator package which has known issues
/// with permission callbacks not resolving properly on first grant.
///
/// The browser will show the permission popup if needed, and the
/// success/error callbacks will fire once the user responds AND
/// the position is acquired (or fails).
///
/// [timeoutSeconds] is only for position acquisition AFTER permission
/// is granted. The permission dialog itself has no timeout.
Future<Coordinates?> getWebGeolocation({int timeoutSeconds = 10}) async {
  final completer = Completer<Coordinates?>();

  if (kDebugMode) {
    print('WebGeolocation: Calling navigator.geolocation.getCurrentPosition()...');
    print('WebGeolocation: Browser will show permission popup if needed');
  }

  // Success callback - called when position is acquired
  void onSuccess(web.GeolocationPosition position) {
    if (completer.isCompleted) return;

    final coords = position.coords;
    if (kDebugMode) {
      print('WebGeolocation: SUCCESS - lat: ${coords.latitude}, lon: ${coords.longitude}');
    }

    completer.complete(Coordinates(
      lat: coords.latitude,
      lon: coords.longitude,
    ));
  }

  // Error callback - called on permission deny or position error
  void onError(web.GeolocationPositionError error) {
    if (completer.isCompleted) return;

    final errorMsg = _getErrorMessage(error.code);
    if (kDebugMode) {
      print('WebGeolocation: ERROR - code: ${error.code}, message: $errorMsg');
    }

    completer.complete(null);
  }

  try {
    // Call browser API directly
    // This will:
    // 1. Show permission popup if permission not granted
    // 2. Wait for user to click Allow/Deny
    // 3. If allowed, acquire position
    // 4. Call onSuccess or onError
    //
    // The timeout in PositionOptions only applies to position acquisition,
    // NOT to the permission dialog.
    web.window.navigator.geolocation.getCurrentPosition(
      onSuccess.toJS,
      onError.toJS,
      web.PositionOptions(
        enableHighAccuracy: false, // Low accuracy is faster, good for city-level
        timeout: timeoutSeconds * 1000, // Convert to milliseconds
        maximumAge: 5 * 60 * 1000, // Accept cached position up to 5 minutes old
      ),
    );
  } catch (e) {
    if (kDebugMode) {
      print('WebGeolocation: Exception calling geolocation API - $e');
    }
    if (!completer.isCompleted) {
      completer.complete(null);
    }
  }

  return completer.future;
}

/// Convert error code to human-readable message
String _getErrorMessage(int code) {
  switch (code) {
    case 1:
      return 'PERMISSION_DENIED - User denied location access';
    case 2:
      return 'POSITION_UNAVAILABLE - Location information unavailable';
    case 3:
      return 'TIMEOUT - Position acquisition timed out';
    default:
      return 'UNKNOWN_ERROR - code: $code';
  }
}
