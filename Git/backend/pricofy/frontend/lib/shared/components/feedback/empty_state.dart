// Empty State Component
//
// Displays a centered message when there's no content to show.
// Used in lists, grids, and search results when empty.
//
// Usage:
// ```dart
// EmptyState(
//   icon: Icons.search_off,
//   title: 'No results found',
//   subtitle: 'Try a different search term',
//   action: TextButton(onPressed: () {}, child: Text('Clear filters')),
// )
// ```

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;
  final double iconSize;
  final Color? iconColor;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
    this.iconSize = 64,
    this.iconColor,
  });

  /// Factory for search empty state
  factory EmptyState.search({
    required String title,
    String? subtitle,
    Widget? action,
  }) {
    return EmptyState(
      icon: Icons.search_off_outlined,
      title: title,
      subtitle: subtitle,
      action: action,
    );
  }

  /// Factory for no data empty state
  factory EmptyState.noData({
    required String title,
    String? subtitle,
    Widget? action,
  }) {
    return EmptyState(
      icon: Icons.inbox_outlined,
      title: title,
      subtitle: subtitle,
      action: action,
    );
  }

  /// Factory for no favorites empty state
  factory EmptyState.noFavorites({
    required String title,
    String? subtitle,
    Widget? action,
  }) {
    return EmptyState(
      icon: Icons.favorite_border_outlined,
      title: title,
      subtitle: subtitle,
      action: action,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: iconSize,
              color: iconColor ?? AppTheme.gray400,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.gray700,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.gray500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
