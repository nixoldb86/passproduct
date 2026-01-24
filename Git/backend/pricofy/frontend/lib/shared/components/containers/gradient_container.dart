// Gradient Container Widget
//
// Container with gradient background
// Used throughout the app for hero sections, CTAs, etc.

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class GradientContainer extends StatelessWidget {
  final Widget child;
  final Gradient? gradient;
  final double? height;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;

  const GradientContainer({
    super.key,
    required this.child,
    this.gradient,
    this.height,
    this.width,
    this.padding,
    this.margin,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        gradient: gradient ?? AppTheme.primaryGradient,
        borderRadius: borderRadius,
      ),
      child: child,
    );
  }
}

/// Primary Gradient (from-primary-600 to-primary-700)
class PrimaryGradientContainer extends StatelessWidget {
  final Widget child;
  final double? height;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;

  const PrimaryGradientContainer({
    super.key,
    required this.child,
    this.height,
    this.width,
    this.padding,
    this.margin,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return GradientContainer(
      gradient: AppTheme.primaryGradient,
      height: height,
      width: width,
      padding: padding,
      margin: margin,
      borderRadius: borderRadius,
      child: child,
    );
  }
}

/// Hero Background Gradient
/// Used in hero sections (from-primary-50 via-purple-50 to-white)
class HeroGradientContainer extends StatelessWidget {
  final Widget child;
  final double? height;
  final EdgeInsetsGeometry? padding;

  const HeroGradientContainer({
    super.key,
    required this.child,
    this.height,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      padding: padding,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.primary50, // from-primary-50
            const Color(0xFFFAF5FF), // via-purple-50
            Colors.white, // to-white
          ],
        ),
      ),
      child: child,
    );
  }
}
