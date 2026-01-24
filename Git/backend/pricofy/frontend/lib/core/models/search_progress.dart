/**
 * Search Progress Model
 *
 * Models for tracking search progress during scraping.
 * Used for lightweight polling with getStatus endpoint.
 */

/// Status of an individual scraper task
enum ScraperTaskStatus {
  pending,
  scraping,
  aggregating,
  enriching,
  translating,
  persisting,
  completed,
  failed,
  expired;

  static ScraperTaskStatus fromString(String value) {
    return ScraperTaskStatus.values.firstWhere(
      (s) => s.name == value.toLowerCase(),
      orElse: () => ScraperTaskStatus.pending,
    );
  }

  /// Whether this status represents a terminal state (no more processing)
  bool get isTerminal =>
      this == completed || this == failed || this == expired;
}

/// Standardized error codes for scraper failures
enum ScraperErrorCode {
  timeout,
  proxyFailed,
  proxyBlocked,
  rateLimited,
  scraperError,
  aiRateLimit,
  aiError,
  aiTimeout,
  translationError,
  translationQuota,
  dynamoWriteError,
  dynamoThrottled,
  internalError;

  static ScraperErrorCode? fromString(String? value) {
    if (value == null || value.isEmpty) return null;
    return switch (value.toUpperCase()) {
      'TIMEOUT' => timeout,
      'PROXY_FAILED' => proxyFailed,
      'PROXY_BLOCKED' => proxyBlocked,
      'RATE_LIMITED' => rateLimited,
      'SCRAPER_ERROR' => scraperError,
      'AI_RATE_LIMIT' => aiRateLimit,
      'AI_ERROR' => aiError,
      'AI_TIMEOUT' => aiTimeout,
      'TRANSLATION_ERROR' => translationError,
      'TRANSLATION_QUOTA' => translationQuota,
      'DYNAMO_WRITE_ERROR' => dynamoWriteError,
      'DYNAMO_THROTTLED' => dynamoThrottled,
      'INTERNAL_ERROR' => internalError,
      _ => null,
    };
  }

  /// User-friendly error message for display
  String get displayMessage => switch (this) {
        timeout => 'Request timed out',
        proxyFailed => 'Connection failed',
        proxyBlocked => 'Access blocked',
        rateLimited => 'Too many requests',
        scraperError => 'Scraping error',
        aiRateLimit => 'AI service busy',
        aiError => 'AI processing error',
        aiTimeout => 'AI processing timeout',
        translationError => 'Translation failed',
        translationQuota => 'Translation limit reached',
        dynamoWriteError => 'Database error',
        dynamoThrottled => 'Service overloaded',
        internalError => 'Internal error',
      };

  /// Whether this error is retriable
  bool get isRetriable => switch (this) {
        timeout => true,
        proxyFailed => true,
        proxyBlocked => false,
        rateLimited => true,
        scraperError => true,
        aiRateLimit => true,
        aiError => true,
        aiTimeout => true,
        translationError => true,
        translationQuota => false,
        dynamoWriteError => true,
        dynamoThrottled => true,
        internalError => true,
      };
}

/// Tracking information for a single scraper task
class ScraperTaskTracking {
  final String scraper;
  final String country;
  final String? language;
  final String? userLanguage;
  final List<String> variants;
  final ScraperTaskStatus status;
  final String? statusDetail;
  final bool fromCache;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final int durationMs;
  final int resultCount;
  final int resultCountRaw;
  final int listingsFiltered;
  final int listingsTranslated;
  final double proxyCost;
  final double aiCost;
  final double translationCost;
  final String? error;
  final ScraperErrorCode? errorCode;
  final String? failedAt;

  const ScraperTaskTracking({
    required this.scraper,
    required this.country,
    this.language,
    this.userLanguage,
    this.variants = const [],
    required this.status,
    this.statusDetail,
    this.fromCache = false,
    this.startedAt,
    this.completedAt,
    this.durationMs = 0,
    this.resultCount = 0,
    this.resultCountRaw = 0,
    this.listingsFiltered = 0,
    this.listingsTranslated = 0,
    this.proxyCost = 0.0,
    this.aiCost = 0.0,
    this.translationCost = 0.0,
    this.error,
    this.errorCode,
    this.failedAt,
  });

  factory ScraperTaskTracking.fromJson(Map<String, dynamic> json) {
    return ScraperTaskTracking(
      scraper: json['scraper'] as String? ?? '',
      country: json['country'] as String? ?? '',
      language: json['language'] as String?,
      userLanguage: json['userLanguage'] as String?,
      variants: (json['variants'] as List<dynamic>?)?.cast<String>() ?? [],
      status: ScraperTaskStatus.fromString(json['status'] as String? ?? 'pending'),
      statusDetail: json['statusDetail'] as String?,
      fromCache: json['fromCache'] as bool? ?? false,
      startedAt: json['startedAt'] != null
          ? DateTime.tryParse(json['startedAt'] as String)
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'] as String)
          : null,
      durationMs: json['durationMs'] as int? ?? 0,
      resultCount: json['resultCount'] as int? ?? 0,
      resultCountRaw: json['resultCountRaw'] as int? ?? 0,
      listingsFiltered: json['listingsFiltered'] as int? ?? 0,
      listingsTranslated: json['listingsTranslated'] as int? ?? 0,
      proxyCost: (json['proxyCost'] as num?)?.toDouble() ?? 0.0,
      aiCost: (json['aiCost'] as num?)?.toDouble() ?? 0.0,
      translationCost: (json['translationCost'] as num?)?.toDouble() ?? 0.0,
      error: json['error'] as String?,
      errorCode: ScraperErrorCode.fromString(json['errorCode'] as String?),
      failedAt: json['failedAt'] as String?,
    );
  }

  /// Total cost for this scraper task
  double get totalCost => proxyCost + aiCost + translationCost;

  /// Display name combining scraper and country (e.g., "Wallapop ES")
  String get displayName {
    final name = switch (scraper.toLowerCase()) {
      'wallapop' => 'Wallapop',
      'milanuncios' => 'Milanuncios',
      'vinted' => 'Vinted',
      'backmarket' => 'BackMarket',
      _ => scraper,
    };
    return '$name $country';
  }

  /// User-friendly error message (uses errorCode if available, falls back to error)
  String? get displayError => errorCode?.displayMessage ?? error;

  /// Whether this task's error is retriable
  bool get isRetriable => errorCode?.isRetriable ?? true;
}

/// Overall search progress tracking
class SearchProgress {
  final String searchId;
  final String status;
  final String? statusDetails;
  final String searchText;
  final String searchType;
  final int totalResults;
  final int scrapersTotal;
  final int scrapersCompleted;
  final int scrapersFailed;
  final List<ScraperTaskTracking> scraperTasks;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SearchProgress({
    required this.searchId,
    required this.status,
    this.statusDetails,
    required this.searchText,
    this.searchType = 'normal',
    this.totalResults = 0,
    this.scrapersTotal = 0,
    this.scrapersCompleted = 0,
    this.scrapersFailed = 0,
    this.scraperTasks = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory SearchProgress.fromJson(Map<String, dynamic> json) {
    return SearchProgress(
      searchId: json['searchId'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      statusDetails: json['statusDetails'] as String?,
      searchText: json['searchText'] as String? ?? '',
      searchType: json['searchType'] as String? ?? 'normal',
      totalResults: json['totalResults'] as int? ?? 0,
      scrapersTotal: json['scrapersTotal'] as int? ?? 0,
      scrapersCompleted: json['scrapersCompleted'] as int? ?? 0,
      scrapersFailed: json['scrapersFailed'] as int? ?? 0,
      scraperTasks: (json['scraperTasks'] as List<dynamic>?)
              ?.map((t) => ScraperTaskTracking.fromJson(t as Map<String, dynamic>))
              .toList() ??
          [],
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  /// Progress percentage (0.0 to 1.0)
  double get progressPercent =>
      scrapersTotal > 0 ? scrapersCompleted / scrapersTotal : 0.0;

  /// True if search is complete (all scrapers have finished - completed, failed, or expired)
  /// Calculates from scraperTasks when available (event-driven mode),
  /// falls back to global status field (legacy mode)
  bool get isComplete {
    // New event-driven mode: calculate from scraperTasks
    if (scraperTasks.isNotEmpty) {
      return scraperTasks.every((t) => t.status.isTerminal);
    }
    // Legacy mode: use global status from backend
    return status == 'completed' || status == 'done';
  }

  /// True if search has failed (all scrapers failed)
  bool get hasFailed {
    if (scraperTasks.isNotEmpty) {
      // All tasks finished and none completed successfully
      return scraperTasks.every((t) => t.status.isTerminal) &&
          scraperTasks.every((t) =>
              t.status == ScraperTaskStatus.failed ||
              t.status == ScraperTaskStatus.expired);
    }
    return status == 'failed' || status == 'error';
  }

  /// True if search is still processing
  bool get isProcessing {
    if (scraperTasks.isNotEmpty) {
      return scraperTasks.any((t) => !t.status.isTerminal);
    }
    return status == 'processing' || status == 'pending' || status == 'scraping';
  }

  /// Number of scrapers still in progress
  int get scrapersInProgress => scrapersTotal - scrapersCompleted - scrapersFailed;

  /// Calculated from scraperTasks for consistency
  int get calculatedScrapersCompleted =>
      scraperTasks.where((t) => t.status == ScraperTaskStatus.completed).length;

  /// Calculated from scraperTasks for consistency
  int get calculatedScrapersFailed => scraperTasks
      .where((t) =>
          t.status == ScraperTaskStatus.failed ||
          t.status == ScraperTaskStatus.expired)
      .length;

  /// Total cost across all scraper tasks
  double get totalCost =>
      scraperTasks.fold(0.0, (sum, t) => sum + t.totalCost);

  /// Total proxy cost across all scraper tasks
  double get totalProxyCost =>
      scraperTasks.fold(0.0, (sum, t) => sum + t.proxyCost);

  /// Total AI cost across all scraper tasks
  double get totalAICost =>
      scraperTasks.fold(0.0, (sum, t) => sum + t.aiCost);

  /// Total translation cost across all scraper tasks
  double get totalTranslationCost =>
      scraperTasks.fold(0.0, (sum, t) => sum + t.translationCost);

  /// Number of scrapers that used cached results
  int get cacheHits => scraperTasks.where((t) => t.fromCache).length;

  /// Total results from all completed scrapers (calculated)
  int get calculatedTotalResults =>
      scraperTasks.fold(0, (sum, t) => sum + t.resultCount);

  /// Tasks that failed with retriable errors
  List<ScraperTaskTracking> get retriableTasks =>
      scraperTasks.where((t) => t.status == ScraperTaskStatus.failed && t.isRetriable).toList();

  /// Tasks that failed with non-retriable errors
  List<ScraperTaskTracking> get nonRetriableTasks =>
      scraperTasks.where((t) => t.status == ScraperTaskStatus.failed && !t.isRetriable).toList();
}
