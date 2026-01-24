// Expandable Filter Section Widget
//
// Reusable widget for filter sections in the FiltersSortSheet.
// Shows collapsed state with preview, expands to show full content.
// Visual styling matches monolito design patterns.

import 'package:flutter/material.dart';
import '../../../../config/theme.dart';

class ExpandableFilterSection extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String? preview;
  final bool isActive;
  final bool isExpanded;
  final VoidCallback onToggle;
  final Widget child;
  final bool isDisabled;

  const ExpandableFilterSection({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.title,
    this.preview,
    this.isActive = false,
    required this.isExpanded,
    required this.onToggle,
    required this.child,
    this.isDisabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveIconColor = isDisabled ? AppTheme.gray400 : iconColor;
    final effectiveTitleColor = isDisabled ? AppTheme.gray500 : AppTheme.gray900;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        gradient: isExpanded && !isDisabled
            ? LinearGradient(
                colors: [
                  AppTheme.primary50,
                  Colors.purple.shade50,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isExpanded && !isDisabled ? null : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isExpanded && !isDisabled ? AppTheme.primary300 : AppTheme.gray200,
          width: isExpanded && !isDisabled ? 2 : 1,
        ),
        boxShadow: isExpanded && !isDisabled
            ? [
                BoxShadow(
                  color: AppTheme.primary500.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onToggle,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header row
                Row(
                  children: [
                    // Icon
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: effectiveIconColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        icon,
                        size: 18,
                        color: effectiveIconColor,
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Title and preview
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                title,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: effectiveTitleColor,
                                ),
                              ),
                              if (isDisabled) ...[
                                const SizedBox(width: 6),
                                Icon(
                                  Icons.lock_outline,
                                  size: 12,
                                  color: AppTheme.gray400,
                                ),
                              ],
                            ],
                          ),
                          if (!isExpanded && preview != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              preview!,
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.gray500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Active badge
                    if (isActive && !isDisabled) ...[
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: effectiveIconColor.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.check,
                          size: 12,
                          color: effectiveIconColor,
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],

                    // Chevron
                    AnimatedRotation(
                      turns: isExpanded ? 0.5 : 0,
                      duration: const Duration(milliseconds: 200),
                      child: Icon(
                        Icons.keyboard_arrow_down,
                        size: 20,
                        color: AppTheme.gray400,
                      ),
                    ),
                  ],
                ),

                // Expanded content
                if (isExpanded) ...[
                  const SizedBox(height: 12),
                  child,
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
