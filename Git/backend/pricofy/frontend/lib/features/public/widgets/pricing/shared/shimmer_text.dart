// Shimmer Text Widget
//
// Animated text with gradient shimmer effect.
// Used for highlighting special words in pricing section.

import 'package:flutter/material.dart';

import '../pricing_colors.dart';

/// Text widget with animated gradient shimmer effect.
class ShimmerText extends StatelessWidget {
  final String text;
  final AnimationController controller;
  final double fontSize;
  final FontWeight fontWeight;

  const ShimmerText({
    super.key,
    required this.text,
    required this.controller,
    required this.fontSize,
    this.fontWeight = FontWeight.w800,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: const [
                PricingColors.purple500,
                PricingColors.pink500,
                PricingColors.purple500,
              ],
              stops: [
                0.0,
                controller.value,
                1.0,
              ],
            ).createShader(bounds);
          },
          child: Text(
            text,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: fontWeight,
              color: Colors.white,
            ),
          ),
        );
      },
    );
  }
}
