// Pricing Tabs Widget
//
// Animated tab selector for switching between buying and selling plans.
// Features shimmer effect on active tab indicator.

import 'package:flutter/material.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/utils/responsive.dart';
import 'pricing_colors.dart';

enum PricingTabType { buying, selling }

/// Animated tab selector for buying/selling pricing plans.
class PricingTabs extends StatelessWidget {
  final PricingTabType activeTab;
  final AnimationController shimmerController;
  final ValueChanged<PricingTabType> onTabChanged;

  const PricingTabs({
    super.key,
    required this.activeTab,
    required this.shimmerController,
    required this.onTabChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isBuying = activeTab == PricingTabType.buying;
    final isMobile = context.isMobile;
    final isEnglish = l10n.localeName == 'en';
    final isMobileEnglish = isMobile && isEnglish;

    // Calcular el ancho del indicador basado en el texto
    final buyingText = l10n.pricingForBuyingTab;
    final sellingText = l10n.pricingForSellingTab;
    final textStyle = TextStyle(
      fontSize: isMobileEnglish ? 13 : 14,
      fontWeight: FontWeight.w600,
    );
    final horizontalPadding = isMobileEnglish ? 16.0 : 24.0;
    
    final textPainter = TextPainter(
      text: TextSpan(text: isBuying ? buyingText : sellingText, style: textStyle),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    final textWidth = textPainter.size.width;
    final indicatorWidth = textWidth + (horizontalPadding * 2);

    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: PricingColors.gray800.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: PricingColors.gray700.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 16,
          ),
        ],
      ),
      child: Stack(
        children: [
          _buildAnimatedIndicator(isBuying, indicatorWidth),
          _buildTabButtons(l10n, isBuying, isMobileEnglish),
        ],
      ),
    );
  }

  Widget _buildAnimatedIndicator(bool isBuying, double width) {
    return AnimatedPositioned(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      left: isBuying ? 6 : null,
      right: isBuying ? null : 6,
      top: 6,
      bottom: 6,
      width: width,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isBuying
                ? [
                    const Color(0xFFF5F3FF).withValues(alpha: 0.9),
                    const Color(0xFFEDE9FE).withValues(alpha: 0.8),
                    const Color(0xFFF5F3FF).withValues(alpha: 0.9),
                  ]
                : [
                    const Color(0xFFF0FDF4).withValues(alpha: 0.9),
                    const Color(0xFFDCFCE7).withValues(alpha: 0.8),
                    const Color(0xFFF0FDF4).withValues(alpha: 0.9),
                  ],
          ),
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: isBuying
                ? PricingColors.primary700.withValues(alpha: 0.3)
                : PricingColors.green500.withValues(alpha: 0.3),
            width: 0.5,
          ),
          boxShadow: [
            BoxShadow(
              color: (isBuying ? PricingColors.purple500 : PricingColors.green500)
                  .withValues(alpha: 0.15),
              blurRadius: 32,
            ),
          ],
        ),
        child: _buildShimmerEffect(isBuying, width),
      ),
    );
  }

  Widget _buildShimmerEffect(bool isBuying, double width) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(100),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background gradient
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.white.withValues(alpha: 0.3),
                  Colors.transparent,
                ],
              ),
            ),
          ),
          // Shimmer animation
          AnimatedBuilder(
            animation: shimmerController,
            builder: (context, child) {
              return Transform.translate(
                offset: Offset(
                  -width + shimmerController.value * (width * 2),
                  0,
                ),
                child: Container(
                  width: width * 0.5,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.transparent,
                        Colors.white.withValues(alpha: 0.8),
                        Colors.white,
                        Colors.white.withValues(alpha: 0.8),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTabButtons(dynamic l10n, bool isBuying, bool isMobileEnglish) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _TabButton(
          label: l10n.pricingForBuyingTab,
          isActive: isBuying,
          isBuying: true,
          onTap: () => onTabChanged(PricingTabType.buying),
          isMobileEnglish: isMobileEnglish,
        ),
        _TabButton(
          label: l10n.pricingForSellingTab,
          isActive: !isBuying,
          isBuying: false,
          onTap: () => onTabChanged(PricingTabType.selling),
          isMobileEnglish: isMobileEnglish,
        ),
      ],
    );
  }
}

class _TabButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final bool isBuying;
  final VoidCallback onTap;
  final bool isMobileEnglish;

  const _TabButton({
    required this.label,
    required this.isActive,
    required this.isBuying,
    required this.onTap,
    this.isMobileEnglish = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isMobileEnglish ? 16 : 24,
          vertical: 12,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: isMobileEnglish ? 13 : 14,
            fontWeight: FontWeight.w600,
            color: isActive
                ? (isBuying ? PricingColors.primary700 : PricingColors.green500)
                : PricingColors.gray400,
          ),
        ),
      ),
    );
  }
}
