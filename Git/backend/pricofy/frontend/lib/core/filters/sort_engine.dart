// Sort Engine - Multi-criteria client-side sorting
//
// Manages sorting criteria and applies them efficiently to search results.
// Supports multi-criteria sorting (e.g., by price, then by distance).

import '../models/search_result.dart';
import '../models/search_filters.dart' show SortField, SortOrder;
import '../models/sort_criteria.dart';
import 'result_comparator.dart';

/// Engine for applying multi-criteria sorting to search results
class SortEngine {
  final List<(ResultComparator, SortOrder)> _criteria = [];

  /// Get current sorting criteria (read-only)
  List<(ResultComparator, SortOrder)> get criteria => List.unmodifiable(_criteria);

  /// Check if any sorting is active (non-default)
  bool get hasActiveSorting =>
      _criteria.isNotEmpty &&
      !(_criteria.length == 1 && _criteria.first.$1 is RelevanceComparator);

  /// Count of active sort criteria
  int get activeSortCount => hasActiveSorting ? _criteria.length : 0;

  /// Set sorting criteria (replaces existing)
  void setCriteria(List<(ResultComparator, SortOrder)> criteria) {
    _criteria.clear();
    _criteria.addAll(criteria);
  }

  /// Set single criterion (convenience method)
  void setSingleCriterion(ResultComparator comparator, SortOrder order) {
    _criteria.clear();
    _criteria.add((comparator, order));
  }

  /// Set from SortCriteria list (for compatibility)
  void setFromSortCriteriaList(List<SortCriteria> criteriaList) {
    _criteria.clear();
    for (final criterion in criteriaList) {
      final comparator = getComparatorForField(criterion.field);
      _criteria.add((comparator, criterion.order));
    }
  }

  /// Reset to default (relevance descending)
  void resetToDefault() {
    _criteria.clear();
    _criteria.add((RelevanceComparator(), SortOrder.desc));
  }

  /// Clear all criteria
  void clear() {
    _criteria.clear();
  }

  /// Apply sorting to results
  List<SearchResult> apply(List<SearchResult> results) {
    if (_criteria.isEmpty) return results;

    final sorted = List<SearchResult>.from(results);
    sorted.sort((a, b) {
      for (final (comparator, order) in _criteria) {
        int cmp = comparator.compare(a, b);
        if (cmp != 0) {
          // For relevance, the comparator already returns desc order
          // For others, we need to flip based on order
          if (comparator is RelevanceComparator) {
            return order == SortOrder.desc ? cmp : -cmp;
          }
          return order == SortOrder.asc ? cmp : -cmp;
        }
      }
      return 0;
    });
    return sorted;
  }

  /// Convert to SortCriteria list (for UI compatibility)
  List<SortCriteria> toSortCriteriaList() {
    if (_criteria.isEmpty) {
      return [SortCriteria.defaultRelevance];
    }
    return _criteria
        .map((c) => SortCriteria(field: c.$1.sortField, order: c.$2))
        .toList();
  }

  /// Get first sort field (for backward compatibility)
  SortField get primaryField {
    if (_criteria.isEmpty) return SortField.relevance;
    return _criteria.first.$1.sortField;
  }

  /// Get first sort order (for backward compatibility)
  SortOrder get primaryOrder {
    if (_criteria.isEmpty) return SortOrder.desc;
    return _criteria.first.$2;
  }

  @override
  String toString() {
    final criteriaStr = _criteria.map((c) => '${c.$1.id}:${c.$2}').join(', ');
    return 'SortEngine([$criteriaStr])';
  }
}
