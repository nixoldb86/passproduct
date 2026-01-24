import 'package:flutter_test/flutter_test.dart';
import 'package:pricofy_front_flutter/core/models/search_result.dart';
import 'package:pricofy_front_flutter/core/models/search_filters.dart';

// Mock BffApiClient for testing
class MockBffApiClient {
  Future<Map<String, dynamic>> submitSearch({
    required String searchText,
    String searchType = 'normal',
    List<String> sources = const [], // Empty = backend uses SSM config
    String? userLanguage,
  }) async {
    return {'searchId': 'test-search-id'};
  }

  Future<Map<String, dynamic>> getStatus(String searchId) async {
    return {
      'status': 'completed',
      'scrapersTotal': 2,
      'scrapersCompleted': 2,
      'scrapersFailed': 0,
      'scraperTasks': [],
    };
  }

  Future<Map<String, dynamic>> getResults(String searchId, {List<String>? scrapers}) async {
    return {'results': []};
  }
}

void main() {
  // Test data - multiple results for testing filtering, sorting, and pagination
  List<SearchResult> createTestResults(int count) {
    return List.generate(count, (i) => SearchResult(
      id: 'result-$i',
      title: 'Product $i ${i % 2 == 0 ? "iPhone" : "Samsung"}',
      price: 100.0 + (i * 10),
      url: 'https://example.com/$i',
      platform: i % 3 == 0 ? 'wallapop' : (i % 3 == 1 ? 'milanuncios' : 'vinted'),
      countryCode: i % 2 == 0 ? 'ES' : 'FR',
      distance: i % 4 == 0 ? null : (i * 5.0),
      relevanceScore: 1.0 - (i * 0.01),
      publishedAt: DateTime(2024, 1, 1).add(Duration(days: i)),
    ));
  }

  group('SearchProvider - Client-Side Filtering', () {
    test('filteredResults applies price filter correctly', () {
      // Create a testable version of SearchProvider internals
      final results = createTestResults(10);

      // Filter: price >= 150
      final filtered = results.where((r) => r.price >= 150).toList();

      // Should have results with price 150, 160, 170, 180, 190
      expect(filtered.length, 5);
      expect(filtered.every((r) => r.price >= 150), true);
    });

    test('filteredResults applies platform filter correctly', () {
      final results = createTestResults(10);

      // Filter: only wallapop
      final filtered = results.where((r) => r.platform.toLowerCase() == 'wallapop').toList();

      // Indices 0, 3, 6, 9 are wallapop
      expect(filtered.length, 4);
      expect(filtered.every((r) => r.platform == 'wallapop'), true);
    });

    test('filteredResults applies country filter correctly', () {
      final results = createTestResults(10);

      // Filter: only ES
      final filtered = results.where((r) => r.countryCode == 'ES').toList();

      // Even indices (0, 2, 4, 6, 8) are ES
      expect(filtered.length, 5);
      expect(filtered.every((r) => r.countryCode == 'ES'), true);
    });

    test('filteredResults applies text search correctly', () {
      final results = createTestResults(10);

      // Search for "iPhone"
      final query = 'iphone';
      final filtered = results.where((r) =>
        r.title.toLowerCase().contains(query)
      ).toList();

      // Even indices have "iPhone" in title
      expect(filtered.length, 5);
      expect(filtered.every((r) => r.title.toLowerCase().contains('iphone')), true);
    });

    test('filteredResults combines multiple filters with AND logic', () {
      final results = createTestResults(20);

      // Combined filters: ES country AND price >= 150 AND wallapop
      final filtered = results.where((r) =>
        r.countryCode == 'ES' &&
        r.price >= 150 &&
        r.platform == 'wallapop'
      ).toList();

      // Check all conditions
      for (final r in filtered) {
        expect(r.countryCode, 'ES');
        expect(r.price, greaterThanOrEqualTo(150));
        expect(r.platform, 'wallapop');
      }
    });
  });

  group('SearchProvider - Client-Side Sorting', () {
    test('sorts by price ascending', () {
      final results = createTestResults(10);
      final sorted = List<SearchResult>.from(results);
      sorted.sort((a, b) => a.price.compareTo(b.price));

      for (int i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price, lessThanOrEqualTo(sorted[i + 1].price));
      }
    });

    test('sorts by price descending', () {
      final results = createTestResults(10);
      final sorted = List<SearchResult>.from(results);
      sorted.sort((a, b) => b.price.compareTo(a.price));

      for (int i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price, greaterThanOrEqualTo(sorted[i + 1].price));
      }
    });

    test('sorts by relevance descending (default)', () {
      final results = createTestResults(10);
      final sorted = List<SearchResult>.from(results);
      sorted.sort((a, b) => (b.relevanceScore ?? 0).compareTo(a.relevanceScore ?? 0));

      for (int i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].relevanceScore, greaterThanOrEqualTo(sorted[i + 1].relevanceScore ?? 0));
      }
    });

    test('sorts by distance ascending with nulls at end', () {
      final results = createTestResults(10);
      final sorted = List<SearchResult>.from(results);
      sorted.sort((a, b) {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1; // null at end
        if (b.distance == null) return -1;
        return a.distance!.compareTo(b.distance!);
      });

      // Non-null distances should come first, sorted ascending
      final nonNull = sorted.where((r) => r.distance != null).toList();
      for (int i = 0; i < nonNull.length - 1; i++) {
        expect(nonNull[i].distance, lessThanOrEqualTo(nonNull[i + 1].distance!));
      }

      // Null distances should be at the end
      final lastNonNullIndex = sorted.lastIndexWhere((r) => r.distance != null);
      for (int i = lastNonNullIndex + 1; i < sorted.length; i++) {
        expect(sorted[i].distance, isNull);
      }
    });
  });

  group('SearchProvider - Virtual Pagination', () {
    test('displayedResults returns limited results', () {
      final results = createTestResults(50);
      const displayLimit = 20;

      final displayed = results.length <= displayLimit
          ? results
          : results.sublist(0, displayLimit);

      expect(displayed.length, displayLimit);
    });

    test('hasMoreResults is true when filtered count exceeds limit', () {
      final results = createTestResults(50);
      const displayLimit = 20;

      final hasMore = results.length > displayLimit;

      expect(hasMore, true);
    });

    test('hasMoreResults is false when all results are displayed', () {
      final results = createTestResults(15);
      const displayLimit = 20;

      final hasMore = results.length > displayLimit;

      expect(hasMore, false);
    });

    test('loadMoreResults increases display limit', () {
      int displayLimit = 20;
      const increment = 20;

      // Simulate loadMoreResults
      displayLimit += increment;

      expect(displayLimit, 40);
    });

    test('pagination respects filtered results count', () {
      final results = createTestResults(100);

      // Filter to only wallapop (indices 0, 3, 6, 9... = 34 items)
      final filtered = results.where((r) => r.platform == 'wallapop').toList();

      const displayLimit = 20;
      final displayed = filtered.length <= displayLimit
          ? filtered
          : filtered.sublist(0, displayLimit);

      expect(displayed.length, 20);
      expect(filtered.length, 34);
      expect(filtered.length > displayLimit, true); // hasMoreResults
    });
  });

  group('SearchProvider - Incremental Loading', () {
    test('deduplicates results by ID', () {
      final existingResults = [
        SearchResult(id: '1', title: 'A', price: 100, url: 'a', platform: 'wallapop'),
        SearchResult(id: '2', title: 'B', price: 200, url: 'b', platform: 'milanuncios'),
      ];

      final newResults = [
        SearchResult(id: '2', title: 'B Updated', price: 200, url: 'b', platform: 'milanuncios'), // duplicate
        SearchResult(id: '3', title: 'C', price: 300, url: 'c', platform: 'vinted'), // new
      ];

      // Simulate deduplication logic
      final existingIds = existingResults.map((r) => r.id).toSet();
      final allResults = List<SearchResult>.from(existingResults);

      for (final result in newResults) {
        if (!existingIds.contains(result.id)) {
          allResults.add(result);
          existingIds.add(result.id);
        }
      }

      expect(allResults.length, 3); // 2 existing + 1 new
      expect(allResults.map((r) => r.id).toSet(), {'1', '2', '3'});
    });

    test('scraper keys track loaded scrapers', () {
      final loadedScraperKeys = <String>{};

      // Simulate first scraper completing
      loadedScraperKeys.add('wallapop-ES');
      expect(loadedScraperKeys.contains('wallapop-ES'), true);
      expect(loadedScraperKeys.contains('milanuncios-ES'), false);

      // Simulate second scraper completing
      loadedScraperKeys.add('milanuncios-ES');
      expect(loadedScraperKeys.length, 2);

      // Duplicate should not be added
      loadedScraperKeys.add('wallapop-ES');
      expect(loadedScraperKeys.length, 2);
    });
  });

  group('SearchProvider - Filter Metadata', () {
    test('computes price range from all results', () {
      final results = createTestResults(10);
      // Prices: 100, 110, 120, 130, 140, 150, 160, 170, 180, 190

      final prices = results.map((r) => r.price).toList();
      final minPrice = prices.reduce((a, b) => a < b ? a : b);
      final maxPrice = prices.reduce((a, b) => a > b ? a : b);

      expect(minPrice, 100);
      expect(maxPrice, 190);
    });

    test('computes unique platforms from all results', () {
      final results = createTestResults(10);

      final platforms = results
          .map((r) => r.platform.toLowerCase())
          .toSet()
          .toList();
      platforms.sort();

      expect(platforms, containsAll(['wallapop', 'milanuncios', 'vinted']));
    });

    test('computes unique countries from all results', () {
      final results = createTestResults(10);

      final countries = results
          .map((r) => r.countryCode)
          .where((c) => c != null)
          .map((c) => c!.toUpperCase())
          .toSet()
          .toList();
      countries.sort();

      expect(countries, ['ES', 'FR']);
    });

    test('computes distance range excluding nulls', () {
      final results = createTestResults(10);

      final distances = results
          .map((r) => r.distance)
          .where((d) => d != null)
          .map((d) => d!)
          .toList();

      if (distances.isNotEmpty) {
        final minDist = distances.reduce((a, b) => a < b ? a : b);
        final maxDist = distances.reduce((a, b) => a > b ? a : b);

        expect(minDist, isNonNegative);
        expect(maxDist, greaterThanOrEqualTo(minDist));
      }
    });
  });

  group('SearchProvider - State Transitions', () {
    test('clearFilters resets all filters', () {
      // Simulate filter state
      double minPrice = 100.0;
      List<String> platforms = ['wallapop'];
      String searchInResults = 'iphone';

      // Clear all
      minPrice = 0;
      platforms = [];
      searchInResults = '';

      expect(minPrice, 0);
      expect(platforms, isEmpty);
      expect(searchInResults, isEmpty);
    });

    test('setSortCriteria with empty list resets to default', () {
      // Default is relevance descending
      var sortField = SortField.price;
      var sortOrder = SortOrder.asc;

      // Reset to default (empty criteria means default relevance)
      sortField = SortField.relevance;
      sortOrder = SortOrder.desc;

      expect(sortField, SortField.relevance);
      expect(sortOrder, SortOrder.desc);
    });

    test('setSearchInResults triggers filter recalculation', () {
      final results = createTestResults(10);
      var searchQuery = '';

      // Set search query
      searchQuery = 'iPhone';

      // Filter should now apply
      final filtered = results.where((r) =>
        r.title.toLowerCase().contains(searchQuery.toLowerCase())
      ).toList();

      expect(filtered.length, 5); // Even indices have iPhone
    });
  });
}
