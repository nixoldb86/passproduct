// Pricing Section Widget
//
// Main pricing section that composes all pricing widgets.
// Displays freemium card and paid plans with tabs for buying/selling.
//
// Used in both HomePage (as section) and standalone PricingPage.

import 'package:flutter/material.dart';

import '../../../core/extensions/l10n_extension.dart';
import '../../../core/utils/responsive.dart';
import '../widgets/pricing/cta_section.dart';
import '../widgets/pricing/faq_section.dart';
import '../widgets/pricing/freemium_card.dart';
import '../widgets/pricing/plan_cards.dart';
import '../widgets/pricing/pricing_colors.dart';
import '../widgets/pricing/pricing_hero.dart';
import '../widgets/pricing/pricing_tabs.dart';

class PricingSection extends StatefulWidget {
  /// If true, includes hero header and FAQ sections (for standalone page)
  /// If false, only shows the freemium card (for embedding in home)
  final bool showFullPage;

  const PricingSection({
    super.key,
    this.showFullPage = false,
  });

  @override
  State<PricingSection> createState() => _PricingSectionState();
}

class _PricingSectionState extends State<PricingSection> with TickerProviderStateMixin {
  PricingTabType _activeTab = PricingTabType.buying;
  late AnimationController _shimmerController;
  late AnimationController _blobController;

  @override
  void initState() {
    super.initState();
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat();
    _blobController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 7),
    )..repeat();
  }

  @override
  void dispose() {
    _shimmerController.dispose();
    _blobController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.showFullPage) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          PricingHero(blobController: _blobController),
          FreemiumSection(shimmerController: _shimmerController),
          _buildTabsSection(context),
          FaqSection(faqs: _getFaqs(context)),
          CtaSection(shimmerController: _shimmerController),
        ],
      );
    }

    return FreemiumSection(shimmerController: _shimmerController);
  }

  Widget _buildTabsSection(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;

    return Container(
      width: double.infinity,
      color: PricingColors.gray950,
      padding: EdgeInsets.symmetric(
        horizontal: 16,
        vertical: isMobile ? 32 : 48,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              PricingTabs(
                activeTab: _activeTab,
                shimmerController: _shimmerController,
                onTabChanged: (tab) => setState(() => _activeTab = tab),
              ),
              const SizedBox(height: 32),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _activeTab == PricingTabType.buying
                    ? _buildBuyingPlans(context, l10n)
                    : _buildSellingPlans(context, l10n),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBuyingPlans(BuildContext context, dynamic l10n) {
    return Column(
      key: const ValueKey('buying'),
      children: [
        PlanSection(
          title: l10n.pricingNationalBuyingTitle,
          subtitle: l10n.pricingNationalBuyingSubtitle,
          plans: _getNacionalCompraPlans(l10n),
          colorScheme: PlanColorScheme.purple,
        ),
        const SizedBox(height: 48),
        PlanSection(
          title: l10n.pricingInternationalBuyingTitle,
          subtitle: l10n.pricingInternationalBuyingSubtitle,
          plans: _getInternacionalCompraPlans(l10n),
          colorScheme: PlanColorScheme.purple,
          showDisclaimer: true,
        ),
      ],
    );
  }

  Widget _buildSellingPlans(BuildContext context, dynamic l10n) {
    return Column(
      key: const ValueKey('selling'),
      children: [
        PlanSection(
          title: l10n.pricingNationalSellingTitle,
          subtitle: l10n.pricingNationalSellingSubtitle,
          plans: _getNacionalVentaPlans(l10n),
          colorScheme: PlanColorScheme.green,
        ),
        const SizedBox(height: 48),
        PlanSection(
          title: l10n.pricingInternationalSellingTitle,
          subtitle: l10n.pricingInternationalSellingSubtitle,
          plans: _getInternacionalVentaPlans(l10n),
          colorScheme: PlanColorScheme.emerald,
          showDisclaimer: true,
        ),
      ],
    );
  }

  // Plan data methods

  List<PlanData> _getNacionalCompraPlans(dynamic l10n) {
    return [
      PlanData(
        name: 'Ninja Local',
        price: '4,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingNational,
        description: l10n.pricingForBuying,
        features: [
          l10n.pricingPlanNinjaLocalFeature1,
          l10n.pricingPlanNinjaLocalFeature2,
        ],
      ),
      PlanData(
        name: 'Radar Local',
        price: '22,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingNational,
        description: l10n.pricingForBuying,
        features: [
          l10n.pricingPlanRadarLocalFeature1,
          '\u2022 ${l10n.pricingPlanRadarLocalFeature2}',
          '\u2022 ${l10n.pricingPlanRadarLocalFeature3}',
          l10n.pricingPlanRadarLocalFeature4,
        ],
      ),
      PlanData(
        name: l10n.pricingPlanPayPerUse,
        price: '0,3',
        priceUnit: l10n.pricingPerSearch,
        typeLabel: l10n.pricingNational,
        description: l10n.pricingForBuying,
        isPayPerUse: true,
        features: [
          l10n.pricingPlanPayPerUseCompraLocalFeature1,
          l10n.pricingPlanPayPerUseCompraLocalFeature2,
          l10n.pricingPlanPayPerUseCompraLocalFeature3,
        ],
      ),
    ];
  }

  List<PlanData> _getInternacionalCompraPlans(dynamic l10n) {
    return [
      PlanData(
        name: 'Ninja',
        price: '6,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingInternational,
        description: l10n.pricingForBuying,
        features: [
          l10n.pricingPlanNinjaFeature1,
          l10n.pricingPlanNinjaFeature2,
        ],
      ),
      PlanData(
        name: 'Radar',
        price: '25,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingInternational,
        description: l10n.pricingForBuying,
        isPopular: true,
        features: [
          l10n.pricingPlanRadarFeature1,
          '\u2022 ${l10n.pricingPlanRadarFeature2}',
          '\u2022 ${l10n.pricingPlanRadarFeature3}',
          l10n.pricingPlanRadarFeature4,
        ],
      ),
      PlanData(
        name: l10n.pricingPlanPayPerUse,
        price: '0,6',
        priceUnit: l10n.pricingPerSearch,
        typeLabel: l10n.pricingInternational,
        description: l10n.pricingForBuying,
        isPayPerUse: true,
        features: [
          l10n.pricingPlanPayPerUseCompraFeature1,
          l10n.pricingPlanPayPerUseCompraFeature2,
          l10n.pricingPlanPayPerUseCompraFeature3,
        ],
      ),
    ];
  }

  List<PlanData> _getNacionalVentaPlans(dynamic l10n) {
    return [
      PlanData(
        name: 'Express',
        price: '5,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingNational,
        description: l10n.pricingForSelling,
        disclaimer: l10n.pricingVentaNacionalDisclaimer,
        features: [
          l10n.pricingPlanExpressFeature1,
          l10n.pricingPlanExpressFeature2,
        ],
      ),
      PlanData(
        name: 'Turbo',
        price: '27,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingNational,
        description: l10n.pricingForSelling,
        disclaimer: l10n.pricingVentaNacionalDisclaimer,
        features: [
          l10n.pricingPlanTurboFeature1,
          '\u2022 ${l10n.pricingPlanTurboFeature2}',
          '\u2022 ${l10n.pricingPlanTurboFeature3}',
        ],
      ),
      PlanData(
        name: l10n.pricingPlanPayPerUse,
        price: '0,9',
        priceUnit: l10n.pricingPerQuery,
        typeLabel: l10n.pricingNational,
        description: l10n.pricingForSelling,
        isPayPerUse: true,
        features: [
          l10n.pricingPlanPayPerUseVentaNacionalFeature1,
          '\u2022 ${l10n.pricingPlanPayPerUseVentaNacionalFeature2}',
          '\u2022 ${l10n.pricingPlanPayPerUseVentaNacionalFeature3}',
        ],
      ),
    ];
  }

  List<PlanData> _getInternacionalVentaPlans(dynamic l10n) {
    return [
      PlanData(
        name: 'Inter Express',
        price: '7,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingInternational,
        description: l10n.pricingForSelling,
        features: [
          l10n.pricingPlanInterExpressFeature1,
          l10n.pricingPlanInterExpressFeature2,
        ],
      ),
      PlanData(
        name: 'Inter Turbo',
        price: '29,99',
        priceUnit: l10n.pricingPerMonth,
        typeLabel: l10n.pricingInternational,
        description: l10n.pricingForSelling,
        isPopular: true,
        features: [
          l10n.pricingPlanInterTurboFeature1,
          '\u2022 ${l10n.pricingPlanInterTurboFeature2}',
          '\u2022 ${l10n.pricingPlanInterTurboFeature3}',
        ],
      ),
      PlanData(
        name: l10n.pricingPlanPayPerUse,
        price: '1,2',
        priceUnit: l10n.pricingPerQuery,
        typeLabel: l10n.pricingInternational,
        description: l10n.pricingForSelling,
        isPayPerUse: true,
        features: [
          l10n.pricingPlanPayPerUseVentaFeature1,
          '\u2022 ${l10n.pricingPlanPayPerUseVentaFeature2}',
          '\u2022 ${l10n.pricingPlanPayPerUseVentaFeature3}',
        ],
      ),
    ];
  }

  List<FaqData> _getFaqs(BuildContext context) {
    final l10n = context.l10n;
    return [
      FaqData(
        question: l10n.pricingFaqQ1,
        answer: l10n.pricingFaqA1,
      ),
      FaqData(
        question: l10n.pricingFaqQ2,
        answer: l10n.pricingFaqA2,
      ),
      FaqData(
        question: l10n.pricingFaqQ3,
        answer: l10n.pricingFaqA3,
      ),
    ];
  }
}
