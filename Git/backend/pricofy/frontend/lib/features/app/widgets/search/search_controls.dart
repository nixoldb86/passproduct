// Search Controls Bar Widget
//
// Provides controls for filtering, sorting, and changing view mode
// of search results. Simplified design with:
// - Search within results input
// - Unified filter+sort button (circular with gradient)
// - View mode toggle (list/cards)

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:remixicon/remixicon.dart';
import '../../../../config/theme.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/providers/search_provider.dart';
import '../../../../core/models/search_filters.dart';
import 'filters_sort_sheet.dart';

/// Position of button in a toggle group (for proper border radius)
enum _ButtonPosition { first, middle, last }

class SearchControlsBar extends StatefulWidget {
  const SearchControlsBar({super.key});

  @override
  State<SearchControlsBar> createState() => _SearchControlsBarState();
}

class _SearchControlsBarState extends State<SearchControlsBar> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();

    return Row(
      children: [
        // Search within results
        Expanded(
          child: _buildSearchInResults(l10n, searchProvider),
        ),
        const SizedBox(width: 10),

        // Unified filter+sort button (circular, gradient)
        _buildFilterSortButton(context, searchProvider, l10n),
        const SizedBox(width: 10),

        // View mode toggle
        _buildViewModeToggle(searchProvider),
      ],
    );
  }

  Widget _buildSearchInResults(dynamic l10n, SearchProvider searchProvider) {
    return SizedBox(
      height: 40,
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: l10n.searchSearchInResults,
          hintStyle: TextStyle(fontSize: 13, color: AppTheme.gray400),
          prefixIcon: Icon(Icons.search, size: 18, color: AppTheme.gray400),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, size: 16, color: AppTheme.gray400),
                  onPressed: () {
                    _searchController.clear();
                    searchProvider.setSearchInResults('');
                  },
                )
              : null,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(color: AppTheme.gray200),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(color: AppTheme.gray200),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(color: AppTheme.primary500, width: 1.5),
          ),
          filled: true,
          fillColor: Colors.white,
        ),
        style: const TextStyle(fontSize: 13),
        onChanged: (value) {
          searchProvider.setSearchInResults(value);
          setState(() {}); // Update clear button visibility
        },
      ),
    );
  }

  Widget _buildFilterSortButton(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    final filterCount = searchProvider.filters.activeFilterCount;
    final sortCount = searchProvider.activeSortCount;
    final totalActive = filterCount + sortCount;

    return Stack(
      children: [
        // Circular button with gradient
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppTheme.primary600, Colors.purple.shade600],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppTheme.primary600.withValues(alpha: 0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => _showFiltersSortSheet(context),
              customBorder: const CircleBorder(),
              child: const Center(
                child: Icon(Icons.tune, color: Colors.white, size: 22),
              ),
            ),
          ),
        ),

        // Badge with active count
        if (totalActive > 0)
          Positioned(
            right: 0,
            top: 0,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.red.shade600,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 1.5),
              ),
              constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
              child: Text(
                '$totalActive',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }

  /// View mode toggle with 3 options: list, cards, map
  /// Styled like the monolith: rounded-full border with primary-500 color
  Widget _buildViewModeToggle(SearchProvider searchProvider) {
    const radius = 20.0;

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.primary500),
        borderRadius: BorderRadius.circular(radius),
      ),
      clipBehavior: Clip.antiAlias,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Cards view button (first - rounded left)
          _buildViewModeButton(
            icon: Icons.grid_view,
            isSelected: searchProvider.viewMode == ViewMode.cards,
            onTap: () => searchProvider.setViewMode(ViewMode.cards),
            position: _ButtonPosition.first,
          ),
          // List view button (middle)
          _buildViewModeButton(
            icon: Icons.format_list_bulleted,
            isSelected: searchProvider.viewMode == ViewMode.list,
            onTap: () => searchProvider.setViewMode(ViewMode.list),
            position: _ButtonPosition.middle,
          ),
          // Map view button (last - rounded right)
          _buildViewModeButton(
            icon: Icons.map_outlined,
            isSelected: searchProvider.viewMode == ViewMode.map,
            onTap: () => searchProvider.setViewMode(ViewMode.map),
            position: _ButtonPosition.last,
          ),
        ],
      ),
    );
  }

  Widget _buildViewModeButton({
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
    required _ButtonPosition position,
  }) {
    const radius = 18.0; // Slightly less than container to fit inside border

    BorderRadius? borderRadius;
    if (position == _ButtonPosition.first) {
      borderRadius = const BorderRadius.only(
        topLeft: Radius.circular(radius),
        bottomLeft: Radius.circular(radius),
      );
    } else if (position == _ButtonPosition.last) {
      borderRadius = const BorderRadius.only(
        topRight: Radius.circular(radius),
        bottomRight: Radius.circular(radius),
      );
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary600 : Colors.white,
          borderRadius: borderRadius,
          border: position != _ButtonPosition.first
              ? Border(left: BorderSide(color: AppTheme.primary500))
              : null,
        ),
        child: Icon(
          icon,
          size: 18,
          color: isSelected ? Colors.white : AppTheme.gray700,
        ),
      ),
    );
  }

  void _showFiltersSortSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const FiltersSortSheet(),
    );
  }
}

/// Animated collapsible controls bar
/// Shows a toggle icon that expands to reveal search, filters, and view mode controls
/// Animation: 200ms with easeOutCubic curve
/// iOS-style design with modern aesthetics
class AnimatedControlsBar extends StatefulWidget {
  final bool isExpanded;
  final VoidCallback onToggle;

  const AnimatedControlsBar({
    super.key,
    required this.isExpanded,
    required this.onToggle,
  });

  @override
  State<AnimatedControlsBar> createState() => _AnimatedControlsBarState();
}

class _AnimatedControlsBarState extends State<AnimatedControlsBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );

    if (widget.isExpanded) {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(AnimatedControlsBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isExpanded != oldWidget.isExpanded) {
      if (widget.isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();

    // When expanded, show full-width controls with fade animation
    if (widget.isExpanded) {
      return FadeTransition(
        opacity: _fadeAnimation,
        child: Row(
          children: [
            // Search within results (takes available space)
            Expanded(
              child: SizedBox(
                height: 28,
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: l10n.searchSearchInResults,
                    hintStyle: TextStyle(fontSize: 12, color: AppTheme.gray400),
                    prefixIcon: Padding(
                      padding: const EdgeInsets.only(left: 8, right: 4),
                      child: Icon(Icons.search, size: 14, color: AppTheme.gray400),
                    ),
                    prefixIconConstraints: const BoxConstraints(minWidth: 28),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? GestureDetector(
                            onTap: () {
                              _searchController.clear();
                              searchProvider.setSearchInResults('');
                              setState(() {});
                            },
                            child: Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: Icon(Icons.clear, size: 12, color: AppTheme.gray400),
                            ),
                          )
                        : null,
                    suffixIconConstraints: const BoxConstraints(minWidth: 20),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 4),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: AppTheme.gray200),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: AppTheme.gray200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: AppTheme.primary400, width: 1.5),
                    ),
                    filled: true,
                    fillColor: AppTheme.gray50,
                  ),
                  style: const TextStyle(fontSize: 13),
                  onChanged: (value) {
                    searchProvider.setSearchInResults(value);
                    setState(() {});
                  },
                ),
              ),
            ),
            const SizedBox(width: 6),

            // Filter button
            _buildIOSFilterButton(context, searchProvider),
            const SizedBox(width: 6),

            // Close button (red circle with X)
            _buildCloseButton(onTap: widget.onToggle),
          ],
        ),
      );
    }

    // Collapsed state: filter toggle button with funnel icon
    return _buildFilterToggleButton(onTap: widget.onToggle);
  }

  /// Filter toggle button (collapsed state) with funnel icon only
  Widget _buildFilterToggleButton({required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.primary500, Colors.purple.shade600],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primary600.withValues(alpha: 0.25),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: const Center(
          child: Icon(
            Remix.filter_2_line,
            color: Colors.white,
            size: 16,
          ),
        ),
      ),
    );
  }

  /// Close button (red circle with X)
  Widget _buildCloseButton({required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: [Colors.red.shade500, Colors.red.shade700],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.red.shade600.withValues(alpha: 0.3),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: const Center(
          child: Icon(
            Icons.close_rounded,
            color: Colors.white,
            size: 14,
          ),
        ),
      ),
    );
  }

  /// iOS-style filter button with icon + "Filtros" text and badge
  Widget _buildIOSFilterButton(BuildContext context, SearchProvider searchProvider) {
    final l10n = context.l10n;
    final filterCount = searchProvider.filters.activeFilterCount;
    final sortCount = searchProvider.activeSortCount;
    final totalActive = filterCount + sortCount;

    return GestureDetector(
      onTap: () => _showFiltersSortSheet(context),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: 30,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              gradient: totalActive > 0
                  ? LinearGradient(
                      colors: [AppTheme.primary500, AppTheme.primary600],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
              color: totalActive > 0 ? null : AppTheme.gray100,
              borderRadius: BorderRadius.circular(8),
              boxShadow: totalActive > 0
                  ? [
                      BoxShadow(
                        color: AppTheme.primary600.withValues(alpha: 0.25),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ]
                  : null,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.tune_rounded,
                  size: 16,
                  color: totalActive > 0 ? Colors.white : AppTheme.gray600,
                ),
                const SizedBox(width: 4),
                Text(
                  l10n.filtersTab,
                  style: TextStyle(
                    color: totalActive > 0 ? Colors.white : AppTheme.gray600,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          if (totalActive > 0)
            Positioned(
              right: -3,
              top: -3,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: Colors.red.shade600,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
                constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                child: Text(
                  '$totalActive',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showFiltersSortSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const FiltersSortSheet(),
    );
  }
}
