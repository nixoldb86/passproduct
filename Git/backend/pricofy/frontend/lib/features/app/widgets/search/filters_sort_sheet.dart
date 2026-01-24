// Filters & Sort Bottom Sheet
//
// Unified bottom sheet with tabs for Filters and Sort.
// Matches monolito design patterns with expandable sections,
// visual sort criteria chips, and clean UI.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/api_config.dart';
import '../../../../config/theme.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/models/search_filters.dart';
import '../../../../core/models/sort_criteria.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/search_provider.dart';
import '../../../../core/utils/country_flags.dart';
import '../modals/registration_modal.dart';
import 'expandable_filter_section.dart';
import 'sort_criterion_chip.dart';

class FiltersSortSheet extends StatefulWidget {
  const FiltersSortSheet({super.key});

  @override
  State<FiltersSortSheet> createState() => _FiltersSortSheetState();
}

class _FiltersSortSheetState extends State<FiltersSortSheet> {
  int _selectedTab = 0; // 0 = Filters, 1 = Sort

  // Local state (copied from provider, applied on submit)
  late SearchFilters _localFilters;
  late List<SortCriteria> _localSort;

  // Expanded sections tracking
  final Set<String> _expandedSections = {};

  // Sort options UI state
  bool _showAddSortOptions = false;

  // Price range temp values
  double _tempMinPrice = 0;
  double _tempMaxPrice = 2000;

  // Distance temp value (null means no limit)
  double? _tempDistance;

  // Dynamic ranges from search results
  double _priceRangeMin = 0;
  double _priceRangeMax = 2000;
  double _distanceRangeMax = 500;
  List<String> _availableCountries = [];
  List<String> _availablePlatforms = [];
  bool _hasDistanceData = false;

  // Platform-specific filter options
  List<String> _availableConditions = [];
  List<String> _availableBrands = [];
  List<String> _availableSizes = [];

  // Extras filter options
  bool _extrasWarranty = false;
  bool _extrasInvoice = false;
  bool _extrasBuyerProtection = false;

  // Registration modal state
  bool _showRegistrationModal = false;

  @override
  void initState() {
    super.initState();
    _initializeFromProvider();
  }

  void _initializeFromProvider() {
    final provider = context.read<SearchProvider>();
    _localFilters = provider.filters;
    _localSort = List.from(provider.sortCriteria);

    // Get dynamic ranges from search results
    final (minPrice, maxPrice) = provider.priceRange;
    _priceRangeMin = minPrice;
    _priceRangeMax = maxPrice;

    final (_, maxDist) = provider.distanceRange;
    _distanceRangeMax = maxDist;
    _hasDistanceData = provider.hasDistanceData;

    _availableCountries = provider.availableCountries;
    _availablePlatforms = provider.availablePlatforms;

    // Platform-specific filter options
    _availableConditions = provider.availableConditions;
    _availableBrands = provider.availableBrands;
    _availableSizes = provider.availableSizes;

    // Initialize price range (use filter values or defaults to full range)
    _tempMinPrice = _localFilters.minPrice ?? _priceRangeMin;
    _tempMaxPrice = _localFilters.maxPrice ?? _priceRangeMax;

    // Initialize distance (null = no limit)
    _tempDistance = _localFilters.maxDistance;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final authProvider = context.watch<AuthProvider>();
    final isGuest = !authProvider.isAuthenticated;

    return Stack(
      children: [
        Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.85,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDragHandle(),
              _buildHeader(l10n),
              _buildTabs(l10n),
              Expanded(
                child: _selectedTab == 0
                    ? _buildFiltersTab(l10n, isGuest)
                    : _buildSortTab(l10n),
              ),
              _buildFooter(l10n),
            ],
          ),
        ),
        // Modal de registro para invitados
        if (_showRegistrationModal)
          RegistrationModal(
            onClose: () => setState(() => _showRegistrationModal = false),
            onRegister: () async {
              setState(() => _showRegistrationModal = false);
              Navigator.pop(context);
              // Navegar a landing para registro
              final landingUrl = ApiConfig.isProduction
                  ? 'https://pricofy.com/landing'
                  : 'https://dev.pricofy.com/#/landing';
              final uri = Uri.parse(landingUrl);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.platformDefault);
              }
            },
          ),
      ],
    );
  }

  Widget _buildDragHandle() {
    return Padding(
      padding: const EdgeInsets.only(top: 12, bottom: 8),
      child: Container(
        width: 40,
        height: 4,
        decoration: BoxDecoration(
          color: AppTheme.gray300,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }

  Widget _buildHeader(dynamic l10n) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary600, Colors.purple.shade600],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.tune, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              l10n.filtersAndSort,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.gray900,
              ),
            ),
          ),
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.close, color: AppTheme.gray500),
            style: IconButton.styleFrom(
              backgroundColor: AppTheme.gray100,
              shape: const CircleBorder(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs(dynamic l10n) {
    final filterCount = _localFilters.activeFilterCount;
    final sortCount = _localSort.where((s) => !s.isDefault).length;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppTheme.gray100,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildTab(
              index: 0,
              label: l10n.filtersTab,
              count: filterCount,
            ),
          ),
          Expanded(
            child: _buildTab(
              index: 1,
              label: l10n.sortTab,
              count: sortCount,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab({
    required int index,
    required String label,
    required int count,
  }) {
    final isSelected = _selectedTab == index;

    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? AppTheme.gray900 : AppTheme.gray500,
              ),
            ),
            if (count > 0) ...[
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primary600 : AppTheme.gray400,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$count',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildFiltersTab(dynamic l10n, bool isGuest) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Grid of filter sections (2 columns on wider screens)
          LayoutBuilder(
            builder: (context, constraints) {
              final useGrid = constraints.maxWidth > 400;

              if (useGrid) {
                return Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    // Filtros SIEMPRE accesibles (precio, envío, país, distancia)
                    SizedBox(
                      width: (constraints.maxWidth - 12) / 2,
                      child: _buildPriceSection(l10n),
                    ),
                    SizedBox(
                      width: (constraints.maxWidth - 12) / 2,
                      child: _buildShippingSection(l10n),
                    ),
                    SizedBox(
                      width: (constraints.maxWidth - 12) / 2,
                      child: _buildCountrySection(l10n),
                    ),
                    SizedBox(
                      width: (constraints.maxWidth - 12) / 2,
                      child: _buildDistanceSection(l10n),
                    ),
                    // Filtros PREMIUM (deshabilitados para invitados)
                    SizedBox(
                      width: (constraints.maxWidth - 12) / 2,
                      child: _buildConditionSection(l10n, isGuest: isGuest),
                    ),
                    // Dynamic platform-specific filter sections
                    if (_availableBrands.isNotEmpty)
                      SizedBox(
                        width: (constraints.maxWidth - 12) / 2,
                        child: _buildBrandSection(l10n, isGuest: isGuest),
                      ),
                    if (_availableSizes.isNotEmpty)
                      SizedBox(
                        width: (constraints.maxWidth - 12) / 2,
                        child: _buildSizeSection(l10n, isGuest: isGuest),
                      ),
                    SizedBox(
                      width: constraints.maxWidth,
                      child: _buildPlatformSection(l10n, isGuest: isGuest),
                    ),
                    // Nuevo filtro Extras
                    SizedBox(
                      width: constraints.maxWidth,
                      child: _buildExtrasSection(l10n, isGuest: isGuest),
                    ),
                  ],
                );
              }

              // Single column on narrow screens
              return Column(
                children: [
                  // Filtros SIEMPRE accesibles
                  _buildPriceSection(l10n),
                  const SizedBox(height: 12),
                  _buildShippingSection(l10n),
                  const SizedBox(height: 12),
                  _buildCountrySection(l10n),
                  const SizedBox(height: 12),
                  _buildDistanceSection(l10n),
                  const SizedBox(height: 12),
                  // Filtros PREMIUM (deshabilitados para invitados)
                  _buildConditionSection(l10n, isGuest: isGuest),
                  const SizedBox(height: 12),
                  // Dynamic platform-specific filter sections
                  if (_availableBrands.isNotEmpty) ...[
                    _buildBrandSection(l10n, isGuest: isGuest),
                    const SizedBox(height: 12),
                  ],
                  if (_availableSizes.isNotEmpty) ...[
                    _buildSizeSection(l10n, isGuest: isGuest),
                    const SizedBox(height: 12),
                  ],
                  _buildPlatformSection(l10n, isGuest: isGuest),
                  const SizedBox(height: 12),
                  // Nuevo filtro Extras
                  _buildExtrasSection(l10n, isGuest: isGuest),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPriceSection(dynamic l10n) {
    final hasPrice = _tempMinPrice > _priceRangeMin || _tempMaxPrice < _priceRangeMax;
    final preview = hasPrice
        ? '${_tempMinPrice.toInt()}€ - ${_tempMaxPrice >= _priceRangeMax ? '∞' : '${_tempMaxPrice.toInt()}€'}'
        : null;

    return ExpandableFilterSection(
      icon: Icons.euro,
      iconColor: AppTheme.primary600,
      title: l10n.filterPrice,
      preview: preview,
      isActive: hasPrice,
      isExpanded: _expandedSections.contains('price'),
      onToggle: () => _toggleSection('price'),
      child: Column(
        children: [
          RangeSlider(
            values: RangeValues(
              _tempMinPrice.clamp(_priceRangeMin, _priceRangeMax),
              _tempMaxPrice.clamp(_priceRangeMin, _priceRangeMax),
            ),
            min: _priceRangeMin,
            max: _priceRangeMax,
            divisions: ((_priceRangeMax - _priceRangeMin) / 10).round().clamp(10, 100),
            labels: RangeLabels(
              '${_tempMinPrice.toInt()}€',
              _tempMaxPrice >= _priceRangeMax ? '∞' : '${_tempMaxPrice.toInt()}€',
            ),
            activeColor: AppTheme.primary600,
            onChanged: (values) {
              setState(() {
                _tempMinPrice = values.start;
                _tempMaxPrice = values.end;
                _localFilters = _localFilters.copyWith(
                  minPrice: values.start > _priceRangeMin ? values.start : null,
                  maxPrice: values.end < _priceRangeMax ? values.end : null,
                  clearMinPrice: values.start <= _priceRangeMin,
                  clearMaxPrice: values.end >= _priceRangeMax,
                );
              });
            },
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${_priceRangeMin.toInt()}€', style: TextStyle(fontSize: 11, color: AppTheme.gray500)),
                Text(
                  '${_tempMinPrice.toInt()}€ - ${_tempMaxPrice >= _priceRangeMax ? '∞' : '${_tempMaxPrice.toInt()}€'}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primary600,
                  ),
                ),
                Text('${_priceRangeMax.toInt()}€', style: TextStyle(fontSize: 11, color: AppTheme.gray500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShippingSection(dynamic l10n) {
    final hasShipping = _localFilters.hasShipping != null;
    String? preview;
    if (hasShipping) {
      preview = _localFilters.hasShipping! ? l10n.shippingWithShipping : l10n.shippingInPerson;
    }

    return ExpandableFilterSection(
      icon: Icons.local_shipping_outlined,
      iconColor: AppTheme.primary600,
      title: l10n.filterShipping,
      preview: preview,
      isActive: hasShipping,
      isExpanded: _expandedSections.contains('shipping'),
      onToggle: () => _toggleSection('shipping'),
      child: Row(
        children: [
          Expanded(
            child: _buildShippingOption(
              label: l10n.shippingAll,
              isSelected: _localFilters.hasShipping == null,
              onTap: () => setState(() {
                _localFilters = _localFilters.copyWith(clearHasShipping: true);
              }),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildShippingOption(
              label: l10n.shippingWithShipping,
              isSelected: _localFilters.hasShipping == true,
              onTap: () => setState(() {
                _localFilters = _localFilters.copyWith(hasShipping: true);
              }),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildShippingOption(
              label: l10n.shippingInPerson,
              isSelected: _localFilters.hasShipping == false,
              onTap: () => setState(() {
                _localFilters = _localFilters.copyWith(hasShipping: false);
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShippingOption({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary600 : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppTheme.primary600 : AppTheme.gray300,
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.gray700,
          ),
        ),
      ),
    );
  }

  Widget _buildCountrySection(dynamic l10n) {
    // Only show countries that exist in the search results
    if (_availableCountries.isEmpty) {
      return const SizedBox.shrink();
    }

    // Empty = no filter = all countries selected
    final selectedCountries = _localFilters.countries.isEmpty
        ? _availableCountries
        : _localFilters.countries;

    // Filter is active only when NOT all countries are selected
    final allSelected = _localFilters.countries.isEmpty ||
        _localFilters.countries.length == _availableCountries.length;
    final hasCountryFilter = !allSelected;
    final preview = hasCountryFilter
        ? '${selectedCountries.length}/${_availableCountries.length}'
        : null;

    return ExpandableFilterSection(
      icon: Icons.public,
      iconColor: AppTheme.primary600,
      title: l10n.filterCountry,
      preview: preview,
      isActive: hasCountryFilter,
      isExpanded: _expandedSections.contains('country'),
      onToggle: () => _toggleSection('country'),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: _availableCountries.map((code) {
          final isSelected = selectedCountries.contains(code);
          return FilterChip(
            label: Text('${getCountryFlagEmoji(code)} $code'),
            selected: isSelected,
            onSelected: (selected) {
              setState(() {
                final newCountries = List<String>.from(selectedCountries);
                if (selected) {
                  newCountries.add(code);
                } else {
                  newCountries.remove(code);
                }
                // If all selected, store empty (= no filter)
                final toStore = newCountries.length == _availableCountries.length
                    ? <String>[]
                    : newCountries;
                _localFilters = _localFilters.copyWith(countries: toStore);
              });
            },
            selectedColor: AppTheme.primary600,
            checkmarkColor: Colors.white,
            labelStyle: TextStyle(
              color: isSelected ? Colors.white : AppTheme.gray600,
            ),
            backgroundColor: AppTheme.gray100,
            side: BorderSide(
              color: isSelected ? AppTheme.primary600 : AppTheme.gray300,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildConditionSection(dynamic l10n, {bool isGuest = false}) {
    // Only show if conditions exist in the search results
    if (_availableConditions.isEmpty) {
      return const SizedBox.shrink();
    }

    final selectedConditions = _localFilters.conditions;
    final hasConditions = selectedConditions.isNotEmpty;
    final preview = hasConditions ? selectedConditions.map(_getConditionDisplayName).join(', ') : null;

    return ExpandableFilterSection(
      icon: Icons.verified_outlined,
      iconColor: isGuest ? AppTheme.gray400 : Colors.teal.shade600,
      title: l10n.filterCondition,
      preview: preview,
      isActive: hasConditions,
      isExpanded: _expandedSections.contains('condition'),
      onToggle: () => _toggleSection('condition'),
      isDisabled: isGuest,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: _availableConditions.map((condition) {
          final isSelected = selectedConditions.contains(condition);
          final displayName = _getConditionDisplayName(condition);
          final color = isGuest ? AppTheme.gray400 : _getConditionColor(condition);

          return FilterChip(
            label: Text(displayName),
            selected: isSelected,
            onSelected: isGuest
                ? (_) => setState(() => _showRegistrationModal = true)
                : (selected) {
                    setState(() {
                      final newConditions = List<String>.from(selectedConditions);
                      if (selected) {
                        newConditions.add(condition);
                      } else {
                        newConditions.remove(condition);
                      }
                      _localFilters = _localFilters.copyWith(conditions: newConditions);
                    });
                  },
            selectedColor: color.withValues(alpha: 0.2),
            checkmarkColor: color,
            backgroundColor: Colors.white,
            side: BorderSide(
              color: isSelected ? color : AppTheme.gray300,
            ),
          );
        }).toList(),
      ),
    );
  }

  String _getConditionDisplayName(String condition) {
    switch (condition) {
      case 'new':
        return 'Nuevo';
      case 'like_new':
        return 'Como nuevo';
      case 'good':
        return 'Buen estado';
      case 'used':
        return 'Usado';
      case 'acceptable':
        return 'Aceptable';
      default:
        return condition;
    }
  }

  Color _getConditionColor(String condition) {
    switch (condition) {
      case 'new':
        return Colors.green;
      case 'like_new':
        return Colors.teal;
      case 'good':
        return Colors.blue;
      case 'used':
        return Colors.orange;
      case 'acceptable':
        return Colors.red;
      default:
        return AppTheme.gray500;
    }
  }

  Widget _buildBrandSection(dynamic l10n, {bool isGuest = false}) {
    // Only show if brands exist in the search results
    if (_availableBrands.isEmpty) {
      return const SizedBox.shrink();
    }

    final selectedBrands = _localFilters.brands;
    final hasBrands = selectedBrands.isNotEmpty;
    final preview = hasBrands ? selectedBrands.join(', ') : null;

    return ExpandableFilterSection(
      icon: Icons.label_outline,
      iconColor: isGuest ? AppTheme.gray400 : AppTheme.primary600,
      title: 'Marca',
      preview: preview,
      isActive: hasBrands,
      isExpanded: _expandedSections.contains('brand'),
      onToggle: () => _toggleSection('brand'),
      isDisabled: isGuest,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: _availableBrands.map((brand) {
          final isSelected = selectedBrands.contains(brand);

          return FilterChip(
            label: Text(brand),
            selected: isSelected,
            onSelected: isGuest
                ? (_) => setState(() => _showRegistrationModal = true)
                : (selected) {
                    setState(() {
                      final newBrands = List<String>.from(selectedBrands);
                      if (selected) {
                        newBrands.add(brand);
                      } else {
                        newBrands.remove(brand);
                      }
                      _localFilters = _localFilters.copyWith(brands: newBrands);
                    });
                  },
            selectedColor: AppTheme.primary100,
            checkmarkColor: AppTheme.primary700,
            backgroundColor: Colors.white,
            side: BorderSide(
              color: isSelected ? AppTheme.primary400 : AppTheme.gray300,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSizeSection(dynamic l10n, {bool isGuest = false}) {
    // Only show if sizes exist in the search results
    if (_availableSizes.isEmpty) {
      return const SizedBox.shrink();
    }

    final selectedSizes = _localFilters.sizes;
    final hasSizes = selectedSizes.isNotEmpty;
    final preview = hasSizes ? selectedSizes.join(', ') : null;

    return ExpandableFilterSection(
      icon: Icons.straighten,
      iconColor: isGuest ? AppTheme.gray400 : Colors.purple.shade600,
      title: 'Talla',
      preview: preview,
      isActive: hasSizes,
      isExpanded: _expandedSections.contains('size'),
      onToggle: () => _toggleSection('size'),
      isDisabled: isGuest,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: _availableSizes.map((size) {
          final isSelected = selectedSizes.contains(size);

          return FilterChip(
            label: Text(size),
            selected: isSelected,
            onSelected: isGuest
                ? (_) => setState(() => _showRegistrationModal = true)
                : (selected) {
                    setState(() {
                      final newSizes = List<String>.from(selectedSizes);
                      if (selected) {
                        newSizes.add(size);
                      } else {
                        newSizes.remove(size);
                      }
                      _localFilters = _localFilters.copyWith(sizes: newSizes);
                    });
                  },
            selectedColor: Colors.purple.shade100,
            checkmarkColor: Colors.purple.shade700,
            backgroundColor: Colors.white,
            side: BorderSide(
              color: isSelected ? Colors.purple.shade400 : AppTheme.gray300,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDistanceSection(dynamic l10n) {
    // Only show distance filter if results have distance data
    if (!_hasDistanceData) {
      return const SizedBox.shrink();
    }

    final hasDistance = _tempDistance != null;
    final preview = hasDistance ? '< ${_tempDistance!.toInt()} km' : null;

    // Generate reasonable distance chips based on max distance
    final distanceChips = <double?>[null]; // "No limit" first
    for (final d in [25.0, 50.0, 100.0, 200.0, 500.0]) {
      if (d <= _distanceRangeMax) {
        distanceChips.add(d);
      }
    }

    return ExpandableFilterSection(
      icon: Icons.near_me,
      iconColor: Colors.purple.shade600,
      title: l10n.filterDistance,
      preview: preview,
      isActive: hasDistance,
      isExpanded: _expandedSections.contains('distance'),
      onToggle: () => _toggleSection('distance'),
      child: Column(
        children: [
          // Quick distance buttons
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: distanceChips.map((d) {
              final label = d == null ? l10n.searchNoLimit : '${d.toInt()} km';
              final isActive = d == null ? !hasDistance : _tempDistance == d;
              return _buildDistanceChip(d, label, hasDistance: isActive);
            }).toList(),
          ),
          const SizedBox(height: 12),
          // Fine-tune slider
          Slider(
            value: (_tempDistance ?? 0).clamp(0, _distanceRangeMax),
            min: 0,
            max: _distanceRangeMax,
            divisions: (_distanceRangeMax / 10).round().clamp(5, 50),
            label: _tempDistance != null ? '${_tempDistance!.toInt()} km' : l10n.searchNoLimit,
            activeColor: Colors.purple.shade600,
            onChanged: (value) {
              setState(() {
                _tempDistance = value > 0 ? value : null;
                _localFilters = _localFilters.copyWith(
                  maxDistance: value > 0 ? value : null,
                  clearMaxDistance: value <= 0,
                );
              });
            },
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(l10n.searchNoLimit, style: TextStyle(fontSize: 11, color: AppTheme.gray500)),
                if (hasDistance)
                  Text(
                    '< ${_tempDistance!.toInt()} km',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.purple.shade600,
                    ),
                  ),
                Text('${_distanceRangeMax.toInt()} km', style: TextStyle(fontSize: 11, color: AppTheme.gray500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDistanceChip(double? distance, String label, {required bool hasDistance}) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _tempDistance = distance;
          _localFilters = _localFilters.copyWith(
            maxDistance: distance,
            clearMaxDistance: distance == null,
          );
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: hasDistance ? Colors.purple.shade100 : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: hasDistance ? Colors.purple.shade400 : AppTheme.gray300,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: hasDistance ? Colors.purple.shade700 : AppTheme.gray600,
          ),
        ),
      ),
    );
  }

  Widget _buildPlatformSection(dynamic l10n, {bool isGuest = false}) {
    // Only show platforms that exist in the search results
    if (_availablePlatforms.isEmpty) {
      return const SizedBox.shrink();
    }

    final selectedPlatforms = _localFilters.platforms;
    final hasPlatforms = selectedPlatforms.isNotEmpty;
    final preview = hasPlatforms ? selectedPlatforms.map((p) => p[0].toUpperCase() + p.substring(1)).join(', ') : null;

    return ExpandableFilterSection(
      icon: Icons.apps,
      iconColor: isGuest ? AppTheme.gray400 : AppTheme.gray600,
      title: l10n.filterPlatforms,
      preview: preview,
      isActive: hasPlatforms,
      isExpanded: _expandedSections.contains('platform'),
      onToggle: () => _toggleSection('platform'),
      isDisabled: isGuest,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: _availablePlatforms.map((platform) {
          final isSelected = selectedPlatforms.contains(platform);
          final color = isGuest ? AppTheme.gray400 : AppTheme.platformColor(platform);
          final displayName = platform[0].toUpperCase() + platform.substring(1);

          return FilterChip(
            label: Text(displayName),
            selected: isSelected,
            onSelected: isGuest
                ? (_) => setState(() => _showRegistrationModal = true)
                : (selected) {
                    setState(() {
                      final newPlatforms = List<String>.from(selectedPlatforms);
                      if (selected) {
                        newPlatforms.add(platform);
                      } else {
                        newPlatforms.remove(platform);
                      }
                      _localFilters = _localFilters.copyWith(platforms: newPlatforms);
                    });
                  },
            selectedColor: color.withValues(alpha: 0.2),
            checkmarkColor: color,
            backgroundColor: Colors.white,
            side: BorderSide(
              color: isSelected ? color : AppTheme.gray300,
            ),
          );
        }).toList(),
      ),
    );
  }

  /// Sección de Extras con opciones premium
  Widget _buildExtrasSection(dynamic l10n, {bool isGuest = false}) {
    final hasExtras = _extrasWarranty || _extrasInvoice || _extrasBuyerProtection;
    final List<String> activeExtras = [];
    if (_extrasWarranty) activeExtras.add(l10n.filterExtrasWarranty);
    if (_extrasInvoice) activeExtras.add(l10n.filterExtrasInvoice);
    if (_extrasBuyerProtection) activeExtras.add(l10n.filterExtrasBuyerProtection);
    final preview = hasExtras ? activeExtras.join(', ') : null;

    return ExpandableFilterSection(
      icon: Icons.auto_awesome,
      iconColor: isGuest ? AppTheme.gray400 : Colors.amber.shade600,
      title: l10n.filterExtras,
      preview: preview,
      isActive: hasExtras,
      isExpanded: _expandedSections.contains('extras'),
      onToggle: () => _toggleSection('extras'),
      isDisabled: isGuest,
      child: Column(
        children: [
          _buildExtrasOption(
            title: l10n.filterExtrasWarranty,
            subtitle: l10n.filterExtrasWarrantyDesc,
            value: _extrasWarranty,
            isGuest: isGuest,
            onChanged: (v) => setState(() => _extrasWarranty = v),
          ),
          const SizedBox(height: 8),
          _buildExtrasOption(
            title: l10n.filterExtrasInvoice,
            subtitle: l10n.filterExtrasInvoiceDesc,
            value: _extrasInvoice,
            isGuest: isGuest,
            onChanged: (v) => setState(() => _extrasInvoice = v),
          ),
          const SizedBox(height: 8),
          _buildExtrasOption(
            title: l10n.filterExtrasBuyerProtection,
            subtitle: l10n.filterExtrasBuyerProtectionDesc,
            value: _extrasBuyerProtection,
            isGuest: isGuest,
            onChanged: (v) => setState(() => _extrasBuyerProtection = v),
          ),
        ],
      ),
    );
  }

  Widget _buildExtrasOption({
    required String title,
    required String subtitle,
    required bool value,
    required bool isGuest,
    required ValueChanged<bool> onChanged,
  }) {
    return GestureDetector(
      onTap: () {
        if (isGuest) {
          setState(() => _showRegistrationModal = true);
        } else {
          onChanged(!value);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: value ? Colors.amber.shade50 : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: value ? Colors.amber.shade400 : AppTheme.gray200,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isGuest ? AppTheme.gray400 : AppTheme.gray800,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: isGuest ? AppTheme.gray300 : AppTheme.gray500,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: value ? Colors.amber.shade500 : Colors.transparent,
                borderRadius: BorderRadius.circular(4),
                border: Border.all(
                  color: value ? Colors.amber.shade500 : (isGuest ? AppTheme.gray300 : AppTheme.gray400),
                  width: 2,
                ),
              ),
              child: value
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSortTab(dynamic l10n) {
    // Filter out default relevance sort for display
    final activeCriteria = _localSort.where((s) => !s.isDefault).toList();
    final usedFields = activeCriteria.map((s) => s.field).toSet();
    final availableFields = SortField.values
        .where((f) => f != SortField.relevance && !usedFields.contains(f))
        .toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Instruction text
          Text(
            l10n.sortDragToReorder,
            style: TextStyle(
              fontSize: 13,
              color: AppTheme.gray500,
            ),
          ),
          const SizedBox(height: 16),

          // Active sort criteria
          if (activeCriteria.isNotEmpty) ...[
            ...activeCriteria.asMap().entries.map((entry) {
              final index = entry.key;
              final criteria = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SortCriterionChip(
                  priority: index + 1,
                  criteria: criteria,
                  onToggleDirection: () => _toggleSortDirection(criteria),
                  onRemove: () => _removeSortCriterion(criteria),
                  getFieldLabel: (field) => _getSortFieldLabel(l10n, field),
                ),
              );
            }),
            const SizedBox(height: 8),
          ],

          // Add criterion button
          if (availableFields.isNotEmpty) ...[
            AddSortCriterionButton(
              onTap: () => setState(() => _showAddSortOptions = !_showAddSortOptions),
            ),

            // Available options grid
            if (_showAddSortOptions) ...[
              const SizedBox(height: 16),
              SortOptionsGrid(
                availableFields: availableFields,
                onSelect: (field) {
                  _addSortCriterion(field);
                  setState(() => _showAddSortOptions = false);
                },
                getFieldLabel: (field) => _getSortFieldLabel(l10n, field),
              ),
            ],
          ],

          // Empty state
          if (activeCriteria.isEmpty && availableFields.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'No hay opciones de ordenación disponibles',
                  style: TextStyle(color: AppTheme.gray500),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFooter(dynamic l10n) {
    final totalActive = _localFilters.activeFilterCount +
        _localSort.where((s) => !s.isDefault).length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppTheme.gray200)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            // Clear button - más compacto
            Expanded(
              flex: 1,
              child: OutlinedButton.icon(
                onPressed: _clearAll,
                icon: Icon(Icons.delete_outline, size: 16, color: AppTheme.gray600),
                label: Text(
                  l10n.clearAll,
                  style: TextStyle(fontSize: 13, color: AppTheme.gray700),
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  side: BorderSide(color: AppTheme.gray300),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),

            // Apply button - más compacto
            Expanded(
              flex: 2,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primary600, Colors.purple.shade600],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primary600.withValues(alpha: 0.25),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _apply,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        l10n.applyFilters,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      if (totalActive > 0) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 1,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '$totalActive',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _toggleSection(String section) {
    setState(() {
      if (_expandedSections.contains(section)) {
        _expandedSections.remove(section);
      } else {
        _expandedSections.add(section);
      }
    });
  }

  String _getSortFieldLabel(dynamic l10n, SortField field) {
    switch (field) {
      case SortField.relevance:
        return l10n.sortRelevance;
      case SortField.price:
        return l10n.sortPriceLabel;
      case SortField.date:
        return l10n.sortDateLabel;
      case SortField.distance:
        return l10n.sortDistanceLabel;
      case SortField.platform:
        return l10n.sortPlatform;
    }
  }

  void _toggleSortDirection(SortCriteria criteria) {
    setState(() {
      final index = _localSort.indexOf(criteria);
      if (index >= 0) {
        final newOrder = criteria.order == SortOrder.asc
            ? SortOrder.desc
            : SortOrder.asc;
        _localSort[index] = SortCriteria(
          field: criteria.field,
          order: newOrder,
        );
      }
    });
  }

  void _removeSortCriterion(SortCriteria criteria) {
    setState(() {
      _localSort.remove(criteria);
      if (_localSort.isEmpty) {
        _localSort.add(SortCriteria.defaultRelevance);
      }
    });
  }

  void _addSortCriterion(SortField field) {
    setState(() {
      // Remove default relevance if it's the only one
      if (_localSort.length == 1 && _localSort.first.isDefault) {
        _localSort.clear();
      }
      _localSort.add(SortCriteria(field: field, order: SortOrder.asc));
    });
  }

  void _clearAll() {
    setState(() {
      // Reset filters to empty
      _localFilters = SearchFilters.empty;

      // Reset sort to default relevance
      _localSort = [SortCriteria.defaultRelevance];

      // Reset temp values for sliders to backend ranges
      _tempMinPrice = _priceRangeMin;
      _tempMaxPrice = _priceRangeMax;
      _tempDistance = null;

      // Collapse all sections
      _expandedSections.clear();

      // Hide add sort options
      _showAddSortOptions = false;
    });
  }

  void _apply() {
    final provider = context.read<SearchProvider>();

    // Apply filters
    provider.applyFilters(_localFilters);

    // Apply sort
    if (_localSort.isNotEmpty && !_localSort.first.isDefault) {
      provider.setSortCriteria(_localSort);
    } else {
      provider.clearSorting();
    }

    Navigator.pop(context);
  }
}
