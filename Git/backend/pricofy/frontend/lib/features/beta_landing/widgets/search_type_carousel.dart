// Search Type Carousel Widget
//
// Carousel showing the 3 search types: Classic, Advanced (AI), Market Analysis

import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';

class SearchTypeCarousel extends StatefulWidget {
  final bool isMobile;

  const SearchTypeCarousel({super.key, required this.isMobile});

  @override
  State<SearchTypeCarousel> createState() => _SearchTypeCarouselState();
}

class _SearchTypeCarouselState extends State<SearchTypeCarousel> {
  late final PageController _pageController;
  int _currentPage = 0;
  int? _expandedBenefitIndex; // Track which benefit is expanded (only for classic search)

  @override
  void initState() {
    super.initState();
    _pageController = PageController(
      viewportFraction: widget.isMobile ? 0.95 : 0.38,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToPage(int page) {
    _pageController.animateToPage(
      page,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Title
        Text(
          context.l10n.searchTypeCarouselTitle,
          style: TextStyle(
            fontSize: widget.isMobile ? 16 : 20,
            fontWeight: FontWeight.w600,
            color: AppTheme.gray900,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),

        // Carousel
        SizedBox(
          height: widget.isMobile ? 320 : 380,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: 3,
            itemBuilder: (context, index) {
              return AnimatedScale(
                scale: _currentPage == index ? 1.0 : 0.92,
                duration: const Duration(milliseconds: 200),
                child: _buildCard(index),
              );
            },
          ),
        ),
        const SizedBox(height: 16),

        // Navigation
        _buildNavigation(),
      ],
    );
  }

  Widget _buildCard(int index) {
    final l10n = context.l10n;
    final cards = [
      _SearchTypeCardData(
        badges: [
          l10n.searchTypeClassicBadge1,
          l10n.searchTypeClassicBadge2,
          l10n.searchTypeClassicBadge3,
        ],
        badgeColor: const Color(0xFF10B981), // emerald-500
        icon: Icons.search,
        iconBgColor: const Color(0xFF10B981), // emerald-500
        title: l10n.searchTypeClassicTitle,
        benefits: [
          l10n.searchTypeClassicBenefit1,
          l10n.searchTypeClassicBenefit2,
          l10n.searchTypeClassicBenefit4,
        ],
        expandedBenefits: [
          l10n.searchTypeClassicBenefit1Expanded,
          l10n.searchTypeClassicBenefit2Expanded,
          l10n.searchTypeClassicBenefit4Expanded,
        ],
        buttonText: l10n.searchTypeClassicButton,
        accentColor: const Color(0xFF10B981), // emerald-500
      ),
      _SearchTypeCardData(
        badges: [
          l10n.searchTypeAdvancedBadge,
          l10n.searchTypeAdvancedBadge2,
        ],
        badgeColor: const Color(0xFF6366F1), // indigo-500
        icon: Icons.auto_awesome,
        iconBgColor: const Color(0xFF6366F1), // indigo-500
        title: l10n.searchTypeAdvancedTitle,
        benefits: [
          l10n.searchTypeAdvancedBenefit1,
          l10n.searchTypeAdvancedBenefit2,
          l10n.searchTypeAdvancedBenefit3,
        ],
        expandedBenefits: [
          l10n.searchTypeAdvancedBenefit1Expanded,
          l10n.searchTypeAdvancedBenefit2Expanded,
          l10n.searchTypeAdvancedBenefit3Expanded,
        ],
        buttonText: l10n.searchTypeAdvancedButton,
        accentColor: const Color(0xFF6366F1), // indigo-500
      ),
      _SearchTypeCardData(
        badges: [l10n.searchTypeMarketBadge],
        badgeColor: const Color(0xFFF59E0B), // amber-500
        icon: Icons.bar_chart,
        iconBgColor: const Color(0xFFF59E0B), // amber-500
        title: l10n.searchTypeMarketTitle,
        benefits: [
          l10n.searchTypeMarketBenefit1,
          l10n.searchTypeMarketBenefit2,
          l10n.searchTypeMarketBenefit3,
        ],
        expandedBenefits: null, // No expandable benefits for market
        buttonText: l10n.searchTypeMarketButton,
        accentColor: const Color(0xFFF59E0B), // amber-500
      ),
    ];

    final card = cards[index];

    return Container(
      margin: EdgeInsets.symmetric(horizontal: widget.isMobile ? 4 : 12),
      padding: EdgeInsets.only(
        top: widget.isMobile ? 16 : 20,
        left: widget.isMobile ? 16 : 20,
        right: widget.isMobile ? 16 : 20,
        bottom: (index == 0 || index == 1) ? (widget.isMobile ? 8 : 12) : (widget.isMobile ? 16 : 20), // Menos padding bottom para búsqueda clásica y avanzada
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Badges (solo para búsqueda clásica, wrap para evitar overflow)
          if (index == 0)
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: card.badges.map((badge) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: card.badgeColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    badge,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: card.badgeColor,
                    ),
                  ),
                );
              }).toList(),
            ),
          if (index == 0) SizedBox(height: widget.isMobile ? 12 : 16),

          // Title + Icon (solo para búsqueda clásica)
          if (index == 0)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Text(
                    card.title,
                    style: TextStyle(
                      fontSize: widget.isMobile ? 18 : 22,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF111827), // gray-900
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: widget.isMobile ? 32 : 36,
                  height: widget.isMobile ? 32 : 36,
                  decoration: BoxDecoration(
                    color: card.iconBgColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    card.icon,
                    color: Colors.white,
                    size: widget.isMobile ? 18 : 22, // Mismo tamaño que el fontSize del título
                  ),
                ),
              ],
            ),

          // Badges para búsqueda avanzada (en una línea)
          if (index == 1)
            Row(
              children: card.badges.map((badge) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: card.badgeColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      badge,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: card.badgeColor,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          if (index == 1) SizedBox(height: widget.isMobile ? 12 : 16),

          // Title + Icon para búsqueda avanzada
          if (index == 1)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Text(
                    card.title,
                    style: TextStyle(
                      fontSize: widget.isMobile ? 18 : 22,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF111827), // gray-900
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: widget.isMobile ? 32 : 36,
                  height: widget.isMobile ? 32 : 36,
                  decoration: BoxDecoration(
                    color: card.iconBgColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    card.icon,
                    color: Colors.white,
                    size: widget.isMobile ? 18 : 22, // Mismo tamaño que el fontSize del título
                  ),
                ),
              ],
            ),

          // Header: Badge + Icon (para tarjeta de mercado)
          if (index == 2) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badge
                if (card.badges.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: card.badgeColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      card.badges.first,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: card.badgeColor,
                      ),
                    ),
                  ),
                const Spacer(),
                // Icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: card.iconBgColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    card.icon,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ],
            ),
            SizedBox(height: widget.isMobile ? 12 : 16),

            // Title
            Text(
              card.title,
              style: TextStyle(
                fontSize: widget.isMobile ? 18 : 22,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF111827), // gray-900
              ),
            ),
          ],
          SizedBox(height: widget.isMobile ? 8 : 12),

          // Benefits
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: card.benefits.asMap().entries.map((entry) {
              final benefitIndex = entry.key;
              final benefit = entry.value;
              final hasExpandedText = card.expandedBenefits != null && 
                                      benefitIndex < card.expandedBenefits!.length;
              
              if (hasExpandedText) {
                // Expandable benefit for classic or advanced search
                return Padding(
                  padding: EdgeInsets.only(bottom: widget.isMobile ? 8 : 10),
                  child: _ExpandableBenefit(
                    shortText: benefit,
                    expandedText: card.expandedBenefits![benefitIndex],
                    accentColor: card.accentColor,
                    isMobile: widget.isMobile,
                    isExpanded: _expandedBenefitIndex == benefitIndex,
                    onTap: () {
                      setState(() {
                        if (_expandedBenefitIndex == benefitIndex) {
                          _expandedBenefitIndex = null;
                        } else {
                          _expandedBenefitIndex = benefitIndex;
                        }
                      });
                    },
                  ),
                );
              } else {
                // Regular benefit (non-expandable)
                return Padding(
                  padding: EdgeInsets.only(bottom: widget.isMobile ? 8 : 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.check_circle,
                        size: widget.isMobile ? 20 : 22,
                        color: card.accentColor,
                      ),
                      SizedBox(width: widget.isMobile ? 6 : 8),
                      Expanded(
                        child: Text(
                          benefit,
                          style: TextStyle(
                            fontSize: widget.isMobile ? 14 : 15,
                            color: AppTheme.gray600,
                            height: widget.isMobile ? 1.25 : 1.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }
            }).toList(),
          ),

          // Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: widget.isMobile ? 12 : 14),
                side: BorderSide(color: card.accentColor, width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                card.buttonText,
                style: TextStyle(
                  fontSize: widget.isMobile ? 14 : 16,
                  fontWeight: FontWeight.w600,
                  color: card.accentColor,
                ),
              ),
            ),
          ),

          // Micro-copy para búsqueda clásica
          if (index == 0) ...[
            SizedBox(height: widget.isMobile ? 8 : 10),
            Text(
              'Ideal para comparar más opciones y encontrar el mejor precio.',
              style: TextStyle(
                fontSize: widget.isMobile ? 11 : 12,
                fontStyle: FontStyle.italic,
                color: AppTheme.gray500,
                height: 1.3,
              ),
              textAlign: TextAlign.center,
            ),
          ],

          // Micro-copy para búsqueda avanzada
          if (index == 1) ...[
            SizedBox(height: widget.isMobile ? 8 : 10),
            Text(
              'Ideal si quieres comprar bien: menos ruido, más control y más tranquilidad.',
              style: TextStyle(
                fontSize: widget.isMobile ? 11 : 12,
                fontStyle: FontStyle.italic,
                color: AppTheme.gray500,
                height: 1.3,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNavigation() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Left arrow
        IconButton(
          onPressed: _currentPage > 0 ? () => _goToPage(_currentPage - 1) : null,
          icon: Icon(
            Icons.chevron_left,
            size: 32,
            color: _currentPage > 0 ? AppTheme.gray700 : AppTheme.gray300,
          ),
        ),
        const SizedBox(width: 8),

        // Dots
        Row(
          children: List.generate(3, (index) {
            final isActive = index == _currentPage;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: isActive ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primary500 : AppTheme.gray300,
                borderRadius: BorderRadius.circular(4),
              ),
            );
          }),
        ),
        const SizedBox(width: 8),

        // Right arrow
        IconButton(
          onPressed: _currentPage < 2 ? () => _goToPage(_currentPage + 1) : null,
          icon: Icon(
            Icons.chevron_right,
            size: 32,
            color: _currentPage < 2 ? AppTheme.gray700 : AppTheme.gray300,
          ),
        ),
      ],
    );
  }
}

class _SearchTypeCardData {
  final List<String> badges;
  final Color badgeColor;
  final IconData icon;
  final Color iconBgColor;
  final String title;
  final List<String> benefits;
  final List<String>? expandedBenefits; // Optional expanded texts (only for classic search)
  final String buttonText;
  final Color accentColor;

  const _SearchTypeCardData({
    required this.badges,
    required this.badgeColor,
    required this.icon,
    required this.iconBgColor,
    required this.title,
    required this.benefits,
    this.expandedBenefits,
    required this.buttonText,
    required this.accentColor,
  });
}

// Expandable benefit widget with tooltip
class _ExpandableBenefit extends StatelessWidget {
  final String shortText;
  final String expandedText;
  final Color accentColor;
  final bool isMobile;
  final bool isExpanded;
  final VoidCallback onTap;

  const _ExpandableBenefit({
    required this.shortText,
    required this.expandedText,
    required this.accentColor,
    required this.isMobile,
    required this.isExpanded,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return TapRegion(
      onTapOutside: (_) {
        if (isExpanded) {
          onTap(); // Close if clicking outside
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: onTap,
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  child: Icon(
                    isExpanded ? Icons.check_circle : Icons.add_circle_outline,
                    key: ValueKey(isExpanded),
                    size: isMobile ? 20 : 22,
                    color: accentColor,
                  ),
                ),
              ),
              SizedBox(width: isMobile ? 6 : 8),
              Expanded(
                child: Text(
                  shortText,
                  style: TextStyle(
                    fontSize: isMobile ? 14 : 15,
                    color: AppTheme.gray600,
                    height: isMobile ? 1.25 : 1.3,
                  ),
                ),
              ),
            ],
          ),
          if (isExpanded) ...[
            SizedBox(height: isMobile ? 6 : 8),
            Container(
              margin: EdgeInsets.only(left: (isMobile ? 16 : 18) + (isMobile ? 6 : 8)),
              padding: EdgeInsets.all(isMobile ? 10 : 12),
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: accentColor.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Text(
                expandedText,
                style: TextStyle(
                  fontSize: isMobile ? 11 : 12,
                  color: AppTheme.gray700,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
