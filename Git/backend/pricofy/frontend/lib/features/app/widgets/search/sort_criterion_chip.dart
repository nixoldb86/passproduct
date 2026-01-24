// Sort Criterion Chip Widget
//
// Visual chip for displaying a sort criterion in the sort tab.
// Shows priority number, icon, label, direction toggle, and delete button.
// Matches monolito design patterns.

import 'package:flutter/material.dart';
import '../../../../config/theme.dart';
import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/models/search_filters.dart';
import '../../../../core/models/sort_criteria.dart';

class SortCriterionChip extends StatelessWidget {
  final int priority;
  final SortCriteria criteria;
  final VoidCallback onToggleDirection;
  final VoidCallback onRemove;
  final String Function(SortField) getFieldLabel;

  const SortCriterionChip({
    super.key,
    required this.priority,
    required this.criteria,
    required this.onToggleDirection,
    required this.onRemove,
    required this.getFieldLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.gray200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Priority badge
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary600, Colors.purple.shade600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Center(
              child: Text(
                '$priority',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),

          // Icon
          Icon(
            _getFieldIcon(criteria.field),
            size: 18,
            color: _getFieldColor(criteria.field),
          ),
          const SizedBox(width: 8),

          // Label
          Expanded(
            child: Text(
              _buildLabel(context),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppTheme.gray800,
              ),
            ),
          ),

          // Toggle direction button
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onToggleDirection,
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.gray100,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(
                  Icons.swap_vert,
                  size: 16,
                  color: AppTheme.gray600,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Delete button
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onRemove,
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(
                  Icons.close,
                  size: 16,
                  color: Colors.red.shade600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _buildLabel(BuildContext context) {
    final l10n = context.l10n;
    final fieldLabel = getFieldLabel(criteria.field);
    final directionLabel = criteria.order == SortOrder.asc
        ? (criteria.field == SortField.price ? l10n.sortLowToHigh : l10n.sortAscending)
        : (criteria.field == SortField.price ? l10n.sortHighToLow : l10n.sortDescending);
    return '$fieldLabel: $directionLabel';
  }

  IconData _getFieldIcon(SortField field) {
    switch (field) {
      case SortField.relevance:
        return Icons.star;
      case SortField.price:
        return Icons.euro;
      case SortField.date:
        return Icons.calendar_today;
      case SortField.distance:
        return Icons.near_me;
      case SortField.platform:
        return Icons.apps;
    }
  }

  Color _getFieldColor(SortField field) {
    switch (field) {
      case SortField.relevance:
        return Colors.amber.shade600;
      case SortField.price:
        return AppTheme.primary600;
      case SortField.date:
        return Colors.blue.shade600;
      case SortField.distance:
        return Colors.purple.shade600;
      case SortField.platform:
        return AppTheme.gray600;
    }
  }
}

/// Button to add a new sort criterion
class AddSortCriterionButton extends StatelessWidget {
  final VoidCallback onTap;

  const AddSortCriterionButton({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppTheme.gray300,
              style: BorderStyle.solid,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.add,
                size: 18,
                color: AppTheme.primary600,
              ),
              const SizedBox(width: 8),
              Text(
                context.l10n.sortAddCriterion,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.primary600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Grid of available sort options to add
class SortOptionsGrid extends StatelessWidget {
  final List<SortField> availableFields;
  final void Function(SortField) onSelect;
  final String Function(SortField) getFieldLabel;

  const SortOptionsGrid({
    super.key,
    required this.availableFields,
    required this.onSelect,
    required this.getFieldLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: availableFields.map((field) {
        return _SortOptionCard(
          field: field,
          label: getFieldLabel(field),
          onTap: () => onSelect(field),
        );
      }).toList(),
    );
  }
}

class _SortOptionCard extends StatelessWidget {
  final SortField field;
  final String label;
  final VoidCallback onTap;

  const _SortOptionCard({
    required this.field,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 100,
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: _getFieldColor(field).withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _getFieldColor(field).withValues(alpha: 0.3),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                _getFieldIcon(field),
                size: 22,
                color: _getFieldColor(field),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: _getFieldColor(field),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getFieldIcon(SortField field) {
    switch (field) {
      case SortField.relevance:
        return Icons.star;
      case SortField.price:
        return Icons.euro;
      case SortField.date:
        return Icons.calendar_today;
      case SortField.distance:
        return Icons.near_me;
      case SortField.platform:
        return Icons.apps;
    }
  }

  Color _getFieldColor(SortField field) {
    switch (field) {
      case SortField.relevance:
        return Colors.amber.shade600;
      case SortField.price:
        return AppTheme.primary600;
      case SortField.date:
        return Colors.blue.shade600;
      case SortField.distance:
        return Colors.purple.shade600;
      case SortField.platform:
        return AppTheme.gray600;
    }
  }
}
