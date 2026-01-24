// Pricing Page
//
// Standalone /pricing page that uses PricingSection with full layout

import 'package:flutter/material.dart';

import '../sections/pricing_section.dart';

/// Pricing page content - layout provided by PublicLayout shell
class PricingPage extends StatelessWidget {
  const PricingPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Content only - layout (navbar + footer) provided by PublicLayout shell
    // Note: Background color handled by PricingSection
    return const Column(
      children: [
        PricingSection(showFullPage: true),
      ],
    );
  }
}
