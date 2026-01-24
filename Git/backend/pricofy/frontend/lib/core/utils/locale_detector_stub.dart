// Locale Detector - Native Implementation (iOS/Android/Desktop)
//
// Uses dart:io Platform.localeName for native platforms.

import 'dart:io' show Platform;

/// Detects the device's locale on native platforms.
/// Returns locale string like "es_ES", "en_US", "fr_FR".
String? detectDeviceLocale() {
  try {
    return Platform.localeName;
  } catch (e) {
    return null;
  }
}
