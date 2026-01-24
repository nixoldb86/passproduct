// Request History Section Widget
//
// Shows recent searches in the dashboard
// Works for both anonymous (limited to 10) and authenticated users

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../config/theme.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/search_provider.dart';
import '../../../../core/api/bff_api_client.dart';

class RequestHistorySection extends StatefulWidget {
  final VoidCallback? onSearchSelected;

  const RequestHistorySection({
    super.key,
    this.onSearchSelected,
  });

  @override
  State<RequestHistorySection> createState() => _RequestHistorySectionState();
}

class _RequestHistorySectionState extends State<RequestHistorySection> {
  List<Map<String, dynamic>> _history = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final apiClient = context.read<BffApiClient>();
      final response = await apiClient.getSearchHistory(limit: 10);

      final searches = response['searches'] as List<dynamic>? ?? [];
      setState(() {
        _history = searches.cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _repeatSearch(String searchText) {
    final searchProvider = context.read<SearchProvider>();
    // Get user's current UI language for variant translation
    final userLanguage = Localizations.localeOf(context).languageCode;
    searchProvider.startSearch(searchText, userLanguage: userLanguage);
    widget.onSearchSelected?.call();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isAuthenticated = context.watch<AuthProvider>().isAuthenticated;

    if (_loading) {
      return _buildLoadingState();
    }

    if (_error != null) {
      return _buildErrorState(l10n);
    }

    if (_history.isEmpty) {
      return _buildEmptyState(l10n);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(Icons.history, color: AppTheme.primary600, size: 20),
                const SizedBox(width: 8),
                Text(
                  l10n.dashboardRecentSearches,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.gray900,
                  ),
                ),
              ],
            ),
            if (!isAuthenticated)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  l10n.dashboardThisSessionOnly,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.primary700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),

        // History list
        ..._history.map((item) => _buildHistoryItem(item, l10n)),

        // Show more hint for anonymous users
        if (!isAuthenticated && _history.length >= 10)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              l10n.authSignUp,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.gray500,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildHistoryItem(Map<String, dynamic> item, dynamic l10n) {
    final searchText = item['searchText'] as String? ?? '';
    final createdAt = item['createdAt'] as String?;
    final status = item['status'] as String? ?? 'completed';
    final resultsCount = item['resultsCount'] as int? ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: InkWell(
        onTap: () => _repeatSearch(searchText),
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Status icon
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _getStatusColor(status).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _getStatusIcon(status),
                  color: _getStatusColor(status),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),

              // Search info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      searchText,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.gray900,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (resultsCount > 0) ...[
                          Text(
                            l10n.dashboardTotalResults(resultsCount),
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.gray600,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        if (createdAt != null)
                          Text(
                            _formatDate(createdAt, l10n),
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.gray500,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              // Repeat search button
              IconButton(
                icon: Icon(Icons.refresh, color: AppTheme.primary600),
                onPressed: () => _repeatSearch(searchText),
                tooltip: l10n.dashboardRepeatSearch,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: AppTheme.primary600,
        ),
      ),
    );
  }

  Widget _buildErrorState(dynamic l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red.shade400),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              l10n.dashboardSearchError,
              style: TextStyle(color: Colors.red.shade700),
            ),
          ),
          TextButton(
            onPressed: _loadHistory,
            child: Text(l10n.commonRetry),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(dynamic l10n) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          children: [
            Icon(
              Icons.search_off,
              size: 48,
              color: AppTheme.gray300,
            ),
            const SizedBox(height: 12),
            Text(
              l10n.dashboardNoActiveSearch,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.gray500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'processing':
      case 'pending':
        return Colors.orange;
      case 'failed':
      case 'error':
        return Colors.red;
      default:
        return AppTheme.gray500;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'completed':
        return Icons.check_circle;
      case 'processing':
      case 'pending':
        return Icons.hourglass_empty;
      case 'failed':
      case 'error':
        return Icons.error;
      default:
        return Icons.search;
    }
  }

  String _formatDate(String isoDate, dynamic l10n) {
    try {
      final date = DateTime.parse(isoDate);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inMinutes < 1) {
        return l10n.timeJustNow;
      } else if (diff.inHours < 1) {
        final mins = diff.inMinutes;
        return l10n.timeMinutesAgo(mins);
      } else if (diff.inDays < 1) {
        final hours = diff.inHours;
        return l10n.timeHoursAgo(hours);
      } else if (diff.inDays < 7) {
        final days = diff.inDays;
        return l10n.timeDaysAgo(days);
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (e) {
      return '';
    }
  }
}

// Keep backward compatibility with SearchHistorySection name
typedef SearchHistorySection = RequestHistorySection;
