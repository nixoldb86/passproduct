// Filters Section Widget
//
// Advanced filtering controls for evaluation detail.
//
// Filters:
// - Price range (custom slider)
// - Shipping toggle (envío vs. mano)
// - Platform dropdown (Wallapop, Milanuncios, All)
// - Search text
// - Reset button

import 'package:flutter/material.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../config/theme.dart';

class FiltersSection extends StatelessWidget {
  final double? minPrice;
  final double? maxPrice;
  final (double, double) priceRange;
  final bool onlyShippable;
  final int minRating;
  final String? platformFilter;
  final List<String> availablePlatforms;
  final String searchQuery;
  final ValueChanged<double?> onMinPriceChanged;
  final ValueChanged<double?> onMaxPriceChanged;
  final VoidCallback onShippableToggled;
  final ValueChanged<int> onMinRatingChanged;
  final ValueChanged<String?> onPlatformChanged;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onResetFilters;

  const FiltersSection({
    super.key,
    required this.minPrice,
    required this.maxPrice,
    required this.priceRange,
    required this.onlyShippable,
    required this.minRating,
    required this.platformFilter,
    required this.availablePlatforms,
    required this.searchQuery,
    required this.onMinPriceChanged,
    required this.onMaxPriceChanged,
    required this.onShippableToggled,
    required this.onMinRatingChanged,
    required this.onPlatformChanged,
    required this.onSearchChanged,
    required this.onResetFilters,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.filter_list, size: 20),
                    SizedBox(width: 8),
                    Text(
                      l10n.searchFilters,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                TextButton.icon(
                  onPressed: onResetFilters,
                  icon: Icon(Icons.refresh, size: 16),
                  label: Text(l10n.commonReset),
                ),
              ],
            ),
            SizedBox(height: 16),

            // Search bar
            TextField(
              decoration: InputDecoration(
                hintText: l10n.searchSearchByTitle,
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onChanged: onSearchChanged,
            ),
            SizedBox(height: 16),

            // Price range slider
            _buildPriceRangeFilter(context, l10n),
            SizedBox(height: 16),

            // Platform filter
            _buildPlatformFilter(context, l10n),
            SizedBox(height: 16),

            // Toggle filters
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                FilterChip(
                  label: Text(l10n.searchShippable),
                  selected: onlyShippable,
                  onSelected: (_) => onShippableToggled(),
                  avatar: Icon(
                    onlyShippable ? Icons.local_shipping : Icons.local_shipping_outlined,
                    size: 18,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceRangeFilter(BuildContext context, dynamic l10n) {
    final (minRange, maxRange) = priceRange;
    final effectiveMin = minPrice ?? minRange;
    final effectiveMax = maxPrice ?? maxRange;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              l10n.searchPriceRange,
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            Text(
              '${effectiveMin.round()}€ - ${effectiveMax.round()}€',
              style: TextStyle(
                color: AppTheme.primary600,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        SizedBox(height: 8),
        RangeSlider(
          values: RangeValues(effectiveMin, effectiveMax),
          min: minRange,
          max: maxRange,
          divisions: ((maxRange - minRange) / 10).round().clamp(10, 100),
          labels: RangeLabels(
            '${effectiveMin.round()}€',
            '${effectiveMax.round()}€',
          ),
          onChanged: (RangeValues values) {
            onMinPriceChanged(values.start == minRange ? null : values.start);
            onMaxPriceChanged(values.end == maxRange ? null : values.end);
          },
        ),
      ],
    );
  }

  Widget _buildPlatformFilter(BuildContext context, dynamic l10n) {
    final platforms = ['all', ...availablePlatforms];
    final selectedPlatform = platformFilter ?? 'all';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.searchPlatform,
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: selectedPlatform,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            prefixIcon: Icon(Icons.apps),
          ),
          items: platforms.map((platform) {
            return DropdownMenuItem(
              value: platform,
              child: Text(
                platform == 'all'
                    ? l10n.searchAllPlatforms
                    : platform.substring(0, 1).toUpperCase() + platform.substring(1),
              ),
            );
          }).toList(),
          onChanged: onPlatformChanged,
        ),
      ],
    );
  }
}

