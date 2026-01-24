// Locale Detector - Web Implementation
//
// Uses browser's navigator.language API via package:web.

import 'package:web/web.dart' as web;

/// Detects the browser's locale on web platforms.
/// Returns locale string like "es", "en-US", "fr-FR".
String? detectDeviceLocale() {
  try {
    return web.window.navigator.language;
  } catch (e) {
    return null;
  }
}
