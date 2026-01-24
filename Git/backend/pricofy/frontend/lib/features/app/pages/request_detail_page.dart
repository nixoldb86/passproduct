// Request Detail Page
//
// Displays detailed request evaluation with scraping results.
// Layout (navbar + sidebar) provided by AppLayout shell.
//
// Features:
// - Header with stats
// - Advanced filters (price, shipping, platform, search)
// - Buyers grid with distance calculations
// - Sellers section (if selling action)
// - Modal detail view
// - Favorites system

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../core/services/geocoding_service.dart';
import '../../../core/services/favorites_service.dart';
import '../../../core/models/coordinates.dart';
import '../models/evaluation_detail.dart';
import '../widgets/request_detail/evaluation_header.dart';
import '../widgets/request_detail/filters_section.dart';
import '../widgets/request_detail/buyers_grid.dart';
import '../widgets/request_detail/sellers_section.dart';

/// Request detail page content - layout provided by AppLayout shell
class RequestDetailPage extends StatefulWidget {
  final String requestId;

  const RequestDetailPage({
    super.key,
    required this.requestId,
  });

  @override
  State<RequestDetailPage> createState() => _RequestDetailPageState();
}

class _RequestDetailPageState extends State<RequestDetailPage> {
  late final BffApiClient _apiClient;
  late final GeocodingService _geocodingService;
  late final FavoritesService _favoritesService;

  EvaluationDetail? _evaluation;
  bool _loading = true;
  String? _error;
  bool _isFavorite = false;

  // Filters state
  double? _minPrice;
  double? _maxPrice;
  bool _onlyShippable = false;
  int _minRating = 0;
  String? _platformFilter;
  String _searchQuery = '';

  // Geocoding cache
  final Map<String, Coordinates?> _locationCoords = {};
  Coordinates? _userCoords;
  bool _geocodingInProgress = false;

  @override
  void initState() {
    super.initState();
    _apiClient = context.read<BffApiClient>();
    _geocodingService = GeocodingService(_apiClient);
    _favoritesService = context.read<FavoritesService>();
    _loadFavoriteStatus();
    _fetchEvaluation();
  }

  Future<void> _loadFavoriteStatus() async {
    final isFav = _favoritesService.isFavorite(widget.requestId);
    setState(() => _isFavorite = isFav);
  }

  Future<void> _toggleFavorite() async {
    final newStatus = await _favoritesService.toggleFavorite(widget.requestId);
    setState(() => _isFavorite = newStatus);
  }

  Future<void> _fetchEvaluation() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      if (kDebugMode) print('📊 [Evaluation Detail] Fetching evaluation: ${widget.requestId}');

      final response = await _apiClient.getEvaluationDetail(widget.requestId);
      final evaluation = EvaluationDetail.fromJson(response);

      if (kDebugMode) print('✅ [Evaluation Detail] Loaded: ${evaluation.producto}');

      Coordinates? userCoords = evaluation.coordenadas;

      if (userCoords != null) {
        if (kDebugMode) print('✅ [Evaluation Detail] Using saved coords: ${userCoords.lat}, ${userCoords.lon}');
      } else {
        if (kDebugMode) print('⚠️ [Evaluation Detail] No saved coords, geocoding...');

        if (evaluation.codigoPostal != null) {
          try {
            final response = await _apiClient.post('/geocode-by-postal', data: {'postalCode': evaluation.codigoPostal});
            if (response['success'] == true && response['coords'] != null) {
              userCoords = Coordinates.fromJson(response['coords']);
            }
          } catch (e) {
            if (kDebugMode) print('⚠️ [Evaluation Detail] Geocoding by postal failed: $e');
          }
        }

        if (userCoords == null && evaluation.ciudad.isNotEmpty) {
          try {
            final response = await _apiClient.post('/geocode-by-postal', data: {'municipio': evaluation.ciudad});
            if (response['success'] == true && response['coords'] != null) {
              userCoords = Coordinates.fromJson(response['coords']);
            }
          } catch (e) {
            if (kDebugMode) print('⚠️ [Evaluation Detail] Geocoding by city failed: $e');
          }
        }
      }

      setState(() {
        _evaluation = evaluation;
        _userCoords = userCoords;
        _loading = false;
      });

      _geocodeAllLocations();
    } catch (e) {
      if (kDebugMode) print('❌ [Evaluation Detail] Error: $e');
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _geocodeAllLocations() async {
    if (_evaluation == null || _geocodingInProgress) return;

    setState(() => _geocodingInProgress = true);

    try {
      final locations = _evaluation!.scraping.jsonCompradores.uniqueCities.toList();
      if (kDebugMode) print('🗺️ [Evaluation Detail] Geocoding ${locations.length} unique buyer cities');

      for (final location in locations) {
        if (!_locationCoords.containsKey(location)) {
          try {
            final response = await _apiClient.post('/geocode-by-postal', data: {'municipio': location});
            if (response['success'] == true && response['coords'] != null) {
              final coords = Coordinates.fromJson(response['coords']);
              if (mounted) {
                setState(() => _locationCoords[location] = coords);
              }
            }
          } catch (e) {
            if (kDebugMode) print('⚠️ [Evaluation Detail] Failed to geocode $location: $e');
            if (mounted) {
              setState(() => _locationCoords[location] = null);
            }
          }
        }
      }
    } catch (e) {
      if (kDebugMode) print('❌ [Evaluation Detail] Geocoding error: $e');
    } finally {
      if (mounted) {
        setState(() => _geocodingInProgress = false);
      }
    }
  }

  List<Comprador> get _filteredCompradores {
    if (_evaluation == null) return [];

    var filtered = _evaluation!.scraping.jsonCompradores.compradores;

    if (_minPrice != null) {
      filtered = filtered.where((c) => c.precioEur >= _minPrice!).toList();
    }
    if (_maxPrice != null) {
      filtered = filtered.where((c) => c.precioEur <= _maxPrice!).toList();
    }
    if (_onlyShippable) {
      filtered = filtered.where((c) => c.isShippable == true).toList();
    }
    if (_platformFilter != null && _platformFilter!.isNotEmpty && _platformFilter != 'all') {
      filtered = filtered.where((c) => c.plataforma.toLowerCase() == _platformFilter!.toLowerCase()).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((c) => c.titulo.toLowerCase().contains(query)).toList();
    }

    if (_userCoords != null) {
      filtered = filtered.map((c) {
        final coords = _locationCoords[c.ciudadOZona];
        if (coords != null) {
          final distance = _geocodingService.calculateDistance(_userCoords!, coords);
          return c.copyWith(coords: coords, distanciaKm: distance);
        }
        return c;
      }).toList();
    }

    return filtered;
  }

  (double min, double max) get _priceRange {
    if (_evaluation == null || _evaluation!.scraping.jsonCompradores.compradores.isEmpty) {
      return (0, 1000);
    }

    final prices = _evaluation!.scraping.jsonCompradores.compradores.map((c) => c.precioEur).where((p) => p > 0).toList();
    if (prices.isEmpty) return (0, 1000);

    return (prices.reduce((a, b) => a < b ? a : b), prices.reduce((a, b) => a > b ? a : b));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    // Content only - layout provided by AppLayout shell
    if (_loading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(l10n.evaluationLoadingEvaluation, style: TextStyle(fontSize: 16, color: Colors.grey[600])),
          ],
        ),
      );
    }

    if (_error != null || _evaluation == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(_error ?? l10n.evaluationNotFound, style: const TextStyle(fontSize: 16), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.pop(),
              icon: const Icon(Icons.arrow_back),
              label: Text(l10n.commonBack),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        onPressed: _toggleFavorite,
        backgroundColor: _isFavorite ? Colors.red : AppTheme.primary600,
        child: Icon(_isFavorite ? Icons.favorite : Icons.favorite_border, color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Back button and title
            Row(
              children: [
                IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.arrow_back),
                  tooltip: l10n.commonBack,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _evaluation!.producto,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.gray900),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Header with stats
            EvaluationHeader(evaluation: _evaluation!),
            const SizedBox(height: 24),

            // Filters section
            FiltersSection(
              minPrice: _minPrice,
              maxPrice: _maxPrice,
              priceRange: _priceRange,
              onlyShippable: _onlyShippable,
              minRating: _minRating,
              platformFilter: _platformFilter,
              availablePlatforms: _evaluation!.scraping.jsonCompradores.uniquePlatforms.toList(),
              searchQuery: _searchQuery,
              onMinPriceChanged: (v) => setState(() => _minPrice = v),
              onMaxPriceChanged: (v) => setState(() => _maxPrice = v),
              onShippableToggled: () => setState(() => _onlyShippable = !_onlyShippable),
              onMinRatingChanged: (v) => setState(() => _minRating = v),
              onPlatformChanged: (v) => setState(() => _platformFilter = v),
              onSearchChanged: (v) => setState(() => _searchQuery = v),
              onResetFilters: () {
                setState(() {
                  _minPrice = null;
                  _maxPrice = null;
                  _onlyShippable = false;
                  _minRating = 0;
                  _platformFilter = null;
                  _searchQuery = '';
                });
              },
            ),
            const SizedBox(height: 24),

            // Buyers grid
            BuyersGrid(
              compradores: _filteredCompradores,
              userCoords: _userCoords,
              geocodingService: _geocodingService,
            ),
            const SizedBox(height: 24),

            // Sellers section (only if selling action)
            if (_evaluation!.isSellingAction && _evaluation!.scraping.hasSellers)
              SellersSection(vendedores: _evaluation!.scraping.jsonVendedores!),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _geocodingService.clearCache();
    super.dispose();
  }
}
