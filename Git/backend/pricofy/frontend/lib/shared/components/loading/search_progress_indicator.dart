// Search Progress Indicator Widget
//
// Compact progress indicator showing scraper status.
// Displays:
// - Scraper status chips (pending, scraping, completed, failed)
// - Slim progress bar
//
// Note: No spinner here - the chips with their own spinners are enough visual feedback.

import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/models/search_progress.dart';

class SearchProgressIndicator extends StatelessWidget {
  final SearchProgress progress;
  final int partialResultsCount;

  const SearchProgressIndicator({
    super.key,
    required this.progress,
    this.partialResultsCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    final progressPercent = progress.progressPercent;
    final hasScraperTasks = progress.scraperTasks.isNotEmpty;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Scraper status chips
          if (hasScraperTasks) ...[
            _buildScraperStatusChips(context),
            const SizedBox(height: 12),
          ],

          // Slim progress bar
          SizedBox(
            width: 200,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: progressPercent),
                duration: const Duration(milliseconds: 300),
                builder: (context, value, child) {
                  return LinearProgressIndicator(
                    value: value,
                    backgroundColor: AppTheme.gray200,
                    color: AppTheme.primary500,
                    minHeight: 3,
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Build scraper status chips
  Widget _buildScraperStatusChips(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 400),
      child: Wrap(
        spacing: 6,
        runSpacing: 6,
        alignment: WrapAlignment.center,
        children: progress.scraperTasks.map((task) {
          return _ScraperStatusChip(task: task);
        }).toList(),
      ),
    );
  }
}

/// Individual scraper status chip (compact)
class _ScraperStatusChip extends StatelessWidget {
  final ScraperTaskTracking task;

  const _ScraperStatusChip({required this.task});

  @override
  Widget build(BuildContext context) {
    final isCompleted = task.status == ScraperTaskStatus.completed;
    final isFailed = task.status == ScraperTaskStatus.failed ||
        task.status == ScraperTaskStatus.expired;
    final isProcessing = _isProcessingState(task.status);
    final isPending = task.status == ScraperTaskStatus.pending;

    final backgroundColor = isCompleted
        ? Colors.green.withValues(alpha: 0.1)
        : isFailed
            ? Colors.red.withValues(alpha: 0.1)
            : isProcessing
                ? AppTheme.primary50
                : AppTheme.gray50;

    final borderColor = isCompleted
        ? Colors.green.shade300
        : isFailed
            ? Colors.red.shade300
            : isProcessing
                ? AppTheme.primary400
                : AppTheme.gray200;

    final textColor = isCompleted
        ? Colors.green.shade700
        : isFailed
            ? Colors.red.shade700
            : isProcessing
                ? AppTheme.primary700
                : AppTheme.gray400;

    final chip = Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Status icon
          if (isCompleted)
            Icon(Icons.check, size: 12, color: Colors.green.shade600)
          else if (isFailed)
            Icon(Icons.close, size: 12, color: Colors.red.shade600)
          else if (isProcessing)
            SizedBox(
              width: 10,
              height: 10,
              child: CircularProgressIndicator(
                strokeWidth: 1.5,
                color: AppTheme.primary600,
              ),
            )
          else
            Icon(Icons.circle_outlined, size: 10, color: AppTheme.gray300),

          const SizedBox(width: 4),

          // Platform name (short)
          Text(
            _getShortName(task),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: textColor,
            ),
          ),

          // Cache badge (if from cache)
          if (isCompleted && task.fromCache) ...[
            const SizedBox(width: 3),
            Icon(Icons.flash_on, size: 10, color: Colors.amber.shade600),
          ],

          // Result count for completed tasks
          if (isCompleted && task.resultCount > 0) ...[
            const SizedBox(width: 3),
            Text(
              '(${task.resultCount})',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w400,
                color: textColor.withValues(alpha: 0.7),
              ),
            ),
          ],
        ],
      ),
    );

    // Wrap with tooltip for failed tasks to show error
    if (isFailed && task.displayError != null) {
      return Tooltip(
        message: task.displayError!,
        child: chip,
      );
    }

    // Tooltip for processing states to show current phase
    if (isProcessing && !isPending) {
      return Tooltip(
        message: _getStatusMessage(task.status),
        child: chip,
      );
    }

    return chip;
  }

  /// Check if status is a processing state (not terminal, not pending)
  bool _isProcessingState(ScraperTaskStatus status) {
    return status == ScraperTaskStatus.scraping ||
        status == ScraperTaskStatus.aggregating ||
        status == ScraperTaskStatus.enriching ||
        status == ScraperTaskStatus.translating ||
        status == ScraperTaskStatus.persisting;
  }

  /// Get human-readable status message
  String _getStatusMessage(ScraperTaskStatus status) {
    return switch (status) {
      ScraperTaskStatus.scraping => 'Fetching listings...',
      ScraperTaskStatus.aggregating => 'Processing results...',
      ScraperTaskStatus.enriching => 'AI analysis...',
      ScraperTaskStatus.translating => 'Translating...',
      ScraperTaskStatus.persisting => 'Saving...',
      _ => '',
    };
  }

  /// Get shorter display name (just platform + country code)
  String _getShortName(ScraperTaskTracking task) {
    final platform = switch (task.scraper.toLowerCase()) {
      'wallapop' => 'Walla',
      'milanuncios' => 'Mila',
      'vinted' => 'Vinted',
      'backmarket' => 'BM',
      _ => task.scraper,
    };
    return '$platform ${task.country}';
  }
}
