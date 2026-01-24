// Why It Works Page - Isra Bravo Style
// Dark, bold, direct copy with high conversion focus

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:remixicon/remixicon.dart';

import '../../../config/routes.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/utils/responsive.dart';

class WhyItWorksPage extends StatefulWidget {
  const WhyItWorksPage({super.key});

  @override
  State<WhyItWorksPage> createState() => _WhyItWorksPageState();
}

class _WhyItWorksPageState extends State<WhyItWorksPage> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _counterController;
  
  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _counterController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..forward();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _counterController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return SingleChildScrollView(
      child: Column(
        children: [
          _buildHeroSection(context, l10n),
          _buildProblemSection(context, l10n),
          _buildSolutionSection(context, l10n),
          _buildNumbersSection(context, l10n),
          _buildUncomfortableQuestion(context, l10n),
          _buildObjectionsSection(context, l10n),
          _buildFinalCTA(context, l10n),
        ],
      ),
    );
  }

  // ============ HERO - El gancho ============
  Widget _buildHeroSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0a0a0f),
            Color(0xFF0f0f18),
            Color(0xFF0a0a0f),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Grid pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: Colors.white.withValues(alpha: 0.03),
                spacing: 60,
              ),
            ),
          ),
          // Accent glow
          Positioned(
            top: -100,
            left: 0,
            right: 0,
            child: Container(
              height: 400,
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topCenter,
                  radius: 1.5,
                  colors: [
                    const Color(0xFF10B981).withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          // Content
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 20 : 40,
              vertical: isMobile ? 60 : 120,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  children: [
                    // Main headline
                    Text(
                      l10n.whyItWorksHeroTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 36 : 72,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        height: 1.0,
                        letterSpacing: -2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.whyItWorksHeroSubtitle,
                      style: TextStyle(
                        fontSize: isMobile ? 36 : 72,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF10B981),
                        height: 1.0,
                        letterSpacing: -2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 24 : 40),
                    
                    // Subtitle
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: isMobile ? 0 : 40),
                      child: Text(
                        l10n.whyItWorksHeroDescription,
                        style: TextStyle(
                          fontSize: isMobile ? 16 : 22,
                          color: Colors.white.withValues(alpha: 0.7),
                          height: 1.6,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: isMobile ? 32 : 48),
                    
                    // CTA Button
                    _buildPrimaryCTA(l10n.whyItWorksHeroCta, isMobile),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============ PROBLEMA - El problema real ============
  Widget _buildProblemSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0f0f18),
            Color(0xFF1a1a24),
            Color(0xFF0f0f18),
          ],
        ),
      ),
      child: Stack(
        children: [
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
              horizontal: isMobile ? 20 : 40,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  children: [
                    // Title
                    Text(
                      l10n.whyItWorksProblemTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 24 : 40,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.whyItWorksProblemSubtitle,
                      style: TextStyle(
                        fontSize: isMobile ? 24 : 40,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFFEF4444),
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 32 : 48),
                    
                    // Problem breakdown
                    Container(
                      padding: EdgeInsets.all(isMobile ? 20 : 32),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.03),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFFEF4444).withValues(alpha: 0.2),
                        ),
                      ),
                      child: Column(
                        children: [
                          _buildProblemItem('50', l10n.whyItWorksProblem1, const Color(0xFF6B7280), isMobile),
                          _buildProblemItem('30', l10n.whyItWorksProblem2, const Color(0xFF9CA3AF), isMobile),
                          _buildProblemItem('15', l10n.whyItWorksProblem3, const Color(0xFFF59E0B), isMobile),
                          _buildProblemItem('4', l10n.whyItWorksProblem4, const Color(0xFFEF4444), isMobile),
                          _buildProblemItem('1', l10n.whyItWorksProblem5, const Color(0xFF10B981), isMobile, isLast: true),
                        ],
                      ),
                    ),
                    SizedBox(height: isMobile ? 24 : 32),
                    
                    // Question
                    Text(
                      l10n.whyItWorksProblemQuestion,
                      style: TextStyle(
                        fontSize: isMobile ? 16 : 20,
                        color: Colors.white.withValues(alpha: 0.6),
                        fontStyle: FontStyle.italic,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    // Funnel visual
                    SizedBox(height: isMobile ? 32 : 48),
                    _buildFunnelVisual(isMobile),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProblemItem(String number, String text, Color color, bool isMobile, {bool isLast = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : (isMobile ? 12 : 16)),
      child: Row(
        children: [
          Container(
            width: isMobile ? 40 : 50,
            height: isMobile ? 40 : 50,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                number,
                style: TextStyle(
                  fontSize: isMobile ? 16 : 20,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
            ),
          ),
          SizedBox(width: isMobile ? 12 : 16),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 15 : 18,
                color: color,
                fontWeight: isLast ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ),
          if (isLast) 
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 10 : 14,
                vertical: isMobile ? 4 : 6,
              ),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(50),
              ),
              child: Text(
                '💎',
                style: TextStyle(fontSize: isMobile ? 16 : 20),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFunnelVisual(bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16 : 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.white.withValues(alpha: 0.02),
            Colors.white.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Remix.filter_3_line,
            color: const Color(0xFF10B981),
            size: isMobile ? 32 : 48,
          ),
          SizedBox(width: isMobile ? 12 : 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.whyItWorksFunnelTitle,
                style: TextStyle(
                  fontSize: isMobile ? 14 : 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              Text(
                l10n.whyItWorksFunnelSubtitle,
                style: TextStyle(
                  fontSize: isMobile ? 12 : 14,
                  color: Colors.white.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ============ SOLUCIÓN - Sin palabrería ============
  Widget _buildSolutionSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    final solutions = [
      {
        'icon': Remix.search_eye_line,
        'title': l10n.whyItWorksSolution1Title,
        'description': l10n.whyItWorksSolution1Description,
      },
      {
        'icon': Remix.filter_3_line,
        'title': l10n.whyItWorksSolution2Title,
        'description': l10n.whyItWorksSolution2Description,
      },
      {
        'icon': Remix.money_euro_circle_line,
        'title': l10n.whyItWorksSolution3Title,
        'description': l10n.whyItWorksSolution3Description,
      },
    ];
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF0a0a0f),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: const Color(0xFF10B981).withValues(alpha: 0.03),
                spacing: 50,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 20 : 40,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1000),
                child: Column(
                  children: [
                    Text(
                      l10n.whyItWorksSolutionTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 24 : 40,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 32 : 48),
                    
                    isMobile
                        ? Column(
                            children: solutions.map((s) => Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _buildSolutionCard(
                                s['icon'] as IconData,
                                s['title'] as String,
                                s['description'] as String,
                                isMobile,
                              ),
                            )).toList(),
                          )
                        : Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: solutions.map((s) => Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: _buildSolutionCard(
                                  s['icon'] as IconData,
                                  s['title'] as String,
                                  s['description'] as String,
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

  Widget _buildSolutionCard(IconData icon, String title, String description, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 20 : 28),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF10B981).withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: isMobile ? 60 : 72,
            height: isMobile ? 60 : 72,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF10B981).withValues(alpha: 0.2),
                  const Color(0xFF10B981).withValues(alpha: 0.1),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: const Color(0xFF10B981).withValues(alpha: 0.3),
              ),
            ),
            child: Icon(icon, color: const Color(0xFF10B981), size: isMobile ? 28 : 36),
          ),
          SizedBox(height: isMobile ? 16 : 20),
          Text(
            title,
            style: TextStyle(
              fontSize: isMobile ? 16 : 20,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF10B981),
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: isMobile ? 8 : 12),
          Text(
            description,
            style: TextStyle(
              fontSize: isMobile ? 14 : 15,
              color: Colors.white.withValues(alpha: 0.6),
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // ============ NÚMEROS - Prueba social ============
  Widget _buildNumbersSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    final stats = [
      {'value': '2', 'unit': 'seg', 'label': l10n.whyItWorksStats1Label},
      {'value': '65', 'unit': '%', 'label': l10n.whyItWorksStats2Label},
      {'value': '127', 'unit': '€', 'label': l10n.whyItWorksStats3Label},
    ];
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF0f0f18),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: Colors.white.withValues(alpha: 0.02),
                spacing: 40,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 20 : 40,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 900),
                child: Column(
                  children: [
                    Text(
                      l10n.whyItWorksStatsTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 24 : 40,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 32 : 48),
                    
                    isMobile
                        ? Column(
                            children: stats.map((s) => Padding(
                              padding: const EdgeInsets.only(bottom: 24),
                              child: _buildStatCard(
                                s['value'] as String,
                                s['unit'] as String,
                                s['label'] as String,
                                isMobile,
                              ),
                            )).toList(),
                          )
                        : Row(
                            children: stats.map((s) => Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: _buildStatCard(
                                  s['value'] as String,
                                  s['unit'] as String,
                                  s['label'] as String,
                                  isMobile,
                                ),
                              ),
                            )).toList(),
                          ),
                    
                    SizedBox(height: isMobile ? 24 : 32),
                    Text(
                      l10n.whyItWorksStatsFooter,
                      style: TextStyle(
                        fontSize: isMobile ? 14 : 16,
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                      textAlign: TextAlign.center,
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

  Widget _buildStatCard(String value, String unit, String label, bool isMobile) {
    return AnimatedBuilder(
      animation: _counterController,
      builder: (context, child) {
        final animatedValue = (int.parse(value) * _counterController.value).round();
        return Container(
          padding: EdgeInsets.all(isMobile ? 20 : 28),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.03),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$animatedValue',
                    style: TextStyle(
                      fontSize: isMobile ? 40 : 56,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF10B981),
                      height: 1,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      unit,
                      style: TextStyle(
                        fontSize: isMobile ? 20 : 24,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF10B981).withValues(alpha: 0.7),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: isMobile ? 8 : 12),
              Text(
                label,
                style: TextStyle(
                  fontSize: isMobile ? 13 : 15,
                  color: Colors.white.withValues(alpha: 0.6),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }

  // ============ PREGUNTA INCÓMODA ============
  Widget _buildUncomfortableQuestion(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF10B981),
            Color(0xFF059669),
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: Colors.white.withValues(alpha: 0.1),
                spacing: 40,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 20 : 40,
              vertical: isMobile ? 60 : 100,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 800),
                child: Column(
                  children: [
                    Text(
                      l10n.whyItWorksQuestionTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 14 : 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white.withValues(alpha: 0.8),
                        letterSpacing: 2,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 20 : 32),
                    
                    Text(
                      l10n.whyItWorksQuestionMain,
                      style: TextStyle(
                        fontSize: isMobile ? 22 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.3,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 20 : 32),
                    
                    Text(
                      l10n.whyItWorksQuestionAnswer,
                      style: TextStyle(
                        fontSize: isMobile ? 18 : 24,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 32 : 48),
                    
                    _buildSecondaryCTA(l10n.whyItWorksQuestionCta, isMobile),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============ OBJECIONES ============
  Widget _buildObjectionsSection(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    final objections = [
      {
        'question': l10n.whyItWorksObjection1Question,
        'answer': l10n.whyItWorksObjection1Answer,
        'icon': Remix.question_line,
      },
      {
        'question': l10n.whyItWorksObjection2Question,
        'answer': l10n.whyItWorksObjection2Answer,
        'icon': Remix.money_euro_circle_line,
      },
      {
        'question': l10n.whyItWorksObjection3Question,
        'answer': l10n.whyItWorksObjection3Answer,
        'icon': Remix.shield_user_line,
      },
    ];
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF0a0a0f),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: Colors.white.withValues(alpha: 0.02),
                spacing: 50,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 20 : 40,
              vertical: isMobile ? 48 : 80,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 800),
                child: Column(
                  children: [
                    Text(
                      l10n.whyItWorksObjectionsTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 24 : 40,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 32 : 48),
                    
                    ...objections.map((o) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _buildObjectionCard(
                        o['question'] as String,
                        o['answer'] as String,
                        o['icon'] as IconData,
                        isMobile,
                      ),
                    )),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildObjectionCard(String question, String answer, IconData icon, bool isMobile) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(isMobile ? 20 : 28),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF10B981), size: isMobile ? 20 : 24),
          ),
          SizedBox(width: isMobile ? 14 : 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  question,
                  style: TextStyle(
                    fontSize: isMobile ? 15 : 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: isMobile ? 8 : 10),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '→',
                      style: TextStyle(
                        fontSize: isMobile ? 14 : 16,
                        color: const Color(0xFF10B981),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        answer,
                        style: TextStyle(
                          fontSize: isMobile ? 14 : 16,
                          color: Colors.white.withValues(alpha: 0.7),
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============ CTA FINAL ============
  Widget _buildFinalCTA(BuildContext context, dynamic l10n) {
    final isMobile = context.isMobile;
    
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0f0f18),
            Color(0xFF0a0a0f),
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: const Color(0xFF10B981).withValues(alpha: 0.03),
                spacing: 60,
              ),
            ),
          ),
          // Glow effect
          Positioned(
            bottom: -100,
            left: 0,
            right: 0,
            child: Container(
              height: 300,
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.bottomCenter,
                  radius: 1.5,
                  colors: [
                    const Color(0xFF10B981).withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 20 : 40,
              vertical: isMobile ? 60 : 100,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 700),
                child: Column(
                  children: [
                    Text(
                      l10n.whyItWorksFinalTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 26 : 48,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        height: 1.1,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.whyItWorksFinalSubtitle,
                      style: TextStyle(
                        fontSize: isMobile ? 26 : 48,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF10B981),
                        height: 1.1,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: isMobile ? 32 : 48),
                    
                    _buildPrimaryCTA(l10n.whyItWorksFinalCta, isMobile),
                    SizedBox(height: isMobile ? 16 : 20),
                    
                    Text(
                      l10n.whyItWorksFinalMicrocopy,
                      style: TextStyle(
                        fontSize: isMobile ? 13 : 15,
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                      textAlign: TextAlign.center,
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

  // ============ COMPONENTES REUTILIZABLES ============
  Widget _buildPrimaryCTA(String text, bool isMobile) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF10B981).withValues(
                  alpha: 0.3 + (_pulseController.value * 0.2),
                ),
                blurRadius: 30 + (_pulseController.value * 10),
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed: () => context.go(AppRoutes.features),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 32 : 48,
                vertical: isMobile ? 18 : 22,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  text,
                  style: TextStyle(
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(width: isMobile ? 10 : 14),
                Icon(Remix.arrow_right_line, size: isMobile ? 20 : 22),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSecondaryCTA(String text, bool isMobile) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: () => context.go('/landing'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF059669),
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 28 : 40,
            vertical: isMobile ? 16 : 20,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 0,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              text,
              style: TextStyle(
                fontSize: isMobile ? 15 : 17,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(width: isMobile ? 8 : 12),
            Icon(Remix.arrow_right_line, size: isMobile ? 18 : 20),
          ],
        ),
      ),
    );
  }

  dynamic get l10n => context.l10n;
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
