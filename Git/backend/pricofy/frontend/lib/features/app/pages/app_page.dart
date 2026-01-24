// App Page
//
// Main page of the Pricofy app (/app route).
// Shows search and evaluation history.
// Works for both authenticated and anonymous users.
// Layout (navbar + sidebar) provided by AppLayout shell.

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../config/routes.dart';
import '../../../config/feature_flags.dart';
import '../../../config/theme.dart';
import '../../../config/api_config.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/search_provider.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../core/models/request.dart';
import '../../../core/services/favorites_service.dart';
import '../../../core/services/session_service.dart';
import 'new_request_page.dart';
import '../widgets/requests/request_card.dart';
import '../widgets/search/search_results_view.dart';
import '../widgets/modals/search_type_modal.dart';
import '../widgets/modals/registration_modal.dart';
import '../widgets/search/location_indicator.dart';

/// App page filter options
enum AppPageFilter {
  dashboard,
  buy,
  sell,
  favorites,
  search,
}

/// Main app page content - layout provided by AppLayout shell
class AppPage extends StatefulWidget {
  final String? filterParam;
  final String? searchParam;

  const AppPage({
    super.key,
    this.filterParam,
    this.searchParam,
  });

  @override
  State<AppPage> createState() => _AppPageState();
}

class _AppPageState extends State<AppPage> {
  late final BffApiClient _apiClient;
  late final FavoritesService _favoritesService;
  late final SessionService _sessionService;
  late final ScrollController _scrollController;
  List<Request> _requests = [];
  bool _loading = true;
  String? _error;
  bool _showingForm = false;
  bool _showingSearchResults = false;
  AppPageFilter _currentFilter = AppPageFilter.dashboard;
  String _searchQuery = '';

  // Search bar state for Buy tab (like hero_section)
  final TextEditingController _buySearchController = TextEditingController();
  final FocusNode _buySearchFocus = FocusNode();
  bool _hasBuySearchText = false;

  // Search bar state for Dashboard (like hero_section)
  final TextEditingController _dashboardSearchController = TextEditingController();
  final FocusNode _dashboardSearchFocus = FocusNode();
  bool _hasDashboardSearchText = false;

  // Modal states
  bool _showSearchTypeModal = false;
  bool _showRegistrationModal = false;
  String _pendingSearchText = '';

  @override
  void initState() {
    super.initState();
    _apiClient = context.read<BffApiClient>();
    _favoritesService = context.read<FavoritesService>();
    _sessionService = SessionService();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    _applyFilterFromParam();
    _handleSearchParam();

    // Initialize search bar listeners for Buy tab
    _buySearchController.addListener(() {
      setState(() {
        _hasBuySearchText = _buySearchController.text.trim().isNotEmpty;
      });
    });

    // Initialize search bar listeners for Dashboard
    _dashboardSearchController.addListener(() {
      setState(() {
        _hasDashboardSearchText = _dashboardSearchController.text.trim().isNotEmpty;
      });
    });

    // Only fetch evaluations if authenticated
    // For guests, we show the dashboard UI without data
    final authProvider = context.read<AuthProvider>();
    if (!_showingSearchResults && authProvider.isAuthenticated) {
      _fetchEvaluations();
    } else if (!authProvider.isAuthenticated) {
      // For guests, just set loading to false and show empty UI
      setState(() {
        _loading = false;
        _requests = [];
      });
    }
  }

  @override
  void dispose() {
    // Cancel any ongoing search when leaving the app page entirely
    // Use read() instead of watch() in dispose to avoid errors
    try {
      final searchProvider = context.read<SearchProvider>();
      if (searchProvider.isSearching) {
        searchProvider.cancelSearch();
      }
    } catch (_) {
      // Provider may not be available during dispose
    }

    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _buySearchController.dispose();
    _buySearchFocus.dispose();
    _dashboardSearchController.dispose();
    _dashboardSearchFocus.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(AppPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    // React to filter changes from URL parameters
    if (widget.filterParam != oldWidget.filterParam) {
      // Cancel any ongoing search when leaving search view
      final wasOnSearch = oldWidget.filterParam == 'search';
      final isLeavingSearch = wasOnSearch && widget.filterParam != 'search';
      if (isLeavingSearch) {
        final searchProvider = context.read<SearchProvider>();
        searchProvider.cancelSearch();
      }

      _applyFilterFromParam();
      // Only fetch if authenticated
      final authProvider = context.read<AuthProvider>();
      if (!_showingSearchResults && authProvider.isAuthenticated) {
        _fetchEvaluations();
      }
    }
    // React to search param changes
    if (widget.searchParam != oldWidget.searchParam) {
      _handleSearchParam();
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      // User is near the bottom, load more results
      final searchProvider = context.read<SearchProvider>();
      if (searchProvider.hasMoreResults && !searchProvider.isLoadingMore) {
        searchProvider.loadMoreResults();
      }
    }
  }

  void _handleSearchParam() {
    if (widget.searchParam != null && widget.searchParam!.isNotEmpty) {
      _showingSearchResults = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final searchProvider = context.read<SearchProvider>();
        final userLanguage = Localizations.localeOf(context).languageCode;
        searchProvider.startSearch(widget.searchParam!, userLanguage: userLanguage);
      });
    }
  }

  void _applyFilterFromParam() {
    if (widget.filterParam != null) {
      switch (widget.filterParam) {
        case 'dashboard':
          _currentFilter = AppPageFilter.dashboard;
          _showingSearchResults = false;
          break;
        case 'buy':
          _currentFilter = AppPageFilter.buy;
          _showingSearchResults = false;
          break;
        case 'sell':
          _currentFilter = AppPageFilter.sell;
          _showingSearchResults = false;
          break;
        case 'favorites':
          _currentFilter = AppPageFilter.favorites;
          _showingSearchResults = false;
          break;
        case 'search':
          _currentFilter = AppPageFilter.search;
          _showingSearchResults = true;
          break;
        default:
          _currentFilter = AppPageFilter.dashboard;
          _showingSearchResults = false;
      }
    }
  }

  List<Request> get _filteredRequests {
    var filtered = _requests;

    switch (_currentFilter) {
      case AppPageFilter.dashboard:
        // Dashboard shows all evaluations
        break;
      case AppPageFilter.buy:
        filtered = filtered.where((e) => e.accion.toLowerCase().contains('comprar')).toList();
        break;
      case AppPageFilter.sell:
        filtered = filtered.where((e) => e.accion.toLowerCase().contains('vender')).toList();
        break;
      case AppPageFilter.favorites:
        filtered = filtered.where((e) => _favoritesService.isFavorite(e.id)).toList();
        break;
      case AppPageFilter.search:
        // Search results are handled separately
        break;
    }

    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((e) =>
        e.modeloMarca.toLowerCase().contains(query) ||
        e.tipoProducto.toLowerCase().contains(query) ||
        e.ciudad.toLowerCase().contains(query)
      ).toList();
    }

    return filtered;
  }

  Future<void> _fetchEvaluations() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      Map<String, String> headers = {};

      if (!authProvider.isAuthenticated) {
        final sessionId = await _sessionService.getOrCreateSessionId();
        headers['x-anon-session-id'] = sessionId;
      }

      final response = await _apiClient.get('/user/evaluations', headers: headers);
      final requests = (response['evaluations'] as List<dynamic>?)
          ?.map((e) => Request.fromJson(e as Map<String, dynamic>))
          .toList() ?? [];

      setState(() {
        _requests = requests;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final searchProvider = context.watch<SearchProvider>();
    final authProvider = context.watch<AuthProvider>();

    // Content only - layout provided by AppLayout shell
    return Stack(
      children: [
        // Main content
        Scaffold(
          backgroundColor: Colors.transparent,
          floatingActionButton: !_showingForm && !_showingSearchResults && searchProvider.status == SearchStatus.idle
              ? FloatingActionButton.extended(
                  onPressed: () => setState(() => _showingForm = true),
                  icon: const Icon(Icons.add),
                  label: Text(l10n.navNewEvaluation),
                  backgroundColor: const Color(0xFF667EEA),
                )
              : null,
          body: _buildContent(context, l10n, searchProvider),
        ),

        // Modal de tipo de búsqueda
        if (_showSearchTypeModal)
          SearchTypeModal(
            searchText: _pendingSearchText,
            isGuestMode: !authProvider.isAuthenticated,
            onClassicSearch: () {
              setState(() => _showSearchTypeModal = false);
              _executeClassicSearch();
            },
            onSmartSearch: _executeSmartSearch,
            onSalesAnalysis: _executeSalesAnalysis,
            onClose: () => setState(() => _showSearchTypeModal = false),
          ),

        // Modal de registro
        if (_showRegistrationModal)
          RegistrationModal(
            onClose: () => setState(() => _showRegistrationModal = false),
            onRegister: () async {
              setState(() => _showRegistrationModal = false);
              // Redirigir a la landing para registro
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

  Widget _buildContent(BuildContext context, dynamic l10n, SearchProvider searchProvider) {
    // If showing form
    if (_showingForm) {
      return _buildFormView(l10n);
    }

    // If on search route, show search results (hidden tab)
    if (_currentFilter == AppPageFilter.search) {
      return _buildSearchResultsView(l10n, searchProvider);
    }

    // Show evaluations list for other routes
    return _buildEvaluationsView(l10n);
  }

  Widget _buildFormView(dynamic l10n) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with close button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                l10n.navNewEvaluation,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.gray900,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () {
                  setState(() => _showingForm = false);
                  _fetchEvaluations();
                },
                tooltip: l10n.commonBack,
              ),
            ],
          ),
          const SizedBox(height: 16),
          NewRequestPage(
            initialAction: 'vender',
            showAsPage: false,
            onClose: () {
              setState(() => _showingForm = false);
              _fetchEvaluations();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResultsView(dynamic l10n, SearchProvider searchProvider) {
    return const SearchResultsViewNew();
  }

  Widget _buildEvaluationsView(dynamic l10n) {
    final authProvider = context.read<AuthProvider>();
    final isAuthenticated = authProvider.isAuthenticated;

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _fetchEvaluations, child: Text(l10n.commonRetry)),
          ],
        ),
      );
    }

    // Dashboard view (like monolito legacy)
    if (_currentFilter == AppPageFilter.dashboard) {
      return _buildDashboardView(l10n, isAuthenticated);
    }

    // For other filters, show the regular evaluations list
    return _buildFilteredEvaluationsView(l10n, isAuthenticated);
  }

  /// Dashboard view matching monolito legacy design
  Widget _buildDashboardView(dynamic l10n, bool isAuthenticated) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;
    final authProvider = context.watch<AuthProvider>();
    final showGuestBanner = !authProvider.isAuthenticated && authProvider.status != AuthStatus.unknown;

    return Column(
      children: [
        // Guest mode banner (identical to search results page)
        if (showGuestBanner)
          Container(
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

        // Search header (identical to search results page)
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Container(
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
                // Location indicator (circular) - like search results
                const Padding(
                  padding: EdgeInsets.only(left: 4),
                  child: LocationIndicator(variant: LocationIndicatorVariant.searchBar),
                ),
                Expanded(
                  child: TextField(
                    controller: _dashboardSearchController,
                    focusNode: _dashboardSearchFocus,
                    onSubmitted: (_) => _handleDashboardSearch(),
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
                        vertical: isMobile ? 8 : 10,
                      ),
                      isDense: true,
                    ),
                    style: TextStyle(fontSize: isMobile ? 13 : 14, color: AppTheme.gray900),
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
                      onTap: _hasDashboardSearchText ? _handleDashboardSearch : null,
                      borderRadius: BorderRadius.circular(50),
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: isMobile ? 8 : 10,
                          vertical: isMobile ? 6 : 6,
                        ),
                        child: Icon(
                          _hasDashboardSearchText ? Icons.arrow_forward : Icons.search,
                          color: Colors.white,
                          size: isMobile ? 16 : 18,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Content below search bar
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Buy and Sell buttons (only on desktop - mobile uses bottom nav)
                if (!isMobile) ...[
                  _buildBuySellButtons(l10n, isAuthenticated),
                  const SizedBox(height: 32),
                ],

                // Smart Searches section
                _buildEmptySmartSearchesSection(l10n),
                const SizedBox(height: 24),

                // Sales Analysis section
                _buildEmptySalesSection(l10n, isAuthenticated),
                const SizedBox(height: 24),

                // Alerts section (like monolito)
                _buildAlertsSection(l10n),
                const SizedBox(height: 24),

                // Notifications section (like monolito)
                _buildNotificationsSection(l10n),
                const SizedBox(height: 24),

                // Favorites section (like monolito)
                _buildFavoritesSection(l10n, isAuthenticated),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Filtered evaluations view (for buy, sell, favorites filters)
  Widget _buildFilteredEvaluationsView(dynamic l10n, bool isAuthenticated) {
    // For Buy tab, show hero-style search bar with empty state
    if (_currentFilter == AppPageFilter.buy) {
      return _buildBuyView(l10n, isAuthenticated);
    }

    if (_requests.isEmpty) {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search bar at the top
            _buildFiltersAndSearch(l10n),
            const SizedBox(height: 24),

            // Empty state message
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _currentFilter == AppPageFilter.sell ? Icons.sell_outlined :
                    Icons.favorite_outline,
                    size: 64,
                    color: AppTheme.gray300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _currentFilter == AppPageFilter.sell ? l10n.dashboardNoSellSearches :
                    l10n.dashboardNoFavorites,
                    style: const TextStyle(fontSize: 16, color: AppTheme.gray600),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Filters & Search
          _buildFiltersAndSearch(l10n),
          const SizedBox(height: 16),

          // Results count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              l10n.dashboardTotalResults(_filteredRequests.length),
              style: TextStyle(fontSize: 14, color: Colors.grey[600], fontWeight: FontWeight.w500),
            ),
          ),
          const SizedBox(height: 12),

          // Requests List
          ..._filteredRequests.map((request) => RequestCard(request: request)),

          // Stats Summary
          if (_requests.isNotEmpty) ...[
            const SizedBox(height: 24),
            _buildStatsSummary(l10n),
          ],
        ],
      ),
    );
  }

  /// Buy view with search bar matching search results page for visual continuity
  Widget _buildBuyView(dynamic l10n, bool isAuthenticated) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;
    final authProvider = context.watch<AuthProvider>();
    final showGuestBanner = !authProvider.isAuthenticated && authProvider.status != AuthStatus.unknown;

    return Column(
      children: [
        // Guest mode banner (identical to search results page)
        if (showGuestBanner)
          Container(
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

        // Search header (identical to search results page)
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Container(
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
                // Location indicator (circular) - like search results
                const Padding(
                  padding: EdgeInsets.only(left: 4),
                  child: LocationIndicator(variant: LocationIndicatorVariant.searchBar),
                ),
                Expanded(
                  child: TextField(
                    controller: _buySearchController,
                    focusNode: _buySearchFocus,
                    onSubmitted: (_) => _handleBuySearch(),
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
                        vertical: isMobile ? 8 : 10,
                      ),
                      isDense: true,
                    ),
                    style: TextStyle(fontSize: isMobile ? 13 : 14, color: AppTheme.gray900),
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
                      onTap: _hasBuySearchText ? _handleBuySearch : null,
                      borderRadius: BorderRadius.circular(50),
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: isMobile ? 8 : 10,
                          vertical: isMobile ? 6 : 6,
                        ),
                        child: Icon(
                          _hasBuySearchText ? Icons.arrow_forward : Icons.search,
                          color: Colors.white,
                          size: isMobile ? 16 : 18,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Content below search bar
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 32),

          // Empty state: "El mejor precio está en algún sitio"
          if (_requests.where((e) => e.accion.toLowerCase().contains('comprar')).isEmpty || !isAuthenticated) ...[
            Padding(
              padding: EdgeInsets.symmetric(horizontal: isMobile ? 24 : 48),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 500),
                child: Column(
                  children: [
                    // Icon - More eye-catching design
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFF7C3AED), // violet-600
                            Color(0xFFDB2777), // pink-600
                          ],
                        ),
                        borderRadius: BorderRadius.circular(32),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF7C3AED).withValues(alpha: 0.4),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.shopping_bag_rounded,
                        size: 28,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Title
                    Text(
                      l10n.buyEmptyStateTitle,
                      style: TextStyle(
                        fontSize: isMobile ? 22 : 28,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.gray900,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),

                    // Description
                    Text(
                      l10n.buyEmptyStateDescription,
                      style: TextStyle(
                        fontSize: isMobile ? 15 : 17,
                        color: AppTheme.gray600,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            // Show buy evaluations if user has some
            ...() {
              final buyRequests = _requests.where((e) => e.accion.toLowerCase().contains('comprar')).toList();
              return [
                // Results count
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    l10n.dashboardTotalResults(buyRequests.length),
                    style: TextStyle(fontSize: 14, color: Colors.grey[600], fontWeight: FontWeight.w500),
                  ),
                ),
                const SizedBox(height: 12),
                // Requests List
                ...buyRequests.map((request) => RequestCard(request: request)),
              ];
            }(),
          ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _handleBuySearch() {
    if (_buySearchController.text.trim().isNotEmpty) {
      // Mostrar modal de tipo de búsqueda
      setState(() {
        _pendingSearchText = _buySearchController.text.trim();
        _showSearchTypeModal = true;
      });
    }
  }

  void _handleDashboardSearch() {
    if (_dashboardSearchController.text.trim().isNotEmpty) {
      // Mostrar modal de tipo de búsqueda
      setState(() {
        _pendingSearchText = _dashboardSearchController.text.trim();
        _showSearchTypeModal = true;
      });
    }
  }

  /// Ejecutar búsqueda clásica (sin modal, directa)
  void _executeClassicSearch() {
    if (_pendingSearchText.isNotEmpty) {
      final searchText = Uri.encodeComponent(_pendingSearchText);
      context.go('${AppRoutes.appSearch}?q=$searchText');
    }
  }

  /// Ejecutar búsqueda inteligente (con IA)
  void _executeSmartSearch() {
    // En modo invitado, mostrar modal de registro
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      setState(() {
        _showSearchTypeModal = false;
      });
      // Pequeño delay para asegurar que el modal de opciones se cierre
      Future.delayed(const Duration(milliseconds: 100), () {
        if (mounted) {
          setState(() {
            _showRegistrationModal = true;
          });
        }
      });
      return;
    }

    // Usuario registrado: ejecutar búsqueda inteligente
    // TODO: Implementar búsqueda inteligente con IA
    if (_pendingSearchText.isNotEmpty) {
      final searchText = Uri.encodeComponent(_pendingSearchText);
      context.go('${AppRoutes.appSearch}?q=$searchText&type=smart');
    }
  }

  /// Ejecutar análisis de venta
  void _executeSalesAnalysis() {
    // En modo invitado, mostrar modal de registro
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      setState(() {
        _showSearchTypeModal = false;
      });
      // Pequeño delay para asegurar que el modal de opciones se cierre
      Future.delayed(const Duration(milliseconds: 100), () {
        if (mounted) {
          setState(() {
            _showRegistrationModal = true;
          });
        }
      });
      return;
    }

    // Usuario registrado: abrir formulario de venta
    // TODO: Implementar análisis de venta
    if (_pendingSearchText.isNotEmpty) {
      final searchText = Uri.encodeComponent(_pendingSearchText);
      context.go('${AppRoutes.appSell}?product=$searchText');
    }
  }

  /// Buy and Sell buttons (like monolito)
  Widget _buildBuySellButtons(dynamic l10n, bool isAuthenticated) {
    return Row(
      children: [
        // Buy button
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              if (_dashboardSearchController.text.trim().isEmpty) {
                context.go(AppRoutes.appBuy);
              } else {
                final searchText = Uri.encodeComponent(_dashboardSearchController.text.trim());
                context.go('${AppRoutes.appSearch}?q=$searchText');
              }
            },
            icon: const Icon(Icons.shopping_cart_outlined, size: 22),
            label: Text(l10n.commonBuy),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.primary600,
              side: const BorderSide(color: AppTheme.primary500),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(50),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Sell button
        Expanded(
          child: Opacity(
            opacity: isAuthenticated ? 1.0 : 0.6,
            child: OutlinedButton.icon(
              onPressed: () {
                if (!isAuthenticated) {
                  // Show registration modal
                  context.go(FeatureFlags.loginRoute);
                  return;
                }
                context.go(AppRoutes.appSell);
              },
              icon: const Icon(Icons.sell_outlined, size: 22),
              label: Text(l10n.commonSell),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF10B981),
                side: const BorderSide(color: Color(0xFF10B981)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(50),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Alerts section (like monolito)
  Widget _buildAlertsSection(dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.dashboardConfiguredAlerts,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.gray900),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              // Market alerts card
              _buildAlertCard(
                l10n.dashboardMarketAlertsDescription,
                onTap: () {
                  // TODO: Open plan modal
                },
              ),
              const SizedBox(width: 12),
              // Offer alerts card
              _buildAlertCard(
                l10n.dashboardOfferAlertsDescription,
                onTap: () {
                  // TODO: Open plan modal
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAlertCard(String description, {VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 280,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.gray200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          description,
          style: const TextStyle(fontSize: 13, color: AppTheme.gray600),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  /// Notifications section (like monolito)
  Widget _buildNotificationsSection(dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.dashboardNotifications,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.gray900),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.gray200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            l10n.dashboardNoNotifications,
            style: const TextStyle(fontSize: 14, color: AppTheme.gray600),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }

  /// Favorites section (like monolito)
  Widget _buildFavoritesSection(dynamic l10n, bool isAuthenticated) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.navFavorites,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.gray900),
        ),
        const SizedBox(height: 12),
        Opacity(
          opacity: isAuthenticated ? 1.0 : 0.6,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.gray200),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(
                  Icons.favorite_outline,
                  size: 48,
                  color: isAuthenticated ? AppTheme.gray400 : AppTheme.gray300,
                ),
                const SizedBox(height: 12),
                Text(
                  isAuthenticated ? l10n.dashboardNoFavorites : l10n.dashboardSignUpForFavorites,
                  style: const TextStyle(fontSize: 14, color: AppTheme.gray600),
                  textAlign: TextAlign.center,
                ),
                if (!isAuthenticated) ...[
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () => context.go(FeatureFlags.loginRoute),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary600,
                      side: const BorderSide(color: AppTheme.primary500),
                    ),
                    child: Text(l10n.authSignUp),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsSummary(dynamic l10n) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.evaluationSummary, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatCard(l10n.commonTotal, _requests.length.toString(), Colors.blue),
                _buildStatCard(l10n.evaluationSelling, _requests.where((e) => e.accion.contains('vender')).length.toString(), Colors.green),
                _buildStatCard(l10n.evaluationBuying, _requests.where((e) => e.accion.contains('comprar')).length.toString(), Colors.purple),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(30),
          ),
          child: Center(
            child: Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildFiltersAndSearch(dynamic l10n) {
    return Column(
      children: [
        TextField(
          decoration: InputDecoration(
            hintText: l10n.searchSearchProducts,
            prefixIcon: const Icon(Icons.search),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          onChanged: (value) => setState(() => _searchQuery = value),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip(label: l10n.searchAllPlatforms, selected: _currentFilter == AppPageFilter.dashboard, onSelected: () => setState(() => _currentFilter = AppPageFilter.dashboard), icon: Icons.all_inclusive),
              const SizedBox(width: 8),
              _buildFilterChip(label: l10n.commonBuy, selected: _currentFilter == AppPageFilter.buy, onSelected: () => setState(() => _currentFilter = AppPageFilter.buy), icon: Icons.shopping_cart_outlined),
              const SizedBox(width: 8),
              _buildFilterChip(label: l10n.commonSell, selected: _currentFilter == AppPageFilter.sell, onSelected: () => setState(() => _currentFilter = AppPageFilter.sell), icon: Icons.sell_outlined),
              const SizedBox(width: 8),
              _buildFilterChip(label: l10n.navFavorites, selected: _currentFilter == AppPageFilter.favorites, onSelected: () => setState(() => _currentFilter = AppPageFilter.favorites), icon: Icons.favorite, count: _favoritesService.count),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip({required String label, required bool selected, required VoidCallback onSelected, required IconData icon, int? count}) {
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 6),
          Text(label),
          if (count != null && count > 0) ...[
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: selected ? Colors.white : const Color(0xFF667EEA),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(count.toString(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: selected ? const Color(0xFF667EEA) : Colors.white)),
            ),
          ],
        ],
      ),
      selected: selected,
      onSelected: (_) => onSelected(),
      selectedColor: const Color(0xFF667EEA),
      checkmarkColor: Colors.white,
      labelStyle: TextStyle(color: selected ? Colors.white : Colors.grey[700]),
    );
  }

  /// Empty state for smart searches section (like monolito)
  Widget _buildEmptySmartSearchesSection(dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.dashboardSmartSearches,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.gray900),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.dashboardSmartSearchesDescription,
                  style: const TextStyle(fontSize: 14, color: AppTheme.gray700),
                ),
                const SizedBox(height: 16),
                // Search types explanation
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: AppTheme.primary100,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.search, size: 16, color: AppTheme.primary600),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(l10n.dashboardClassicSearch, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.gray900)),
                          Text(l10n.dashboardClassicSearchDescription, style: const TextStyle(fontSize: 13, color: AppTheme.gray600)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF9333EA), Color(0xFFEC4899)]),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.bolt, size: 16, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(l10n.dashboardIntelligentSearch, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.gray900)),
                          Text(l10n.dashboardIntelligentSearchDescription, style: const TextStyle(fontSize: 13, color: AppTheme.gray600)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // CTA button to go to Buy section
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => context.go(AppRoutes.appBuy),
                    icon: const Icon(Icons.shopping_cart_outlined),
                    label: Text(l10n.dashboardStartBuying),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary600,
                      side: const BorderSide(color: AppTheme.primary500),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Empty state for sales analysis section (like monolito)
  Widget _buildEmptySalesSection(dynamic l10n, bool isAuthenticated) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.dashboardSalesAnalysis,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.gray900),
        ),
        const SizedBox(height: 12),
        Opacity(
          opacity: isAuthenticated ? 1.0 : 0.6,
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.sell, size: 16, color: Color(0xFF10B981)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          l10n.dashboardSalesDescription,
                          style: const TextStyle(fontSize: 14, color: AppTheme.gray700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // CTA button to go to Sell section
                  SizedBox(
                    width: double.infinity,
                    child: isAuthenticated
                        ? OutlinedButton.icon(
                            onPressed: () => context.go(AppRoutes.appSell),
                            icon: const Icon(Icons.sell_outlined),
                            label: Text(l10n.dashboardStartSelling),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF10B981),
                              side: const BorderSide(color: Color(0xFF10B981)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          )
                        : OutlinedButton.icon(
                            onPressed: () => context.go(FeatureFlags.loginRoute),
                            icon: const Icon(Icons.lock_outline),
                            label: Text(l10n.dashboardSignUpToSell),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.gray500,
                              side: const BorderSide(color: AppTheme.gray300),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
