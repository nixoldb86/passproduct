// Platform Detector
//
// Cross-platform utility to detect specific browser/platform combinations.
// Uses conditional exports for web vs native implementations.

export 'platform_detector_stub.dart'
    if (dart.library.js_interop) 'platform_detector_impl.dart';
