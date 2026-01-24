// CTA Section Widget
//
// Final call to action with guarantees
// Uses gradient design and Remixicon
// CTA buttons point to /landing

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:remixicon/remixicon.dart';

import '../../../config/theme.dart';
import '../../../config/routes.dart';
import '../../../core/extensions/l10n_extension.dart';

class CTASection extends StatelessWidget {
  const CTASection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    final guarantees = [
      {'icon': Remix.user_line, 'text': l10n.ctaGuarantee1},
      {'icon': Remix.shield_check_line, 'text': l10n.ctaGuarantee2},
      {'icon': Remix.close_circle_line, 'text': l10n.ctaGuarantee3},
    ];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFF8FAFC),
            Color(0xFFEEF2FF),
            Color(0xFFF5F3FF),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Grid pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: AppTheme.primary600.withValues(alpha: 0.03),
                spacing: 50,
              ),
            ),
          ),
          // Radial gradient overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 1.2,
                  colors: [
                    AppTheme.primary600.withValues(alpha: 0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isMobile ? 56 : 96,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 800),
                child: Column(
                  children: [
                    // Main CTA Card
                    Container(
                      padding: EdgeInsets.all(isMobile ? 28 : 48),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.white,
                            Color(0xFFFAFAFF),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(isMobile ? 20 : 32),
                        border: Border.all(
                          color: AppTheme.primary600.withValues(alpha: 0.2),
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary600.withValues(alpha: 0.15),
                            blurRadius: 50,
                            offset: const Offset(0, 20),
                          ),
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 20,
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          // Icon
                          Container(
                            padding: EdgeInsets.all(isMobile ? 16 : 20),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppTheme.primary600.withValues(alpha: 0.15),
                                  const Color(0xFF9333EA).withValues(alpha: 0.1),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(isMobile ? 16 : 20),
                            ),
                            child: Icon(
                              Remix.rocket_2_line,
                              size: isMobile ? 32 : 44,
                              color: AppTheme.primary700,
                            ),
                          ),
                          SizedBox(height: isMobile ? 20 : 28),

                          // Title
                          ShaderMask(
                            shaderCallback: (bounds) => const LinearGradient(
                              colors: [
                                AppTheme.primary700,
                                Color(0xFF9333EA),
                              ],
                            ).createShader(bounds),
                            child: Text(
                              l10n.ctaTitle,
                              style: TextStyle(
                                fontSize: isMobile ? 24 : 38,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                height: 1.2,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          SizedBox(height: isMobile ? 12 : 18),

                          // Subtitle
                          Text(
                            l10n.ctaSubtitle,
                            style: TextStyle(
                              fontSize: isMobile ? 16 : 20,
                              color: AppTheme.gray700,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: isMobile ? 28 : 40),

                          // CTA Button
                          _AnimatedCTAButton(
                            text: l10n.ctaStartFree,
                            isMobile: isMobile,
                            onPressed: () => context.go(AppRoutes.landing),
                          ),
                          SizedBox(height: isMobile ? 24 : 32),

                          // Guarantees
                          Wrap(
                            spacing: isMobile ? 16 : 32,
                            runSpacing: isMobile ? 12 : 16,
                            alignment: WrapAlignment.center,
                            children: guarantees.map((guarantee) {
                              return Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    guarantee['icon'] as IconData,
                                    size: isMobile ? 16 : 18,
                                    color: const Color(0xFF10B981),
                                  ),
                                  SizedBox(width: isMobile ? 6 : 8),
                                  Text(
                                    guarantee['text'] as String,
                                    style: TextStyle(
                                      fontSize: isMobile ? 13 : 15,
                                      color: AppTheme.gray700,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedCTAButton extends StatefulWidget {
  final String text;
  final bool isMobile;
  final VoidCallback onPressed;

  const _AnimatedCTAButton({
    required this.text,
    required this.isMobile,
    required this.onPressed,
  });

  @override
  State<_AnimatedCTAButton> createState() => _AnimatedCTAButtonState();
}

class _AnimatedCTAButtonState extends State<_AnimatedCTAButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        transform: Matrix4.identity()
          ..translateByDouble(_isHovered ? 4.0 : 0.0, 0.0, 0.0, 1.0),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppTheme.primary600, Color(0xFF9333EA)],
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primary600.withValues(alpha: _isHovered ? 0.5 : 0.4),
              blurRadius: _isHovered ? 35 : 25,
              offset: Offset(0, _isHovered ? 12 : 8),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: widget.onPressed,
          style: ElevatedButton.styleFrom(
            padding: EdgeInsets.symmetric(
              horizontal: widget.isMobile ? 32 : 48,
              vertical: widget.isMobile ? 18 : 22,
            ),
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.white,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.text,
                style: TextStyle(
                  fontSize: widget.isMobile ? 16 : 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(width: widget.isMobile ? 10 : 12),
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                transform: Matrix4.identity()
                  ..translateByDouble(_isHovered ? 4.0 : 0.0, 0.0, 0.0, 1.0),
                child: Icon(
                  Remix.arrow_right_line,
                  size: widget.isMobile ? 18 : 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Grid pattern painter
class _GridPatternPainter extends CustomPainter {
  final Color lineColor;
  final double spacing;

  _GridPatternPainter({required this.lineColor, this.spacing = 40});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _GridPatternPainter oldDelegate) {
    return oldDelegate.lineColor != lineColor || oldDelegate.spacing != spacing;
  }
}
