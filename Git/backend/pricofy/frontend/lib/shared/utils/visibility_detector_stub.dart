// Visibility Detector - Non-Web Implementation
//
// Stub implementation for mobile/desktop platforms.
// Always reports as visible since there's no browser tab concept.

import 'dart:async';

/// Singleton that detects visibility changes.
/// On mobile/desktop, always reports as visible.
class VisibilityDetector {
  static VisibilityDetector? _instance;

  final StreamController<bool> _controller = StreamController<bool>.broadcast();

  VisibilityDetector._internal();

  /// Get the singleton instance.
  static VisibilityDetector get instance {
    _instance ??= VisibilityDetector._internal();
    return _instance!;
  }

  /// Stream that emits true when visible, false when hidden.
  /// On mobile/desktop, only emits true once on subscription.
  Stream<bool> get visibilityStream => _controller.stream;

  /// Current visibility state. Always true on mobile/desktop.
  bool get isVisible => true;

  /// Initialize the detector. No-op on mobile/desktop.
  void initialize() {
    // Emit initial visible state
    _controller.add(true);
  }

  /// Dispose resources.
  void dispose() {
    _controller.close();
  }
}
