// Error State Component
//
// Displays error messages with retry functionality.
// Two variants: centered (full-page) and inline (row-based).
//
// Usage:
// ```dart
// // Centered error (for pages/sections)
// ErrorState(
//   title: 'Search error',
//   message: 'Could not load results',
//   onRetry: () => reload(),
// )
//
// // Inline error (for compact spaces)
// ErrorState.inline(
//   message: 'Error loading history',
//   onRetry: () => reload(),
// )
// ```

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

enum ErrorStateVariant { centered, inline }

class ErrorState extends StatelessWidget {
  final String? title;
  final String message;
  final VoidCallback? onRetry;
  final String? retryLabel;
  final ErrorStateVariant variant;
  final double iconSize;

  const ErrorState({
    super.key,
    this.title,
    required this.message,
    this.onRetry,
    this.retryLabel,
    this.iconSize = 80,
  }) : variant = ErrorStateVariant.centered;

  /// Inline error for compact spaces (row-based)
  const ErrorState.inline({
    super.key,
    required this.message,
    this.onRetry,
    this.retryLabel,
  })  : title = null,
        variant = ErrorStateVariant.inline,
        iconSize = 24;

  @override
  Widget build(BuildContext context) {
    return variant == ErrorStateVariant.centered
        ? _buildCentered(context)
        : _buildInline(context);
  }

  Widget _buildCentered(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: iconSize,
              color: Colors.red.shade300,
            ),
            if (title != null) ...[
              const SizedBox(height: 16),
              Text(
                title!,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.red,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                message,
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.gray600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: Text(retryLabel ?? 'Retry'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInline(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red.shade400, size: iconSize),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: Colors.red.shade700),
            ),
          ),
          if (onRetry != null)
            TextButton(
              onPressed: onRetry,
              child: Text(retryLabel ?? 'Retry'),
            ),
        ],
      ),
    );
  }
}
