// Locale Detector
//
// Cross-platform utility to detect device/browser locale.
// Uses conditional exports for web vs native implementations.

export 'locale_detector_stub.dart'
    if (dart.library.js_interop) 'locale_detector_web.dart';
