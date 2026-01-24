// Stats Section Widget
//
// Shows 3 key stats with social proof
// Uses Remixicon and improved visual design

import 'package:flutter/material.dart';
import 'package:remixicon/remixicon.dart';

import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';

class StatsSection extends StatelessWidget {
  const StatsSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    final stats = [
      {
        'icon': Remix.timer_flash_line,
        'highlight': l10n.statsItem1Highlight,
        'label': l10n.statsItem1Label,
        'description': l10n.statsItem1Description,
        'color': AppTheme.primary600,
      },
      {
        'icon': Remix.money_euro_circle_line,
        'highlight': l10n.statsItem2Highlight,
        'label': l10n.statsItem2Label,
        'description': l10n.statsItem2Description,
        'color': const Color(0xFF10B981),
      },
      {
        'icon': Remix.stack_line,
        'highlight': l10n.statsItem3Highlight,
        'label': l10n.statsItem3Label,
        'description': l10n.statsItem3Description,
        'color': const Color(0xFF8B5CF6),
      },
    ];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.white,
            Color(0xFFF8FAFC), // slate-50
            Color(0xFFFAFAFA), // neutral-50
          ],
        ),
      ),
      child: Stack(
        children: [
          // Decorative elements
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: AppTheme.gray200.withValues(alpha: 0.5),
                spacing: 60,
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
                    // Title
                    Text(
                      l10n.statsTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 26 : 42,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.gray900,
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 36 : 56),

                    // Stats Grid
                    isMobile
                        ? Column(
                            children: stats
                                .map((stat) => Padding(
                                      padding: const EdgeInsets.only(bottom: 20),
                                      child: _buildStatCard(stat, isMobile),
                                    ))
                                .toList(),
                          )
                        : Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: stats
                                .map((stat) => Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: _buildStatCard(stat, isMobile),
                                      ),
                                    ))
                                .toList(),
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

  Widget _buildStatCard(Map<String, dynamic> stat, bool isMobile) {
    return _HoverStatCard(stat: stat, isMobile: isMobile);
  }
}

class _HoverStatCard extends StatefulWidget {
  final Map<String, dynamic> stat;
  final bool isMobile;

  const _HoverStatCard({
    required this.stat,
    required this.isMobile,
  });

  @override
  State<_HoverStatCard> createState() => _HoverStatCardState();
}

class _HoverStatCardState extends State<_HoverStatCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final color = widget.stat['color'] as Color;
    
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        transform: Matrix4.identity()
          ..translateByDouble(0.0, _isHovered ? -6.0 : 0.0, 0.0, 1.0),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              color.withValues(alpha: _isHovered ? 0.08 : 0.03),
            ],
          ),
          borderRadius: BorderRadius.circular(widget.isMobile ? 16 : 24),
          border: Border.all(
            color: _isHovered ? color : color.withValues(alpha: 0.3),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: _isHovered
                  ? color.withValues(alpha: 0.2)
                  : Colors.black.withValues(alpha: 0.06),
              blurRadius: _isHovered ? 30 : 15,
              offset: Offset(0, _isHovered ? 10 : 4),
            ),
          ],
        ),
        padding: EdgeInsets.all(widget.isMobile ? 24 : 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: widget.isMobile ? 56 : 72,
              height: widget.isMobile ? 56 : 72,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    color.withValues(alpha: _isHovered ? 0.2 : 0.12),
                    color.withValues(alpha: _isHovered ? 0.12 : 0.06),
                  ],
                ),
                borderRadius: BorderRadius.circular(widget.isMobile ? 16 : 20),
                border: Border.all(
                  color: color.withValues(alpha: 0.2),
                ),
              ),
              child: Center(
                child: AnimatedScale(
                  scale: _isHovered ? 1.1 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: Icon(
                    widget.stat['icon'] as IconData,
                    size: widget.isMobile ? 28 : 36,
                    color: color,
                  ),
                ),
              ),
            ),
            SizedBox(height: widget.isMobile ? 18 : 24),

            // Highlight (big number)
            ShaderMask(
              shaderCallback: (bounds) => LinearGradient(
                colors: [
                  color,
                  color.withValues(alpha: 0.8),
                ],
              ).createShader(bounds),
              child: Text(
                widget.stat['highlight']!,
                style: TextStyle(
                  fontSize: widget.isMobile ? 32 : 44,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.1,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            SizedBox(height: widget.isMobile ? 6 : 10),

            // Label
            Text(
              widget.stat['label']!,
              style: TextStyle(
                fontSize: widget.isMobile ? 14 : 16,
                fontWeight: FontWeight.w600,
                color: AppTheme.gray800,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: widget.isMobile ? 10 : 14),

            // Description
            Text(
              widget.stat['description']!,
              style: TextStyle(
                fontSize: widget.isMobile ? 13 : 15,
                color: AppTheme.gray600,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
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
