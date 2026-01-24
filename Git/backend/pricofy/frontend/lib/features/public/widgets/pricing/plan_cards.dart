// Plan Cards Widget
//
// Displays pricing plan cards in a responsive grid layout.
// Supports different color schemes for buying/selling plans.

import 'package:flutter/material.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/utils/responsive.dart';
import 'pricing_colors.dart';

/// Data model for a pricing plan.
class PlanData {
  final String name;
  final String price;
  final String priceUnit;
  final String typeLabel;
  final String description;
  final List<String> features;
  final bool isPopular;
  final bool isPayPerUse;
  final String? disclaimer;

  const PlanData({
    required this.name,
    required this.price,
    required this.priceUnit,
    required this.typeLabel,
    required this.description,
    required this.features,
    this.isPopular = false,
    this.isPayPerUse = false,
    this.disclaimer,
  });
}

/// Color scheme options for plan cards.
enum PlanColorScheme { purple, green, emerald }

/// Section containing a header and grid of plan cards.
class PlanSection extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<PlanData> plans;
  final PlanColorScheme colorScheme;
  final bool showDisclaimer;

  const PlanSection({
    super.key,
    required this.title,
    required this.subtitle,
    required this.plans,
    required this.colorScheme,
    this.showDisclaimer = false,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;

    return Column(
      children: [
        _buildHeader(isMobile),
        const SizedBox(height: 24),
        _buildPlanGrid(context, isMobile),
        if (showDisclaimer) ...[
          const SizedBox(height: 16),
          Text(
            l10n.pricingInternationalDisclaimer,
            style: const TextStyle(
              fontSize: 12,
              color: PricingColors.gray400,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Widget _buildHeader(bool isMobile) {
    return Column(
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: isMobile ? 24 : 36,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 16,
            color: PricingColors.gray400,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildPlanGrid(BuildContext context, bool isMobile) {
    if (isMobile) {
      return Column(
        children: plans.asMap().entries.map((entry) {
          return Padding(
            padding: EdgeInsets.only(bottom: entry.key < plans.length - 1 ? 16 : 0),
            child: PlanCard(plan: entry.value, colorScheme: colorScheme),
          );
        }).toList(),
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: plans.asMap().entries.map((entry) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              left: entry.key > 0 ? 8 : 0,
              right: entry.key < plans.length - 1 ? 8 : 0,
            ),
            child: PlanCard(plan: entry.value, colorScheme: colorScheme),
          ),
        );
      }).toList(),
    );
  }
}

/// Individual plan card widget.
class PlanCard extends StatelessWidget {
  final PlanData plan;
  final PlanColorScheme colorScheme;

  const PlanCard({
    super.key,
    required this.plan,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;
    final colors = _getColors();

    return Container(
      decoration: BoxDecoration(
        color: colors.bgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.borderColor, width: 2),
        boxShadow: plan.isPopular
            ? [
                BoxShadow(
                  color: PricingColors.purple500.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      padding: EdgeInsets.all(isMobile ? 20 : 24),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          if (plan.isPopular) _buildPopularBadge(l10n),
          if (plan.isPayPerUse) _buildPayPerUseBadge(l10n),
          _buildCardContent(context, l10n, isMobile, colors),
        ],
      ),
    );
  }

  _PlanCardColors _getColors() {
    final isPayPerUse = plan.isPayPerUse;

    switch (colorScheme) {
      case PlanColorScheme.purple:
        return _PlanCardColors(
          bgColor: isPayPerUse ? PricingColors.bluePlanBg : PricingColors.purplePlanBg,
          borderColor: isPayPerUse ? PricingColors.bluePlanBorder : PricingColors.purplePlanBorder,
          badgeColor: isPayPerUse
              ? PricingColors.blue500.withValues(alpha: 0.2)
              : PricingColors.purple500.withValues(alpha: 0.2),
          badgeTextColor: isPayPerUse ? PricingColors.blue400 : PricingColors.purple400,
          checkColor: isPayPerUse ? PricingColors.blue400 : PricingColors.purple400,
          buttonColor: isPayPerUse ? PricingColors.blue500 : PricingColors.purple500,
        );
      case PlanColorScheme.green:
        return _PlanCardColors(
          bgColor: isPayPerUse ? PricingColors.bluePlanBg : PricingColors.greenPlanBg,
          borderColor: isPayPerUse ? PricingColors.bluePlanBorder : PricingColors.greenPlanBorder,
          badgeColor: isPayPerUse
              ? PricingColors.blue500.withValues(alpha: 0.2)
              : PricingColors.green500.withValues(alpha: 0.2),
          badgeTextColor: isPayPerUse ? PricingColors.blue400 : PricingColors.green400,
          checkColor: isPayPerUse ? PricingColors.blue400 : PricingColors.green400,
          buttonColor: isPayPerUse ? PricingColors.blue500 : PricingColors.green500,
        );
      case PlanColorScheme.emerald:
        return _PlanCardColors(
          bgColor: isPayPerUse ? PricingColors.bluePlanBg : PricingColors.emeraldPlanBg,
          borderColor: isPayPerUse ? PricingColors.bluePlanBorder : PricingColors.emeraldPlanBorder,
          badgeColor: isPayPerUse
              ? PricingColors.blue500.withValues(alpha: 0.2)
              : PricingColors.emerald500.withValues(alpha: 0.2),
          badgeTextColor: isPayPerUse ? PricingColors.blue400 : PricingColors.emerald400,
          checkColor: isPayPerUse ? PricingColors.blue400 : PricingColors.emerald400,
          buttonColor: isPayPerUse ? PricingColors.blue500 : PricingColors.emerald500,
        );
    }
  }

  Widget _buildPopularBadge(dynamic l10n) {
    return Positioned(
      top: -20,
      left: 0,
      right: 0,
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [PricingColors.purple500, Color(0xFF7C3AED)],
            ),
            borderRadius: BorderRadius.circular(100),
            boxShadow: [
              BoxShadow(
                color: PricingColors.purple500.withValues(alpha: 0.4),
                blurRadius: 8,
              ),
            ],
          ),
          child: Text(
            l10n.pricingMostPopular,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPayPerUseBadge(dynamic l10n) {
    return Positioned(
      top: -20,
      left: 0,
      right: 0,
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          decoration: BoxDecoration(
            color: PricingColors.blue500.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(100),
            border: Border.all(color: PricingColors.blue500.withValues(alpha: 0.5)),
          ),
          child: Text(
            l10n.pricingPayPerUse,
            style: const TextStyle(
              color: PricingColors.blue400,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCardContent(BuildContext context, dynamic l10n, bool isMobile, _PlanCardColors colors) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (plan.isPopular || plan.isPayPerUse) const SizedBox(height: 16),
        _buildTypeBadge(colors),
        const SizedBox(height: 12),
        _buildPlanName(isMobile),
        const SizedBox(height: 8),
        _buildPrice(isMobile),
        const SizedBox(height: 8),
        _buildDescription(),
        const SizedBox(height: 20),
        _buildFeatures(isMobile, colors),
        if (plan.disclaimer != null) ...[
          const SizedBox(height: 12),
          _buildDisclaimer(),
        ],
        const SizedBox(height: 20),
        _buildCtaButton(context, l10n, colors),
      ],
    );
  }

  Widget _buildTypeBadge(_PlanCardColors colors) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: colors.badgeColor,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: colors.borderColor),
      ),
      child: Text(
        plan.typeLabel,
        style: TextStyle(
          color: colors.badgeTextColor,
          fontSize: 14,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildPlanName(bool isMobile) {
    return Text(
      plan.name,
      style: TextStyle(
        fontSize: isMobile ? 24 : 28,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
    );
  }

  Widget _buildPrice(bool isMobile) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          plan.price,
          style: TextStyle(
            fontSize: isMobile ? 36 : 48,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          plan.priceUnit,
          style: const TextStyle(
            fontSize: 16,
            color: PricingColors.gray300,
          ),
        ),
      ],
    );
  }

  Widget _buildDescription() {
    return Text(
      plan.description,
      style: const TextStyle(
        fontSize: 14,
        color: PricingColors.gray300,
      ),
    );
  }

  Widget _buildFeatures(bool isMobile, _PlanCardColors colors) {
    return Column(
      children: plan.features.map((feature) {
        final isSubItem = feature.startsWith('\u2022 ');
        return Padding(
          padding: EdgeInsets.only(
            bottom: 8,
            left: isSubItem ? 24 : 0,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isSubItem)
                Container(
                  width: 6,
                  height: 6,
                  margin: const EdgeInsets.only(top: 6),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: colors.checkColor,
                  ),
                )
              else
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: colors.checkColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Icon(
                    Icons.check,
                    color: colors.checkColor,
                    size: 12,
                  ),
                ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isSubItem ? feature.substring(2) : feature,
                  style: TextStyle(
                    fontSize: isMobile ? 13 : 14,
                    color: PricingColors.gray200,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDisclaimer() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: PricingColors.warningBg.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: PricingColors.warningBorder.withValues(alpha: 0.5)),
      ),
      child: Text(
        plan.disclaimer!,
        style: const TextStyle(
          fontSize: 12,
          color: PricingColors.warningText,
          height: 1.4,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildCtaButton(BuildContext context, dynamic l10n, _PlanCardColors colors) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: null,
            style: ElevatedButton.styleFrom(
              backgroundColor: colors.buttonColor,
              foregroundColor: Colors.white,
              disabledBackgroundColor: PricingColors.gray700,
              disabledForegroundColor: PricingColors.gray300,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 4,
            ),
            child: Text(
              plan.isPayPerUse ? l10n.pricingContact : l10n.pricingSubscribePlan,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
        _buildComingSoonSticker(l10n),
      ],
    );
  }

  Widget _buildComingSoonSticker(dynamic l10n) {
    return Positioned(
      top: -8,
      right: -8,
      child: Transform.rotate(
        angle: 0.2,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [PricingColors.yellow400, PricingColors.orange500],
            ),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 4,
              ),
            ],
          ),
          child: Text(
            l10n.pricingComingSoon,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _PlanCardColors {
  final Color bgColor;
  final Color borderColor;
  final Color badgeColor;
  final Color badgeTextColor;
  final Color checkColor;
  final Color buttonColor;

  const _PlanCardColors({
    required this.bgColor,
    required this.borderColor,
    required this.badgeColor,
    required this.badgeTextColor,
    required this.checkColor,
    required this.buttonColor,
  });
}
