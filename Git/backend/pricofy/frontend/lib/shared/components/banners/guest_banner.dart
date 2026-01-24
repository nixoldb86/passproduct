// Guest Banner Component
//
// Displays a promotional banner encouraging guest users to sign up.
// Used in dashboard and search views when user is not authenticated.
//
// Usage:
// ```dart
// GuestBanner(
//   onSignUp: () => context.go('/login'),
// )
// ```

import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';

class GuestBanner extends StatelessWidget {
  final VoidCallback onSignUp;

  const GuestBanner({
    super.key,
    required this.onSignUp,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary50, const Color(0xFFF3E8FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppTheme.primary200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.primary100,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.person_add_outlined, color: AppTheme.primary600, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.dashboardGuestMode,
                  style: TextStyle(
                    color: AppTheme.primary700,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  l10n.dashboardThisSessionOnly,
                  style: TextStyle(color: AppTheme.gray600, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: onSignUp,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary600,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              l10n.authSignUp,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
