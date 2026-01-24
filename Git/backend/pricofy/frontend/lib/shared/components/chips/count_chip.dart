// Count Chip Component
//
// A simple chip displaying a count value.
// Used to show item counts in headers/sections.
//
// Usage:
// ```dart
// CountChip(count: 42)
// CountChip(count: 5, backgroundColor: Colors.blue)
// ```

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class CountChip extends StatelessWidget {
  final int count;
  final Color? backgroundColor;
  final Color? textColor;

  const CountChip({
    super.key,
    required this.count,
    this.backgroundColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(
        '$count',
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: textColor ?? AppTheme.primary600,
        ),
      ),
      backgroundColor: backgroundColor ?? AppTheme.primary50,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
