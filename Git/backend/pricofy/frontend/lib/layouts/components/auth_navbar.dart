// Auth Navbar Widget
//
// Shows Guest menu for anonymous users or User menu for authenticated users

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../config/feature_flags.dart';
import '../../core/extensions/l10n_extension.dart';
import '../../core/providers/auth_provider.dart';

class AuthNavbar extends StatelessWidget {
  const AuthNavbar({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    if (authProvider.isLoading) {
      return const SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }

    if (authProvider.isAuthenticated) {
      return _buildAuthenticatedMenu(context, authProvider);
    } else {
      return _buildAnonymousMenu(context);
    }
  }

  /// Authenticated user menu (existing functionality)
  Widget _buildAuthenticatedMenu(BuildContext context, AuthProvider authProvider) {
    final user = authProvider.user;
    final isAdmin = authProvider.isAdmin;

    return PopupMenuButton<String>(
      offset: const Offset(0, 40),
      child: _buildMenuButton(
        icon: Icons.account_circle,
        label: user?.fullName ?? 'User',
      ),
      itemBuilder: (context) => [
        _buildMenuItem(Icons.person, 'Profile', 'profile'),
        _buildMenuItem(Icons.dashboard, 'My Searches', 'dashboard'),
        if (isAdmin)
          _buildMenuItem(Icons.admin_panel_settings, 'Admin', 'admin',
            color: AppTheme.primary600),
        const PopupMenuDivider(),
        _buildMenuItem(Icons.logout, 'Logout', 'logout',
          color: Colors.red.shade600),
      ],
      onSelected: (value) => _handleAuthenticatedAction(context, authProvider, value),
    );
  }

  /// Anonymous user: simple login button (no menu)
  /// Guest mode banner already handles the "register" messaging
  Widget _buildAnonymousMenu(BuildContext context) {
    final l10n = context.l10n;

    return GestureDetector(
      onTap: () => context.go(FeatureFlags.loginRoute),
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppTheme.primary600, Colors.purple.shade600],
            ),
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
          child: Text(
            l10n.authSignIn,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuButton({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.gray300),
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20, color: AppTheme.gray700),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          const SizedBox(width: 4),
          Icon(Icons.arrow_drop_down, size: 20, color: AppTheme.gray700),
        ],
      ),
    );
  }

  PopupMenuItem<String> _buildMenuItem(
    IconData icon,
    String label,
    String value, {
    Color? color
  }) {
    return PopupMenuItem<String>(
      value: value,
      child: Row(
        children: [
          Icon(icon, size: 18, color: color ?? AppTheme.gray600),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: color)),
        ],
      ),
    );
  }

  Future<void> _handleAuthenticatedAction(
    BuildContext context,
    AuthProvider authProvider,
    String value
  ) async {
    switch (value) {
      case 'profile':
        context.go(AppRoutes.profile);
        break;
      case 'dashboard':
        context.go(AppRoutes.dashboard);
        break;
      case 'admin':
        context.go(AppRoutes.admin);
        break;
      case 'logout':
        await authProvider.signOut();
        if (context.mounted) {
          context.go(AppRoutes.home);
        }
        break;
    }
  }

}
