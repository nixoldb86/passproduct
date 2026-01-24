import 'package:flutter_test/flutter_test.dart';
import 'package:pricofy_front_flutter/core/filters/filters.dart';
import 'package:pricofy_front_flutter/core/models/search_result.dart';
import 'package:pricofy_front_flutter/core/models/search_filters.dart';

void main() {
  // Test data
  final results = [
    SearchResult(
      id: '1',
      title: 'iPhone 12',
      price: 500,
      url: 'https://example.com/1',
      platform: 'wallapop',
      countryCode: 'ES',
      distance: 10,
    ),
    SearchResult(
      id: '2',
      title: 'iPhone 13',
      price: 700,
      url: 'https://example.com/2',
      platform: 'milanuncios',
      countryCode: 'ES',
      distance: 25,
    ),
    SearchResult(
      id: '3',
      title: 'Samsung Galaxy',
      price: 300,
      url: 'https://example.com/3',
      platform: 'wallapop',
      countryCode: 'FR',
      distance: 50,
    ),
    SearchResult(
      id: '4',
      title: 'Google Pixel',
      price: 450,
      url: 'https://example.com/4',
      platform: 'vinted',
      countryCode: 'IT',
      distance: null,
    ),
    SearchResult(
      id: '5',
      title: 'Cheap phone',
      price: 50,
      url: 'https://example.com/5',
      platform: 'milanuncios',
      countryCode: 'ES',
      distance: 5,
    ),
  ];

  group('PriceRangeFilter', () {
    test('filters by minimum price', () {
      final filter = PriceRangeFilter(min: 400);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 3);
      expect(filtered.every((r) => r.price >= 400), true);
    });

    test('filters by maximum price', () {
      final filter = PriceRangeFilter(max: 500);

      final filtered = results.where((r) => filter.matches(r)).toList();

      // Results with price <= 500: 500, 300, 450, 50 = 4 items
      expect(filtered.length, 4);
      expect(filtered.every((r) => r.price <= 500), true);
    });

    test('filters by price range', () {
      final filter = PriceRangeFilter(min: 300, max: 500);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 3);
      expect(filtered.map((r) => r.id).toSet(), {'1', '3', '4'});
    });

    test('isActive returns false when no constraints', () {
      final filter = PriceRangeFilter();
      expect(filter.isActive, false);
    });

    test('isActive returns true with min constraint', () {
      final filter = PriceRangeFilter(min: 100);
      expect(filter.isActive, true);
    });
  });

  group('DistanceFilter', () {
    test('filters by max distance', () {
      final filter = DistanceFilter(maxDistance: 20);

      final filtered = results.where((r) => filter.matches(r)).toList();

      // Should include only items with distance <= 20 (excludes null distance)
      expect(filtered.length, 2);
      expect(filtered.map((r) => r.id).toSet(), {'1', '5'});
    });

    test('excludes results with null distance when filter is active', () {
      final filter = DistanceFilter(maxDistance: 10);
      final result = results.firstWhere((r) => r.id == '4'); // has null distance

      expect(filter.matches(result), false);
    });

    test('isActive returns false when no constraint', () {
      final filter = DistanceFilter();
      expect(filter.isActive, false);
    });
  });

  group('PlatformFilter', () {
    test('filters by single platform', () {
      final filter = PlatformFilter.fromList(['wallapop']);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 2);
      expect(filtered.every((r) => r.platform == 'wallapop'), true);
    });

    test('filters by multiple platforms', () {
      final filter = PlatformFilter.fromList(['wallapop', 'vinted']);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 3);
    });

    test('is case insensitive', () {
      final filter = PlatformFilter.fromList(['WALLAPOP', 'Milanuncios']);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 4);
    });

    test('empty filter passes all results', () {
      final filter = PlatformFilter();

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, results.length);
    });

    test('add and remove platforms', () {
      var filter = PlatformFilter();
      expect(filter.isActive, false);

      filter = filter.add('wallapop');
      expect(filter.isActive, true);
      expect(filter.platforms.contains('wallapop'), true);

      filter = filter.add('vinted');
      expect(filter.platforms.length, 2);

      filter = filter.remove('wallapop');
      expect(filter.platforms.length, 1);
      expect(filter.platforms.contains('wallapop'), false);
    });
  });

  group('CountryFilter', () {
    test('filters by single country', () {
      final filter = CountryFilter.fromList(['ES']);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 3);
      expect(filtered.every((r) => r.countryCode == 'ES'), true);
    });

    test('filters by multiple countries', () {
      final filter = CountryFilter.fromList(['ES', 'FR']);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 4);
    });

    test('is case insensitive', () {
      final filter = CountryFilter.fromList(['es', 'fr']);

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 4);
    });
  });

  group('TextSearchFilter', () {
    test('filters by title match', () {
      final filter = TextSearchFilter(query: 'iPhone');

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 2);
    });

    test('is case insensitive', () {
      final filter = TextSearchFilter(query: 'IPHONE');

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, 2);
    });

    test('empty query passes all results', () {
      final filter = TextSearchFilter(query: '');

      final filtered = results.where((r) => filter.matches(r)).toList();

      expect(filtered.length, results.length);
    });
  });

  group('FilterEngine', () {
    test('applies multiple filters with AND logic', () {
      final engine = FilterEngine();
      engine.setFilter(PriceRangeFilter(min: 300));
      engine.setFilter(PlatformFilter.fromList(['wallapop']));

      final filtered = engine.apply(results);

      // Should match: price >= 300 AND platform = wallapop
      expect(filtered.length, 2);
      expect(filtered.map((r) => r.id).toSet(), {'1', '3'});
    });

    test('empty filters returns all results', () {
      final engine = FilterEngine();

      final filtered = engine.apply(results);

      expect(filtered.length, results.length);
    });

    test('setFilter replaces existing filter of same type', () {
      final engine = FilterEngine();
      engine.setFilter(PriceRangeFilter(min: 100));
      engine.setFilter(PriceRangeFilter(min: 500));

      expect(engine.activeFilterCount, 1);

      final filtered = engine.apply(results);
      expect(filtered.every((r) => r.price >= 500), true);
    });

    test('removeFilter removes filter', () {
      final engine = FilterEngine();
      engine.setFilter(PriceRangeFilter(min: 500));
      engine.setFilter(PlatformFilter.fromList(['wallapop']));

      expect(engine.activeFilterCount, 2);

      engine.removeFilter('price');
      expect(engine.activeFilterCount, 1);

      final filtered = engine.apply(results);
      expect(filtered.length, 2); // Only platform filter active
    });

    test('clearAll removes all filters', () {
      final engine = FilterEngine();
      engine.setFilter(PriceRangeFilter(min: 500));
      engine.setFilter(PlatformFilter.fromList(['wallapop']));

      engine.clearAll();

      expect(engine.hasActiveFilters, false);
      expect(engine.apply(results).length, results.length);
    });

    test('applyFromSearchFilters works correctly', () {
      final engine = FilterEngine();
      engine.applyFromSearchFilters(
        SearchFilters(
          minPrice: 400,
          maxPrice: 700,
          platforms: ['wallapop', 'milanuncios'],
          countries: ['ES'],
        ),
      );

      final filtered = engine.apply(results);

      // Price 400-700, platforms wallapop/milanuncios, country ES
      expect(filtered.length, 2);
      expect(filtered.map((r) => r.id).toSet(), {'1', '2'});
    });

    test('toSearchFilters converts back correctly', () {
      final engine = FilterEngine();
      engine.setFilter(PriceRangeFilter(min: 100, max: 500));
      engine.setFilter(DistanceFilter(maxDistance: 50));
      engine.setFilter(PlatformFilter.fromList(['wallapop']));
      engine.setFilter(CountryFilter.fromList(['ES', 'FR']));

      final filters = engine.toSearchFilters();

      expect(filters.minPrice, 100);
      expect(filters.maxPrice, 500);
      expect(filters.maxDistance, 50);
      expect(filters.platforms, ['wallapop']);
      expect(filters.countries.toSet(), {'ES', 'FR'});
    });
  });
}
