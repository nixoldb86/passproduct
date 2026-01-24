// Responsive Utilities
//
// Helpers for responsive design and platform detection

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'dart:io' show Platform;

/// Breakpoints (matching Tailwind CSS defaults)
class Breakpoints {
  static const double mobile = 640;
  static const double tablet = 768;
  static const double desktop = 1024;
  static const double widescreen = 1280;
}

/// Responsive builder widget
class ResponsiveBuilder extends StatelessWidget {
  final Widget Function(BuildContext context, ResponsiveInfo info) builder;

  const ResponsiveBuilder({super.key, required this.builder});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final info = ResponsiveInfo(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
        );
        return builder(context, info);
      },
    );
  }
}

/// Responsive information
class ResponsiveInfo {
  final double width;
  final double height;

  ResponsiveInfo({required this.width, required this.height});

  bool get isMobile => width < Breakpoints.mobile;
  bool get isTablet =>
      width >= Breakpoints.mobile && width < Breakpoints.desktop;
  bool get isDesktop => width >= Breakpoints.desktop;
  bool get isWidescreen => width >= Breakpoints.widescreen;

  /// Get number of columns for grid
  int get gridColumns {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isWidescreen) return 4;
    return 3; // desktop
  }

  /// Get horizontal padding
  double get horizontalPadding {
    if (isMobile) return 16;
    if (isTablet) return 24;
    return 32;
  }
}

/// Platform detection
class PlatformUtils {
  /// Check if running on web
  static bool get isWeb => kIsWeb;

  /// Check if running on mobile (iOS or Android)
  static bool get isMobile {
    if (kIsWeb) return false;
    try {
      return Platform.isAndroid || Platform.isIOS;
    } catch (e) {
      return false;
    }
  }

  /// Check if running on Android
  static bool get isAndroid {
    if (kIsWeb) return false;
    try {
      return Platform.isAndroid;
    } catch (e) {
      return false;
    }
  }

  /// Check if running on iOS
  static bool get isIOS {
    if (kIsWeb) return false;
    try {
      return Platform.isIOS;
    } catch (e) {
      return false;
    }
  }

  /// Check if running on desktop (macOS, Windows, Linux)
  static bool get isDesktop {
    if (kIsWeb) return false;
    try {
      return Platform.isMacOS || Platform.isWindows || Platform.isLinux;
    } catch (e) {
      return false;
    }
  }
}

/// Extension on BuildContext for easy access
extension ResponsiveContext on BuildContext {
  /// Get screen width
  double get screenWidth => MediaQuery.of(this).size.width;

  /// Get screen height
  double get screenHeight => MediaQuery.of(this).size.height;

  /// Check if mobile
  bool get isMobile => screenWidth < Breakpoints.mobile;

  /// Check if tablet
  bool get isTablet =>
      screenWidth >= Breakpoints.mobile && screenWidth < Breakpoints.desktop;

  /// Check if desktop
  bool get isDesktop => screenWidth >= Breakpoints.desktop;

  /// Check if widescreen
  bool get isWidescreen => screenWidth >= Breakpoints.widescreen;

  /// Get responsive padding
  EdgeInsets get responsivePadding {
    if (isMobile) {
      return const EdgeInsets.all(16);
    } else if (isTablet) {
      return const EdgeInsets.all(24);
    }
    return const EdgeInsets.all(32);
  }

  /// Get responsive horizontal padding
  EdgeInsets get responsiveHorizontalPadding {
    if (isMobile) {
      return const EdgeInsets.symmetric(horizontal: 16);
    } else if (isTablet) {
      return const EdgeInsets.symmetric(horizontal: 24);
    }
    return const EdgeInsets.symmetric(horizontal: 32);
  }
}
