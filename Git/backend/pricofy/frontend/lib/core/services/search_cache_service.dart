/// Service for caching search results in memory.
///
/// Provides a 10-minute TTL cache to avoid duplicate API calls
/// when users navigate back or search for the same query.
library;

import '../models/search_result.dart';
import '../models/search_progress.dart';

/// Cached search data with timestamp for TTL checking.
class CachedSearch {
  final String searchId;
  final List<SearchResult> results;
  final SearchProgress? progress;
  final DateTime cachedAt;

  CachedSearch({
    required this.searchId,
    required this.results,
    this.progress,
    required this.cachedAt,
  });

  /// Check if this cached entry has expired.
  bool isExpired(Duration ttl) {
    return DateTime.now().difference(cachedAt) > ttl;
  }

  /// Get remaining TTL duration.
  Duration remainingTTL(Duration ttl) {
    final elapsed = DateTime.now().difference(cachedAt);
    final remaining = ttl - elapsed;
    return remaining.isNegative ? Duration.zero : remaining;
  }
}

/// In-memory cache service for search results.
///
/// Cache is keyed by normalized search text (lowercase, trimmed).
/// Entries expire after [cacheTTL] (default 10 minutes).
/// Maximum [maxCacheSize] entries are kept (LRU eviction).
class SearchCacheService {
  /// Default cache TTL: 10 minutes
  static const Duration cacheTTL = Duration(minutes: 10);

  /// Maximum number of cached searches
  static const int maxCacheSize = 10;

  /// Internal cache storage (insertion order preserved for LRU)
  final Map<String, CachedSearch> _cache = {};

  /// Normalize search text for consistent cache keys.
  String _normalizeKey(String searchText) {
    return searchText.toLowerCase().trim();
  }

  /// Cache search results.
  ///
  /// Overwrites any existing entry for the same search text.
  /// Evicts oldest entry (LRU) if cache exceeds [maxCacheSize].
  void cacheSearch(
    String searchText,
    String searchId,
    List<SearchResult> results,
    SearchProgress? progress,
  ) {
    final key = _normalizeKey(searchText);

    // Remove existing entry first (to update insertion order for LRU)
    _cache.remove(key);

    // Evict oldest entries if at capacity
    while (_cache.length >= maxCacheSize) {
      _cache.remove(_cache.keys.first);
    }

    _cache[key] = CachedSearch(
      searchId: searchId,
      results: List.from(results), // Create a copy to avoid mutations
      progress: progress,
      cachedAt: DateTime.now(),
    );
  }

  /// Get cached search results if not expired.
  ///
  /// Returns null if:
  /// - No cache entry exists for this search text
  /// - The cache entry has expired
  ///
  /// On cache hit, moves entry to end (LRU: most recently used last).
  CachedSearch? getCachedSearch(String searchText) {
    final key = _normalizeKey(searchText);
    final cached = _cache[key];

    if (cached == null) {
      return null;
    }

    // Check if expired
    if (cached.isExpired(cacheTTL)) {
      _cache.remove(key); // Clean up expired entry
      return null;
    }

    // Move to end (most recently used) for LRU
    _cache.remove(key);
    _cache[key] = cached;

    return cached;
  }

  /// Check if a valid (non-expired) cache entry exists.
  bool hasCachedSearch(String searchText) {
    return getCachedSearch(searchText) != null;
  }

  /// Invalidate cache for a specific search text.
  void invalidate(String searchText) {
    final key = _normalizeKey(searchText);
    _cache.remove(key);
  }

  /// Clear all cached searches.
  void clear() {
    _cache.clear();
  }

  /// Get the number of cached entries (for debugging).
  int get cacheSize => _cache.length;

  /// Clean up all expired entries.
  void cleanupExpired() {
    _cache.removeWhere((_, cached) => cached.isExpired(cacheTTL));
  }
}
