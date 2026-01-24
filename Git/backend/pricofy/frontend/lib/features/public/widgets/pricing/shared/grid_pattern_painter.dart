// Grid Pattern Painter
//
// CustomPainter that draws a subtle grid pattern.
// Used as background decoration in pricing sections.

import 'package:flutter/material.dart';

/// Draws a grid pattern with configurable line color and spacing.
class GridPatternPainter extends CustomPainter {
  final Color lineColor;
  final double spacing;

  GridPatternPainter({
    required this.lineColor,
    this.spacing = 40,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 1;

    // Vertical lines
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Horizontal lines
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant GridPatternPainter oldDelegate) {
    return oldDelegate.lineColor != lineColor || oldDelegate.spacing != spacing;
  }
}
