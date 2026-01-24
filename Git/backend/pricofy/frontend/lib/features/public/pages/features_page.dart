// Features Page - Redesigned with professional icons and animations
// Mobile-first responsive design

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:remixicon/remixicon.dart';

import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/utils/responsive.dart';

class FeaturesPage extends StatefulWidget {
  const FeaturesPage({super.key});

  @override
  State<FeaturesPage> createState() => _FeaturesPageState();
}

class _FeaturesPageState extends State<FeaturesPage> with TickerProviderStateMixin {
  bool _isSelling = true;
  late AnimationController _blobController;
  late AnimationController _shimmerController;

  @override
  void initState() {
    super.initState();
    _blobController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat();
  }

  @override
  void dispose() {
    _blobController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Column(
      children: [
        _buildHeroWithToggle(context, l10n),
        _buildProblemSection(context, l10n),
        _buildSolutionSection(context, l10n),
        _buildComparisonSection(context, l10n),
        _buildMainFeaturesSection(context, l10n),
        _buildCTASection(context, l10n),
      ],
    );
  }

  // ============ HERO SECTION ============
  Widget _buildHeroWithToggle(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    final title = _isSelling ? l10n.featuresTitle : l10n.featuresBuyerTitle;
    final subtitle = _isSelling ? l10n.featuresSubtitle : l10n.featuresBuyerSubtitle;
    final description = _isSelling ? l10n.featuresHeroDescription : l10n.featuresBuyerSubtitle;
    final ctaText = _isSelling ? l10n.featuresCtaButton : l10n.featuresBuyerCtaButton;
    final accentColor = _isSelling ? const Color(0xFF10B981) : const Color(0xFF3B82F6);

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0f0f1a),
            Color(0xFF1a1a2e),
            Color(0xFF16213e),
            Color(0xFF0f0f1a),
          ],
        ),
      ),
      child: Stack(
        children: [
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 16 : 24,
              vertical: isMobile ? 40 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  children: [
                    _buildToggle(l10n, accentColor, isMobile),
                    SizedBox(height: isMobile ? 32 : 48),

                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: Column(
                        key: ValueKey(_isSelling),
                        children: [
                          _buildUrgencyBadge(subtitle, isMobile),
                          SizedBox(height: isMobile ? 20 : 32),

                          Text(
                            title,
                            style: TextStyle(
                              fontSize: isMobile ? 26 : 52,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              height: 1.15,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: isMobile ? 16 : 24),

                          Text(
                            description,
                            style: TextStyle(
                              fontSize: isMobile ? 15 : 20,
                              color: Colors.white.withValues(alpha: 0.85),
                              height: 1.6,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: isMobile ? 32 : 48),

                          _buildAnimatedCTA(ctaText, accentColor, isMobile),
                          SizedBox(height: isMobile ? 12 : 16),

                          Text(
                            l10n.featuresCtaSubtitle,
                            style: TextStyle(
                              fontSize: isMobile ? 12 : 14,
                              color: Colors.white.withValues(alpha: 0.6),
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (!isMobile) Positioned.fill(child: _buildAnimatedBlobs()),
          Positioned.fill(child: _buildRadialGradients()),
          Positioned.fill(child: _buildGridPattern()),
        ],
      ),
    );
  }

  Widget _buildToggle(dynamic l10n, Color accentColor, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 4 : 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(color: accentColor.withValues(alpha: 0.2), blurRadius: 30),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildToggleButton(
            l10n.featuresToggleSeller,
            Remix.money_dollar_circle_line,
            _isSelling,
            () => setState(() => _isSelling = true),
            const Color(0xFF10B981),
            isMobile,
          ),
          SizedBox(width: isMobile ? 2 : 4),
          _buildToggleButton(
            l10n.featuresToggleBuyer,
            Remix.shopping_cart_2_line,
            !_isSelling,
            () => setState(() => _isSelling = false),
            const Color(0xFF3B82F6),
            isMobile,
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton(String text, IconData icon, bool isActive, VoidCallback onTap, Color activeColor, bool isMobile) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 14 : 20,
          vertical: isMobile ? 10 : 12,
        ),
        decoration: BoxDecoration(
          gradient: isActive
              ? LinearGradient(
                  colors: [activeColor, activeColor.withValues(alpha: 0.8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isActive ? null : Colors.transparent,
          borderRadius: BorderRadius.circular(50),
          boxShadow: isActive
              ? [BoxShadow(color: activeColor.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 4))]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: isMobile ? 16 : 18, color: isActive ? Colors.white : Colors.white.withValues(alpha: 0.6)),
            SizedBox(width: isMobile ? 6 : 8),
            Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 13 : 15,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : Colors.white.withValues(alpha: 0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUrgencyBadge(String text, bool isMobile) {
    final warningColor = _isSelling ? const Color(0xFFEF4444) : const Color(0xFFF59E0B);
    final icon = _isSelling ? Remix.error_warning_line : Remix.question_line;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 12 : 16,
        vertical: isMobile ? 8 : 10,
      ),
      decoration: BoxDecoration(
        color: warningColor.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: warningColor.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: warningColor, size: isMobile ? 16 : 18),
          SizedBox(width: isMobile ? 8 : 10),
          Flexible(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 12 : 14,
                fontWeight: FontWeight.w600,
                color: warningColor,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedCTA(String text, Color color, bool isMobile) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(isMobile ? 12 : 14),
        boxShadow: [
          BoxShadow(color: color.withValues(alpha: 0.4), blurRadius: 30, offset: const Offset(0, 8)),
        ],
      ),
      child: ElevatedButton(
        onPressed: () => context.go('/landing'),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 28 : 40,
            vertical: isMobile ? 16 : 20,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(isMobile ? 12 : 14)),
          elevation: 0,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(text, style: TextStyle(fontSize: isMobile ? 15 : 18, fontWeight: FontWeight.w700)),
            SizedBox(width: isMobile ? 8 : 12),
            Icon(Remix.arrow_right_line, size: isMobile ? 18 : 20),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedBlobs() {
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _blobController,
        builder: (context, child) {
          final t = _blobController.value;
          return Stack(
            fit: StackFit.expand,
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: 50 + 80 * math.sin(t * 2 * math.pi),
                left: 30 + 50 * math.cos(t * 2 * math.pi),
                child: _buildBlob(_isSelling ? const Color(0xFF10B981) : const Color(0xFF3B82F6), 300),
              ),
              Positioned(
                bottom: 60 + 60 * math.cos(t * 2 * math.pi + 1),
                right: 20 + 40 * math.sin(t * 2 * math.pi + 1),
                child: _buildBlob(_isSelling ? const Color(0xFF059669) : const Color(0xFF2563EB), 250),
              ),
              Positioned(
                top: 150 + 40 * math.sin(t * 2 * math.pi + 2),
                right: 100 + 30 * math.cos(t * 2 * math.pi + 2),
                child: _buildBlob(const Color(0xFF8B5CF6), 200),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBlob(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color.withValues(alpha: 0.15),
            color.withValues(alpha: 0.05),
            Colors.transparent,
          ],
        ),
      ),
    );
  }

  Widget _buildRadialGradients() {
    final accentColor = _isSelling ? const Color(0xFF10B981) : const Color(0xFF3B82F6);
    return IgnorePointer(
      child: Stack(
        fit: StackFit.expand,
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(-0.5, -0.5),
                radius: 1.2,
                colors: [accentColor.withValues(alpha: 0.08), Colors.transparent],
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(0.5, 0.8),
                radius: 1.0,
                colors: [const Color(0xFF8B5CF6).withValues(alpha: 0.08), Colors.transparent],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridPattern() {
    return IgnorePointer(
      child: CustomPaint(
        painter: _GridPatternPainter(lineColor: Colors.white.withValues(alpha: 0.03), spacing: 60),
      ),
    );
  }

  // ============ PROBLEM SECTION ============
  Widget _buildProblemSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    final problems = _isSelling
        ? [
            {'icon': Remix.arrow_up_line, 'title': l10n.featuresProblem1Title, 'description': l10n.featuresProblem1Description, 'color': const Color(0xFFEF4444)},
            {'icon': Remix.arrow_down_line, 'title': l10n.featuresProblem2Title, 'description': l10n.featuresProblem2Description, 'color': const Color(0xFFF59E0B)},
            {'icon': Remix.question_line, 'title': l10n.featuresProblem3Title, 'description': l10n.featuresProblem3Description, 'color': const Color(0xFF8B5CF6)},
          ]
        : [
            {'icon': Remix.time_line, 'title': l10n.featuresBuyerProblem1Title, 'description': l10n.featuresBuyerProblem1Description, 'color': const Color(0xFFEF4444)},
            {'icon': Remix.shuffle_line, 'title': l10n.featuresBuyerProblem2Title, 'description': l10n.featuresBuyerProblem2Description, 'color': const Color(0xFFF59E0B)},
            {'icon': Remix.emotion_sad_line, 'title': l10n.featuresBuyerProblem3Title, 'description': l10n.featuresBuyerProblem3Description, 'color': const Color(0xFF8B5CF6)},
          ];

    final sectionTitle = _isSelling ? l10n.featuresProblemTitle : l10n.featuresBuyerTitle;
    final sectionSubtitle = _isSelling ? l10n.featuresProblemSubtitle : l10n.featuresBuyerSubtitle;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: _isSelling
              ? [const Color(0xFFFEF2F2), const Color(0xFFFFF7ED), const Color(0xFFFFFBEB)]
              : [const Color(0xFFFEF3C7), const Color(0xFFFFFBEB), const Color(0xFFFEF2F2)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: _GridPatternPainter(lineColor: Colors.black.withValues(alpha: 0.02), spacing: 50)),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 16 : 24,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1000),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Column(
                    key: ValueKey('problem-$_isSelling'),
                    children: [
                      _buildSectionBadge(l10n.featuresBadgeProblem, Remix.error_warning_fill, const Color(0xFFDC2626), isMobile),
                      SizedBox(height: isMobile ? 16 : 24),

                      Text(
                        sectionTitle,
                        style: TextStyle(
                          fontSize: isMobile ? 24 : 40,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF991B1B),
                          height: 1.2,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: isMobile ? 10 : 16),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: isMobile ? 8 : 0),
                        child: Text(
                          sectionSubtitle,
                          style: TextStyle(fontSize: isMobile ? 14 : 18, color: AppTheme.gray600),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      SizedBox(height: isMobile ? 32 : 48),

                      isMobile
                          ? Column(
                              children: problems.map((p) => Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: _buildProblemCard(
                                  p['icon'] as IconData,
                                  p['title'] as String,
                                  p['description'] as String,
                                  p['color'] as Color,
                                  isMobile,
                                ),
                              )).toList(),
                            )
                          : Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: problems.map((p) => Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  child: _buildProblemCard(
                                    p['icon'] as IconData,
                                    p['title'] as String,
                                    p['description'] as String,
                                    p['color'] as Color,
                                    isMobile,
                                  ),
                                ),
                              )).toList(),
                            ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionBadge(String text, IconData icon, Color color, bool isMobile) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 12 : 16,
        vertical: isMobile ? 6 : 8,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: isMobile ? 14 : 16, color: color),
          SizedBox(width: isMobile ? 6 : 8),
          Text(
            text,
            style: TextStyle(
              fontSize: isMobile ? 12 : 13,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProblemCard(IconData icon, String title, String description, Color color, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 20 : 28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isMobile ? 16 : 20),
        border: Border.all(color: color.withValues(alpha: 0.25), width: 2),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.1), blurRadius: 30, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(isMobile ? 12 : 16),
            ),
            child: Icon(icon, color: color, size: isMobile ? 24 : 28),
          ),
          SizedBox(height: isMobile ? 16 : 20),
          Text(
            title,
            style: TextStyle(fontSize: isMobile ? 17 : 20, fontWeight: FontWeight.w700, color: color),
          ),
          SizedBox(height: isMobile ? 8 : 10),
          Text(
            description,
            style: TextStyle(fontSize: isMobile ? 14 : 15, color: AppTheme.gray600, height: 1.6),
          ),
        ],
      ),
    );
  }

  // ============ SOLUTION SECTION ============
  Widget _buildSolutionSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    final solutions = _isSelling
        ? [
            {'icon': Remix.search_eye_line, 'text': l10n.featuresSolution1},
            {'icon': Remix.price_tag_3_line, 'text': l10n.featuresSolution2},
            {'icon': Remix.store_2_line, 'text': l10n.featuresSolution3},
          ]
        : [
            {'icon': Remix.search_2_line, 'text': l10n.featuresBuyerSolution1},
            {'icon': Remix.filter_3_line, 'text': l10n.featuresBuyerSolution2},
            {'icon': Remix.check_double_line, 'text': l10n.featuresBuyerSolution3},
          ];

    final sectionTitle = _isSelling ? l10n.featuresSolutionTitle : l10n.featuresBuyerSolutionTitle;
    final sectionSubtitle = _isSelling ? l10n.featuresSolutionSubtitle : l10n.featuresBuyerSolutionSubtitle;
    final accentColor = _isSelling ? const Color(0xFF10B981) : const Color(0xFF3B82F6);

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: _isSelling
              ? [const Color(0xFFECFDF5), const Color(0xFFF0FDF4), const Color(0xFFFFFFFF)]
              : [const Color(0xFFEFF6FF), const Color(0xFFF0F9FF), const Color(0xFFFFFFFF)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: _GridPatternPainter(lineColor: accentColor.withValues(alpha: 0.04), spacing: 50)),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 16 : 24,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Column(
                    key: ValueKey('solution-$_isSelling'),
                    children: [
                      _buildSectionBadge(l10n.featuresBadgeSolution, Remix.sparkling_2_fill, accentColor, isMobile),
                      SizedBox(height: isMobile ? 16 : 24),

                      Text(
                        sectionTitle,
                        style: TextStyle(
                          fontSize: isMobile ? 24 : 40,
                          fontWeight: FontWeight.w800,
                          color: _isSelling ? const Color(0xFF065F46) : const Color(0xFF1E40AF),
                          height: 1.2,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: isMobile ? 8 : 12),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: isMobile ? 8 : 0),
                        child: Text(
                          sectionSubtitle,
                          style: TextStyle(
                            fontSize: isMobile ? 15 : 20,
                            color: accentColor,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      SizedBox(height: isMobile ? 32 : 48),

                      ...solutions.asMap().entries.map((entry) => Padding(
                        padding: EdgeInsets.only(bottom: isMobile ? 12 : 20),
                        child: _buildSolutionCard(
                          entry.value['icon'] as IconData,
                          entry.value['text'] as String,
                          accentColor,
                          isMobile,
                        ),
                      )),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSolutionCard(IconData icon, String text, Color color, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16 : 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isMobile ? 14 : 20),
        border: Border.all(color: color.withValues(alpha: 0.2), width: 2),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.08), blurRadius: 30, offset: const Offset(0, 10))],
      ),
      child: Row(
        children: [
          Container(
            width: isMobile ? 44 : 52,
            height: isMobile ? 44 : 52,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color, color.withValues(alpha: 0.8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(isMobile ? 12 : 14),
              boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 5))],
            ),
            child: Icon(icon, size: isMobile ? 20 : 24, color: Colors.white),
          ),
          SizedBox(width: isMobile ? 14 : 20),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 15 : 17,
                fontWeight: FontWeight.w600,
                color: AppTheme.gray800,
                height: 1.4,
              ),
            ),
          ),
          Container(
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(Remix.check_line, color: color, size: isMobile ? 18 : 20),
          ),
        ],
      ),
    );
  }

  // ============ COMPARISON SECTION ============
  Widget _buildComparisonSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    final comparisons = _isSelling
        ? [
            {'before': l10n.featuresCompareBefore1, 'after': l10n.featuresCompareAfter1, 'iconBefore': Remix.time_line, 'iconAfter': Remix.flashlight_line},
            {'before': l10n.featuresCompareBefore2, 'after': l10n.featuresCompareAfter2, 'iconBefore': Remix.question_line, 'iconAfter': Remix.bar_chart_box_line},
            {'before': l10n.featuresCompareBefore3, 'after': l10n.featuresCompareAfter3, 'iconBefore': Remix.calendar_close_line, 'iconAfter': Remix.calendar_check_line},
            {'before': l10n.featuresCompareBefore4, 'after': l10n.featuresCompareAfter4, 'iconBefore': Remix.emotion_unhappy_line, 'iconAfter': Remix.emotion_happy_line},
          ]
        : [
            {'before': l10n.featuresBuyerCompareBefore1, 'after': l10n.featuresBuyerCompareAfter1, 'iconBefore': Remix.window_line, 'iconAfter': Remix.search_2_line},
            {'before': l10n.featuresBuyerCompareBefore2, 'after': l10n.featuresBuyerCompareAfter2, 'iconBefore': Remix.question_line, 'iconAfter': Remix.check_double_line},
            {'before': l10n.featuresBuyerCompareBefore3, 'after': l10n.featuresBuyerCompareAfter3, 'iconBefore': Remix.map_pin_line, 'iconAfter': Remix.global_line},
            {'before': l10n.featuresBuyerCompareBefore4, 'after': l10n.featuresBuyerCompareAfter4, 'iconBefore': Remix.spam_2_line, 'iconAfter': Remix.focus_3_line},
          ];

    final afterColor = _isSelling ? const Color(0xFF10B981) : const Color(0xFF3B82F6);

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFF8FAFC), Color(0xFFFFFFFF), Color(0xFFF1F5F9)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: _GridPatternPainter(lineColor: Colors.black.withValues(alpha: 0.02), spacing: 40)),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 16 : 24,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1000),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: Column(
                    key: ValueKey('compare-$_isSelling'),
                    children: [
                      _buildSectionBadge(l10n.featuresBadgeCompare, Remix.contrast_2_line, AppTheme.gray700, isMobile),
                      SizedBox(height: isMobile ? 16 : 24),

                      Text(
                        l10n.featuresCompareTitle,
                        style: TextStyle(
                          fontSize: isMobile ? 24 : 40,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.gray900,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: isMobile ? 32 : 48),

                      if (!isMobile)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 24),
                          child: Row(
                            children: [
                              Expanded(child: _buildCompareHeader('ANTES', Remix.close_circle_line, const Color(0xFFB91C1C), const Color(0xFFFEE2E2), const Color(0xFFFCA5A5))),
                              const SizedBox(width: 24),
                              Expanded(child: _buildCompareHeader('CON PRICOFY', Remix.checkbox_circle_line,
                                _isSelling ? const Color(0xFF065F46) : const Color(0xFF1E40AF),
                                _isSelling ? const Color(0xFFD1FAE5) : const Color(0xFFDBEAFE),
                                _isSelling ? const Color(0xFF6EE7B7) : const Color(0xFF93C5FD),
                              )),
                            ],
                          ),
                        ),

                      // Móvil: tarjetas con antes/después integrado
                      if (isMobile)
                        ...comparisons.map((c) => Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: _buildMobileComparisonCard(
                            c['before']!,
                            c['after']!,
                            c['iconBefore'] as IconData,
                            c['iconAfter'] as IconData,
                            afterColor,
                          ),
                        ))
                      else
                        ...comparisons.map((c) => Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            children: [
                              Expanded(child: _buildComparisonItem(c['before']!, c['iconBefore'] as IconData, true, afterColor, false)),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(color: afterColor.withValues(alpha: 0.1), shape: BoxShape.circle),
                                  child: Icon(Remix.arrow_right_line, color: afterColor, size: 20),
                                ),
                              ),
                              Expanded(child: _buildComparisonItem(c['after']!, c['iconAfter'] as IconData, false, afterColor, false)),
                            ],
                          ),
                        )),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompareHeader(String text, IconData icon, Color textColor, Color bgColor, Color borderColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20, color: textColor),
          const SizedBox(width: 10),
          Text(text, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: textColor, letterSpacing: 1)),
        ],
      ),
    );
  }

  // Tarjeta de comparación móvil mejorada
  Widget _buildMobileComparisonCard(String before, String after, IconData iconBefore, IconData iconAfter, Color afterColor) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.gray200),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          // Antes
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFFFEF2F2),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(15),
                topRight: Radius.circular(15),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Remix.close_line, color: Color(0xFFEF4444), size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'ANTES',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB91C1C),
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        before,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF991B1B),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(iconBefore, color: const Color(0xFFEF4444).withValues(alpha: 0.5), size: 20),
              ],
            ),
          ),
          // Separador con flecha
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: afterColor.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Remix.arrow_down_line, color: afterColor, size: 18),
                ),
              ],
            ),
          ),
          // Después
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: afterColor == const Color(0xFF10B981) ? const Color(0xFFF0FDF4) : const Color(0xFFF0F9FF),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(15),
                bottomRight: Radius.circular(15),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: afterColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Remix.check_line, color: afterColor, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CON PRICOFY',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: afterColor == const Color(0xFF10B981) ? const Color(0xFF065F46) : const Color(0xFF1E40AF),
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        after,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: afterColor == const Color(0xFF10B981) ? const Color(0xFF047857) : const Color(0xFF1D4ED8),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(iconAfter, color: afterColor.withValues(alpha: 0.6), size: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonItem(String text, IconData icon, bool isBefore, Color afterColor, bool isMobile) {
    final color = isBefore ? const Color(0xFFEF4444) : afterColor;
    final bgColor = isBefore
        ? const Color(0xFFFEF2F2)
        : (afterColor == const Color(0xFF10B981) ? const Color(0xFFF0FDF4) : const Color(0xFFF0F9FF));

    return Container(
      padding: EdgeInsets.all(isMobile ? 14 : 20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(isMobile ? 12 : 16),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Container(
            width: isMobile ? 36 : 40,
            height: isMobile ? 36 : 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(isMobile ? 8 : 10),
            ),
            child: Icon(icon, color: color, size: isMobile ? 18 : 20),
          ),
          SizedBox(width: isMobile ? 12 : 16),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 13 : 15,
                fontWeight: FontWeight.w500,
                color: isBefore
                    ? const Color(0xFFB91C1C)
                    : (afterColor == const Color(0xFF10B981) ? const Color(0xFF065F46) : const Color(0xFF1E40AF)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============ FEATURES SECTION ============
  Widget _buildMainFeaturesSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    // Copys diferentes para vendedor vs comprador
    final features = _isSelling
        ? [
            {'icon': Remix.flashlight_line, 'title': l10n.featuresAiTitle, 'description': l10n.featuresAiDescription, 'color': const Color(0xFF8B5CF6)},
            {'icon': Remix.line_chart_line, 'title': l10n.featuresRealTimeTitle, 'description': l10n.featuresRealTimeDescription, 'color': const Color(0xFF3B82F6)},
            {'icon': Remix.calendar_todo_line, 'title': l10n.featuresAnalyticsTitle, 'description': l10n.featuresAnalyticsDescription, 'color': const Color(0xFF10B981)},
            {'icon': Remix.shield_check_line, 'title': l10n.featuresSecurityTitle, 'description': l10n.featuresSecurityDescription, 'color': const Color(0xFFF59E0B)},
          ]
        : [
            {'icon': Remix.search_eye_line, 'title': l10n.featuresBuyerAiTitle, 'description': l10n.featuresBuyerAiDescription, 'color': const Color(0xFF8B5CF6)},
            {'icon': Remix.time_line, 'title': l10n.featuresBuyerRealTimeTitle, 'description': l10n.featuresBuyerRealTimeDescription, 'color': const Color(0xFF3B82F6)},
            {'icon': Remix.timer_line, 'title': l10n.featuresBuyerAnalyticsTitle, 'description': l10n.featuresBuyerAnalyticsDescription, 'color': const Color(0xFF10B981)},
            {'icon': Remix.shield_check_line, 'title': l10n.featuresBuyerSecurityTitle, 'description': l10n.featuresBuyerSecurityDescription, 'color': const Color(0xFFF59E0B)},
          ];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFF1F5F9), Color(0xFFF8FAFC), Color(0xFFFFFFFF)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: _GridPatternPainter(lineColor: Colors.black.withValues(alpha: 0.02), spacing: 50)),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 16 : 24,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: Column(
                  children: [
                    _buildSectionBadge(l10n.featuresBadgeWhyItWorks, Remix.tools_line, const Color(0xFF7C3AED), isMobile),
                    SizedBox(height: isMobile ? 16 : 24),

                    Text(
                      _isSelling ? l10n.featuresTechTitleSeller : l10n.featuresTechTitleBuyer,
                      style: TextStyle(
                        fontSize: isMobile ? 24 : 40,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.gray900,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 32 : 48),

                    isMobile
                        ? Column(
                            children: features.map((f) => Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _buildFeatureCard(
                                f['icon'] as IconData,
                                f['title'] as String,
                                f['description'] as String,
                                f['color'] as Color,
                                isMobile,
                              ),
                            )).toList(),
                          )
                        : Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: features.map((f) => Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: _buildFeatureCard(
                                  f['icon'] as IconData,
                                  f['title'] as String,
                                  f['description'] as String,
                                  f['color'] as Color,
                                  isMobile,
                                ),
                              ),
                            )).toList(),
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

  Widget _buildFeatureCard(IconData icon, String title, String description, Color color, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 20 : 28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(isMobile ? 16 : 24),
        border: Border.all(color: AppTheme.gray100, width: 1.5),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.08), blurRadius: 40, offset: const Offset(0, 15))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: isMobile ? 52 : 60,
            height: isMobile ? 52 : 60,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.08)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(isMobile ? 14 : 18),
              border: Border.all(color: color.withValues(alpha: 0.2)),
            ),
            child: Icon(icon, color: color, size: isMobile ? 24 : 28),
          ),
          SizedBox(height: isMobile ? 18 : 24),
          Text(title, style: TextStyle(fontSize: isMobile ? 17 : 20, fontWeight: FontWeight.w700, color: AppTheme.gray900)),
          SizedBox(height: isMobile ? 8 : 12),
          Text(description, style: TextStyle(fontSize: isMobile ? 14 : 15, color: AppTheme.gray600, height: 1.7)),
        ],
      ),
    );
  }

  // ============ CTA SECTION ============
  Widget _buildCTASection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    final accentColor = _isSelling ? const Color(0xFF10B981) : const Color(0xFF3B82F6);
    final ctaText = _isSelling ? l10n.featuresCtaButton : l10n.featuresBuyerCtaButton;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: _isSelling
              ? [const Color(0xFF10B981), const Color(0xFF059669), const Color(0xFF047857)]
              : [const Color(0xFF3B82F6), const Color(0xFF2563EB), const Color(0xFF1D4ED8)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: _GridPatternPainter(lineColor: Colors.white.withValues(alpha: 0.05), spacing: 40)),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0, -0.5),
                  radius: 1.5,
                  colors: [Colors.white.withValues(alpha: 0.1), Colors.transparent],
                ),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 16 : 24,
              vertical: isMobile ? 60 : 100,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 700),
                child: Column(
                  children: [
                    Icon(
                      _isSelling ? Remix.rocket_2_line : Remix.search_eye_line,
                      size: isMobile ? 40 : 48,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                    SizedBox(height: isMobile ? 18 : 24),
                    Text(
                      l10n.featuresCtaTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 24 : 40,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 10 : 16),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: isMobile ? 8 : 0),
                      child: Text(
                        l10n.featuresCtaSubtitle,
                        style: TextStyle(
                          fontSize: isMobile ? 14 : 20,
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: isMobile ? 28 : 40),

                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(isMobile ? 12 : 14),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 30, offset: const Offset(0, 10))],
                      ),
                      child: ElevatedButton(
                        onPressed: () => context.go('/landing'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: accentColor,
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 32 : 48,
                            vertical: isMobile ? 16 : 20,
                          ),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(isMobile ? 12 : 14)),
                          elevation: 0,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(ctaText, style: TextStyle(fontSize: isMobile ? 15 : 18, fontWeight: FontWeight.w700)),
                            SizedBox(width: isMobile ? 8 : 12),
                            Icon(Remix.arrow_right_line, size: isMobile ? 18 : 20),
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
}

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