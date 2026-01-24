// Network Image Widget - Web Implementation
//
// For iOS Safari: Uses Image.network with BFF proxy to avoid memory crashes.
// For other platforms: Uses HtmlElementView with a POOLED approach.
//
// iOS Safari has known memory issues with both CanvasKit images and
// HtmlElementView platform views. The proxy solution works around this.

import 'dart:js_interop';
import 'package:web/web.dart' as web;
import 'dart:ui_web' as ui_web;
import 'package:flutter/material.dart';

import '../../utils/platform_detector.dart';
import '../../../config/environment.dart';
import '../../../core/api/bff_session_manager.dart';

/// Pool size - maximum concurrent images visible + scroll buffer
/// Mobile: ~4-6 cards visible, ~3-4 list items visible
/// With scroll buffer, 20 is plenty
const int _poolSize = 20;

/// Track which pool slots are in use
final Set<int> _usedSlots = {};

/// Track if pool has been initialized
bool _poolInitialized = false;

/// Map from slot index to the img element (persistent, reused)
final Map<int, web.HTMLImageElement> _imgElements = {};

/// Map from slot index to the current state callbacks
final Map<int, _ImageCallbacks> _slotCallbacks = {};

/// Callbacks for load/error events
class _ImageCallbacks {
  final void Function() onLoad;
  final void Function() onError;
  _ImageCallbacks({required this.onLoad, required this.onError});
}

/// Initialize the pool of view factories (called once)
void _initializePool() {
  if (_poolInitialized) return;
  _poolInitialized = true;

  for (int i = 0; i < _poolSize; i++) {
    final viewType = 'network-image-pool-$i';

    // Create the img element once - it will be reused
    final img = web.HTMLImageElement();
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.display = 'block';
    _imgElements[i] = img;

    // Set up event handlers that delegate to current callbacks
    final slotIndex = i;
    img.onload = ((web.Event event) {
      _slotCallbacks[slotIndex]?.onLoad();
    }).toJS;

    img.onerror = ((web.Event event) {
      _slotCallbacks[slotIndex]?.onError();
    }).toJS;

    // Register the view factory
    ui_web.platformViewRegistry.registerViewFactory(
      viewType,
      (int viewId) {
        // Return a container with the img element
        final container = web.HTMLDivElement();
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.overflow = 'hidden';
        container.appendChild(_imgElements[slotIndex]!);
        return container;
      },
    );
  }
}

/// Acquire a slot from the pool, returns null if pool exhausted
int? _acquireSlot() {
  _initializePool();

  for (int i = 0; i < _poolSize; i++) {
    if (!_usedSlots.contains(i)) {
      _usedSlots.add(i);
      return i;
    }
  }
  return null; // Pool exhausted
}

/// Release a slot back to the pool
void _releaseSlot(int slot) {
  _usedSlots.remove(slot);
  _slotCallbacks.remove(slot);
  // Clear the image src to free memory
  _imgElements[slot]?.src = '';
}

/// Update an existing slot with new image URL and callbacks
void _updateSlot(int slot, String url, String objectFit, _ImageCallbacks callbacks) {
  _slotCallbacks[slot] = callbacks;
  final img = _imgElements[slot];
  if (img != null) {
    img.style.objectFit = objectFit;
    img.src = url; // This triggers load/error
  }
}

/// A network image widget that works across all platforms without CORS issues.
///
/// On web platforms, this uses native HTML img elements which are not subject
/// to CORS restrictions (unlike XMLHttpRequest used by Flutter's Image.network
/// in CanvasKit/WASM mode).
///
/// Uses a pooled approach to limit platform views and prevent iOS crashes.
class NetworkImageWidget extends StatefulWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget Function(BuildContext context)? placeholder;
  final Widget Function(BuildContext context, Object error)? errorBuilder;
  final BorderRadius? borderRadius;

  const NetworkImageWidget({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorBuilder,
    this.borderRadius,
  });

  @override
  State<NetworkImageWidget> createState() => _NetworkImageWidgetState();
}

class _NetworkImageWidgetState extends State<NetworkImageWidget> {
  int? _slotIndex;
  String? _viewType;
  bool _isLoading = true;
  bool _hasError = false;
  Object? _error;
  bool _poolExhausted = false;

  @override
  void initState() {
    super.initState();
    _acquireAndSetupSlot();
  }

  void _acquireAndSetupSlot() {
    _slotIndex = _acquireSlot();
    if (_slotIndex == null) {
      _poolExhausted = true;
      return;
    }

    _viewType = 'network-image-pool-$_slotIndex';
    _loadImage();
  }

  void _loadImage() {
    if (_slotIndex == null) return;

    final safeUrl = _sanitizeImageUrl(widget.imageUrl);
    final objectFit = _getObjectFit(widget.fit);

    _updateSlot(
      _slotIndex!,
      safeUrl,
      objectFit,
      _ImageCallbacks(
        onLoad: () {
          if (mounted) {
            setState(() {
              _isLoading = false;
              _hasError = false;
            });
          }
        },
        onError: () {
          if (mounted) {
            setState(() {
              _isLoading = false;
              _hasError = true;
              _error = 'Failed to load image';
            });
          }
        },
      ),
    );
  }

  @override
  void dispose() {
    if (_slotIndex != null) {
      _releaseSlot(_slotIndex!);
    }
    super.dispose();
  }

  @override
  void didUpdateWidget(NetworkImageWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.imageUrl != widget.imageUrl) {
      setState(() {
        _isLoading = true;
        _hasError = false;
      });
      _loadImage();
    }
  }

  String _getObjectFit(BoxFit fit) {
    switch (fit) {
      case BoxFit.contain:
        return 'contain';
      case BoxFit.cover:
        return 'cover';
      case BoxFit.fill:
        return 'fill';
      case BoxFit.fitWidth:
        return 'scale-down';
      case BoxFit.fitHeight:
        return 'scale-down';
      case BoxFit.none:
        return 'none';
      case BoxFit.scaleDown:
        return 'scale-down';
    }
  }

  @override
  Widget build(BuildContext context) {
    // iOS Safari: Use Image.network with BFF proxy (avoids memory crashes)
    if (isIOSSafariWeb) {
      return _buildProxiedImage(context);
    }

    // Other platforms: Use HtmlElementView pool
    return _buildHtmlElementViewImage(context);
  }

  /// Build image using dedicated proxy Lambda for iOS Safari
  /// Uses staticCachedToken - the image-proxy allows 1-day grace period on token expiration
  Widget _buildProxiedImage(BuildContext context) {
    final sessionToken = BffSessionManager.staticCachedToken;

    if (sessionToken == null) {
      // No token yet - show placeholder
      return _wrapWithBorderRadius(
        widget.placeholder?.call(context) ??
            Container(
              width: widget.width,
              height: widget.height,
              color: Colors.grey[200],
              child: const Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
      );
    }

    final proxyUrl =
        '${Environment.imageProxyUrl}?url=${Uri.encodeComponent(widget.imageUrl)}';

    final imageWidget = Image.network(
      proxyUrl,
      width: widget.width,
      height: widget.height,
      fit: widget.fit,
      headers: {
        'Accept': 'image/*',
        'X-Session-Token': sessionToken,
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return widget.placeholder?.call(context) ??
            Container(
              width: widget.width,
              height: widget.height,
              color: Colors.grey[200],
              child: const Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            );
      },
      errorBuilder: (context, error, stackTrace) {
        return widget.errorBuilder?.call(context, error) ??
            SizedBox(
              width: widget.width,
              height: widget.height,
              child: const Icon(Icons.broken_image, color: Colors.grey),
            );
      },
    );

    return _wrapWithBorderRadius(imageWidget);
  }

  /// Build image using HtmlElementView pool for other platforms
  Widget _buildHtmlElementViewImage(BuildContext context) {
    // Pool exhausted - show placeholder
    if (_poolExhausted || _viewType == null) {
      final placeholderWidget = widget.placeholder?.call(context) ??
          Container(
            width: widget.width,
            height: widget.height,
            color: Colors.grey[200],
            child: const Center(
              child: Icon(Icons.image, color: Colors.grey, size: 24),
            ),
          );
      return _wrapWithBorderRadius(placeholderWidget);
    }

    // Show error widget if load failed
    if (_hasError) {
      final errorWidget =
          widget.errorBuilder?.call(context, _error ?? 'Unknown error') ??
              SizedBox(
                width: widget.width,
                height: widget.height,
                child: const Icon(Icons.broken_image, color: Colors.grey),
              );
      return _wrapWithBorderRadius(errorWidget);
    }

    // Stack the HTML element with a placeholder while loading
    final imageWidget = SizedBox(
      width: widget.width,
      height: widget.height,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Placeholder shown while loading
          if (_isLoading)
            widget.placeholder?.call(context) ??
                Container(
                  color: Colors.grey[200],
                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                ),
          // HTML img element - always present to ensure it loads
          Opacity(
            opacity: _isLoading ? 0.0 : 1.0,
            child: HtmlElementView(viewType: _viewType!),
          ),
        ],
      ),
    );

    return _wrapWithBorderRadius(imageWidget);
  }

  Widget _wrapWithBorderRadius(Widget child) {
    if (widget.borderRadius != null) {
      return ClipRRect(
        borderRadius: widget.borderRadius!,
        child: child,
      );
    }
    return child;
  }

  /// Sanitizes image URL to avoid "illegal argument percent encoding" errors.
  String _sanitizeImageUrl(String url) {
    if (url.isEmpty) return url;
    try {
      final uri = Uri.parse(url);
      return uri.toString();
    } catch (e) {
      return url.replaceAllMapped(
        RegExp(r'%(?![0-9A-Fa-f]{2})'),
        (match) => '%25',
      );
    }
  }
}
