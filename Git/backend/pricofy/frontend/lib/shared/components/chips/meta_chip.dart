// Meta Chip Component
//
// A simple informational chip with icon + label.
// Used for displaying metadata (location, date, category).
//
// Usage:
// ```dart
// MetaChip(
//   icon: Icons.location_on_outlined,
//   label: 'Madrid (28001)',
// )
// ```

import 'package:flutter/material.dart';

class MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? backgroundColor;
  final Color? iconColor;
  final Color? labelColor;

  const MetaChip({
    super.key,
    required this.icon,
    required this.label,
  })  : backgroundColor = null,
        iconColor = null,
        labelColor = null;

  const MetaChip.custom({
    super.key,
    required this.icon,
    required this.label,
    this.backgroundColor,
    this.iconColor,
    this.labelColor,
  });

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(
        icon,
        size: 16,
        color: iconColor,
      ),
      label: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          color: labelColor,
        ),
      ),
      backgroundColor: backgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
