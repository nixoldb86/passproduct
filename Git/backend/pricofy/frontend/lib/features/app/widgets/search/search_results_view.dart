// Search Results View Widget - Horizontal Sections Navigation
//
// Navegación horizontal entre secciones con scroll vertical dentro de cada una:
// 1. SearchResultsHeader (barra de búsqueda + ubicación + píldoras de países)
// 2. Navegación horizontal con PageView entre:
//    - "Todos los resultados" (scroll vertical)
//    - "Los más cercanos" (scroll vertical, ordenados por distancia)
//    - "Los más económicos" (scroll vertical, ordenados por precio)
// 3. Flechas chevron para navegar entre secciones

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:remixicon/remixicon.dart';
import 'package:circle_flags/circle_flags.dart';
import '../../../../config/theme.dart';
import '../../../../config/api_config.dart';
import '../../../../config/feature_flags.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/search_provider.dart';
import '../../../../core/models/search_result.dart';
import '../../../../core/models/search_filters.dart';
import '../../../../shared/components/images/network_image_widget.dart';
import '../../../../shared/components/loading/motivational_text_rotator.dart';
import '../../../../shared/components/loading/youtube_style_progress_bar.dart';
import '../../../../shared/components/badges/platform_icon_with_flag.dart';
import 'search_controls.dart';
import 'search_result_detail_modal.dart';
import 'search_results_map_view.dart';
import 'location_indicator.dart';
import '../modals/search_type_modal.dart';
import '../modals/registration_modal.dart';
import '../../../../config/routes.dart';

/// Search Results View - New design with original components
class SearchResultsViewNew extends StatefulWidget {
  const SearchResultsViewNew({super.key});

  @override
  State<SearchResultsViewNew> createState() => _SearchResultsViewNewState();
}

class _SearchResultsViewNewState extends State<SearchResultsViewNew> {
  bool _showBanner = true;
  double _lastScrollPosition = 0;

  void _onScrollNotification(ScrollNotification notification) {
    // Only react to vertical scroll (from list views), not horizontal (from PageView)
    // Check the scroll axis to filter out PageView swipe events
    if (notification is ScrollUpdateNotification &&
        notification.metrics.axis == Axis.vertical) {
      final currentPosition = notification.metrics.pixels;

      // Scroll hacia abajo y no estamos al inicio → ocultar
      if (currentPosition > _lastScrollPosition && currentPosition > 50) {
        if (_showBanner) setState(() => _showBanner = false);
      }
      // Scroll hacia arriba (en cualquier punto) → mostrar
      else if (currentPosition < _lastScrollPosition) {
        if (!_showBanner) setState(() => _showBanner = true);
      }

      _lastScrollPosition = currentPosition;
    }
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        _onScrollNotification(notification);
        return false;
      },
      child: Column(
        children: [
          // Banner animado
          _AnimatedGuestBanner(isVisible: _showBanner),
          SearchResultsHeader(isControlsRowVisible: _showBanner),
          Expanded(
            child: _SearchResultsSections(),
          ),
        ],
      ),
    );
  }
}

/// Banner de modo invitado animado
class _AnimatedGuestBanner extends StatelessWidget {
  final bool isVisible;

  const _AnimatedGuestBanner({required this.isVisible});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    if (authProvider.isAuthenticated || authProvider.status == AuthStatus.unknown) {
      return const SizedBox.shrink();
    }

    final l10n = context.l10n;
    final isMobile = MediaQuery.of(context).size.width < 600;

    return AnimatedCrossFade(
      duration: const Duration(milliseconds: 200),
      crossFadeState: isVisible ? CrossFadeState.showFirst : CrossFadeState.showSecond,
      firstChild: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.primary50, Colors.purple.shade50],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          border: Border(
            bottom: BorderSide(color: AppTheme.primary200),
          ),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: 12,
            vertical: isMobile ? 6 : 8,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Icon(
                  Icons.info_outline,
                  size: isMobile ? 14 : 16,
                  color: AppTheme.primary600,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: '${l10n.guestModeBannerTitle} - ',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppTheme.gray700,
                          fontSize: isMobile ? 11 : 12,
                        ),
                      ),
                      TextSpan(
                        text: l10n.guestModeBannerCTA,
                        style: TextStyle(
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primary600,
                          decoration: TextDecoration.underline,
                          decorationColor: AppTheme.primary600,
                        ),
                        recognizer: TapGestureRecognizer()
                          ..onTap = () => context.go(FeatureFlags.loginRoute),
                      ),
                      TextSpan(
                        text: l10n.guestModeBannerRest,
                        style: TextStyle(
                          color: AppTheme.gray700,
                          fontSize: isMobile ? 11 : 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      secondChild: const SizedBox(width: double.infinity, height: 0),
    );
  }
}

/// Header original con barra de búsqueda
class SearchResultsHeader extends StatefulWidget {
  final bool isControlsRowVisible;
  
  const SearchResultsHeader({super.key, this.isControlsRowVisible = true});

  @override
  State<SearchResultsHeader> createState() => _SearchResultsHeaderState();
}

class _SearchResultsHeaderState extends State<SearchResultsHeader> {
  late TextEditingController _searchController;
  String? _lastSearchText;
  bool _isEditing = false;
  
  // Modal states
  bool _showSearchTypeModal = false;
  bool _showRegistrationModal = false;
  String _pendingSearchText = '';
  
  // Controls bar expanded state
  bool _isControlsExpanded = false;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _searchController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onTextChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final currentText = _searchController.text.trim();
    final searchText = _lastSearchText ?? '';
    if (currentText != searchText && !_isEditing) {
      setState(() => _isEditing = true);
    } else if (currentText == searchText && _isEditing) {
      setState(() => _isEditing = false);
    }
  }

  void _handleSearchSubmit(String value) {
    if (value.trim().isNotEmpty) {
      setState(() {
        _isEditing = false;
        _pendingSearchText = value.trim();
        _showSearchTypeModal = true;
      });
    }
  }

  void _executeClassicSearch() {
    setState(() => _showSearchTypeModal = false);
    final searchProvider = context.read<SearchProvider>();
    final userLanguage = Localizations.localeOf(context).languageCode;
    searchProvider.startSearch(_pendingSearchText, userLanguage: userLanguage);
    context.go('${AppRoutes.appSearch}?q=${Uri.encodeComponent(_pendingSearchText)}');
  }

  void _executeSmartSearch() {
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      setState(() {
        _showSearchTypeModal = false;
        _showRegistrationModal = true;
      });
      return;
    }
    setState(() => _showSearchTypeModal = false);
    final searchProvider = context.read<SearchProvider>();
    final userLanguage = Localizations.localeOf(context).languageCode;
    searchProvider.startSearch(_pendingSearchText, userLanguage: userLanguage);
    context.go('${AppRoutes.appSearch}?q=${Uri.encodeComponent(_pendingSearchText)}');
  }

  void _executeSalesAnalysis() {
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      setState(() {
        _showSearchTypeModal = false;
        _showRegistrationModal = true;
      });
      return;
    }
    setState(() => _showSearchTypeModal = false);
    context.go('${AppRoutes.appSell}?product=${Uri.encodeComponent(_pendingSearchText)}');
  }

  Widget _buildSearchBar(BuildContext context, SearchProvider searchProvider, dynamic l10n) {
    final isMobile = MediaQuery.of(context).size.width < 768;
    
    return Column(
      children: [
        // Search bar - más estrecha verticalmente
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: AppTheme.primary500, width: 1.5),
            borderRadius: BorderRadius.circular(50),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Location indicator (circular) - always visible
              const Padding(
                padding: EdgeInsets.only(left: 4),
                child: LocationIndicator(variant: LocationIndicatorVariant.searchBar),
              ),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: l10n.dashboardWhatDoYouWantToSearch,
                    hintStyle: TextStyle(color: AppTheme.gray400, fontSize: isMobile ? 13 : 14),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    fillColor: Colors.transparent,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: isMobile ? 10 : 20,
                      vertical: isMobile ? 8 : 10, // Más estrecho
                    ),
                    isDense: true,
                  ),
                  style: TextStyle(fontSize: isMobile ? 13 : 14, color: AppTheme.gray900),
                  onSubmitted: (value) => _handleSearchSubmit(value),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(right: 3),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(50),
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _isEditing ? () => _handleSearchSubmit(_searchController.text) : null,
                    borderRadius: BorderRadius.circular(50),
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: isMobile ? 8 : 10,
                        vertical: isMobile ? 6 : 6, // Más compacto
                      ),
                      child: Icon(
                        _isEditing ? Icons.arrow_forward : Icons.search,
                        color: Colors.white,
                        size: isMobile ? 16 : 18, // Más pequeño
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // Progress bar
        if (searchProvider.status == SearchStatus.searching)
          Padding(
            padding: const EdgeInsets.only(top: 3),
            child: YouTubeStyleProgressBar(
              progress: searchProvider.progress?.progressPercent ?? 0.0,
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();

    // Sync controller with provider's search text
    if (_lastSearchText != searchProvider.searchText) {
      _lastSearchText = searchProvider.searchText;
      _searchController.text = searchProvider.searchText ?? '';
      if (_isEditing) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) setState(() => _isEditing = false);
        });
      }
    }

    final isSearching = searchProvider.status == SearchStatus.searching;
    final hasResults = searchProvider.hasResults;

    return Stack(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), // Más compacto
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Barra de búsqueda
              _buildSearchBar(context, searchProvider, l10n),

              // Motivational text
              if (isSearching && !hasResults) ...[
                const SizedBox(height: 12),
                const Center(child: MotivationalTextRotator()),
              ],

              // Country pills + View mode toggle + Animated controls
              // Animated visibility based on scroll (same behavior as guest banner)
              AnimatedCrossFade(
                duration: const Duration(milliseconds: 200),
                crossFadeState: widget.isControlsRowVisible
                    ? CrossFadeState.showFirst
                    : CrossFadeState.showSecond,
                firstChild: Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: hasResults && _isControlsExpanded
                      ? AnimatedControlsBar(
                          isExpanded: _isControlsExpanded,
                          onToggle: () => setState(() => _isControlsExpanded = !_isControlsExpanded),
                        )
                      : Row(
                          children: [
                            Expanded(child: _CountryPills()),
                            if (hasResults) ...[
                              const SizedBox(width: 12),
                              const _ResultsViewModeSegmentedControl(),
                              const SizedBox(width: 10),
                              AnimatedControlsBar(
                                isExpanded: _isControlsExpanded,
                                onToggle: () => setState(() => _isControlsExpanded = !_isControlsExpanded),
                              ),
                            ],
                          ],
                        ),
                ),
                secondChild: const SizedBox(width: double.infinity, height: 0),
              ),
            ],
          ),
        ),
        
        // Modales
        if (_showSearchTypeModal)
          SearchTypeModal(
            searchText: _pendingSearchText,
            isGuestMode: !context.watch<AuthProvider>().isAuthenticated,
            onClose: () => setState(() => _showSearchTypeModal = false),
            onClassicSearch: _executeClassicSearch,
            onSmartSearch: _executeSmartSearch,
            onSalesAnalysis: _executeSalesAnalysis,
          ),
        if (_showRegistrationModal)
          RegistrationModal(
            onClose: () => setState(() => _showRegistrationModal = false),
            onRegister: () async {
              setState(() => _showRegistrationModal = false);
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
}

/// Píldoras de países (funcionan como filtros)
/// Altura igual al segmented control de vista (28px), banderas circulares
/// Convención: provider.filters.countries vacío = todos seleccionados (sin filtro)
class _CountryPills extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final availableCountries = searchProvider.availableCountries;
    final filterCountries = searchProvider.filters.countries;

    if (availableCountries.isEmpty) return const SizedBox.shrink();

    // Empty = no filter = all countries selected
    final selectedCountries = filterCountries.isEmpty
        ? Set<String>.from(availableCountries)
        : Set<String>.from(filterCountries);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: availableCountries.map((countryCode) {
          final isSelected = selectedCountries.contains(countryCode);

          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () {
                final newSelected = Set<String>.from(selectedCountries);
                if (isSelected) {
                  newSelected.remove(countryCode);
                } else {
                  newSelected.add(countryCode);
                }
                // If all selected, store empty (= no filter)
                final toStore = newSelected.length == availableCountries.length
                    ? <String>[]
                    : newSelected.toList();
                final newFilters = searchProvider.filters.copyWith(
                  countries: toStore.isEmpty ? null : toStore,
                  clearCountries: toStore.isEmpty,
                );
                searchProvider.applyFilters(newFilters);
              },
              child: Container(
                height: 24, // Misma altura que la parte seleccionada del segmented control
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primary50 : AppTheme.gray100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? AppTheme.primary500 : AppTheme.gray300,
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Bandera circular
                    ClipOval(
                      child: CircleFlag(
                        countryCode.toLowerCase(),
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      countryCode,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        color: isSelected ? AppTheme.primary700 : AppTheme.gray700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Secciones de resultados con navegación horizontal entre secciones
class _SearchResultsSections extends StatefulWidget {
  @override
  State<_SearchResultsSections> createState() => _SearchResultsSectionsState();
}

class _SearchResultsSectionsState extends State<_SearchResultsSections> {
  int _currentPage = 0;

  void _goToPage(int page) {
    if (page >= 0 && page < 3) {
      setState(() => _currentPage = page);
    }
  }

  /// Build only the current section - lazy loading to prevent memory issues
  Widget _buildCurrentSection(int page) {
    switch (page) {
      case 0:
        return _AllResultsSection();
      case 1:
        return _NearestResultsSectionVertical();
      case 2:
        return _CheapestResultsSection();
      default:
        return _AllResultsSection();
    }
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final l10n = context.l10n;
    
    // Títulos de las secciones (traducidos)
    final sectionTitles = [
      l10n.sectionAllResults,
      l10n.sectionNearest,
      l10n.sectionCheapest,
    ];
    
    if (searchProvider.status == SearchStatus.searching && !searchProvider.hasResults) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (!searchProvider.hasResults) {
      return const Center(child: Text('No hay resultados'));
    }

    return Column(
      children: [
        // Header con título y flechas de navegación
        _SectionNavigationHeader(
          currentPage: _currentPage,
          sectionTitles: sectionTitles,
          onPrevious: () => _goToPage(_currentPage - 1),
          onNext: () => _goToPage(_currentPage + 1),
        ),
        
        // Lazy-loaded sections - only renders the active page
        // This prevents 3x image loading that was crashing iOS Safari
        Expanded(
          child: _buildCurrentSection(_currentPage),
        ),
      ],
    );
  }
}

/// Header de navegación entre secciones con flechas chevron - Compacto
class _SectionNavigationHeader extends StatelessWidget {
  final int currentPage;
  final List<String> sectionTitles;
  final VoidCallback onPrevious;
  final VoidCallback onNext;

  const _SectionNavigationHeader({
    required this.currentPage,
    required this.sectionTitles,
    required this.onPrevious,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final canGoPrevious = currentPage > 0;
    final canGoNext = currentPage < sectionTitles.length - 1;
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), // Más compacto
      child: Row(
        children: [
          // Flecha izquierda (chevron simple)
          _ChevronButton(
            direction: _ChevronDirection.left,
            isEnabled: canGoPrevious,
            onTap: canGoPrevious ? onPrevious : null,
          ),
          
          // Título de la sección actual
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Text(
                sectionTitles[currentPage],
                key: ValueKey(currentPage),
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14, // Más pequeño
                  fontWeight: FontWeight.w600,
                  color: AppTheme.gray800,
                ),
              ),
            ),
          ),
          
          // Flecha derecha (chevron simple)
          _ChevronButton(
            direction: _ChevronDirection.right,
            isEnabled: canGoNext,
            onTap: canGoNext ? onNext : null,
          ),
        ],
      ),
    );
  }
}

enum _ChevronDirection { left, right }

/// Botón chevron minimalista (2 líneas) - Más pequeño
class _ChevronButton extends StatelessWidget {
  final _ChevronDirection direction;
  final bool isEnabled;
  final VoidCallback? onTap;

  const _ChevronButton({
    required this.direction,
    required this.isEnabled,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque, // Toda el área es clicable
      child: Container(
        width: 44, // Zona clicable ampliada para mejor accesibilidad
        height: 44,
        alignment: Alignment.center,
        child: CustomPaint(
          size: const Size(10, 16), // Tamaño visual del chevron sin cambio
          painter: _ChevronPainter(
            direction: direction,
            color: isEnabled ? AppTheme.primary600 : AppTheme.gray300,
          ),
        ),
      ),
    );
  }
}

/// Painter para dibujar chevron minimalista (2 líneas)
class _ChevronPainter extends CustomPainter {
  final _ChevronDirection direction;
  final Color color;

  _ChevronPainter({required this.direction, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.0 // Más fino
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    if (direction == _ChevronDirection.left) {
      // Chevron izquierdo: >
      path.moveTo(size.width * 0.8, 0);
      path.lineTo(size.width * 0.2, size.height * 0.5);
      path.lineTo(size.width * 0.8, size.height);
    } else {
      // Chevron derecho: <
      path.moveTo(size.width * 0.2, 0);
      path.lineTo(size.width * 0.8, size.height * 0.5);
      path.lineTo(size.width * 0.2, size.height);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _ChevronPainter oldDelegate) {
    return oldDelegate.direction != direction || oldDelegate.color != color;
  }
}

// ============================================================================
// ADVANCED SEARCH PROMO CARD
// Promotional card shown to unauthenticated users to encourage sign-up
// ============================================================================

/// First position where promo card is inserted
const int _firstPromoPosition = 20;

/// Interval between subsequent promo cards
const int _promoInterval = 40;

/// Calculates positions where promo cards should be shown
List<int> _getPromoPositions(int totalResults, Set<int> dismissedPositions) {
  final positions = <int>[];
  // First position at 20
  if (totalResults > _firstPromoPosition && !dismissedPositions.contains(_firstPromoPosition)) {
    positions.add(_firstPromoPosition);
  }
  // Subsequent every 40 (60, 100, 140...)
  int nextPosition = _firstPromoPosition + _promoInterval;
  while (nextPosition < totalResults) {
    if (!dismissedPositions.contains(nextPosition)) {
      positions.add(nextPosition);
    }
    nextPosition += _promoInterval;
  }
  return positions;
}

/// Result of calculating promo card position for a given index
class _PromoIndexResult {
  final int? promoPosition; // If non-null, this index should show a promo card at this position
  final int resultIndex;    // The actual result index after accounting for promo cards

  const _PromoIndexResult({this.promoPosition, required this.resultIndex});
}

/// Calculates whether an index should show a promo card or a result
/// Returns the promo position if it's a promo card, or the adjusted result index
_PromoIndexResult _calculatePromoIndex(int index, List<int> promoPositions) {
  int promosBefore = 0;
  for (final pos in promoPositions) {
    if (pos + promosBefore < index) {
      promosBefore++;
    } else if (pos + promosBefore == index) {
      return _PromoIndexResult(promoPosition: pos, resultIndex: index - promosBefore);
    }
  }
  return _PromoIndexResult(resultIndex: index - promosBefore);
}

/// Promotional card explaining why results may seem irrelevant
/// Shown after 20 ads, then every 40 for unauthenticated users
class _AdvancedSearchPromoCard extends StatelessWidget {
  final String searchText;
  final VoidCallback? onDismiss;

  const _AdvancedSearchPromoCard({required this.searchText, this.onDismiss});

  // Fluorescent purple color for the border
  static const Color _fluorescentPurple = Color(0xFFBF00FF);

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final authProvider = context.watch<AuthProvider>();

    // Don't show if user is authenticated
    if (authProvider.isAuthenticated) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _fluorescentPurple, width: 2.5),
        boxShadow: [
          BoxShadow(
            color: _fluorescentPurple.withValues(alpha: 0.25),
            blurRadius: 16,
            spreadRadius: 2,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with icon and title
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🤔', style: TextStyle(fontSize: 24)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  l10n.advancedSearchPromoTitle,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.gray900,
                    height: 1.3,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Message text
          Text(
            l10n.advancedSearchPromoMessage(searchText),
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.gray700,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 20),

          // Buttons - reversed logic:
          // "Prefiero resultados filtrados" -> opens registration modal
          // "Entendido, quiero ver todo" -> closes the card
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Primary button - Opens registration modal for filtered results
              Expanded(
                flex: 3,
                child: ElevatedButton(
                  onPressed: () => _onRequestFilteredResults(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _fluorescentPurple,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    l10n.advancedSearchPromoActivate,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, height: 1.3),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Secondary button - Closes the card (user accepts unfiltered results)
              Expanded(
                flex: 2,
                child: TextButton(
                  onPressed: onDismiss,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                  ),
                  child: Text(
                    l10n.advancedSearchPromoNotNow,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.gray500,
                      fontWeight: FontWeight.w500,
                      fontSize: 13,
                      height: 1.3,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _onRequestFilteredResults(BuildContext context) {
    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (ctx) => RegistrationModal(
        onClose: () => Navigator.of(ctx).pop(),
        message: context.l10n.registrationModalAdvancedSearch,
      ),
    );
  }
}

/// 1. Sección "Todos los resultados" con scroll vertical
class _AllResultsSection extends StatefulWidget {
  @override
  State<_AllResultsSection> createState() => _AllResultsSectionState();
}

class _AllResultsSectionState extends State<_AllResultsSection> {
  final Set<int> _dismissedPromoPositions = {};

  void _dismissPromoAt(int position) {
    setState(() {
      _dismissedPromoPositions.add(position);
    });
  }
  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final authProvider = context.watch<AuthProvider>();
    // Use displayedResults (limited to 20/40) instead of filteredResults (all 800+)
    // This prevents memory issues on devices with limited RAM (iPhone)
    final results = searchProvider.displayedResults;
    final viewMode = searchProvider.viewMode;
    final searchText = searchProvider.searchText ?? '';

    // Calculate promo positions for unauthenticated users
    final promoPositions = !authProvider.isAuthenticated
        ? _getPromoPositions(results.length, _dismissedPromoPositions)
        : <int>[];

    // Vista de mapa
    if (viewMode == ViewMode.map) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: SearchResultsMapView(),
      );
    }

    // Vista de lista con promo cards
    if (viewMode == ViewMode.list) {
      final totalItems = results.length + promoPositions.length;

      return NotificationListener<ScrollNotification>(
        onNotification: (notification) {
          // Load more when user scrolls near bottom
          if (notification is ScrollUpdateNotification) {
            final metrics = notification.metrics;
            if (metrics.pixels >= metrics.maxScrollExtent - 200) {
              if (searchProvider.hasMoreResults) {
                searchProvider.loadMoreResults();
              }
            }
          }
          return false;
        },
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: totalItems,
          itemBuilder: (context, index) {
            final promoResult = _calculatePromoIndex(index, promoPositions);

            // If this index is a promo card
            if (promoResult.promoPosition != null) {
              return _AdvancedSearchPromoCard(
                searchText: searchText,
                onDismiss: () => _dismissPromoAt(promoResult.promoPosition!),
              );
            }

            // Otherwise show result
            if (promoResult.resultIndex < results.length) {
              return _ResultListItem(result: results[promoResult.resultIndex]);
            }
            return const SizedBox.shrink();
          },
        ),
      );
    }

    // Vista de mosaico (grid) con promo cards intercaladas
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        // Load more when user scrolls near bottom
        if (notification is ScrollUpdateNotification) {
          final metrics = notification.metrics;
          if (metrics.pixels >= metrics.maxScrollExtent - 200) {
            if (searchProvider.hasMoreResults) {
              searchProvider.loadMoreResults();
            }
          }
        }
        return false;
      },
      child: LayoutBuilder(
        builder: (context, constraints) {
          final screenWidth = MediaQuery.of(context).size.width;
          final isMobile = screenWidth < 600;

          final spacing = isMobile ? 8.0 : 12.0;
          final horizontalPadding = isMobile ? 12.0 : 16.0;

          int actualColumns;
          double aspectRatio;

          if (isMobile) {
            actualColumns = 2;
            aspectRatio = 193 / 251;
          } else {
            final cardWidth = 200.0;
            final availableWidth = constraints.maxWidth - (horizontalPadding * 2);
            final columnsCount = (availableWidth / (cardWidth + spacing)).floor();
            actualColumns = columnsCount > 0 ? columnsCount : 1;
            aspectRatio = 0.75;
          }

          // Calculate number of rows and promo positions (in terms of rows)
          final numRows = (results.length / actualColumns).ceil();
          final promoRowPositions = promoPositions.map((p) => (p / actualColumns).floor()).toSet().toList()..sort();
          final totalItems = numRows + promoRowPositions.length;

          return ListView.builder(
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
            itemCount: totalItems,
            itemBuilder: (context, index) {
              // Calculate how many promos appear before this index
              int promosBeforeIndex = 0;
              for (final promoRow in promoRowPositions) {
                if (promoRow + promosBeforeIndex < index) {
                  promosBeforeIndex++;
                } else {
                  break;
                }
              }
              
              // Check if this index is a promo position
              final isPromoIndex = promoRowPositions.contains(index - promosBeforeIndex) && 
                  promosBeforeIndex < promoRowPositions.length &&
                  promoRowPositions[promosBeforeIndex] + promosBeforeIndex == index;
              
              if (isPromoIndex) {
                return Padding(
                  padding: EdgeInsets.only(bottom: spacing),
                  child: _AdvancedSearchPromoCard(
                    searchText: searchText,
                    onDismiss: () => _dismissPromoAt(promoRowPositions[promosBeforeIndex]),
                  ),
                );
              }
              
              // Otherwise show a row of grid items
              final rowIndex = index - promosBeforeIndex;
              final startIndex = rowIndex * actualColumns;
              final endIndex = (startIndex + actualColumns).clamp(0, results.length);
              
              if (startIndex >= results.length) {
                return const SizedBox.shrink();
              }
              
              final rowItems = results.sublist(startIndex, endIndex);
              final cardHeight = (constraints.maxWidth - horizontalPadding * 2 - spacing * (actualColumns - 1)) / actualColumns / aspectRatio;
              
              return Padding(
                padding: EdgeInsets.only(bottom: spacing),
                child: SizedBox(
                  height: cardHeight,
                  child: Row(
                    children: [
                      for (int i = 0; i < rowItems.length; i++) ...[
                        if (i > 0) SizedBox(width: spacing),
                        Expanded(child: _ResultGridItem(result: rowItems[i])),
                      ],
                      // Fill remaining space if row is not complete
                      for (int i = rowItems.length; i < actualColumns; i++) ...[
                        SizedBox(width: spacing),
                        const Expanded(child: SizedBox()),
                      ],
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

/// 2. Sección "Los más cercanos" con scroll vertical
class _NearestResultsSectionVertical extends StatefulWidget {
  @override
  State<_NearestResultsSectionVertical> createState() => _NearestResultsSectionVerticalState();
}

class _NearestResultsSectionVerticalState extends State<_NearestResultsSectionVertical> {
  final Set<int> _dismissedPromoPositions = {};

  void _dismissPromoAt(int position) {
    setState(() {
      _dismissedPromoPositions.add(position);
    });
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final authProvider = context.watch<AuthProvider>();
    final viewMode = searchProvider.viewMode;
    final searchText = searchProvider.searchText ?? '';

    // Use displayedResultsByDistance: filters applied, sorted by distance, then limited
    // This gives us the N nearest results from ALL filtered results
    final nearestResults = searchProvider.displayedResultsByDistance;

    if (nearestResults.isEmpty) {
      return const Center(child: Text('No hay resultados cercanos'));
    }

    // Calculate promo positions for unauthenticated users
    final promoPositions = !authProvider.isAuthenticated
        ? _getPromoPositions(nearestResults.length, _dismissedPromoPositions)
        : <int>[];

    // Vista de mapa
    if (viewMode == ViewMode.map) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: SearchResultsMapView(),
      );
    }

    // Vista de lista con promo cards
    if (viewMode == ViewMode.list) {
      final totalItems = nearestResults.length + promoPositions.length;

      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: totalItems,
        itemBuilder: (context, index) {
          final promoResult = _calculatePromoIndex(index, promoPositions);

          // If this index is a promo card
          if (promoResult.promoPosition != null) {
            return _AdvancedSearchPromoCard(
              searchText: searchText,
              onDismiss: () => _dismissPromoAt(promoResult.promoPosition!),
            );
          }

          // Otherwise show result
          if (promoResult.resultIndex < nearestResults.length) {
            return _ResultListItem(result: nearestResults[promoResult.resultIndex]);
          }
          return const SizedBox.shrink();
        },
      );
    }

    // Vista de mosaico (grid) con promo cards intercaladas
    return LayoutBuilder(
      builder: (context, constraints) {
        final screenWidth = MediaQuery.of(context).size.width;
        final isMobile = screenWidth < 600;

        final spacing = isMobile ? 8.0 : 12.0;
        final horizontalPadding = isMobile ? 12.0 : 16.0;

        int actualColumns;
        double aspectRatio;

        if (isMobile) {
          actualColumns = 2;
          aspectRatio = 193 / 251;
        } else {
          final cardWidth = 200.0;
          final availableWidth = constraints.maxWidth - (horizontalPadding * 2);
          final columnsCount = (availableWidth / (cardWidth + spacing)).floor();
          actualColumns = columnsCount > 0 ? columnsCount : 1;
          aspectRatio = 0.75;
        }

        // Calculate number of rows and promo positions (in terms of rows)
        final numRows = (nearestResults.length / actualColumns).ceil();
        final promoRowPositions = promoPositions.map((p) => (p / actualColumns).floor()).toSet().toList()..sort();
        final totalItems = numRows + promoRowPositions.length;

        return ListView.builder(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          itemCount: totalItems,
          itemBuilder: (context, index) {
            // Calculate how many promos appear before this index
            int promosBeforeIndex = 0;
            for (final promoRow in promoRowPositions) {
              if (promoRow + promosBeforeIndex < index) {
                promosBeforeIndex++;
              } else {
                break;
              }
            }
            
            // Check if this index is a promo position
            final isPromoIndex = promoRowPositions.contains(index - promosBeforeIndex) && 
                promosBeforeIndex < promoRowPositions.length &&
                promoRowPositions[promosBeforeIndex] + promosBeforeIndex == index;
            
            if (isPromoIndex) {
              return Padding(
                padding: EdgeInsets.only(bottom: spacing),
                child: _AdvancedSearchPromoCard(
                  searchText: searchText,
                  onDismiss: () => _dismissPromoAt(promoRowPositions[promosBeforeIndex]),
                ),
              );
            }
            
            // Otherwise show a row of grid items
            final rowIndex = index - promosBeforeIndex;
            final startIndex = rowIndex * actualColumns;
            final endIndex = (startIndex + actualColumns).clamp(0, nearestResults.length);
            
            if (startIndex >= nearestResults.length) {
              return const SizedBox.shrink();
            }
            
            final rowItems = nearestResults.sublist(startIndex, endIndex);
            final cardHeight = (constraints.maxWidth - horizontalPadding * 2 - spacing * (actualColumns - 1)) / actualColumns / aspectRatio;
            
            return Padding(
              padding: EdgeInsets.only(bottom: spacing),
              child: SizedBox(
                height: cardHeight,
                child: Row(
                  children: [
                    for (int i = 0; i < rowItems.length; i++) ...[
                      if (i > 0) SizedBox(width: spacing),
                      Expanded(child: _ResultGridItem(result: rowItems[i])),
                    ],
                    // Fill remaining space if row is not complete
                    for (int i = rowItems.length; i < actualColumns; i++) ...[
                      SizedBox(width: spacing),
                      const Expanded(child: SizedBox()),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

/// 3. Sección "Los más económicos" con scroll vertical
class _CheapestResultsSection extends StatefulWidget {
  @override
  State<_CheapestResultsSection> createState() => _CheapestResultsSectionState();
}

class _CheapestResultsSectionState extends State<_CheapestResultsSection> {
  final Set<int> _dismissedPromoPositions = {};

  void _dismissPromoAt(int position) {
    setState(() {
      _dismissedPromoPositions.add(position);
    });
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final authProvider = context.watch<AuthProvider>();
    final viewMode = searchProvider.viewMode;
    final searchText = searchProvider.searchText ?? '';

    // Use displayedResultsByPrice: filters applied, sorted by price, then limited
    // This gives us the N cheapest results from ALL filtered results
    final cheapestResults = searchProvider.displayedResultsByPrice;

    if (cheapestResults.isEmpty) {
      return const Center(child: Text('No hay resultados'));
    }

    // Calculate promo positions for unauthenticated users
    final promoPositions = !authProvider.isAuthenticated
        ? _getPromoPositions(cheapestResults.length, _dismissedPromoPositions)
        : <int>[];

    // Vista de mapa
    if (viewMode == ViewMode.map) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: SearchResultsMapView(),
      );
    }

    // Vista de lista con promo cards
    if (viewMode == ViewMode.list) {
      final totalItems = cheapestResults.length + promoPositions.length;

      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: totalItems,
        itemBuilder: (context, index) {
          final promoResult = _calculatePromoIndex(index, promoPositions);

          // If this index is a promo card
          if (promoResult.promoPosition != null) {
            return _AdvancedSearchPromoCard(
              searchText: searchText,
              onDismiss: () => _dismissPromoAt(promoResult.promoPosition!),
            );
          }

          // Otherwise show result
          if (promoResult.resultIndex < cheapestResults.length) {
            return _ResultListItem(result: cheapestResults[promoResult.resultIndex]);
          }
          return const SizedBox.shrink();
        },
      );
    }

    // Vista de mosaico (grid) con promo cards intercaladas
    return LayoutBuilder(
      builder: (context, constraints) {
        final screenWidth = MediaQuery.of(context).size.width;
        final isMobile = screenWidth < 600;

        final spacing = isMobile ? 8.0 : 12.0;
        final horizontalPadding = isMobile ? 12.0 : 16.0;

        int actualColumns;
        double aspectRatio;

        if (isMobile) {
          actualColumns = 2;
          aspectRatio = 193 / 251;
        } else {
          final cardWidth = 200.0;
          final availableWidth = constraints.maxWidth - (horizontalPadding * 2);
          final columnsCount = (availableWidth / (cardWidth + spacing)).floor();
          actualColumns = columnsCount > 0 ? columnsCount : 1;
          aspectRatio = 0.75;
        }

        // Calculate number of rows and promo positions (in terms of rows)
        final numRows = (cheapestResults.length / actualColumns).ceil();
        final promoRowPositions = promoPositions.map((p) => (p / actualColumns).floor()).toSet().toList()..sort();
        final totalItems = numRows + promoRowPositions.length;

        return ListView.builder(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          itemCount: totalItems,
          itemBuilder: (context, index) {
            // Calculate how many promos appear before this index
            int promosBeforeIndex = 0;
            for (final promoRow in promoRowPositions) {
              if (promoRow + promosBeforeIndex < index) {
                promosBeforeIndex++;
              } else {
                break;
              }
            }
            
            // Check if this index is a promo position
            final isPromoIndex = promoRowPositions.contains(index - promosBeforeIndex) && 
                promosBeforeIndex < promoRowPositions.length &&
                promoRowPositions[promosBeforeIndex] + promosBeforeIndex == index;
            
            if (isPromoIndex) {
              return Padding(
                padding: EdgeInsets.only(bottom: spacing),
                child: _AdvancedSearchPromoCard(
                  searchText: searchText,
                  onDismiss: () => _dismissPromoAt(promoRowPositions[promosBeforeIndex]),
                ),
              );
            }
            
            // Otherwise show a row of grid items
            final rowIndex = index - promosBeforeIndex;
            final startIndex = rowIndex * actualColumns;
            final endIndex = (startIndex + actualColumns).clamp(0, cheapestResults.length);
            
            if (startIndex >= cheapestResults.length) {
              return const SizedBox.shrink();
            }
            
            final rowItems = cheapestResults.sublist(startIndex, endIndex);
            final cardHeight = (constraints.maxWidth - horizontalPadding * 2 - spacing * (actualColumns - 1)) / actualColumns / aspectRatio;
            
            return Padding(
              padding: EdgeInsets.only(bottom: spacing),
              child: SizedBox(
                height: cardHeight,
                child: Row(
                  children: [
                    for (int i = 0; i < rowItems.length; i++) ...[
                      if (i > 0) SizedBox(width: spacing),
                      Expanded(child: _ResultGridItem(result: rowItems[i])),
                    ],
                    // Fill remaining space if row is not complete
                    for (int i = rowItems.length; i < actualColumns; i++) ...[
                      SizedBox(width: spacing),
                      const Expanded(child: SizedBox()),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}


/// Shipping indicator - always visible, crossed out when not shippable
class _ShippingIndicator extends StatelessWidget {
  final bool isShippable;
  final double size;

  const _ShippingIndicator({required this.isShippable, this.size = 14});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.local_shipping_outlined,
            size: size,
            color: isShippable ? AppTheme.gray500 : AppTheme.gray300,
          ),
          if (!isShippable)
            CustomPaint(
              size: Size(size, size),
              painter: _StrikeThroughPainter(color: AppTheme.gray400),
            ),
        ],
      ),
    );
  }
}

/// Custom painter for diagonal strike-through line
class _StrikeThroughPainter extends CustomPainter {
  final Color color;
  _StrikeThroughPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      Offset(size.width * 0.8, size.height * 0.2),
      Offset(size.width * 0.2, size.height * 0.8),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Item de resultado en modo lista - Rediseñado
class _ResultListItem extends StatelessWidget {
  final SearchResult result;

  const _ResultListItem({required this.result});

  void _showDetailModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SearchResultDetailModal(result: result),
    );
  }

  @override
  Widget build(BuildContext context) {
    const double imageSize = 56;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 6),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: AppTheme.gray200),
      ),
      child: InkWell(
        onTap: () => _showDetailModal(context),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Imagen
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: result.hasImage
                      ? NetworkImageWidget(
                          key: ValueKey(result.imageUrl),
                          imageUrl: result.imageUrl!,
                          width: imageSize,
                          height: imageSize,
                          fit: BoxFit.cover,
                        )
                      : Container(
                          width: imageSize,
                          height: imageSize,
                          color: AppTheme.gray200,
                          child: Icon(Icons.image_outlined, size: 22, color: AppTheme.gray400),
                        ),
                ),
                const SizedBox(width: 10),
                
                // Información - altura igual a la imagen
                Expanded(
                  child: SizedBox(
                    height: imageSize,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Línea 1: Título + Icono plataforma (alineado con parte SUPERIOR de la imagen)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                result.title,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  height: 1.2,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            PlatformIconWithFlag(
                              platform: result.platform,
                              countryCode: result.marketplaceCountry ?? result.countryCode,
                              size: 24,
                            ),
                          ],
                        ),
                        // Línea 2: Precio + Envío/Ubicación (alineado con parte INFERIOR de la imagen)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            // Precio a la izquierda (muy destacado)
                            Text(
                              '${result.price.toStringAsFixed(2)} €',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF667EEA),
                                height: 1.0,
                              ),
                            ),
                            const Spacer(),
                            // Envío y ubicación a la derecha
                            _ShippingIndicator(isShippable: result.isShippable, size: 12),
                            const SizedBox(width: 6),
                            Icon(Icons.near_me, size: 10, color: AppTheme.gray500),
                            const SizedBox(width: 2),
                            Text(
                              result.distance != null ? '${result.distance!.toStringAsFixed(0)} km' : '-',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.gray600,
                                height: 1.0,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Item de resultado en modo cuadrícula - Compacto para móvil (193x251 en iPhone 14 Pro Max)
class _ResultGridItem extends StatelessWidget {
  final SearchResult result;

  const _ResultGridItem({required this.result});

  void _showDetailModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SearchResultDetailModal(result: result),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final borderRadius = isMobile ? 8.0 : 12.0;
    final imagePadding = isMobile ? 4.0 : 6.0;
    
    return Card(
      elevation: 1,
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: InkWell(
        onTap: () => _showDetailModal(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen con marco blanco alrededor
            Expanded(
              flex: 60,
              child: Container(
                padding: EdgeInsets.all(imagePadding),
                color: Colors.white,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(borderRadius - 2),
                  child: result.hasImage
                      ? NetworkImageWidget(
                          key: ValueKey(result.imageUrl),
                          imageUrl: result.imageUrl!,
                          fit: BoxFit.cover,
                        )
                      : Container(
                          color: AppTheme.gray200,
                          child: Center(
                            child: Icon(
                              Icons.image_outlined, 
                              size: isMobile ? 28 : 40, 
                              color: AppTheme.gray400,
                            ),
                          ),
                        ),
                ),
              ),
            ),
            
            // Información compacta
            Padding(
              padding: EdgeInsets.all(isMobile ? 6 : 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Título + icono plataforma (altura fija 2 líneas)
                  SizedBox(
                    height: isMobile ? 28 : 32, // Altura fija para 2 líneas
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            result.title,
                            style: TextStyle(
                              fontSize: isMobile ? 11 : 12,
                              fontWeight: FontWeight.w600,
                              height: 1.2,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        PlatformIconWithFlag(
                          platform: result.platform,
                          countryCode: result.marketplaceCountry ?? result.countryCode,
                          size: isMobile ? 20 : 24,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Precio (muy destacado)
                  Text(
                    '${result.price.toStringAsFixed(2)} €',
                    style: TextStyle(
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF667EEA),
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Envío + Distancia
                  Row(
                    children: [
                      _ShippingIndicator(isShippable: result.isShippable, size: isMobile ? 10 : 12),
                      SizedBox(width: isMobile ? 4 : 6),
                      Icon(Icons.near_me, size: isMobile ? 8 : 10, color: AppTheme.gray500),
                      const SizedBox(width: 2),
                      Text(
                        result.distance != null ? '${result.distance!.toStringAsFixed(0)} km' : '-',
                        style: TextStyle(fontSize: isMobile ? 9 : 11, color: AppTheme.gray600),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// VIEW MODE SEGMENTED CONTROL
// =============================================================================

/// Position of a segment button within the control
enum _SegPosition { left, middle, right }

/// iOS-style segmented control for switching between view modes (list/grid/map)
class _ResultsViewModeSegmentedControl extends StatelessWidget {
  const _ResultsViewModeSegmentedControl();

  @override
  Widget build(BuildContext context) {
    final searchProvider = context.watch<SearchProvider>();
    final selected = searchProvider.viewMode;

    const double height = 28;
    const double segmentWidth = 32;
    const double radius = 10;

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: AppTheme.primary50,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: AppTheme.primary200),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary600.withValues(alpha: 0.08),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _SegButton(
            width: segmentWidth,
            icon: Remix.layout_grid_line,
            isSelected: selected == ViewMode.cards,
            position: _SegPosition.left,
            onTap: () => searchProvider.setViewMode(ViewMode.cards),
          ),
          _SegButton(
            width: segmentWidth,
            icon: Remix.menu_2_line,
            isSelected: selected == ViewMode.list,
            position: _SegPosition.middle,
            onTap: () => searchProvider.setViewMode(ViewMode.list),
          ),
          _SegButton(
            width: segmentWidth,
            icon: Remix.map_2_line,
            isSelected: selected == ViewMode.map,
            position: _SegPosition.right,
            onTap: () => searchProvider.setViewMode(ViewMode.map),
          ),
        ],
      ),
    );
  }
}

/// Individual button segment within the segmented control
class _SegButton extends StatelessWidget {
  final double width;
  final IconData icon;
  final bool isSelected;
  final _SegPosition position;
  final VoidCallback onTap;

  const _SegButton({
    required this.width,
    required this.icon,
    required this.isSelected,
    required this.position,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    BorderRadius? borderRadius;
    if (position == _SegPosition.left) {
      borderRadius = const BorderRadius.only(
        topLeft: Radius.circular(8),
        bottomLeft: Radius.circular(8),
      );
    } else if (position == _SegPosition.right) {
      borderRadius = const BorderRadius.only(
        topRight: Radius.circular(8),
        bottomRight: Radius.circular(8),
      );
    }

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOutCubic,
        width: width,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  colors: [AppTheme.primary500, Colors.purple.shade600],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? null : Colors.white,
          borderRadius: borderRadius,
          border: position != _SegPosition.left
              ? Border(left: BorderSide(color: AppTheme.primary200))
              : null,
        ),
        child: Center(
          child: Icon(
            icon,
            size: 16,
            color: isSelected ? Colors.white : AppTheme.primary600,
          ),
        ),
      ),
    );
  }
}
