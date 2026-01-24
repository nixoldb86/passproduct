// FAQ Section Widget
//
// Displays frequently asked questions with hover effects.
// Grid pattern background for visual interest.

import 'package:flutter/material.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/utils/responsive.dart';
import 'pricing_colors.dart';
import 'shared/grid_pattern_painter.dart';

/// Data model for a FAQ item.
class FaqData {
  final String question;
  final String answer;

  const FaqData({
    required this.question,
    required this.answer,
  });
}

/// FAQ section with badge, title, and expandable items.
class FaqSection extends StatelessWidget {
  final List<FaqData> faqs;

  const FaqSection({
    super.key,
    required this.faqs,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [PricingColors.gray900, PricingColors.gray950],
        ),
      ),
      child: Stack(
        children: [
          // Content first (defines size)
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isMobile ? 48 : 96,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  children: [
                    _buildBadge(l10n),
                    const SizedBox(height: 24),
                    _buildTitle(l10n, isMobile),
                    const SizedBox(height: 48),
                    ...faqs.map((faq) => FaqItem(
                          question: faq.question,
                          answer: faq.answer,
                        )),
                  ],
                ),
              ),
            ),
          ),
          // Grid pattern as overlay
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: GridPatternPainter(
                  lineColor: Colors.white.withValues(alpha: 0.05),
                  spacing: 40,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(dynamic l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: PricingColors.primary500.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        l10n.pricingFaqBadge,
        style: const TextStyle(
          color: PricingColors.purple400,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTitle(dynamic l10n, bool isMobile) {
    return Text(
      l10n.pricingFaqTitle,
      style: TextStyle(
        fontSize: isMobile ? 32 : 48,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
      textAlign: TextAlign.center,
    );
  }
}

/// Individual FAQ item with hover effect.
class FaqItem extends StatefulWidget {
  final String question;
  final String answer;

  const FaqItem({
    super.key,
    required this.question,
    required this.answer,
  });

  @override
  State<FaqItem> createState() => _FaqItemState();
}

class _FaqItemState extends State<FaqItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.only(bottom: 24),
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: PricingColors.gray800.withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isHovered ? PricingColors.primary600 : PricingColors.gray700,
            width: 2,
          ),
          boxShadow: _isHovered
              ? [
                  BoxShadow(
                    color: PricingColors.primary600.withValues(alpha: 0.2),
                    blurRadius: 20,
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.question,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: _isHovered ? PricingColors.purple400 : Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              widget.answer,
              style: const TextStyle(
                fontSize: 16,
                color: PricingColors.gray300,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
