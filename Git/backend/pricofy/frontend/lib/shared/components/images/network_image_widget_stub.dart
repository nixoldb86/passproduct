// Network Image Widget - Non-Web Implementation
//
// Standard Image.network implementation for mobile/desktop platforms.
// This file is used when dart.library.js_interop is not available.

import 'package:flutter/material.dart';

/// A network image widget that works across all platforms without CORS issues.
///
/// On mobile/desktop, this uses the standard Image.network widget.
class NetworkImageWidget extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final imageWidget = Image.network(
      imageUrl,
      width: width,
      height: height,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return placeholder?.call(context) ??
            SizedBox(
              width: width,
              height: height,
              child: const Center(
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            );
      },
      errorBuilder: (ctx, error, stackTrace) {
        return errorBuilder?.call(ctx, error) ??
            SizedBox(
              width: width,
              height: height,
              child: const Icon(Icons.broken_image, color: Colors.grey),
            );
      },
    );

    // Apply border radius if specified
    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }
}
