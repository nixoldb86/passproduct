// Platform Detector - Stub Implementation (Mobile/Desktop)
//
// On native platforms (iOS, Android, macOS, Windows, Linux),
// we never need the image proxy - native apps handle images directly.

/// Returns true if running on iOS Safari web.
/// Always false on native platforms.
bool get isIOSSafariWeb => false;

/// Returns true if running on any iOS web browser.
/// Always false on native platforms.
bool get isIOSWeb => false;
