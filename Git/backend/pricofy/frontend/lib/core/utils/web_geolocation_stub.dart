// Web Geolocation Stub (for non-web platforms)
//
// This file provides a stub implementation for native platforms.
// The actual implementation is in web_geolocation_web.dart

import '../models/coordinates.dart';

/// Stub for native platforms - always returns null (use Geolocator instead)
Future<Coordinates?> getWebGeolocation({int timeoutSeconds = 10}) async {
  return null;
}

/// Stub for native platforms - returns false
bool isWebPlatform() => false;
