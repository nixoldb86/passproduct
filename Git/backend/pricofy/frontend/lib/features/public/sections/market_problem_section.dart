// Market Problem Section Widget
//
// Shows 3 problems with emotional copy
// Uses Remixicon and improved visual design

import 'package:flutter/material.dart';
import 'package:remixicon/remixicon.dart';

import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';

class MarketProblemSection extends StatelessWidget {
  const MarketProblemSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    final problems = [
      {
        'icon': Remix.time_line,
        'title': l10n.marketProblem1Title,
        'description': l10n.marketProblem1Description,
        'stat': l10n.marketProblem1Stat,
        'color': const Color(0xFFEF4444),
      },
      {
        'icon': Remix.money_dollar_circle_line,
        'title': l10n.marketProblem2Title,
        'description': l10n.marketProblem2Description,
        'stat': l10n.marketProblem2Stat,
        'color': const Color(0xFFF59E0B),
      },
      {
        'icon': Remix.emotion_unhappy_line,
        'title': l10n.marketProblem3Title,
        'description': l10n.marketProblem3Description,
        'stat': l10n.marketProblem3Stat,
        'color': const Color(0xFF8B5CF6),
      },
    ];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFFEF2F2), // red-50
            Color(0xFFFFF7ED), // orange-50
            Color(0xFFFEFCE8), // yellow-50
          ],
        ),
      ),
      child: Stack(
        children: [
          // Grid pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: const Color(0xFFEF4444).withValues(alpha: 0.03),
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
                        color: const Color(0xFFEF4444).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(50),
                        border: Border.all(
                          color: const Color(0xFFEF4444).withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Remix.error_warning_line,
                            size: isMobile ? 16 : 18,
                            color: const Color(0xFFDC2626),
                          ),
                          SizedBox(width: isMobile ? 8 : 10),
                          Text(
                            l10n.marketProblemBadge,
                            style: TextStyle(
                              color: const Color(0xFFDC2626),
                              fontSize: isMobile ? 13 : 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: isMobile ? 20 : 32),

                    // Title
                    Text(
                      l10n.marketProblemTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 26 : 48,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF991B1B),
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 12 : 20),

                    // Subtitle
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 700),
                      child: Text(
                        l10n.marketProblemSubtitle,
                        style: TextStyle(
                          fontSize: isMobile ? 15 : 20,
                          color: AppTheme.gray700,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: isMobile ? 36 : 56),

                    // Problems Grid
                    isMobile
                        ? Column(
                            children: problems
                                .map((problem) => Padding(
                                      padding: const EdgeInsets.only(bottom: 20),
                                      child: _buildProblemCard(problem, isMobile),
                                    ))
                                .toList(),
                          )
                        : Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: problems
                                .map((problem) => Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: _buildProblemCard(problem, isMobile),
                                      ),
                                    ))
                                .toList(),
                          ),

                    SizedBox(height: isMobile ? 40 : 64),

                    // CTA transition
                    Column(
                      children: [
                        // Decorative line
                        Container(
                          width: isMobile ? 80 : 120,
                          height: 4,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFFFECDD3),
                                Color(0xFFFED7AA),
                                Color(0xFFBFDBFE),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        SizedBox(height: isMobile ? 20 : 32),

                        Text(
                          l10n.marketProblemCtaTitle,
                          style: TextStyle(
                            fontSize: isMobile ? 18 : 28,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.gray900,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: isMobile ? 10 : 16),

                        ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 700),
                          child: Text(
                            l10n.marketProblemCtaDescription,
                            style: TextStyle(
                              fontSize: isMobile ? 15 : 18,
                              color: AppTheme.gray600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
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

  Widget _buildProblemCard(Map<String, dynamic> problem, bool isMobile) {
    return _HoverProblemCard(problem: problem, isMobile: isMobile);
  }
}

class _HoverProblemCard extends StatefulWidget {
  final Map<String, dynamic> problem;
  final bool isMobile;

  const _HoverProblemCard({
    required this.problem,
    required this.isMobile,
  });

  @override
  State<_HoverProblemCard> createState() => _HoverProblemCardState();
}

class _HoverProblemCardState extends State<_HoverProblemCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final color = widget.problem['color'] as Color;
    
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
            color: _isHovered ? color : color.withValues(alpha: 0.4),
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
                    widget.problem['icon'] as IconData,
                    size: widget.isMobile ? 26 : 32,
                    color: color,
                  ),
                ),
              ),
            ),
            SizedBox(height: widget.isMobile ? 16 : 20),

            // Title
            Text(
              widget.problem['title']!,
              style: TextStyle(
                fontSize: widget.isMobile ? 18 : 22,
                fontWeight: FontWeight.w700,
                color: color,
                height: 1.2,
              ),
            ),
            SizedBox(height: widget.isMobile ? 10 : 12),

            // Description
            Text(
              widget.problem['description']!,
              style: TextStyle(
                fontSize: widget.isMobile ? 14 : 16,
                color: AppTheme.gray700,
                height: 1.6,
              ),
            ),
            SizedBox(height: widget.isMobile ? 16 : 20),

            // Stat Badge
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: double.infinity,
              padding: EdgeInsets.symmetric(
                horizontal: widget.isMobile ? 14 : 18,
                vertical: widget.isMobile ? 10 : 12,
              ),
              decoration: BoxDecoration(
                color: color.withValues(alpha: _isHovered ? 0.12 : 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: color.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Remix.bar_chart_2_line,
                    size: widget.isMobile ? 14 : 16,
                    color: color,
                  ),
                  SizedBox(width: widget.isMobile ? 8 : 10),
                  Flexible(
                    child: Text(
                      widget.problem['stat']!,
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
