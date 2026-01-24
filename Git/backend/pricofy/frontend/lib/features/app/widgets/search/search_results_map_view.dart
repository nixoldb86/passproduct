// Search Results Map View Widget
//
// Displays search results on an OpenStreetMap with pricofy-landing style:
// - CARTO Light tiles with saturation filter
// - Price markers with circular design (green for GPS, orange for city-level)
// - Clustering with gradient backgrounds and minimum price
// - Collapsible legend and "no location" panel
// - User location marker (blue)

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_marker_cluster/flutter_map_marker_cluster.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:circle_flags/circle_flags.dart';
import '../../../../config/theme.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/providers/search_provider.dart';
import '../../../../core/providers/location_provider.dart';
import '../../../../core/models/search_result.dart';
import '../../../../core/models/search_filters.dart';
import 'search_result_detail_modal.dart';

// ============================================================================
// CONSTANTS - pricofy-landing style colors
// ============================================================================

/// Green color for GPS-level precision (Wallapop)
const Color _kGpsColor = Color(0xFF10B981);
const Color _kGpsColorDark = Color(0xFF059669);

/// Orange color for city-level precision (geocoded)
const Color _kCityColor = Color(0xFFF59E0B);
const Color _kCityColorDark = Color(0xFFD97706);

/// Blue color for user location marker
const Color _kUserLocationColor = Color(0xFF3B82F6);

// _kPrimaryColor removed - was unused

// ============================================================================
// MAIN WIDGET
// ============================================================================

/// Main widget for displaying search results on a map
class SearchResultsMapView extends StatefulWidget {
  const SearchResultsMapView({super.key});

  @override
  State<SearchResultsMapView> createState() => _SearchResultsMapViewState();
}

class _SearchResultsMapViewState extends State<SearchResultsMapView> {
  final MapController _mapController = MapController();
  bool _mapReady = false;
  bool _legendOpen = true;
  bool _noLocationPanelOpen = false; // Start collapsed
  double _currentZoom = 10;

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();
    final locationProvider = context.watch<LocationProvider>();
    final isMobile = MediaQuery.of(context).size.width < 600;

    // Classify results by precision level
    final classification = _ClassifiedResults.from(searchProvider.filteredResults);

    if (classification.withGps.isEmpty && classification.withoutGps.isEmpty) {
      return _MapEmptyState(l10n: l10n);
    }

    final bounds = _MapBoundsCalculator.calculate(classification.withGps);
    final userLocation = locationProvider.coords;

    return Stack(
      children: [
        // Main map
        Column(
          children: [
            // Header: Mobile shows legend inline, Desktop shows counter
            if (isMobile)
              _MobileMapHeader(
                gpsCount: classification.gpsExact.length,
                cityCount: classification.cityLevel.length,
              )
            else
              _MapHeader(
                gpsCount: classification.gpsExact.length,
                cityCount: classification.cityLevel.length,
                noLocationCount: classification.withoutGps.length,
                totalResults: searchProvider.filteredResults.length,
                l10n: l10n,
              ),

            // Map
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  if (constraints.maxHeight == 0 || constraints.maxWidth == 0) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  return SizedBox(
                    width: constraints.maxWidth,
                    height: constraints.maxHeight,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: FlutterMap(
                        mapController: _mapController,
                        options: MapOptions(
                          initialCenter: bounds.center,
                          initialZoom: 10,
                          maxZoom: 20,
                          minZoom: 3,
                          // Disable rotation on mobile
                          interactionOptions: InteractionOptions(
                            flags: isMobile
                                ? InteractiveFlag.all & ~InteractiveFlag.rotate
                                : InteractiveFlag.all,
                          ),
                          onMapReady: () {
                            setState(() => _mapReady = true);
                            _fitBoundsWhenReady(bounds);
                          },
                          onPositionChanged: (position, hasGesture) {
                            if (position.zoom != _currentZoom) {
                              setState(() => _currentZoom = position.zoom);
                            }
                          },
                        ),
                        children: [
                          // CARTO Voyager - más contraste y colores que Light
                          TileLayer(
                            urlTemplate:
                                'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                            subdomains: const ['a', 'b', 'c', 'd'],
                            userAgentPackageName: 'com.pricofy.app',
                            maxZoom: 20,
                          ),

                          // Clustered markers
                          MarkerClusterLayerWidget(
                            options: MarkerClusterLayerOptions(
                              // Dynamic cluster radius based on zoom
                              maxClusterRadius: _currentZoom < 9
                                  ? 80
                                  : _currentZoom < 12
                                      ? 50
                                      : 30,
                              size: const Size(60, 60),
                              markers: _buildMarkers(classification.withGps),
                              builder: (context, clusterMarkers) {
                                return _ClusterMarkerWidget(
                                  markers: clusterMarkers,
                                  results: classification.withGps,
                                );
                              },
                              spiderfyCluster: true,
                              zoomToBoundsOnClick: true,
                              showPolygon: false,
                            ),
                          ),

                          // User location marker
                          if (userLocation != null)
                            MarkerLayer(
                              markers: [
                                Marker(
                                  point: LatLng(userLocation.lat, userLocation.lon),
                                  width: 24,
                                  height: 24,
                                  child: const _UserLocationMarker(),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),

        // Collapsible legend (top-right) - only on desktop
        if (!isMobile)
          Positioned(
            top: 60,
            right: _legendOpen ? 16 : 0,
            child: _CollapsibleLegend(
              isOpen: _legendOpen,
              gpsCount: classification.gpsExact.length,
              cityCount: classification.cityLevel.length,
              onToggle: () => setState(() => _legendOpen = !_legendOpen),
              l10n: l10n,
            ),
          ),

        // "No location" panel (bottom-left)
        if (classification.withoutGps.isNotEmpty)
          Positioned(
            bottom: 16,
            left: _noLocationPanelOpen ? 16 : 8,
            child: _NoLocationPanel(
              isOpen: _noLocationPanelOpen,
              results: classification.withoutGps,
              onToggle: () => setState(() => _noLocationPanelOpen = !_noLocationPanelOpen),
              onResultTap: _showResultDetail,
              onViewMoreByCountry: (countryCode) => _navigateToGridWithCountryFilter(context, searchProvider, countryCode),
              l10n: l10n,
            ),
          ),
      ],
    );
  }

  List<Marker> _buildMarkers(List<SearchResult> results) {
    return results.map((result) {
      return Marker(
        point: LatLng(result.gpsLat!, result.gpsLon!),
        width: 50,
        height: 50,
        child: GestureDetector(
          onTap: () => _showResultDetail(result),
          child: _PriceMarkerWidget(result: result),
        ),
      );
    }).toList();
  }

  void _fitBoundsWhenReady(LatLngBounds bounds) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_mapReady && mounted) {
        try {
          _mapController.fitCamera(
            CameraFit.bounds(
              bounds: bounds,
              padding: const EdgeInsets.all(50),
            ),
          );
        } catch (e) {
          debugPrint('Map fitCamera error (can be ignored): $e');
        }
      }
    });
  }

  void _showResultDetail(SearchResult result) {
    showDialog(
      context: context,
      builder: (context) => SearchResultDetailModal(result: result),
    );
  }

  /// Navigate to grid/mosaic view with country filter applied
  void _navigateToGridWithCountryFilter(BuildContext context, SearchProvider searchProvider, String countryCode) {
    // Get current filters and set ONLY this country (replacing any existing country filter)
    final currentFilters = searchProvider.filters;
    
    // Create new filters with ONLY this country selected (preserving other filters)
    final newFilters = currentFilters.copyWith(
      countries: [countryCode.toUpperCase()],
    );
    
    // Apply filters
    searchProvider.applyFilters(newFilters);
    
    // Change to grid/mosaic view (ViewMode.cards = mosaic)
    searchProvider.setViewMode(ViewMode.cards);
    
    // Close the panel
    setState(() => _noLocationPanelOpen = false);
  }
}

// ============================================================================
// CLASSIFIED RESULTS
// ============================================================================

/// Helper class to classify results by precision level
class _ClassifiedResults {
  final List<SearchResult> gpsExact;    // Wallapop - green
  final List<SearchResult> cityLevel;   // Other platforms - orange
  final List<SearchResult> withoutGps;  // No coordinates

  _ClassifiedResults({
    required this.gpsExact,
    required this.cityLevel,
    required this.withoutGps,
  });

  List<SearchResult> get withGps => [...gpsExact, ...cityLevel];

  factory _ClassifiedResults.from(List<SearchResult> results) {
    final gpsExact = <SearchResult>[];
    final cityLevel = <SearchResult>[];
    final withoutGps = <SearchResult>[];

    for (final result in results) {
      if (result.price <= 0) continue; // Skip invalid prices

      if (result.hasGps) {
        // Wallapop has exact GPS, others are geocoded to city level
        if (result.platform.toLowerCase() == 'wallapop') {
          gpsExact.add(result);
        } else {
          cityLevel.add(result);
        }
      } else {
        withoutGps.add(result);
      }
    }

    return _ClassifiedResults(
      gpsExact: gpsExact,
      cityLevel: cityLevel,
      withoutGps: withoutGps,
    );
  }
}

// ============================================================================
// MAP HEADER
// ============================================================================

/// Header with counter (Desktop)
class _MapHeader extends StatelessWidget {
  final int gpsCount;
  final int cityCount;
  final int noLocationCount;
  final int totalResults;
  final dynamic l10n;

  const _MapHeader({
    required this.gpsCount,
    required this.cityCount,
    required this.noLocationCount,
    required this.totalResults,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    final mappedCount = gpsCount + cityCount;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(Icons.map_outlined, size: 16, color: AppTheme.gray500),
          const SizedBox(width: 8),
          Text(
            '$mappedCount de $totalResults en el mapa',
            style: TextStyle(fontSize: 13, color: AppTheme.gray600),
          ),
          if (noLocationCount > 0) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.gray100,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '+$noLocationCount sin ubicación',
                style: TextStyle(fontSize: 11, color: AppTheme.gray500),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Mobile header with inline legend
class _MobileMapHeader extends StatelessWidget {
  final int gpsCount;
  final int cityCount;

  const _MobileMapHeader({
    required this.gpsCount,
    required this.cityCount,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        children: [
          // GPS exact legend item
          _MobileLegendItem(
            color: _kGpsColor,
            label: l10n.mapLegendExactLocation,
            count: gpsCount,
          ),
          const SizedBox(width: 16),
          // City level legend item
          if (cityCount > 0)
            _MobileLegendItem(
              color: _kCityColor,
              label: l10n.mapLegendCityLevel,
              count: cityCount,
            ),
        ],
      ),
    );
  }
}

/// Compact legend item for mobile header
class _MobileLegendItem extends StatelessWidget {
  final Color color;
  final String label;
  final int count;

  const _MobileLegendItem({
    required this.color,
    required this.label,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          '$label ($count)',
          style: TextStyle(
            fontSize: 11,
            color: AppTheme.gray600,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

// ============================================================================
// PRICE MARKER (Individual pins - pricofy-landing style)
// ============================================================================

class _PriceMarkerWidget extends StatelessWidget {
  final SearchResult result;

  const _PriceMarkerWidget({required this.result});

  @override
  Widget build(BuildContext context) {
    final isGpsExact = result.platform.toLowerCase() == 'wallapop';
    final borderColor = isGpsExact ? _kGpsColor : _kCityColor;
    final priceText = '${result.price.toStringAsFixed(0)}€';

    // Adaptive font size based on price length (pricofy-landing formula)
    final fontSize = _calculateFontSize(priceText.length);

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: borderColor, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          priceText,
          style: TextStyle(
            color: borderColor,
            fontSize: fontSize,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.3,
            height: 1,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  double _calculateFontSize(int textLength) {
    // Formula from pricofy-landing: Math.max(7, Math.min(13, 34 / (longitudTexto * 0.85)))
    const size = 34.0;
    return (size / (textLength * 0.85)).clamp(7.0, 13.0);
  }
}

// ============================================================================
// CLUSTER MARKER (pricofy-landing style with gradient)
// ============================================================================

class _ClusterMarkerWidget extends StatelessWidget {
  final List<Marker> markers;
  final List<SearchResult> results;

  const _ClusterMarkerWidget({
    required this.markers,
    required this.results,
  });

  @override
  Widget build(BuildContext context) {
    final count = markers.length;
    final minPrice = _calculateMinPrice();
    final priceText = '${minPrice.toStringAsFixed(0)}€';

    // Determine cluster color based on majority (like pricofy-landing)
    final gpsCount = _countGpsExact();
    final isMajorityGps = gpsCount > count / 2;
    
    // Dynamic size based on count (50, 60, 70px)
    final size = count < 10 ? 50.0 : count < 25 ? 60.0 : 70.0;

    // Adaptive font sizes
    final priceFontSize = _calculatePriceFontSize(priceText.length, size);
    final countFontSize = (size * 0.17).clamp(9.0, 14.0);

    final gradient = isMajorityGps
        ? const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [_kGpsColor, _kGpsColorDark],
          )
        : const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [_kCityColor, _kCityColorDark],
          );

    final shadowColor = isMajorityGps
        ? _kGpsColor.withValues(alpha: 0.4)
        : _kCityColor.withValues(alpha: 0.4);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: gradient,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              priceText,
              style: TextStyle(
                color: Colors.white,
                fontSize: priceFontSize,
                fontWeight: FontWeight.w900,
                height: 0.95,
                letterSpacing: -0.5,
                shadows: [
                  Shadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 1),
            Text(
              '($count)',
              style: TextStyle(
                color: Colors.white,
                fontSize: countFontSize,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _calculateMinPrice() {
    double minPrice = double.infinity;
    
    for (final marker in markers) {
      final result = results.firstWhere(
        (r) => r.gpsLat == marker.point.latitude && r.gpsLon == marker.point.longitude,
        orElse: () => results.first,
      );
      if (result.price > 0 && result.price < minPrice) {
        minPrice = result.price;
      }
    }
    
    return minPrice.isFinite ? minPrice : 0;
  }

  int _countGpsExact() {
    int count = 0;
    for (final marker in markers) {
      final result = results.firstWhere(
        (r) => r.gpsLat == marker.point.latitude && r.gpsLon == marker.point.longitude,
        orElse: () => results.first,
      );
      if (result.platform.toLowerCase() == 'wallapop') {
        count++;
      }
    }
    return count;
  }

  double _calculatePriceFontSize(int textLength, double size) {
    // Formula from pricofy-landing
    return (size / (textLength * 0.62)).clamp(11.0, size * 0.36);
  }
}

// ============================================================================
// USER LOCATION MARKER (Blue dot)
// ============================================================================

class _UserLocationMarker extends StatelessWidget {
  const _UserLocationMarker();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: _kUserLocationColor,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// COLLAPSIBLE LEGEND (pricofy-landing style)
// ============================================================================

class _CollapsibleLegend extends StatelessWidget {
  final bool isOpen;
  final int gpsCount;
  final int cityCount;
  final VoidCallback onToggle;
  final dynamic l10n;

  const _CollapsibleLegend({
    required this.isOpen,
    required this.gpsCount,
    required this.cityCount,
    required this.onToggle,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    if (!isOpen) {
      // Collapsed state - just arrow button
      return GestureDetector(
        onTap: onToggle,
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(8),
              bottomLeft: Radius.circular(8),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(-2, 0),
              ),
            ],
          ),
          child: const Icon(Icons.chevron_left, size: 16, color: Colors.black54),
        ),
      );
    }

    // Expanded state
    return Container(
      constraints: const BoxConstraints(maxWidth: 200),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n.mapLegendTitle,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                GestureDetector(
                  onTap: onToggle,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Icon(Icons.chevron_right, size: 16),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Divider(height: 1),
            const SizedBox(height: 12),

            // GPS Exact checkbox
            _LegendCheckboxItem(
              color: _kGpsColor,
              label: l10n.mapLegendExactLocation,
              count: gpsCount,
              isChecked: true,
            ),
            const SizedBox(height: 8),

            // City Level checkbox
            if (cityCount > 0)
              _LegendCheckboxItem(
                color: _kCityColor,
                label: l10n.mapLegendCityLevel,
                count: cityCount,
                isChecked: true,
              ),
          ],
        ),
      ),
    );
  }
}

class _LegendCheckboxItem extends StatelessWidget {
  final Color color;
  final String label;
  final int count;
  final bool isChecked;

  const _LegendCheckboxItem({
    required this.color,
    required this.label,
    required this.count,
    required this.isChecked,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: isChecked ? color : Colors.white,
            border: Border.all(color: color, width: 2),
            borderRadius: BorderRadius.circular(2),
          ),
          child: isChecked
              ? const Icon(Icons.check, size: 12, color: Colors.white)
              : null,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Color(0xFF374151),
            ),
          ),
        ),
        Text(
          '$count',
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF6B7280),
          ),
        ),
      ],
    );
  }
}

// ============================================================================
// NO LOCATION PANEL (pricofy-landing style)
// ============================================================================

class _NoLocationPanel extends StatelessWidget {
  final bool isOpen;
  final List<SearchResult> results;
  final VoidCallback onToggle;
  final void Function(SearchResult) onResultTap;
  final void Function(String countryCode) onViewMoreByCountry;
  final dynamic l10n;

  const _NoLocationPanel({
    required this.isOpen,
    required this.results,
    required this.onToggle,
    required this.onResultTap,
    required this.onViewMoreByCountry,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    if (!isOpen) {
      // Collapsed state - circular button
      return GestureDetector(
        onTap: onToggle,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(Icons.chevron_right, size: 18, color: Colors.black54),
        ),
      );
    }

    // Group by country
    final byCountry = _groupByCountry(results);

    return Container(
      constraints: const BoxConstraints(maxWidth: 300),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                const Text('🌍', style: TextStyle(fontSize: 16)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    l10n.mapNoLocationTitle,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: onToggle,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.chevron_left, size: 16),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Estos anuncios solo tienen información de país.',
              style: TextStyle(fontSize: 12, color: AppTheme.gray500),
            ),
            const SizedBox(height: 12),

            // Country list
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 250),
              child: SingleChildScrollView(
                child: Column(
                  children: byCountry.entries.map((entry) {
                    return _CountrySection(
                      countryCode: entry.key,
                      results: entry.value,
                      onResultTap: onResultTap,
                      onViewMoreTap: onViewMoreByCountry,
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Map<String, List<SearchResult>> _groupByCountry(List<SearchResult> results) {
    final map = <String, List<SearchResult>>{};
    for (final result in results) {
      final code = result.countryCode ?? 'unknown';
      map.putIfAbsent(code, () => []).add(result);
    }
    return map;
  }
}

class _CountrySection extends StatelessWidget {
  final String countryCode;
  final List<SearchResult> results;
  final void Function(SearchResult) onResultTap;
  final void Function(String countryCode) onViewMoreTap;

  const _CountrySection({
    required this.countryCode,
    required this.results,
    required this.onResultTap,
    required this.onViewMoreTap,
  });

  @override
  Widget build(BuildContext context) {
    final countryName = _getCountryName(countryCode);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppTheme.gray200, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Country header
          Row(
            children: [
              if (countryCode != 'unknown' && countryCode.length == 2)
                ClipOval(
                  child: CircleFlag(countryCode.toLowerCase(), size: 16),
                )
              else
                const Text('🌍', style: TextStyle(fontSize: 14)),
              const SizedBox(width: 6),
              Text(
                countryName,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                '(${results.length})',
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.gray500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // First 3 results
          ...results.take(3).map((result) {
            return GestureDetector(
              onTap: () => onResultTap(result),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                margin: const EdgeInsets.only(bottom: 2),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '• ${result.price.toStringAsFixed(0)}€ - ${result.title.length > 30 ? '${result.title.substring(0, 30)}...' : result.title}',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.gray700,
                  ),
                ),
              ),
            );
          }),

          // "more" count - clickable
          if (results.length > 3)
            GestureDetector(
              onTap: () => onViewMoreTap(countryCode),
              child: Padding(
                padding: const EdgeInsets.only(left: 8, top: 2),
                child: Text(
                  '+ ${results.length - 3} más',
                  style: TextStyle(
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                    color: const Color(0xFF667EEA),
                    decoration: TextDecoration.underline,
                    decorationColor: const Color(0xFF667EEA),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _getCountryName(String code) {
    const names = {
      'ES': 'España',
      'FR': 'Francia',
      'DE': 'Alemania',
      'IT': 'Italia',
      'PT': 'Portugal',
      'GB': 'Reino Unido',
      'UK': 'Reino Unido',
      'IE': 'Irlanda',
      'NL': 'Países Bajos',
      'BE': 'Bélgica',
      'AT': 'Austria',
      'CH': 'Suiza',
      'PL': 'Polonia',
      'SE': 'Suecia',
      'DK': 'Dinamarca',
      'NO': 'Noruega',
      'FI': 'Finlandia',
      'unknown': 'Desconocido',
    };
    return names[code.toUpperCase()] ?? code;
  }
}

// ============================================================================
// EMPTY STATE
// ============================================================================

class _MapEmptyState extends StatelessWidget {
  final dynamic l10n;

  const _MapEmptyState({required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_off, size: 64, color: AppTheme.gray300),
          const SizedBox(height: 16),
          Text(
            'No hay resultados con ubicación',
            style: TextStyle(fontSize: 16, color: AppTheme.gray500),
          ),
          const SizedBox(height: 8),
          Text(
            'Prueba con la vista de lista o tarjetas',
            style: TextStyle(fontSize: 14, color: AppTheme.gray400),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// BOUNDS CALCULATOR
// ============================================================================

class _MapBoundsCalculator {
  static LatLngBounds calculate(List<SearchResult> results) {
    if (results.isEmpty) {
      // Default: Madrid
      return LatLngBounds(
        const LatLng(40.3, -3.8),
        const LatLng(40.5, -3.6),
      );
    }

    final lats = results.map((r) => r.gpsLat!).toList();
    final lons = results.map((r) => r.gpsLon!).toList();

    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLon = lons.reduce((a, b) => a < b ? a : b);
    final maxLon = lons.reduce((a, b) => a > b ? a : b);

    final latPadding = (maxLat - minLat) < 0.01 ? 0.01 : 0.0;
    final lonPadding = (maxLon - minLon) < 0.01 ? 0.01 : 0.0;

    return LatLngBounds(
      LatLng(minLat - latPadding, minLon - lonPadding),
      LatLng(maxLat + latPadding, maxLon + lonPadding),
    );
  }
}
