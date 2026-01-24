// Visibility Detector - Web Implementation
//
// Listens to document.visibilitychange events to detect when the browser tab
// becomes visible or hidden. Used for proactive session token refresh.

import 'dart:async';
import 'dart:js_interop';
import 'package:web/web.dart' as web;

/// Singleton that detects visibility changes on web.
/// Emits events when the browser tab becomes visible or hidden.
class VisibilityDetector {
  static VisibilityDetector? _instance;

  final StreamController<bool> _controller = StreamController<bool>.broadcast();
  JSFunction? _visibilityHandler;
  bool _initialized = false;

  VisibilityDetector._internal();

  /// Get the singleton instance.
  static VisibilityDetector get instance {
    _instance ??= VisibilityDetector._internal();
    return _instance!;
  }

  /// Stream that emits true when tab becomes visible, false when hidden.
  Stream<bool> get visibilityStream => _controller.stream;

  /// Current visibility state.
  bool get isVisible {
    try {
      return web.document.visibilityState == 'visible';
    } catch (e) {
      return true; // Assume visible if we can't detect
    }
  }

  /// Initialize the detector and start listening to visibility changes.
  void initialize() {
    if (_initialized) return;
    _initialized = true;

    try {
      // Create the event handler
      _visibilityHandler = ((web.Event event) {
        final visible = web.document.visibilityState == 'visible';
        _controller.add(visible);
      }).toJS;

      // Add event listener
      web.document.addEventListener('visibilitychange', _visibilityHandler);

      // Emit initial state
      _controller.add(isVisible);
    } catch (e) {
      // If we can't set up the listener, just emit visible once
      _controller.add(true);
    }
  }

  /// Dispose resources and remove event listener.
  void dispose() {
    if (_visibilityHandler != null) {
      try {
        web.document.removeEventListener('visibilitychange', _visibilityHandler);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    _controller.close();
    _initialized = false;
  }
}
