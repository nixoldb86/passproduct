// Hero Section Widget
//
// Updated with marketing-focused design
// Badge, social proof, micro-copy
// Maintains search bar functionality and CTA to /landing

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:remixicon/remixicon.dart';

import '../../../config/theme.dart';
import '../../../config/routes.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../beta_landing/widgets/search_type_carousel.dart';

class HeroSection extends StatefulWidget {
  const HeroSection({super.key});

  @override
  State<HeroSection> createState() => _HeroSectionState();
}

class _HeroSectionState extends State<HeroSection> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();
  bool _isInputFocused = false;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _searchFocus.addListener(() {
      setState(() {
        _isInputFocused = _searchFocus.hasFocus;
      });
    });
    _searchController.addListener(() {
      setState(() {
        _hasText = _searchController.text.trim().isNotEmpty;
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  void _handleSearch() {
    if (_searchController.text.trim().isNotEmpty) {
      // Navigate to search results page with query
      // Both anonymous and authenticated users can search
      final searchText = Uri.encodeComponent(_searchController.text.trim());
      context.go('${AppRoutes.appSearch}?q=$searchText');
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFEEF2FF), // primary-50
            Colors.white,
            Color(0xFFF5F3FF), // purple-50
            Color(0xFFFEF2F2), // red-50/30
          ],
        ),
      ),
      child: Stack(
        children: [
          // Grid pattern background
          Positioned.fill(
            child: CustomPaint(
              painter: _GridPatternPainter(
                lineColor: AppTheme.primary600.withValues(alpha: 0.03),
                spacing: 50,
              ),
            ),
          ),
          // Content
          Padding(
            padding: EdgeInsets.fromLTRB(
              16,
              MediaQuery.of(context).padding.top + (isMobile ? 12 : 80),
              16,
              isMobile ? 40 : 64,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1280),
                child: Column(
                  children: [
                    // Badge
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: isMobile ? 14 : 20,
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
                          width: 1,
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
                            Remix.search_eye_line,
                            size: isMobile ? 16 : 18,
                            color: AppTheme.primary700,
                          ),
                          SizedBox(width: isMobile ? 8 : 10),
                          Flexible(
                            child: Text(
                              l10n.heroBadge,
                              style: TextStyle(
                                color: AppTheme.primary700,
                                fontSize: isMobile ? 12 : 14,
                                fontWeight: FontWeight.w600,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: isMobile ? 20 : 32),

                    // Title - PRIMERO
                    Text(
                      l10n.heroTitleLine1,
                      style: TextStyle(
                        fontSize: isMobile ? 32 : 80,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.gray900,
                        height: 1.1,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),

                    // Title Highlight
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [
                          AppTheme.primary600,
                          Color(0xFF9333EA), // purple-600
                          AppTheme.primary700,
                        ],
                      ).createShader(bounds),
                      child: Text(
                        l10n.heroTitleLine2,
                        style: TextStyle(
                          fontSize: isMobile ? 32 : 80,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          height: 1.1,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: isMobile ? 24 : 40),

                    // Search Bar - MOVIDO DEBAJO DEL TÍTULO
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 768),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(50),
                          border: Border.all(
                            color: _isInputFocused
                                ? AppTheme.primary600
                                : AppTheme.gray300,
                            width: _isInputFocused ? 2.5 : 1.5,
                          ),
                          boxShadow: _isInputFocused
                              ? [
                                  BoxShadow(
                                    color: AppTheme.primary600.withValues(alpha: 0.35),
                                    blurRadius: 40,
                                    offset: const Offset(0, 10),
                                    spreadRadius: 2,
                                  ),
                                  BoxShadow(
                                    color: const Color(0xFF9333EA).withValues(alpha: 0.2),
                                    blurRadius: 60,
                                    offset: const Offset(0, 15),
                                  ),
                                ]
                              : [
                                  BoxShadow(
                                    color: AppTheme.primary600.withValues(alpha: 0.1),
                                    blurRadius: 20,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                        ),
                        child: Row(
                          children: [
                            // Text Input
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                focusNode: _searchFocus,
                                onSubmitted: (_) => _handleSearch(),
                                style: TextStyle(
                                  fontSize: isMobile ? 16 : 18,
                                  color: AppTheme.gray900,
                                ),
                                decoration: InputDecoration(
                                  hintText: l10n.heroSearchPlaceholder,
                                  hintStyle: TextStyle(
                                    color: AppTheme.gray400,
                                    fontSize: isMobile ? 13 : 18,
                                  ),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  errorBorder: InputBorder.none,
                                  disabledBorder: InputBorder.none,
                                  focusedErrorBorder: InputBorder.none,
                                  filled: false,
                                  fillColor: Colors.transparent,
                                  contentPadding: EdgeInsets.only(
                                    left: 24,
                                    top: isMobile ? 6 : 10,
                                    bottom: isMobile ? 6 : 10,
                                  ),
                                ),
                              ),
                            ),
                            // Search Button
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: AnimatedOpacity(
                                duration: const Duration(milliseconds: 200),
                                opacity: _hasText ? 1.0 : 0.5,
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        AppTheme.primary600,
                                        Color(0xFF9333EA),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: _hasText ? [
                                      BoxShadow(
                                        color: AppTheme.primary600.withValues(alpha: 0.4),
                                        blurRadius: 15,
                                        offset: const Offset(0, 4),
                                      ),
                                    ] : null,
                                  ),
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      onTap: _hasText ? _handleSearch : null,
                                      borderRadius: BorderRadius.circular(20),
                                      child: Padding(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: isMobile ? 12 : 16,
                                          vertical: 8,
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Remix.search_line,
                                              color: Colors.white,
                                              size: isMobile ? 16 : 18,
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              l10n.heroSearchButton,
                                              style: TextStyle(
                                                fontSize: isMobile ? 13 : 14,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: isMobile ? 20 : 32),

                    // Description - Debajo de la barra de búsqueda
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 700),
                      child: Text(
                        l10n.heroDescription,
                        style: TextStyle(
                          fontSize: isMobile ? 16 : 20,
                          color: AppTheme.gray700,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: isMobile ? 16 : 24),

                    // Search Type Carousel
                    Container(
                      margin: EdgeInsets.symmetric(horizontal: isMobile ? 0 : 24),
                      padding: EdgeInsets.only(
                        top: isMobile ? 8 : 16,
                        bottom: isMobile ? 16 : 24,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: AppTheme.gray200,
                          width: 1,
                        ),
                      ),
                      child: SearchTypeCarousel(isMobile: isMobile),
                    ),
                    SizedBox(height: isMobile ? 24 : 32),

                    // CTA Button with arrow
                    Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primary600, Color(0xFF9333EA)],
                        ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary600.withValues(alpha: 0.5),
                            blurRadius: 30,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () => context.go(AppRoutes.landing),
                        style: ElevatedButton.styleFrom(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? 28 : 40,
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
                              l10n.heroStartFree,
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
                    SizedBox(height: isMobile ? 12 : 16),

                    // Micro-copy
                    Text(
                      l10n.heroMicrocopy,
                      style: TextStyle(
                        fontSize: isMobile ? 12 : 14,
                        color: AppTheme.gray500,
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
