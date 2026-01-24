// Feature Item Widgets
//
// Widgets for displaying feature lists with check icons.
// Used in freemium card and plan cards.

import 'package:flutter/material.dart';

import '../pricing_colors.dart';

/// A feature item with a check icon and text.
class FeatureItem extends StatelessWidget {
  final Widget child;
  final Color checkColor;
  final bool isMobile;

  const FeatureItem({
    super.key,
    required this.child,
    required this.checkColor,
    this.isMobile = false,
  });

  /// Creates a feature item with plain text.
  factory FeatureItem.text({
    Key? key,
    required String text,
    required Color checkColor,
    bool isMobile = false,
  }) {
    return FeatureItem(
      key: key,
      checkColor: checkColor,
      isMobile: isMobile,
      child: Text(
        text,
        style: TextStyle(
          fontSize: isMobile ? 13 : 15,
          color: PricingColors.gray300,
          height: 1.4,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: checkColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Icon(
              Icons.check,
              color: checkColor,
              size: 12,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(child: child),
        ],
      ),
    );
  }
}

/// A sub-item with a bullet point (for nested features).
class FeatureSubItem extends StatelessWidget {
  final String text;
  final Color bulletColor;
  final bool isMobile;

  const FeatureSubItem({
    super.key,
    required this.text,
    required this.bulletColor,
    this.isMobile = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 28, bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '\u2022',
            style: TextStyle(
              color: bulletColor.withValues(alpha: 0.6),
              fontSize: 12,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 11 : 13,
                color: PricingColors.gray400,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Highlighted text with a yellow background (e.g., "ilimitadas").
class HighlightedText extends StatelessWidget {
  final String text;
  final bool isMobile;

  const HighlightedText({
    super.key,
    required this.text,
    this.isMobile = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
      decoration: BoxDecoration(
        color: PricingColors.yellow400,
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: PricingColors.yellow400.withValues(alpha: 0.4),
            blurRadius: 4,
          ),
        ],
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: isMobile ? 16 : 20,
          fontWeight: FontWeight.w700,
          color: PricingColors.yellow900,
        ),
      ),
    );
  }
}
