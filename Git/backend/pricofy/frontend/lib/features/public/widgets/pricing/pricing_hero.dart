// Pricing Hero Section
//
// Hero section with gradient background, animated blobs,
// badge, title and subtitles for the pricing page.

import 'package:flutter/material.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/utils/responsive.dart';
import 'pricing_colors.dart';

/// Hero section for the pricing page with animated background effects.
class PricingHero extends StatelessWidget {
  final AnimationController blobController;

  const PricingHero({
    super.key,
    required this.blobController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isMobile = context.isMobile;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            PricingColors.gray950,
            PricingColors.gray900,
            PricingColors.gray950,
          ],
        ),
      ),
      child: Stack(
        children: [
          // Content defines the size
          _buildContent(context, l10n, isMobile),
          // Background effects as overlays
          Positioned.fill(child: _buildRadialGradients()),
          Positioned.fill(child: _buildAnimatedBlobs()),
        ],
      ),
    );
  }

  Widget _buildRadialGradients() {
    return IgnorePointer(
      child: Stack(
        fit: StackFit.expand,
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(-0.4, -0.6),
                radius: 1.0,
                colors: [
                  PricingColors.primary600.withValues(alpha: 0.1),
                  Colors.transparent,
                ],
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(0.4, 0.6),
                radius: 1.0,
                colors: [
                  PricingColors.purple500.withValues(alpha: 0.1),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedBlobs() {
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: blobController,
        builder: (context, child) {
          final t = blobController.value;
          return Stack(
            fit: StackFit.expand,
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: 80 + 50 * (t < 0.33 ? t * 3 : t < 0.66 ? 1 - (t - 0.33) * 3 : 0),
                left: 40 + 30 * (t < 0.33 ? t * 3 : t < 0.66 ? 1 - (t - 0.33) * 3 : 0),
                child: _buildBlob(PricingColors.primary500),
              ),
              Positioned(
                bottom: 80 + 20 * (t < 0.5 ? t * 2 : 2 - t * 2),
                right: 40,
                child: _buildBlob(PricingColors.purple500),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBlob(Color color) {
    return Container(
      width: 384,
      height: 384,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.1),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.1),
            blurRadius: 100,
            spreadRadius: 50,
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, dynamic l10n, bool isMobile) {
    return Padding(
      padding: EdgeInsets.only(
        top: isMobile ? 80 : 120,
        bottom: 60,
        left: 16,
        right: 16,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              _buildBadge(l10n),
              const SizedBox(height: 32),
              _buildTitle(l10n, isMobile),
              const SizedBox(height: 16),
              _buildSubtitles(l10n, isMobile),
            ],
          ),
        ),
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
        l10n.pricingBadge,
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
      l10n.pricingHeroTitle,
      style: TextStyle(
        fontSize: isMobile ? 40 : 56,
        fontWeight: FontWeight.w700,
        color: Colors.white,
        height: 1.1,
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildSubtitles(dynamic l10n, bool isMobile) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 900),
      child: Column(
        children: [
          Text(
            l10n.pricingHeroSubtitle1,
            style: TextStyle(
              fontSize: isMobile ? 14 : 22,
              color: PricingColors.gray300,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            l10n.pricingHeroSubtitle2,
            style: TextStyle(
              fontSize: isMobile ? 14 : 22,
              color: PricingColors.gray300,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
