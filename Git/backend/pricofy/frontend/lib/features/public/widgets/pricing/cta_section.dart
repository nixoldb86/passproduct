// CTA Section Widget
//
// Final call-to-action section with gradient background,
// title, subtitle and animated button with shimmer effect.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/utils/responsive.dart';
import 'pricing_colors.dart';
import 'shared/grid_pattern_painter.dart';

/// Final CTA section with gradient background and animated button.
class CtaSection extends StatelessWidget {
  final AnimationController shimmerController;

  const CtaSection({
    super.key,
    required this.shimmerController,
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
            PricingColors.primary600,
            Color(0xFF7C3AED),
            PricingColors.primary700,
          ],
        ),
      ),
      child: Stack(
        children: [
          // Content defines the size
          _buildContent(context, l10n, isMobile),
          // Background effects as overlays
          Positioned.fill(child: _buildBackgroundEffects()),
        ],
      ),
    );
  }

  Widget _buildBackgroundEffects() {
    return IgnorePointer(
      child: Stack(
        fit: StackFit.expand,
        clipBehavior: Clip.none,
        children: [
          // Radial gradient overlay
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.center,
                radius: 0.7,
                colors: [
                  Colors.white.withValues(alpha: 0.1),
                  Colors.transparent,
                ],
              ),
            ),
          ),
          // Grid pattern
          CustomPaint(
            painter: GridPatternPainter(
              lineColor: Colors.white.withValues(alpha: 0.08),
              spacing: 40,
            ),
          ),
          // Blobs
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              width: 384,
              height: 384,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.05),
                boxShadow: [
                  BoxShadow(
                    color: Colors.white.withValues(alpha: 0.05),
                    blurRadius: 100,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            child: Container(
              width: 384,
              height: 384,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: PricingColors.purple400.withValues(alpha: 0.1),
                boxShadow: [
                  BoxShadow(
                    color: PricingColors.purple400.withValues(alpha: 0.1),
                    blurRadius: 100,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, dynamic l10n, bool isMobile) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: 16,
        vertical: isMobile ? 48 : 96,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1024),
          child: Column(
            children: [
              Text(
                l10n.pricingCtaTitle,
                style: TextStyle(
                  fontSize: isMobile ? 32 : 48,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 700),
                child: Text(
                  l10n.pricingCtaSubtitle,
                  style: TextStyle(
                    fontSize: isMobile ? 18 : 22,
                    color: Colors.white.withValues(alpha: 0.9),
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 48),
              CtaButton(
                text: l10n.pricingCreateFreeAccount,
                shimmerController: shimmerController,
                onPressed: () => context.go('/landing'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Animated CTA button with shimmer effect and hover state.
class CtaButton extends StatefulWidget {
  final String text;
  final AnimationController shimmerController;
  final VoidCallback onPressed;

  const CtaButton({
    super.key,
    required this.text,
    required this.shimmerController,
    required this.onPressed,
  });

  @override
  State<CtaButton> createState() => _CtaButtonState();
}

class _CtaButtonState extends State<CtaButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          transform: _isHovered ? (Matrix4.identity()..scaleByDouble(1.05, 1.05, 1.0, 1.0)) : Matrix4.identity(),
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: _isHovered ? 0.3 : 0.2),
                blurRadius: _isHovered ? 30 : 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Stack(
            children: [
              _buildShimmerOverlay(),
              _buildButtonContent(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerOverlay() {
    return Positioned.fill(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: AnimatedBuilder(
          animation: widget.shimmerController,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(
                -200 + widget.shimmerController.value * 400,
                0,
              ),
              child: Container(
                width: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      Colors.white.withValues(alpha: 0.4),
                      Colors.white.withValues(alpha: 0.6),
                      Colors.white.withValues(alpha: 0.4),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildButtonContent() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.text,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: PricingColors.primary600,
          ),
        ),
        const SizedBox(width: 8),
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          transform: _isHovered ? (Matrix4.identity()..translateByDouble(4.0, 0.0, 0.0, 1.0)) : Matrix4.identity(),
          child: const Icon(
            Icons.arrow_forward,
            color: PricingColors.primary600,
            size: 20,
          ),
        ),
      ],
    );
  }
}
