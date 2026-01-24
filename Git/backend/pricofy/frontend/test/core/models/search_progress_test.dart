import 'package:flutter_test/flutter_test.dart';
import 'package:pricofy_front_flutter/core/models/search_progress.dart';

void main() {
  group('ScraperTaskStatus', () {
    test('should parse status from string', () {
      expect(ScraperTaskStatus.fromString('pending'), ScraperTaskStatus.pending);
      expect(ScraperTaskStatus.fromString('scraping'), ScraperTaskStatus.scraping);
      expect(ScraperTaskStatus.fromString('aggregating'), ScraperTaskStatus.aggregating);
      expect(ScraperTaskStatus.fromString('enriching'), ScraperTaskStatus.enriching);
      expect(ScraperTaskStatus.fromString('translating'), ScraperTaskStatus.translating);
      expect(ScraperTaskStatus.fromString('persisting'), ScraperTaskStatus.persisting);
      expect(ScraperTaskStatus.fromString('completed'), ScraperTaskStatus.completed);
      expect(ScraperTaskStatus.fromString('failed'), ScraperTaskStatus.failed);
      expect(ScraperTaskStatus.fromString('expired'), ScraperTaskStatus.expired);
    });

    test('should return pending for unknown status', () {
      expect(ScraperTaskStatus.fromString('unknown'), ScraperTaskStatus.pending);
      expect(ScraperTaskStatus.fromString(''), ScraperTaskStatus.pending);
      expect(ScraperTaskStatus.fromString('PENDING'), ScraperTaskStatus.pending);
    });

    test('should identify terminal states', () {
      expect(ScraperTaskStatus.pending.isTerminal, false);
      expect(ScraperTaskStatus.scraping.isTerminal, false);
      expect(ScraperTaskStatus.aggregating.isTerminal, false);
      expect(ScraperTaskStatus.enriching.isTerminal, false);
      expect(ScraperTaskStatus.translating.isTerminal, false);
      expect(ScraperTaskStatus.persisting.isTerminal, false);
      expect(ScraperTaskStatus.completed.isTerminal, true);
      expect(ScraperTaskStatus.failed.isTerminal, true);
      expect(ScraperTaskStatus.expired.isTerminal, true);
    });
  });

  group('ScraperTaskTracking', () {
    test('should create from JSON', () {
      final json = {
        'scraper': 'wallapop',
        'country': 'ES',
        'variants': ['iPhone 15', 'iphone quince'],
        'status': 'scraping',
        'statusDetail': 'Processing variants',
        'fromCache': false,
        'startedAt': '2025-01-15T10:30:00Z',
        'durationMs': 4500,
        'resultCount': 25,
        'resultCountRaw': 30,
      };

      final tracking = ScraperTaskTracking.fromJson(json);

      expect(tracking.scraper, 'wallapop');
      expect(tracking.country, 'ES');
      expect(tracking.variants, ['iPhone 15', 'iphone quince']);
      expect(tracking.status, ScraperTaskStatus.scraping);
      expect(tracking.statusDetail, 'Processing variants');
      expect(tracking.fromCache, false);
      expect(tracking.durationMs, 4500);
      expect(tracking.resultCount, 25);
      expect(tracking.resultCountRaw, 30);
    });

    test('should handle missing fields in JSON', () {
      final json = {
        'scraper': 'vinted',
        'country': 'FR',
      };

      final tracking = ScraperTaskTracking.fromJson(json);

      expect(tracking.scraper, 'vinted');
      expect(tracking.country, 'FR');
      expect(tracking.variants, isEmpty);
      expect(tracking.status, ScraperTaskStatus.pending);
      expect(tracking.fromCache, false);
      expect(tracking.durationMs, 0);
      expect(tracking.resultCount, 0);
    });

    test('should display correct name for scrapers', () {
      expect(
        ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.pending).displayName,
        'Wallapop ES',
      );
      expect(
        ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.pending).displayName,
        'Vinted FR',
      );
      expect(
        ScraperTaskTracking(scraper: 'milanuncios', country: 'ES', status: ScraperTaskStatus.pending).displayName,
        'Milanuncios ES',
      );
      expect(
        ScraperTaskTracking(scraper: 'backmarket', country: 'ES', status: ScraperTaskStatus.pending).displayName,
        'BackMarket ES',
      );
      expect(
        ScraperTaskTracking(scraper: 'unknown_scraper', country: 'XX', status: ScraperTaskStatus.pending).displayName,
        'unknown_scraper XX',
      );
    });
  });

  group('SearchProgress', () {
    test('should create from JSON', () {
      final json = {
        'searchId': 'search-123',
        'status': 'processing',
        'searchText': 'iPhone 15',
        'searchType': 'advanced',
        'totalResults': 75,
        'scrapersTotal': 3,
        'scrapersCompleted': 1,
        'scrapersFailed': 0,
        'scraperTasks': [
          {'scraper': 'wallapop', 'country': 'ES', 'status': 'completed', 'resultCount': 25},
          {'scraper': 'vinted', 'country': 'FR', 'status': 'scraping', 'resultCount': 0},
          {'scraper': 'milanuncios', 'country': 'ES', 'status': 'pending', 'resultCount': 0},
        ],
        'createdAt': '2025-01-15T10:30:00Z',
        'updatedAt': '2025-01-15T10:31:00Z',
      };

      final progress = SearchProgress.fromJson(json);

      expect(progress.searchId, 'search-123');
      expect(progress.status, 'processing');
      expect(progress.searchText, 'iPhone 15');
      expect(progress.searchType, 'advanced');
      expect(progress.totalResults, 75);
      expect(progress.scrapersTotal, 3);
      expect(progress.scrapersCompleted, 1);
      expect(progress.scrapersFailed, 0);
      expect(progress.scraperTasks.length, 3);
    });

    test('should calculate progress percentage', () {
      final progress = SearchProgress(
        searchId: 'test',
        status: 'processing',
        searchText: 'test',
        scrapersTotal: 4,
        scrapersCompleted: 2,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(progress.progressPercent, 0.5);
    });

    test('should handle zero scrapers for progress', () {
      final progress = SearchProgress(
        searchId: 'test',
        status: 'pending',
        searchText: 'test',
        scrapersTotal: 0,
        scrapersCompleted: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(progress.progressPercent, 0.0);
    });

    group('isComplete', () {
      test('should be complete when all scraperTasks are terminal', () {
        final progress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [
            ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.completed),
            ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.completed),
            ScraperTaskTracking(scraper: 'milanuncios', country: 'ES', status: ScraperTaskStatus.failed),
          ],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(progress.isComplete, true);
      });

      test('should NOT be complete when some scraperTasks are still processing', () {
        final progress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [
            ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.completed),
            ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.scraping),
            ScraperTaskTracking(scraper: 'milanuncios', country: 'ES', status: ScraperTaskStatus.pending),
          ],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(progress.isComplete, false);
      });

      test('should be complete with expired tasks', () {
        final progress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [
            ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.expired),
            ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.expired),
          ],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(progress.isComplete, true);
      });

      test('should fall back to status field when no scraperTasks', () {
        final completedProgress = SearchProgress(
          searchId: 'test',
          status: 'completed',
          searchText: 'test',
          scraperTasks: [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        expect(completedProgress.isComplete, true);

        final doneProgress = SearchProgress(
          searchId: 'test',
          status: 'done',
          searchText: 'test',
          scraperTasks: [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        expect(doneProgress.isComplete, true);

        final processingProgress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        expect(processingProgress.isComplete, false);
      });
    });

    group('hasFailed', () {
      test('should be true when all tasks failed or expired', () {
        final progress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [
            ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.failed),
            ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.expired),
          ],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(progress.hasFailed, true);
      });

      test('should be false when at least one task completed', () {
        final progress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [
            ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.completed),
            ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.failed),
          ],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(progress.hasFailed, false);
      });

      test('should fall back to status field when no scraperTasks', () {
        final failedProgress = SearchProgress(
          searchId: 'test',
          status: 'failed',
          searchText: 'test',
          scraperTasks: [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        expect(failedProgress.hasFailed, true);

        final errorProgress = SearchProgress(
          searchId: 'test',
          status: 'error',
          searchText: 'test',
          scraperTasks: [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        expect(errorProgress.hasFailed, true);
      });
    });

    group('isProcessing', () {
      test('should be true when some tasks are not terminal', () {
        final progress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [
            ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.completed),
            ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.scraping),
          ],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(progress.isProcessing, true);
      });

      test('should be false when all tasks are terminal', () {
        final progress = SearchProgress(
          searchId: 'test',
          status: 'processing',
          searchText: 'test',
          scraperTasks: [
            ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.completed),
            ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.failed),
          ],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        expect(progress.isProcessing, false);
      });
    });

    test('should calculate scrapersInProgress correctly', () {
      final progress = SearchProgress(
        searchId: 'test',
        status: 'processing',
        searchText: 'test',
        scrapersTotal: 5,
        scrapersCompleted: 2,
        scrapersFailed: 1,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(progress.scrapersInProgress, 2);
    });

    test('should calculate completed/failed from scraperTasks', () {
      final progress = SearchProgress(
        searchId: 'test',
        status: 'processing',
        searchText: 'test',
        scraperTasks: [
          ScraperTaskTracking(scraper: 'wallapop', country: 'ES', status: ScraperTaskStatus.completed),
          ScraperTaskTracking(scraper: 'vinted', country: 'FR', status: ScraperTaskStatus.completed),
          ScraperTaskTracking(scraper: 'milanuncios', country: 'ES', status: ScraperTaskStatus.failed),
          ScraperTaskTracking(scraper: 'backmarket', country: 'ES', status: ScraperTaskStatus.expired),
          ScraperTaskTracking(scraper: 'ebay', country: 'ES', status: ScraperTaskStatus.scraping),
        ],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(progress.calculatedScrapersCompleted, 2);
      expect(progress.calculatedScrapersFailed, 2); // failed + expired
    });
  });
}
