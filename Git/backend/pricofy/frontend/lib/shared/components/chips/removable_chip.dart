// Removable Chip Component
//
// A compact chip with a close button for active filters and sort criteria.
// Used when the user can remove/dismiss the filter.
//
// Usage:
// ```dart
// // Filter chip with remove action
// RemovableChip(
//   label: '< 50 km',
//   onRemove: () => clearFilter(),
//   color: Colors.blue,
// )
//
// // Sort chip with toggle and remove
// RemovableChip.sort(
//   label: 'Price',
//   prefix: '↑',
//   onPrefixTap: () => toggleDirection(),
//   onRemove: () => removeSort(),
// )
// ```

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class RemovableChip extends StatelessWidget {
  final String label;
  final VoidCallback onRemove;
  final Color? color;
  final String? prefix;
  final VoidCallback? onPrefixTap;

  const RemovableChip({
    super.key,
    required this.label,
    required this.onRemove,
    this.color,
    this.prefix,
    this.onPrefixTap,
  });

  /// Sort chip variant with toggleable direction prefix
  const RemovableChip.sort({
    super.key,
    required this.label,
    required this.prefix,
    required this.onPrefixTap,
    required this.onRemove,
  }) : color = null;

  @override
  Widget build(BuildContext context) {
    final chipColor = color ?? AppTheme.primary600;
    final isSort = prefix != null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isSort
            ? AppTheme.primary100
            : chipColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isSort
              ? AppTheme.primary300
              : chipColor.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (prefix != null) ...[
            InkWell(
              onTap: onPrefixTap,
              child: Text(
                prefix!,
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.primary700,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: isSort ? AppTheme.primary700 : chipColor,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 4),
          InkWell(
            onTap: onRemove,
            child: Icon(
              Icons.close,
              size: 16,
              color: isSort ? AppTheme.primary600 : chipColor,
            ),
          ),
        ],
      ),
    );
  }
}
