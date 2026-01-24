import 'package:flutter_test/flutter_test.dart';
import 'package:pricofy_front_flutter/core/filters/filters.dart';
import 'package:pricofy_front_flutter/core/models/search_result.dart';
import 'package:pricofy_front_flutter/core/models/search_filters.dart';
import 'package:pricofy_front_flutter/core/models/sort_criteria.dart';

void main() {
  // Test data
  final results = [
    SearchResult(
      id: '1',
      title: 'iPhone 12',
      price: 500,
      url: 'https://example.com/1',
      platform: 'wallapop',
      relevanceScore: 0.9,
      distance: 10,
      publishedAt: DateTime(2024, 1, 15),
    ),
    SearchResult(
      id: '2',
      title: 'iPhone 13',
      price: 700,
      url: 'https://example.com/2',
      platform: 'milanuncios',
      relevanceScore: 0.7,
      distance: 25,
      publishedAt: DateTime(2024, 1, 10),
    ),
    SearchResult(
      id: '3',
      title: 'Samsung Galaxy',
      price: 300,
      url: 'https://example.com/3',
      platform: 'wallapop',
      relevanceScore: 0.8,
      distance: 50,
      publishedAt: DateTime(2024, 1, 20),
    ),
    SearchResult(
      id: '4',
      title: 'Google Pixel',
      price: 450,
      url: 'https://example.com/4',
      platform: 'vinted',
      relevanceScore: 0.6,
      distance: null,
      publishedAt: DateTime(2024, 1, 5),
    ),
    SearchResult(
      id: '5',
      title: 'Cheap phone',
      price: 50,
      url: 'https://example.com/5',
      platform: 'milanuncios',
      relevanceScore: 0.5,
      distance: 5,
      publishedAt: null,
    ),
  ];

  group('PriceComparator', () {
    test('compares prices correctly', () {
      final comparator = PriceComparator();

      expect(comparator.compare(results[0], results[1]), lessThan(0)); // 500 < 700
      expect(comparator.compare(results[1], results[0]), greaterThan(0)); // 700 > 500
      expect(comparator.compare(results[0], results[0]), 0); // 500 == 500
    });
  });

  group('DateComparator', () {
    test('compares dates correctly', () {
      final comparator = DateComparator();

      // result[2] (Jan 20) > result[0] (Jan 15) > result[1] (Jan 10)
      expect(comparator.compare(results[2], results[0]), greaterThan(0));
      expect(comparator.compare(results[0], results[1]), greaterThan(0));
    });

    test('handles null dates', () {
      final comparator = DateComparator();

      // result[4] has null date, treated as epoch
      expect(comparator.compare(results[0], results[4]), greaterThan(0));
    });
  });

  group('DistanceComparator', () {
    test('compares distances correctly', () {
      final comparator = DistanceComparator();

      expect(comparator.compare(results[0], results[1]), lessThan(0)); // 10 < 25
      expect(comparator.compare(results[2], results[0]), greaterThan(0)); // 50 > 10
    });

    test('null distances sort to end', () {
      final comparator = DistanceComparator();

      // result[3] has null distance
      expect(comparator.compare(results[0], results[3]), lessThan(0)); // 10 < null
      expect(comparator.compare(results[3], results[0]), greaterThan(0)); // null > 10
    });
  });

  group('RelevanceComparator', () {
    test('compares relevance correctly (higher is better)', () {
      final comparator = RelevanceComparator();

      // Higher relevance should sort first (comparator returns negative for higher first)
      expect(comparator.compare(results[0], results[1]), lessThan(0)); // 0.9 > 0.7
      expect(comparator.compare(results[1], results[0]), greaterThan(0));
    });
  });

  group('SortEngine', () {
    test('sorts by price ascending', () {
      final engine = SortEngine();
      engine.setSingleCriterion(PriceComparator(), SortOrder.asc);

      final sorted = engine.apply(results);

      expect(sorted[0].price, 50);
      expect(sorted[1].price, 300);
      expect(sorted[2].price, 450);
      expect(sorted[3].price, 500);
      expect(sorted[4].price, 700);
    });

    test('sorts by price descending', () {
      final engine = SortEngine();
      engine.setSingleCriterion(PriceComparator(), SortOrder.desc);

      final sorted = engine.apply(results);

      expect(sorted[0].price, 700);
      expect(sorted[1].price, 500);
      expect(sorted[2].price, 450);
      expect(sorted[3].price, 300);
      expect(sorted[4].price, 50);
    });

    test('sorts by relevance descending (default)', () {
      final engine = SortEngine();
      engine.resetToDefault();

      final sorted = engine.apply(results);

      expect(sorted[0].relevanceScore, 0.9);
      expect(sorted[1].relevanceScore, 0.8);
      expect(sorted[2].relevanceScore, 0.7);
      expect(sorted[3].relevanceScore, 0.6);
      expect(sorted[4].relevanceScore, 0.5);
    });

    test('sorts by distance ascending (nulls at end)', () {
      final engine = SortEngine();
      engine.setSingleCriterion(DistanceComparator(), SortOrder.asc);

      final sorted = engine.apply(results);

      expect(sorted[0].distance, 5);
      expect(sorted[1].distance, 10);
      expect(sorted[2].distance, 25);
      expect(sorted[3].distance, 50);
      expect(sorted[4].distance, null); // null at end
    });

    test('multi-criteria sorting works', () {
      // Create results with same platform but different prices
      final testResults = [
        SearchResult(id: '1', title: 'A', price: 200, url: 'a', platform: 'wallapop'),
        SearchResult(id: '2', title: 'B', price: 100, url: 'b', platform: 'milanuncios'),
        SearchResult(id: '3', title: 'C', price: 150, url: 'c', platform: 'wallapop'),
        SearchResult(id: '4', title: 'D', price: 300, url: 'd', platform: 'milanuncios'),
      ];

      final engine = SortEngine();
      engine.setCriteria([
        (PlatformComparator(), SortOrder.asc),
        (PriceComparator(), SortOrder.asc),
      ]);

      final sorted = engine.apply(testResults);

      // First sorted by platform (milanuncios, wallapop), then by price within each
      expect(sorted[0].id, '2'); // milanuncios, 100
      expect(sorted[1].id, '4'); // milanuncios, 300
      expect(sorted[2].id, '3'); // wallapop, 150
      expect(sorted[3].id, '1'); // wallapop, 200
    });

    test('setFromSortCriteriaList works', () {
      final engine = SortEngine();
      engine.setFromSortCriteriaList([
        SortCriteria(field: SortField.price, order: SortOrder.asc),
      ]);

      final sorted = engine.apply(results);

      expect(sorted[0].price, 50);
      expect(sorted[4].price, 700);
    });

    test('toSortCriteriaList converts correctly', () {
      final engine = SortEngine();
      engine.setFromSortCriteriaList([
        SortCriteria(field: SortField.price, order: SortOrder.desc),
        SortCriteria(field: SortField.date, order: SortOrder.asc),
      ]);

      final criteria = engine.toSortCriteriaList();

      expect(criteria.length, 2);
      expect(criteria[0].field, SortField.price);
      expect(criteria[0].order, SortOrder.desc);
      expect(criteria[1].field, SortField.date);
      expect(criteria[1].order, SortOrder.asc);
    });

    test('empty criteria returns unsorted', () {
      final engine = SortEngine();
      engine.clear();

      final sorted = engine.apply(results);

      expect(sorted.length, results.length);
      // Order should be unchanged
      expect(sorted[0].id, results[0].id);
    });

    test('hasActiveSorting detects non-default sorting', () {
      final engine = SortEngine();

      engine.resetToDefault();
      expect(engine.hasActiveSorting, false);

      engine.setSingleCriterion(PriceComparator(), SortOrder.asc);
      expect(engine.hasActiveSorting, true);
    });

    test('primaryField and primaryOrder getters work', () {
      final engine = SortEngine();
      engine.setFromSortCriteriaList([
        SortCriteria(field: SortField.price, order: SortOrder.desc),
        SortCriteria(field: SortField.date, order: SortOrder.asc),
      ]);

      expect(engine.primaryField, SortField.price);
      expect(engine.primaryOrder, SortOrder.desc);
    });
  });

  group('getComparatorForField', () {
    test('returns correct comparator for each field', () {
      expect(getComparatorForField(SortField.price), isA<PriceComparator>());
      expect(getComparatorForField(SortField.date), isA<DateComparator>());
      expect(getComparatorForField(SortField.distance), isA<DistanceComparator>());
      expect(getComparatorForField(SortField.relevance), isA<RelevanceComparator>());
      expect(getComparatorForField(SortField.platform), isA<PlatformComparator>());
    });
  });
}
