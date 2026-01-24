// Search Provider
//
// Manages search state across the app:
// - Submit search requests (public/private endpoints based on auth)
// - Poll for results asynchronously with incremental loading by scraper
// - Track search status and results
// - Client-side filtering, sorting, and virtual pagination
//
// All filtering, sorting, and pagination is done locally on the client.
// The backend simply returns all results without any server-side processing.

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:dio/dio.dart' show CancelToken, DioException, DioExceptionType;
import '../api/bff_api_client.dart';
import '../models/search_result.dart';
import '../models/search_filters.dart';
import '../models/sort_criteria.dart';
import '../models/search_progress.dart';
import '../models/filter_metadata.dart';
import '../filters/filters.dart';
import '../services/search_cache_service.dart';
import 'location_provider.dart';

enum SearchStatus {
  idle,       // No active search
  searching,  // Search submitted, waiting for results
  completed,  // Search completed with results
  error,      // Search failed
}

class SearchProvider extends ChangeNotifier {
  final BffApiClient _apiClient;
  final LocationProvider _locationProvider;
  final SearchCacheService _cacheService = SearchCacheService();

  SearchStatus _status = SearchStatus.idle;
  String? _searchId;
  String? _searchText;
  String? _error;
  bool _isPolling = false;
  CancelToken? _pollCancelToken;

  // All results from backend (unfiltered, unsorted)
  List<SearchResult> _allResults = [];

  // Scrapers already loaded (for incremental loading)
  final Set<String> _loadedScraperKeys = {};

  // Virtual pagination limit (how many filtered results to display)
  int _displayLimit = 20;

  // Scraper progress tracking
  SearchProgress? _progress;

  // View mode (cards or list)
  ViewMode _viewMode = ViewMode.cards;

  // Client-side filter and sort engines
  final FilterEngine _filterEngine = FilterEngine();
  final SortEngine _sortEngine = SortEngine();

  // Client-side search within results (instant filter)
  String _searchInResults = '';

  // Getters - basic
  SearchStatus get status => _status;
  String? get searchId => _searchId;
  String? get searchText => _searchText;
  String? get error => _error;
  bool get isSearching => _status == SearchStatus.searching;

  // Getters - scraper progress
  SearchProgress? get progress => _progress;

  /// Smoothed progress that interpolates between scraper completions.
  /// Takes into account the current state of active scrapers for smoother UX.
  double get smoothedProgressPercent {
    if (_progress == null) return 0.0;
    if (_progress!.isComplete) return 1.0;

    final baseProgress = _progress!.progressPercent;

    // Add micro-progress based on active scraper states
    double microProgress = 0.0;
    int activeTasks = 0;

    for (final task in _progress!.scraperTasks) {
      if (!task.status.isTerminal) {
        activeTasks++;
        microProgress += switch (task.status) {
          ScraperTaskStatus.pending => 0.0,
          ScraperTaskStatus.scraping => 0.3,
          ScraperTaskStatus.aggregating => 0.6,
          ScraperTaskStatus.enriching => 0.8,
          ScraperTaskStatus.translating => 0.9,
          ScraperTaskStatus.persisting => 0.95,
          _ => 0.0,
        };
      }
    }

    if (activeTasks == 0) return baseProgress;

    // Each active task contributes partial progress
    final taskWeight = 1.0 / _progress!.scrapersTotal;
    final extraProgress = (microProgress / activeTasks) * taskWeight * activeTasks;

    return (baseProgress + extraProgress).clamp(0.0, 1.0);
  }

  // Getters - view mode
  ViewMode get viewMode => _viewMode;

  // Getters - all results (raw)
  List<SearchResult> get allResults => List.unmodifiable(_allResults);
  int get totalResults => _allResults.length;
  bool get hasResults => _allResults.isNotEmpty;

  // Getters - filtered and sorted results (computed locally)
  List<SearchResult> get filteredResults {
    // 1. Apply text search filter if set
    if (_searchInResults.isNotEmpty) {
      _filterEngine.setFilter(TextSearchFilter(query: _searchInResults));
    } else {
      _filterEngine.removeFilter('text');
    }

    // 2. Apply filters
    var results = _filterEngine.apply(_allResults);

    // 3. Apply sorting or round-robin interleaving
    // When using default sort (relevance), use round-robin to mix platforms evenly
    // When user selects explicit sort (price, date, distance), use that
    if (!_sortEngine.hasActiveSorting) {
      // Default: round-robin interleave by platform
      results = _interleaveByPlatform(results);
    } else {
      // User selected explicit sort
      results = _sortEngine.apply(results);
    }

    return results;
  }

  // Getters - displayed results (virtual pagination)
  List<SearchResult> get displayedResults {
    final filtered = filteredResults;
    return filtered.length <= _displayLimit
        ? filtered
        : filtered.sublist(0, _displayLimit);
  }

  /// Results sorted by distance (nearest first), then limited
  /// Returns the N nearest results from ALL filtered results
  List<SearchResult> get displayedResultsByDistance {
    // Get filtered results (with filters applied, no default sort)
    final filtered = _getFilteredResultsWithoutSort();
    // Sort by distance (nulls last)
    final sorted = List<SearchResult>.from(filtered)
      ..sort((a, b) {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance!.compareTo(b.distance!);
      });
    // Apply limit
    return sorted.length <= _displayLimit
        ? sorted
        : sorted.sublist(0, _displayLimit);
  }

  /// Results sorted by price (cheapest first), then limited
  /// Returns the N cheapest results from ALL filtered results
  List<SearchResult> get displayedResultsByPrice {
    // Get filtered results (with filters applied, no default sort)
    final filtered = _getFilteredResultsWithoutSort();
    // Sort by price ascending
    final sorted = List<SearchResult>.from(filtered)
      ..sort((a, b) => a.price.compareTo(b.price));
    // Apply limit
    return sorted.length <= _displayLimit
        ? sorted
        : sorted.sublist(0, _displayLimit);
  }

  /// Helper: Get filtered results without applying default sort
  /// Used by displayedResultsByDistance and displayedResultsByPrice
  List<SearchResult> _getFilteredResultsWithoutSort() {
    // Apply text search filter if set
    if (_searchInResults.isNotEmpty) {
      _filterEngine.setFilter(TextSearchFilter(query: _searchInResults));
    } else {
      _filterEngine.removeFilter('text');
    }
    // Apply filters only (no sorting)
    return _filterEngine.apply(_allResults);
  }

  // Getters - backwards compatible with old API
  List<SearchResult> get results => displayedResults;

  // Getters - filter metadata (computed locally from all results)
  FilterMetadata get filterMetadata => _computeFilterMetadata();
  bool get hasFilterMetadata => _allResults.isNotEmpty;

  // Getters - pagination
  bool get hasMoreResults => filteredResults.length > _displayLimit;
  bool get isLoadingMore => false; // No async loading for virtual pagination
  int get filteredResultsCount => filteredResults.length;

  // Getters - filters
  SearchFilters get filters => _filterEngine.toSearchFilters();
  bool get hasActiveFilters => _filterEngine.hasActiveFilters || _searchInResults.isNotEmpty;
  int get activeFilterCount => _filterEngine.activeFilterCount + (_searchInResults.isNotEmpty ? 1 : 0);

  // Getters - sorting (multi-criteria)
  List<SortCriteria> get sortCriteria => _sortEngine.toSortCriteriaList();
  bool get hasActiveSorting => _sortEngine.hasActiveSorting;
  int get activeSortCount => _sortEngine.activeSortCount;
  // Backward compatibility: first sort criterion
  SortField get sortField => _sortEngine.primaryField;
  SortOrder get sortOrder => _sortEngine.primaryOrder;

  /// True if there are any active filters OR active sorting (non-default)
  bool get hasActiveFiltersOrSorting => hasActiveFilters || hasActiveSorting;

  // Getters - search in results
  String get searchInResults => _searchInResults;

  // Getters - display limit
  int get displayLimit => _displayLimit;

  // Getters - backwards compatible (computed from all results)
  List<String> get availableCountries {
    final countries = _allResults
        .map((r) => r.countryCode)
        .where((c) => c != null)
        .map((c) => c!.toUpperCase())
        .toSet()
        .toList();
    countries.sort();
    return countries;
  }

  List<String> get availablePlatforms {
    final platforms = _allResults
        .map((r) => r.platform.toLowerCase())
        .toSet()
        .toList();
    platforms.sort();
    return platforms;
  }

  (double, double) get priceRange {
    if (_allResults.isEmpty) return (0, 2000);
    final prices = _allResults.map((r) => r.price).toList();
    return (prices.reduce((a, b) => a < b ? a : b), prices.reduce((a, b) => a > b ? a : b));
  }

  (double, double) get distanceRange {
    final distances = _allResults
        .map((r) => r.distance)
        .where((d) => d != null)
        .map((d) => d!)
        .toList();
    if (distances.isEmpty) return (0, 500);
    return (distances.reduce((a, b) => a < b ? a : b), distances.reduce((a, b) => a > b ? a : b));
  }

  bool get hasDistanceData => _allResults.any((r) => r.distance != null);

  // Dynamic filter values from search results (platform-specific fields)
  List<String> get availableConditions {
    final conditions = _allResults
        .map((r) => r.condition)
        .where((c) => c != null && c.isNotEmpty)
        .map((c) => c!)
        .toSet()
        .toList();
    // Sort by condition quality order
    const conditionOrder = ['new', 'like_new', 'good', 'used', 'acceptable'];
    conditions.sort((a, b) {
      final aIdx = conditionOrder.indexOf(a);
      final bIdx = conditionOrder.indexOf(b);
      if (aIdx < 0 && bIdx < 0) return a.compareTo(b);
      if (aIdx < 0) return 1;
      if (bIdx < 0) return -1;
      return aIdx.compareTo(bIdx);
    });
    return conditions;
  }

  List<String> get availableBrands {
    final brands = _allResults
        .map((r) => r.brand)
        .where((b) => b != null && b.isNotEmpty)
        .map((b) => b!)
        .toSet()
        .toList();
    brands.sort();
    return brands;
  }

  List<String> get availableSizes {
    final sizes = _allResults
        .map((r) => r.size)
        .where((s) => s != null && s.isNotEmpty)
        .map((s) => s!)
        .toSet()
        .toList();
    // Keep original order (don't sort - sizes can be S, M, L, XL, or 38, 40, 42)
    return sizes;
  }

  SearchProvider({
    required BffApiClient apiClient,
    required LocationProvider locationProvider,
  })  : _apiClient = apiClient,
        _locationProvider = locationProvider {
    // Initialize with default sorting
    _sortEngine.resetToDefault();
  }

  /// Interleave results by platform+country (round-robin)
  /// This ensures a balanced mix of results from all sources
  /// instead of showing all results from one scraper first.
  /// Groups by "platform-country" (e.g., "vinted-ES", "vinted-FR")
  List<SearchResult> _interleaveByPlatform(List<SearchResult> results) {
    if (results.isEmpty) return results;

    // Group results by platform+country for finer granularity
    final Map<String, List<SearchResult>> bySource = {};
    for (final result in results) {
      final platform = result.platform.toLowerCase();
      final country = result.countryCode?.toUpperCase() ?? 'XX';
      final key = '$platform-$country';
      bySource.putIfAbsent(key, () => []).add(result);
    }

    // If only one source, return as-is
    if (bySource.length <= 1) return results;

    // Round-robin interleave
    final List<SearchResult> interleaved = [];
    final sources = bySource.keys.toList();
    final iterators = {
      for (final s in sources) s: 0,
    };

    // Keep going until all sources are exhausted
    bool hasMore = true;
    while (hasMore) {
      hasMore = false;
      for (final source in sources) {
        final list = bySource[source]!;
        final idx = iterators[source]!;
        if (idx < list.length) {
          interleaved.add(list[idx]);
          iterators[source] = idx + 1;
          hasMore = hasMore || (idx + 1 < list.length);
        }
      }
    }

    return interleaved;
  }

  /// Compute FilterMetadata locally from all results
  FilterMetadata _computeFilterMetadata() {
    if (_allResults.isEmpty) {
      return FilterMetadata.empty;
    }

    final prices = _allResults.map((r) => r.price).toList();
    final minPrice = prices.reduce((a, b) => a < b ? a : b);
    final maxPrice = prices.reduce((a, b) => a > b ? a : b);

    final platforms = _allResults
        .map((r) => r.platform.toLowerCase())
        .toSet()
        .toList();
    platforms.sort();

    final countries = _allResults
        .map((r) => r.countryCode)
        .where((c) => c != null)
        .map((c) => c!.toUpperCase())
        .toSet()
        .toList();
    countries.sort();

    final distances = _allResults
        .map((r) => r.distance)
        .where((d) => d != null)
        .map((d) => d!)
        .toList();

    return FilterMetadata(
      priceRange: PriceRange(min: minPrice, max: maxPrice),
      platforms: platforms,
      countries: countries,
      distanceRange: distances.isEmpty
          ? null
          : DistanceRange(
              min: distances.reduce((a, b) => a < b ? a : b),
              max: distances.reduce((a, b) => a > b ? a : b),
            ),
    );
  }

  /// Set view mode
  void setViewMode(ViewMode mode) {
    if (_viewMode != mode) {
      _viewMode = mode;
      // Adjust display limit based on view mode
      _displayLimit = mode == ViewMode.list ? 40 : 20;
      notifyListeners();
    }
  }

  /// Apply filters - instant, no API call
  Future<void> applyFilters(SearchFilters newFilters) async {
    _filterEngine.applyFromSearchFilters(newFilters, textQuery: _searchInResults);
    _displayLimit = _viewMode == ViewMode.list ? 40 : 20; // Reset virtual pagination
    notifyListeners();
  }

  /// Set filters without notifying (for UI state)
  void setFilters(SearchFilters newFilters) {
    _filterEngine.applyFromSearchFilters(newFilters, textQuery: _searchInResults);
    notifyListeners();
  }

  /// Clear all filters - instant, no API call
  Future<void> clearFilters() async {
    _filterEngine.clearAll();
    _searchInResults = '';
    _displayLimit = _viewMode == ViewMode.list ? 40 : 20; // Reset virtual pagination
    notifyListeners();
  }

  /// Set sort options - instant, no API call (single criterion - backward compatible)
  Future<void> setSortOrder(SortField field, SortOrder order) async {
    await setSortCriteria([SortCriteria(field: field, order: order)]);
  }

  /// Set multi-criteria sorting - instant, no API call
  Future<void> setSortCriteria(List<SortCriteria> criteria) async {
    if (criteria.isEmpty) {
      _sortEngine.resetToDefault();
    } else {
      _sortEngine.setFromSortCriteriaList(criteria);
    }
    _displayLimit = _viewMode == ViewMode.list ? 40 : 20; // Reset virtual pagination
    notifyListeners();
  }

  /// Add a sort criterion (max 2 criteria)
  Future<void> addSortCriterion(SortCriteria criterion) async {
    final current = sortCriteria;
    if (current.length >= 2) return; // Max 2 criteria
    if (current.any((c) => c.field == criterion.field)) return; // No duplicates

    final newCriteria = [...current, criterion];
    // Remove default relevance if adding a real criterion
    if (newCriteria.length > 1 && newCriteria.first.isDefault) {
      newCriteria.removeAt(0);
    }
    await setSortCriteria(newCriteria);
  }

  /// Remove a sort criterion by field
  Future<void> removeSortCriterion(SortField field) async {
    final newCriteria = sortCriteria.where((c) => c.field != field).toList();
    await setSortCriteria(newCriteria);
  }

  /// Toggle sort order for a criterion (or add if not present)
  Future<void> toggleSortCriterion(SortField field) async {
    final current = sortCriteria;
    final existingIndex = current.indexWhere((c) => c.field == field);
    if (existingIndex >= 0) {
      // Toggle order
      final existing = current[existingIndex];
      final newOrder = existing.order == SortOrder.asc ? SortOrder.desc : SortOrder.asc;
      final newCriteria = List<SortCriteria>.from(current);
      newCriteria[existingIndex] = existing.copyWith(order: newOrder);
      await setSortCriteria(newCriteria);
    } else {
      // Add with default asc order (except price which defaults to asc for "lowest first")
      await addSortCriterion(SortCriteria(
        field: field,
        order: field == SortField.price ? SortOrder.asc : SortOrder.desc,
      ));
    }
  }

  /// Clear all sorting (reset to default relevance)
  Future<void> clearSorting() async {
    await setSortCriteria([]);
  }

  /// Set search within results (client-side instant filter)
  void setSearchInResults(String query) {
    if (_searchInResults != query) {
      _searchInResults = query;
      _displayLimit = _viewMode == ViewMode.list ? 40 : 20; // Reset virtual pagination
      notifyListeners();
    }
  }

  /// Load more results (virtual pagination - just increase display limit)
  Future<void> loadMoreResults() async {
    if (!hasMoreResults) return;
    _displayLimit += _viewMode == ViewMode.list ? 40 : 20;
    notifyListeners();
  }

  /// Start a new search
  /// [userLanguage] is optional: the user's UI language (e.g., "en", "es") for variant translation.
  Future<void> startSearch(String text, {List<String>? sources, String? userLanguage}) async {
    if (text.trim().isEmpty) {
      _error = 'Search text cannot be empty';
      _status = SearchStatus.error;
      notifyListeners();
      return;
    }

    // Cancel any ongoing search/polling before starting a new one
    // This prevents race conditions where old polling updates stale UI
    if (_isPolling) {
      _isPolling = false;
      _pollCancelToken?.cancel('New search started');
      _pollCancelToken = null;
    }

    final normalized = text.trim();

    // Check cache first - avoid duplicate API calls for recent searches
    final cached = _cacheService.getCachedSearch(normalized);
    if (cached != null) {
      if (kDebugMode) {
        debugPrint('[SearchProvider] Cache hit for "$normalized" (${cached.results.length} results, TTL: ${cached.remainingTTL(SearchCacheService.cacheTTL).inMinutes}m)');
      }
      _searchId = cached.searchId;
      _searchText = normalized;
      _allResults = List.from(cached.results);
      _loadedScraperKeys.clear();
      _progress = cached.progress;
      _status = SearchStatus.completed;
      _error = null;
      _displayLimit = _viewMode == ViewMode.list ? 40 : 20;
      _searchInResults = '';
      _filterEngine.clearAll();
      _sortEngine.resetToDefault();
      notifyListeners();
      return; // No API call needed
    }

    // Clear previous search and reset all state
    _allResults = [];
    _loadedScraperKeys.clear();
    _error = null;
    _searchText = normalized;
    _status = SearchStatus.searching;
    _displayLimit = _viewMode == ViewMode.list ? 40 : 20;
    _searchInResults = '';
    _filterEngine.clearAll();
    _sortEngine.resetToDefault();
    _progress = null;
    notifyListeners();

    try {
      // Ensure location is detected before searching
      // This may show GPS permission dialog on first search and waits for user response
      await _locationProvider.ensureLocationDetected();

      if (kDebugMode) {
        debugPrint('[SearchProvider] Starting search: $_searchText (userLanguage: $userLanguage, country: ${_locationProvider.countryCode})');
      }

      final response = await _apiClient.submitSearch(
        searchText: _searchText!,
        sources: sources ?? [], // Empty = backend uses SSM config based on user country
        userLanguage: userLanguage,
        country: _locationProvider.countryCode,
        gps: _locationProvider.gpsForSearch,
      );

      _searchId = response['searchId'] as String?;

      if (_searchId == null) {
        throw Exception('No searchId returned from API');
      }

      // Parse scraperTasks from submit response (event-driven mode)
      // This allows frontend to display which scrapers will be used immediately
      final scraperTasksData = response['scraperTasks'] as List<dynamic>?;
      if (scraperTasksData != null && scraperTasksData.isNotEmpty) {
        final scraperTasks = scraperTasksData
            .map((t) => ScraperTaskTracking.fromJson(t as Map<String, dynamic>))
            .toList();
        _progress = SearchProgress(
          searchId: _searchId!,
          status: 'pending',
          searchText: _searchText!,
          scrapersTotal: scraperTasks.length,
          scrapersCompleted: 0,
          scrapersFailed: 0,
          scraperTasks: scraperTasks,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        // Notify immediately so UI can show scrapers
        notifyListeners();
        if (kDebugMode) {
          debugPrint('[SearchProvider] Search submitted with ${scraperTasks.length} scraperTasks');
        }
      }

      if (kDebugMode) {
        debugPrint('[SearchProvider] Search submitted, ID: $_searchId');
      }

      // Start polling for results with incremental loading
      await _pollForResults();

    } catch (e) {
      if (kDebugMode) {
        debugPrint('[SearchProvider] Search error: $e');
      }
      _error = e.toString();
      _status = SearchStatus.error;
      notifyListeners();
    }
  }

  /// Poll for search results with incremental loading by scraper
  Future<void> _pollForResults() async {
    if (_searchId == null || _isPolling) return;

    _isPolling = true;
    _pollCancelToken = CancelToken();

    const maxAttempts = 60;  // 60 attempts x 2s = 2 minutes max
    const pollDelay = Duration(seconds: 2);

    for (var attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if polling was cancelled (new search started or user left view)
      if (!_isPolling) {
        if (kDebugMode) {
          debugPrint('[SearchProvider] Polling cancelled');
        }
        return; // Exit completely, don't update state
      }

      if (_status != SearchStatus.searching) {
        // Search was cancelled or errored out
        break;
      }

      try {
        if (kDebugMode) {
          debugPrint('[SearchProvider] Polling attempt ${attempt + 1}/$maxAttempts');
        }

        // 1. Get lightweight status for progress tracking
        final statusResponse = await _apiClient.getStatus(_searchId!, cancelToken: _pollCancelToken);
        _progress = SearchProgress.fromJson(statusResponse);

        if (kDebugMode) {
          debugPrint('[SearchProvider] Progress: ${_progress!.scrapersCompleted}/${_progress!.scrapersTotal} scrapers');
        }

        // 2. Detect newly completed scrapers
        final newlyCompletedScrapers = <String>[];
        for (final task in _progress!.scraperTasks) {
          if (task.status == ScraperTaskStatus.completed) {
            final key = '${task.scraper}-${task.country}';
            if (!_loadedScraperKeys.contains(key)) {
              newlyCompletedScrapers.add(task.scraper);
              _loadedScraperKeys.add(key);
            }
          }
        }

        // 3. Load results from newly completed scrapers
        if (newlyCompletedScrapers.isNotEmpty) {
          final uniqueScrapers = newlyCompletedScrapers.toSet().toList();
          await _loadResultsFromScrapers(uniqueScrapers, cancelToken: _pollCancelToken);
        }

        // 4. Check if search is complete
        if (_progress!.isComplete) {
          _status = SearchStatus.completed;

          // Save to cache for future quick access (10 min TTL)
          if (_searchText != null && _searchId != null) {
            _cacheService.cacheSearch(
              _searchText!,
              _searchId!,
              _allResults,
              _progress,
            );
            if (kDebugMode) {
              debugPrint('[SearchProvider] Cached "$_searchText" with ${_allResults.length} results');
            }
          }

          if (kDebugMode) {
            debugPrint('[SearchProvider] Search completed with ${_allResults.length} total results');
          }

          notifyListeners();
          break;

        } else if (_progress!.hasFailed) {
          _error = 'Search failed';
          _status = SearchStatus.error;
          notifyListeners();
          break;

        } else {
          // Still processing, notify for progress update
          notifyListeners();
        }

        // Wait before next poll
        await Future.delayed(pollDelay);

        // Check again after delay in case polling was cancelled during wait
        if (!_isPolling) {
          if (kDebugMode) {
            debugPrint('[SearchProvider] Polling cancelled during delay');
          }
          return;
        }

      } on DioException catch (e) {
        if (e.type == DioExceptionType.cancel) {
          if (kDebugMode) {
            debugPrint('[SearchProvider] Polling cancelled by CancelToken');
          }
          return;
        }
        if (kDebugMode) {
          debugPrint('[SearchProvider] Polling error: $e');
        }
        // Don't fail immediately on polling error, try again
        await Future.delayed(pollDelay);

        // Check after error delay too
        if (!_isPolling) {
          if (kDebugMode) {
            debugPrint('[SearchProvider] Polling cancelled during error delay');
          }
          return;
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('[SearchProvider] Polling error: $e');
        }
        // Don't fail immediately on polling error, try again
        await Future.delayed(pollDelay);

        // Check after error delay too
        if (!_isPolling) {
          if (kDebugMode) {
            debugPrint('[SearchProvider] Polling cancelled during error delay');
          }
          return;
        }
      }
    }

    // If we exhausted all attempts without completing
    if (_status == SearchStatus.searching) {
      // Don't fail - show partial results from scrapers that did complete
      // Mark as completed with a warning if we have any results
      if (_allResults.isNotEmpty) {
        _status = SearchStatus.completed;

        // Cache partial results so user doesn't lose them
        if (_searchText != null && _searchId != null) {
          _cacheService.cacheSearch(
            _searchText!,
            _searchId!,
            _allResults,
            _progress,
          );
          if (kDebugMode) {
            debugPrint('[SearchProvider] Search timed out but showing ${_allResults.length} partial results from ${_loadedScraperKeys.length} scrapers (cached)');
          }
        }
      } else {
        // Only error if we got nothing at all
        _error = 'Search timed out with no results. Please try again.';
        _status = SearchStatus.error;
        if (kDebugMode) {
          debugPrint('[SearchProvider] Search timed out with no results');
        }
      }
      notifyListeners();
    }

    _isPolling = false;
  }

  /// Load results from specific scrapers (incremental loading)
  Future<void> _loadResultsFromScrapers(List<String> scrapers, {CancelToken? cancelToken}) async {
    if (_searchId == null) return;

    try {
      if (kDebugMode) {
        debugPrint('[SearchProvider] Loading results from scrapers: $scrapers');
      }

      final response = await _apiClient.getResults(_searchId!, scrapers: scrapers, cancelToken: cancelToken);

      final resultsData = response['results'] as List<dynamic>? ?? [];
      final newResults = resultsData
          .map((json) => SearchResult.fromJson(json as Map<String, dynamic>))
          .toList();

      // Add to _allResults (dedup by ID)
      final existingIds = _allResults.map((r) => r.id).toSet();
      for (final result in newResults) {
        if (!existingIds.contains(result.id)) {
          _allResults.add(result);
          existingIds.add(result.id);
        }
      }

      if (kDebugMode) {
        debugPrint('[SearchProvider] Added ${newResults.length} results, total: ${_allResults.length}');
      }

      notifyListeners();

    } catch (e) {
      if (kDebugMode) {
        debugPrint('[SearchProvider] Error loading results from scrapers: $e');
      }
      // Don't fail, just continue polling
    }
  }

  /// Cancel ongoing search
  void cancelSearch() {
    _status = SearchStatus.idle;
    _isPolling = false;
    _pollCancelToken?.cancel('Search cancelled by user');
    _pollCancelToken = null;
    notifyListeners();
  }

  /// Clear search results and reset state
  void clearSearch() {
    _status = SearchStatus.idle;
    _searchId = null;
    _searchText = null;
    _allResults = [];
    _loadedScraperKeys.clear();
    _error = null;
    _isPolling = false;
    _pollCancelToken?.cancel('Search cleared');
    _pollCancelToken = null;
    _displayLimit = _viewMode == ViewMode.list ? 40 : 20;
    _searchInResults = '';
    _filterEngine.clearAll();
    _sortEngine.resetToDefault();
    _progress = null;
    notifyListeners();
  }

  /// Resume polling for an existing search (e.g., after navigation)
  Future<void> resumeSearch(String searchId) async {
    if (_isPolling) return;

    _searchId = searchId;
    _status = SearchStatus.searching;
    notifyListeners();

    await _pollForResults();
  }

  /// Force refresh the current search, bypassing cache
  Future<void> refreshSearch({String? userLanguage}) async {
    if (_searchText == null) return;

    final text = _searchText!;
    _cacheService.invalidate(text);

    if (kDebugMode) {
      debugPrint('[SearchProvider] Refresh search: invalidated cache for "$text"');
    }

    await startSearch(text, userLanguage: userLanguage);
  }

  // ========================================
  // Deprecated getters for backward compatibility
  // ========================================

  /// @deprecated Use displayLimit instead
  int get pageSize => _displayLimit;

  /// @deprecated Not used with client-side filtering
  bool get isApplyingFilters => false;

  /// @deprecated Use setViewMode and displayLimit instead
  void setPageSize(int size) {
    if (size > 0 && size != _displayLimit) {
      _displayLimit = size;
      notifyListeners();
    }
  }
}
