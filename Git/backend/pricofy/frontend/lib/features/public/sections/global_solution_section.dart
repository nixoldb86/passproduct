// Global Solution Section Widget
//
// Shows 3 solutions with Remixicon + benefits for buyers and sellers
// Uses improved visual design with gradients and animations

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:remixicon/remixicon.dart';

import '../../../config/theme.dart';
import '../../../config/routes.dart';
import '../../../core/extensions/l10n_extension.dart';

class GlobalSolutionSection extends StatelessWidget {
  const GlobalSolutionSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    final solutions = [
      {
        'icon': Remix.search_line,
        'title': l10n.globalSolution1Title,
        'description': l10n.globalSolution1Description,
        'highlight': l10n.globalSolution1Highlight,
        'color': AppTheme.primary600,
      },
      {
        'icon': Remix.filter_3_line,
        'title': l10n.globalSolution2Title,
        'description': l10n.globalSolution2Description,
        'highlight': l10n.globalSolution2Highlight,
        'color': const Color(0xFF8B5CF6),
      },
      {
        'icon': Remix.global_line,
        'title': l10n.globalSolution3Title,
        'description': l10n.globalSolution3Description,
        'highlight': l10n.globalSolution3Highlight,
        'color': const Color(0xFF10B981),
      },
    ];

    final buyerBenefits = [
      l10n.globalSolutionBuyersItem1,
      l10n.globalSolutionBuyersItem2,
      l10n.globalSolutionBuyersItem3,
      l10n.globalSolutionBuyersItem4,
    ];

    final sellerBenefits = [
      l10n.globalSolutionSellersItem1,
      l10n.globalSolutionSellersItem2,
      l10n.globalSolutionSellersItem3,
      l10n.globalSolutionSellersItem4,
    ];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFEEF2FF), // primary-50
            Color(0xFFF5F3FF), // purple-50
            Color(0xFFF0FDF4), // emerald-50
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
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1100),
                child: Column(
                  children: [
                    // Badge
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: isMobile ? 14 : 18,
                        vertical: isMobile ? 8 : 10,
                      ),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.primary50.withValues(alpha: 0.9),
                            const Color(0xFFDDD6FE).withValues(alpha: 0.8),
                            AppTheme.primary50.withValues(alpha: 0.9),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(50),
                        border: Border.all(
                          color: AppTheme.primary600.withValues(alpha: 0.3),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary600.withValues(alpha: 0.15),
                            blurRadius: 20,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Remix.magic_line,
                            size: isMobile ? 16 : 18,
                            color: AppTheme.primary700,
                          ),
                          SizedBox(width: isMobile ? 8 : 10),
                          Text(
                            l10n.globalSolutionBadge,
                            style: TextStyle(
                              color: AppTheme.primary700,
                              fontSize: isMobile ? 13 : 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: isMobile ? 20 : 32),

                    // Title
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [
                          AppTheme.primary700,
                          Color(0xFF9333EA),
                        ],
                      ).createShader(bounds),
                      child: Text(
                        l10n.globalSolutionTitle,
                        style: TextStyle(
                          fontSize: isMobile ? 26 : 48,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          height: 1.2,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: isMobile ? 12 : 20),

                    // Subtitle
                    Text(
                      l10n.globalSolutionSubtitle,
                      style: TextStyle(
                        fontSize: isMobile ? 16 : 22,
                        color: AppTheme.gray700,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 36 : 56),

                    // Solutions Grid
                    isMobile
                        ? Column(
                            children: solutions
                                .map((solution) => Padding(
                                      padding: const EdgeInsets.only(bottom: 20),
                                      child: _buildSolutionCard(solution, isMobile),
                                    ))
                                .toList(),
                          )
                        : Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: solutions
                                .map((solution) => Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: _buildSolutionCard(solution, isMobile),
                                      ),
                                    ))
                                .toList(),
                          ),

                    SizedBox(height: isMobile ? 48 : 72),

                    // Benefits section
                    isMobile
                        ? Column(
                            children: [
                              _buildBenefitsCard(
                                title: l10n.globalSolutionBuyersTitle,
                                benefits: buyerBenefits,
                                icon: Remix.shopping_cart_line,
                                color: const Color(0xFF3B82F6),
                                isMobile: isMobile,
                              ),
                              const SizedBox(height: 20),
                              _buildBenefitsCard(
                                title: l10n.globalSolutionSellersTitle,
                                benefits: sellerBenefits,
                                icon: Remix.price_tag_3_line,
                                color: const Color(0xFF10B981),
                                isMobile: isMobile,
                              ),
                            ],
                          )
                        : Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: _buildBenefitsCard(
                                  title: l10n.globalSolutionBuyersTitle,
                                  benefits: buyerBenefits,
                                  icon: Remix.shopping_cart_line,
                                  color: const Color(0xFF3B82F6),
                                  isMobile: isMobile,
                                ),
                              ),
                              const SizedBox(width: 24),
                              Expanded(
                                child: _buildBenefitsCard(
                                  title: l10n.globalSolutionSellersTitle,
                                  benefits: sellerBenefits,
                                  icon: Remix.price_tag_3_line,
                                  color: const Color(0xFF10B981),
                                  isMobile: isMobile,
                                ),
                              ),
                            ],
                          ),

                    SizedBox(height: isMobile ? 40 : 56),

                    // CTA Button
                    Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primary600, Color(0xFF9333EA)],
                        ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary600.withValues(alpha: 0.4),
                            blurRadius: 25,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () => context.go(AppRoutes.landing),
                        style: ElevatedButton.styleFrom(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 28 : 36,
                            vertical: isMobile ? 16 : 20,
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
                              l10n.globalSolutionButtonText,
                              style: TextStyle(
                                fontSize: isMobile ? 16 : 18,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            SizedBox(width: isMobile ? 8 : 12),
                            Icon(
                              Remix.arrow_right_line,
                              size: isMobile ? 18 : 20,
                            ),
                          ],
                        ),
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

  Widget _buildSolutionCard(Map<String, dynamic> solution, bool isMobile) {
    return _HoverSolutionCard(solution: solution, isMobile: isMobile);
  }

  Widget _buildBenefitsCard({
    required String title,
    required List<String> benefits,
    required IconData icon,
    required Color color,
    required bool isMobile,
  }) {
    return _HoverBenefitsCard(
      title: title,
      benefits: benefits,
      icon: icon,
      color: color,
      isMobile: isMobile,
    );
  }
}

class _HoverSolutionCard extends StatefulWidget {
  final Map<String, dynamic> solution;
  final bool isMobile;

  const _HoverSolutionCard({
    required this.solution,
    required this.isMobile,
  });

  @override
  State<_HoverSolutionCard> createState() => _HoverSolutionCardState();
}

class _HoverSolutionCardState extends State<_HoverSolutionCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final color = widget.solution['color'] as Color;
    
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: SystemMouseCursors.click,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        transform: Matrix4.identity()
          ..translateByDouble(0.0, _isHovered ? -8.0 : 0.0, 0.0, 1.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(widget.isMobile ? 16 : 24),
          border: Border.all(
            color: _isHovered ? color : color.withValues(alpha: 0.3),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: _isHovered
                  ? color.withValues(alpha: 0.2)
                  : Colors.black.withValues(alpha: 0.08),
              blurRadius: _isHovered ? 30 : 20,
              offset: Offset(0, _isHovered ? 12 : 6),
            ),
          ],
        ),
        padding: EdgeInsets.all(widget.isMobile ? 20 : 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: widget.isMobile ? 52 : 64,
              height: widget.isMobile ? 52 : 64,
              decoration: BoxDecoration(
                color: color.withValues(alpha: _isHovered ? 0.15 : 0.1),
                borderRadius: BorderRadius.circular(widget.isMobile ? 14 : 18),
              ),
              child: Center(
                child: AnimatedScale(
                  scale: _isHovered ? 1.1 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: Icon(
                    widget.solution['icon'] as IconData,
                    size: widget.isMobile ? 26 : 32,
                    color: color,
                  ),
                ),
              ),
            ),
            SizedBox(height: widget.isMobile ? 16 : 20),

            // Title
            Text(
              widget.solution['title']!,
              style: TextStyle(
                fontSize: widget.isMobile ? 18 : 22,
                fontWeight: FontWeight.w700,
                color: AppTheme.gray900,
                height: 1.2,
              ),
            ),
            SizedBox(height: widget.isMobile ? 10 : 12),

            // Description
            Text(
              widget.solution['description']!,
              style: TextStyle(
                fontSize: widget.isMobile ? 14 : 16,
                color: AppTheme.gray700,
                height: 1.6,
              ),
            ),
            SizedBox(height: widget.isMobile ? 16 : 20),

            // Highlight Badge
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: double.infinity,
              padding: EdgeInsets.symmetric(
                horizontal: widget.isMobile ? 14 : 18,
                vertical: widget.isMobile ? 10 : 12,
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    color.withValues(alpha: _isHovered ? 0.15 : 0.08),
                    color.withValues(alpha: _isHovered ? 0.1 : 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: color.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Remix.check_double_line,
                    size: widget.isMobile ? 14 : 16,
                    color: color,
                  ),
                  SizedBox(width: widget.isMobile ? 8 : 10),
                  Flexible(
                    child: Text(
                      widget.solution['highlight']!,
                      style: TextStyle(
                        color: color,
                        fontSize: widget.isMobile ? 12 : 14,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HoverBenefitsCard extends StatefulWidget {
  final String title;
  final List<String> benefits;
  final IconData icon;
  final Color color;
  final bool isMobile;

  const _HoverBenefitsCard({
    required this.title,
    required this.benefits,
    required this.icon,
    required this.color,
    required this.isMobile,
  });

  @override
  State<_HoverBenefitsCard> createState() => _HoverBenefitsCardState();
}

class _HoverBenefitsCardState extends State<_HoverBenefitsCard> {
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
          ..translateByDouble(0.0, _isHovered ? -4.0 : 0.0, 0.0, 1.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(widget.isMobile ? 16 : 24),
          border: Border.all(
            color: _isHovered ? widget.color : widget.color.withValues(alpha: 0.3),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: _isHovered
                  ? widget.color.withValues(alpha: 0.15)
                  : Colors.black.withValues(alpha: 0.08),
              blurRadius: _isHovered ? 25 : 15,
              offset: Offset(0, _isHovered ? 8 : 4),
            ),
          ],
        ),
        padding: EdgeInsets.all(widget.isMobile ? 20 : 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(widget.isMobile ? 10 : 14),
                  decoration: BoxDecoration(
                    color: widget.color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(widget.isMobile ? 12 : 16),
                  ),
                  child: Icon(
                    widget.icon,
                    size: widget.isMobile ? 22 : 26,
                    color: widget.color,
                  ),
                ),
                SizedBox(width: widget.isMobile ? 12 : 16),
                Text(
                  widget.title,
                  style: TextStyle(
                    fontSize: widget.isMobile ? 18 : 22,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.gray900,
                  ),
                ),
              ],
            ),
            SizedBox(height: widget.isMobile ? 16 : 24),

            // Benefits list
            ...widget.benefits.map((benefit) => Padding(
                  padding: EdgeInsets.only(bottom: widget.isMobile ? 10 : 14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: EdgeInsets.only(top: widget.isMobile ? 4 : 6),
                        child: Icon(
                          Remix.checkbox_circle_fill,
                          size: widget.isMobile ? 16 : 18,
                          color: widget.color,
                        ),
                      ),
                      SizedBox(width: widget.isMobile ? 10 : 12),
                      Expanded(
                        child: Text(
                          benefit,
                          style: TextStyle(
                            fontSize: widget.isMobile ? 14 : 16,
                            color: AppTheme.gray700,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
          ],
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
