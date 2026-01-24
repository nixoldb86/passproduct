// Bottom Navigation Component
//
// Bottom navigation bar for mobile app layout.
// Shows all 5 navigation options like the sidebar.
// Supports guest mode with restricted actions.

import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../core/extensions/l10n_extension.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/widgets/registration_modal.dart';

class BottomNav extends StatelessWidget {
  final String currentRoute;

  const BottomNav({
    super.key,
    required this.currentRoute,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final authProvider = context.watch<AuthProvider>();
    final isAuthenticated = authProvider.isAuthenticated;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppTheme.gray200)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 56,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
            // 1. Dashboard (free)
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

              // 2. Vender (restricted)
              _buildNavItem(
                context,
                icon: CupertinoIcons.tag,
                selectedIcon: CupertinoIcons.tag_fill,
                label: l10n.commonSell,
                route: AppRoutes.appSell,
                isSelected: currentRoute == AppRoutes.appSell,
                color: currentRoute == AppRoutes.appSell ? const Color(0xFF10B981) : null,
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
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required String route,
    required bool isSelected,
    required bool isAuthenticated,
    bool requiresAuth = false,
    String? restrictedMessage,
    Color? color,
  }) {
    final isRestricted = requiresAuth && !isAuthenticated;
    final activeColor = color ?? AppTheme.primary600;
    final inactiveColor = AppTheme.gray500;

    return Expanded(
      child: Opacity(
        opacity: isRestricted ? 0.6 : 1.0,
        child: InkWell(
          onTap: () {
            if (isRestricted) {
              RegistrationModal.show(context, message: restrictedMessage);
            } else {
              context.go(route);
            }
          },
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSelected ? selectedIcon : icon,
                size: 22,
                color: isSelected ? activeColor : inactiveColor,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: isSelected ? activeColor : inactiveColor,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
