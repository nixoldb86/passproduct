// Freemium Card Widget
//
// Card displaying the free tier features for buying and selling.
// Shows two columns with different feature sets.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/utils/responsive.dart';
import 'pricing_colors.dart';
import 'shared/feature_item.dart';
import 'shared/grid_pattern_painter.dart';
import 'shared/shimmer_text.dart';

/// Section containing the freemium card with title and subtitle.
class FreemiumSection extends StatelessWidget {
  final AnimationController shimmerController;

  const FreemiumSection({
    super.key,
    required this.shimmerController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;

    return Container(
      width: double.infinity,
      color: PricingColors.gray950,
      child: Stack(
        children: [
          // Content first (defines size)
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isMobile ? 32 : 48,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1280),
                child: Column(
                  children: [
                    Text(
                      l10n.pricingFreemiumTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 28 : 36,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.pricingFreemiumSubtitle,
                      style: const TextStyle(
                        fontSize: 16,
                        color: PricingColors.gray400,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    FreemiumCard(shimmerController: shimmerController),
                  ],
                ),
              ),
            ),
          ),
          // Grid pattern as overlay (doesn't block interactions)
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: GridPatternPainter(
                  lineColor: Colors.white.withValues(alpha: 0.03),
                  spacing: 40,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// The main freemium card with two columns for buying and selling.
class FreemiumCard extends StatelessWidget {
  final AnimationController shimmerController;

  const FreemiumCard({
    super.key,
    required this.shimmerController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;

    return Container(
      constraints: const BoxConstraints(maxWidth: 900),
      decoration: BoxDecoration(
        color: PricingColors.gray800.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: PricingColors.gray700, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      padding: EdgeInsets.all(isMobile ? 16 : 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(l10n, isMobile),
          SizedBox(height: isMobile ? 16 : 32),
          _buildColumns(context, l10n, isMobile),
          SizedBox(height: isMobile ? 16 : 32),
          _buildCtaButton(context, l10n, isMobile),
        ],
      ),
    );
  }

  Widget _buildHeader(dynamic l10n, bool isMobile) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Freemium',
          style: TextStyle(
            fontSize: isMobile ? 24 : 32,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              '0',
              style: TextStyle(
                fontSize: isMobile ? 36 : 48,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              l10n.pricingPriceUnit,
              style: TextStyle(
                fontSize: isMobile ? 16 : 20,
                color: PricingColors.gray300,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildColumns(BuildContext context, dynamic l10n, bool isMobile) {
    if (isMobile) {
      return Column(
        children: [
          _FreemiumColumn(
            type: FreemiumColumnType.buying,
            shimmerController: shimmerController,
          ),
          const SizedBox(height: 16),
          _FreemiumColumn(
            type: FreemiumColumnType.selling,
            shimmerController: shimmerController,
          ),
        ],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: _FreemiumColumn(
            type: FreemiumColumnType.buying,
            shimmerController: shimmerController,
          ),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: _FreemiumColumn(
            type: FreemiumColumnType.selling,
            shimmerController: shimmerController,
          ),
        ),
      ],
    );
  }

  Widget _buildCtaButton(BuildContext context, dynamic l10n, bool isMobile) {
    return Center(
      child: ElevatedButton(
        onPressed: () => context.go('/landing'),
        style: ElevatedButton.styleFrom(
          backgroundColor: PricingColors.gray700,
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 24 : 40,
            vertical: isMobile ? 12 : 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 8,
        ),
        child: Text(
          l10n.pricingCreateFreeAccount,
          style: TextStyle(
            fontSize: isMobile ? 14 : 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

enum FreemiumColumnType { buying, selling }

class _FreemiumColumn extends StatelessWidget {
  final FreemiumColumnType type;
  final AnimationController shimmerController;

  const _FreemiumColumn({
    required this.type,
    required this.shimmerController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;
    final isBuying = type == FreemiumColumnType.buying;

    final iconColor = isBuying ? PricingColors.primary600 : PricingColors.green500;
    final checkColor = isBuying ? PricingColors.purple400 : PricingColors.green400;

    return Container(
      decoration: BoxDecoration(
        color: PricingColors.gray900.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: PricingColors.gray700),
      ),
      padding: EdgeInsets.all(isMobile ? 12 : 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildColumnHeader(l10n, isMobile, isBuying, iconColor),
          SizedBox(height: isMobile ? 12 : 16),
          if (isBuying)
            _buildBuyingFeatures(context, l10n, isMobile, checkColor)
          else
            _buildSellingFeatures(context, l10n, isMobile, checkColor),
        ],
      ),
    );
  }

  Widget _buildColumnHeader(dynamic l10n, bool isMobile, bool isBuying, Color iconColor) {
    return Row(
      children: [
        Container(
          width: isMobile ? 32 : 40,
          height: isMobile ? 32 : 40,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            isBuying ? Icons.search : Icons.add,
            color: iconColor,
            size: isMobile ? 20 : 24,
          ),
        ),
        const SizedBox(width: 12),
        Text(
          isBuying ? l10n.pricingForBuying : l10n.pricingForSelling,
          style: TextStyle(
            fontSize: isMobile ? 16 : 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildBuyingFeatures(BuildContext context, dynamic l10n, bool isMobile, Color checkColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Unlimited searches with highlighted text
        FeatureItem(
          checkColor: checkColor,
          isMobile: isMobile,
          child: _buildUnlimitedSearchesText(l10n, isMobile),
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumCompraItem1,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumCompraItem2,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumCompraItem3,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
        const SizedBox(height: 8),
        // Intelligent search with shimmer text
        FeatureItem(
          checkColor: checkColor,
          isMobile: isMobile,
          child: _buildIntelligentSearchText(context, l10n, isMobile),
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumCompraIntItem1,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumCompraIntItem2,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
      ],
    );
  }

  Widget _buildSellingFeatures(BuildContext context, dynamic l10n, bool isMobile, Color checkColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        FeatureItem.text(
          text: l10n.pricingFreeMarketAnalysis,
          checkColor: checkColor,
          isMobile: isMobile,
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumVentaItem1,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumVentaItem2,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
        FeatureSubItem(
          text: l10n.pricingFreemiumVentaItem3,
          bulletColor: checkColor,
          isMobile: isMobile,
        ),
        const SizedBox(height: 12),
        _buildDisclaimer(l10n, isMobile),
      ],
    );
  }

  Widget _buildUnlimitedSearchesText(dynamic l10n, bool isMobile) {
    final text = l10n.pricingUnlimitedSearches;
    final highlightWord = l10n.pricingUnlimited;
    final parts = text.split(highlightWord);

    if (parts.length < 2) {
      return Text(
        text,
        style: TextStyle(
          fontSize: isMobile ? 13 : 15,
          color: PricingColors.gray300,
        ),
      );
    }

    return Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: parts[0],
            style: TextStyle(
              fontSize: isMobile ? 13 : 15,
              color: PricingColors.gray300,
            ),
          ),
          WidgetSpan(
            alignment: PlaceholderAlignment.baseline,
            baseline: TextBaseline.alphabetic,
            child: HighlightedText(text: highlightWord, isMobile: isMobile),
          ),
          if (parts.length > 1)
            TextSpan(
              text: parts[1],
              style: TextStyle(
                fontSize: isMobile ? 13 : 15,
                color: PricingColors.gray300,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildIntelligentSearchText(BuildContext context, dynamic l10n, bool isMobile) {
    final text = l10n.pricingFreeIntelligentSearch;
    final highlightWord = l10n.pricingIntelligent;
    final parts = text.split(highlightWord);

    if (parts.length < 2) {
      return Text(
        text,
        style: TextStyle(
          fontSize: isMobile ? 13 : 15,
          color: PricingColors.gray300,
        ),
      );
    }

    return Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: parts[0],
            style: TextStyle(
              fontSize: isMobile ? 13 : 15,
              color: PricingColors.gray300,
            ),
          ),
          WidgetSpan(
            alignment: PlaceholderAlignment.baseline,
            baseline: TextBaseline.alphabetic,
            child: ShimmerText(
              text: highlightWord,
              controller: shimmerController,
              fontSize: isMobile ? 16 : 18,
            ),
          ),
          TextSpan(
            text: parts[1],
            style: TextStyle(
              fontSize: isMobile ? 13 : 15,
              color: PricingColors.gray300,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDisclaimer(dynamic l10n, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 8 : 12),
      decoration: BoxDecoration(
        color: PricingColors.warningBg.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: PricingColors.warningBorder.withValues(alpha: 0.5)),
      ),
      child: Text(
        l10n.pricingFreemiumDisclaimer,
        style: TextStyle(
          fontSize: isMobile ? 11 : 13,
          color: PricingColors.warningText,
          height: 1.4,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}
