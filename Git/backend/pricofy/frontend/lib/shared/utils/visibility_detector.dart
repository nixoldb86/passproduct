// Visibility Detector
//
// Cross-platform utility to detect when the app/tab becomes visible or hidden.
// On web, listens to document.visibilitychange events.
// On mobile/desktop, always reports as visible (no background tab concept).
//
// This file exports the correct implementation based on platform.

export 'visibility_detector_stub.dart'
    if (dart.library.js_interop) 'visibility_detector_impl.dart';
