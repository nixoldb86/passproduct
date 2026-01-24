// App Layout
//
// Shell layout for app pages (/app/*).
// Desktop: Fixed navbar + sidebar + content
// Mobile: Content + bottom navigation bar
// Used with ShellRoute in GoRouter.
//
// Guest users can access /app for search, but actions
// like selling or favorites require login (shows registration modal).
// Guest mode banner appears when not authenticated.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../config/theme.dart';
import '../core/widgets/guest_mode_banner.dart';
import 'components/navbar.dart';
import 'components/sidebar.dart';
import 'components/bottom_nav.dart';

class AppLayout extends StatelessWidget {
  final Widget child;

  const AppLayout({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    // Responsive breakpoint: 768px (md in Tailwind)
    final isWideScreen = MediaQuery.of(context).size.width >= 768;
    final currentRoute = GoRouterState.of(context).uri.toString();

    if (isWideScreen) {
      return _buildDesktopLayout(context, currentRoute);
    } else {
      return _buildMobileLayout(context, currentRoute);
    }
  }

  /// Desktop Layout: Fixed navbar + sidebar + guest banner + content
  Widget _buildDesktopLayout(BuildContext context, String currentRoute) {
    // Ocultar banner en rutas que tienen su propio banner
    final isSearchRoute = currentRoute.contains('/app/search');
    final isBuyRoute = currentRoute.contains('/app/buy');
    final isDashboardRoute = currentRoute == '/app' || currentRoute.contains('/app/dashboard');
    
    return Scaffold(
      backgroundColor: AppTheme.gray50,
      body: Stack(
        children: [
          // Main content with sidebar
          Padding(
            padding: const EdgeInsets.only(top: 64), // Space for fixed navbar
            child: Row(
              children: [
                // Fixed Sidebar
                Container(
                  width: 240,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                      right: BorderSide(color: AppTheme.gray200),
                    ),
                  ),
                  child: Sidebar(currentRoute: currentRoute),
                ),

                // Main Content Area with guest banner
                Expanded(
                  child: Column(
                    children: [
                      if (!isSearchRoute && !isBuyRoute && !isDashboardRoute) const GuestModeBanner(),
                      Expanded(child: child),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Fixed Navbar on top
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Navbar(),
          ),
        ],
      ),
    );
  }

  /// Mobile Layout: Guest banner + content + bottom navigation bar
  Widget _buildMobileLayout(BuildContext context, String currentRoute) {
    // Ocultar banner en rutas que tienen su propio banner
    final isSearchRoute = currentRoute.contains('/app/search');
    final isBuyRoute = currentRoute.contains('/app/buy');
    final isDashboardRoute = currentRoute == '/app' || currentRoute.contains('/app/dashboard');
    
    return Scaffold(
      backgroundColor: AppTheme.gray50,
      body: Stack(
        children: [
          // Main content with guest banner and padding for bottom bar
          Padding(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top,
              bottom: 64, // Space for bottom nav bar
            ),
            child: Column(
              children: [
                if (!isSearchRoute && !isBuyRoute && !isDashboardRoute) const GuestModeBanner(),
                Expanded(child: child),
              ],
            ),
          ),

          // Fixed bottom navigation bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: BottomNav(currentRoute: currentRoute),
          ),
        ],
      ),
    );
  }
}
