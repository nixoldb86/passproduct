// Sidebar Component
//
// Navigation sidebar for app layout (desktop).
// Shows user navigation, filters, and admin options.
// Supports guest mode with restricted actions.

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../core/extensions/l10n_extension.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/utils/responsive.dart';
import '../../core/widgets/registration_modal.dart';

class Sidebar extends StatelessWidget {
  final String currentRoute;

  const Sidebar({
    super.key,
    required this.currentRoute,
  });

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final l10n = context.l10n;
    final isAdmin = authProvider.isAdmin;
    final isAuthenticated = authProvider.isAuthenticated;

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        // Top padding for mobile safe area
        SizedBox(height: context.isDesktop ? 16 : MediaQuery.of(context).padding.top + 8),

        // 1. Dashboard (free) - shows all evaluations
        _buildNavItem(
          context,
          icon: CupertinoIcons.square_grid_2x2,
          selectedIcon: CupertinoIcons.square_grid_2x2_fill,
          label: l10n.navDashboard,
          route: AppRoutes.appDashboard,
          isSelected: currentRoute == AppRoutes.appDashboard,
          isAuthenticated: isAuthenticated,
          requiresAuth: false,
        ),

        // 2. Ventas (restricted)
        _buildNavItem(
          context,
          icon: CupertinoIcons.tag,
          selectedIcon: CupertinoIcons.tag_fill,
          label: l10n.commonSell,
          route: AppRoutes.appSell,
          isSelected: currentRoute == AppRoutes.appSell,
          isAuthenticated: isAuthenticated,
          requiresAuth: true,
          restrictedMessage: l10n.restrictedSell,
        ),

        // 3. Comprar (free)
        _buildNavItem(
          context,
          icon: CupertinoIcons.bag,
          selectedIcon: CupertinoIcons.bag_fill,
          label: l10n.commonBuy,
          route: AppRoutes.appBuy,
          isSelected: currentRoute == AppRoutes.appBuy,
          isAuthenticated: isAuthenticated,
          requiresAuth: false,
        ),

        // 4. Favoritos (restricted)
        _buildNavItem(
          context,
          icon: CupertinoIcons.heart,
          selectedIcon: CupertinoIcons.heart_fill,
          label: l10n.navFavorites,
          route: AppRoutes.appFavorites,
          isSelected: currentRoute == AppRoutes.appFavorites,
          isAuthenticated: isAuthenticated,
          requiresAuth: true,
          restrictedMessage: l10n.restrictedFavorites,
        ),

        // 5. Perfil (restricted)
        _buildNavItem(
          context,
          icon: CupertinoIcons.person,
          selectedIcon: CupertinoIcons.person_fill,
          label: l10n.profileMyProfile,
          route: AppRoutes.profile,
          isSelected: currentRoute == AppRoutes.profile,
          isAuthenticated: isAuthenticated,
          requiresAuth: true,
          restrictedMessage: l10n.restrictedProfile,
        ),

        // Admin panel (only for admins)
        if (isAdmin) ...[
          const Divider(height: 1),
          _buildNavItem(
            context,
            icon: Icons.admin_panel_settings_outlined,
            selectedIcon: Icons.admin_panel_settings,
            label: l10n.navAdminPanel,
            route: AppRoutes.admin,
            isSelected: currentRoute == AppRoutes.admin,
            isAuthenticated: isAuthenticated,
            requiresAuth: false, // Admin check is separate
          ),
        ],

        // Logout - only show for authenticated users
        if (isAuthenticated) ...[
          const Divider(height: 1),
          _buildNavItem(
            context,
            icon: Icons.logout,
            selectedIcon: Icons.logout,
            label: l10n.authLogout,
            route: null,
            isSelected: false,
            isAuthenticated: isAuthenticated,
            requiresAuth: false,
            onTap: () => _handleLogout(context, context.read<AuthProvider>()),
          ),
        ],
      ],
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required String? route,
    required bool isSelected,
    required bool isAuthenticated,
    bool requiresAuth = false,
    String? restrictedMessage,
    VoidCallback? onTap,
  }) {
    final isRestricted = requiresAuth && !isAuthenticated;

    return Opacity(
      opacity: isRestricted ? 0.6 : 1.0,
      child: ListTile(
        leading: Icon(
          isSelected ? selectedIcon : icon,
          color: isSelected ? AppTheme.primary600 : AppTheme.gray700,
        ),
        title: Text(
          label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? AppTheme.primary600 : AppTheme.gray700,
          ),
        ),
        selected: isSelected,
        selectedTileColor: AppTheme.primary50,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
        onTap: onTap ??
            () {
              if (isRestricted) {
                RegistrationModal.show(context, message: restrictedMessage);
              } else if (route != null) {
                context.go(route);
              }
            },
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context, AuthProvider authProvider) async {
    final l10n = context.l10n;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(l10n.authLogoutConfirm),
          content: Text(l10n.authLogoutConfirm),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(l10n.commonCancel),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary600,
              ),
              child: Text(l10n.authLogout),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      await authProvider.signOut();
      if (context.mounted) {
        context.go(AppRoutes.home);
      }
    }
  }
}
