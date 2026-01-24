// Platform Detector - Web Implementation
//
// Detects iOS devices using the most reliable 2025 approach:
// 1. userAgent containing iPhone/iPad/iPod
// 2. iPad in desktop mode: platform "MacIntel" + maxTouchPoints > 1
//
// All browsers on iOS (Safari, Chrome, Firefox, Edge) use WebKit engine,
// so detecting iOS means detecting WebKit-based browsers that need workarounds.
//
// References:
// - https://evilmartians.com/chronicles/how-to-detect-safari-and-ios-versions-with-ease
// - https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints
//
// Verified: Changes from commit 430f2b8 are included (improved iOS detection)

import 'package:web/web.dart' as web;

/// Cached detection results
bool? _isIOSWebCached;

/// Returns true if running on any iOS browser (Safari, Chrome, Firefox, Edge).
///
/// Detection method:
/// 1. userAgent contains "iPhone", "iPad", or "iPod"
/// 2. OR platform is "MacIntel" with maxTouchPoints > 1 (iPad in desktop mode)
///
/// Why maxTouchPoints > 1 (not > 0)?
/// - Mac with trackpad has maxTouchPoints = 1
/// - iPad has maxTouchPoints = 5
/// - Chrome desktop without touch has maxTouchPoints = 0
///
/// This detects ALL iOS browsers because Apple requires all browsers on iOS
/// to use the WebKit engine. The proxy workaround is needed for all of them
/// due to memory issues with CanvasKit images and HtmlElementView.
bool get isIOSSafariWeb {
  if (_isIOSWebCached != null) return _isIOSWebCached!;

  try {
    final userAgent = web.window.navigator.userAgent;
    final platform = web.window.navigator.platform;
    final maxTouchPoints = web.window.navigator.maxTouchPoints;

    // Method 1: Direct iOS device detection via userAgent
    final isIOSDevice = userAgent.contains('iPhone') ||
                        userAgent.contains('iPad') ||
                        userAgent.contains('iPod');

    // Method 2: iPad in desktop mode (iOS 13+)
    // Reports platform as "MacIntel" but has multi-touch support
    // Mac with trackpad has maxTouchPoints = 1, iPad has > 1
    final isIPadDesktopMode = platform == 'MacIntel' && maxTouchPoints > 1;

    _isIOSWebCached = isIOSDevice || isIPadDesktopMode;
  } catch (e) {
    _isIOSWebCached = false;
  }

  return _isIOSWebCached!;
}

/// Returns true if running on any iOS web browser.
/// Alias for isIOSSafariWeb since all iOS browsers use WebKit.
bool get isIOSWeb => isIOSSafariWeb;
