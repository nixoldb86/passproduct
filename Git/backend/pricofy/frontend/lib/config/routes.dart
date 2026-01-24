// App Routes
//
// Navigation routes using go_router with ShellRoutes for layouts.
//
// Architecture:
// - Public: / (home, pricing, features, contact) - uses PublicLayout
// - App: /app/* (dashboard, search, request details) - uses AppLayout
// - Admin: /admin/* - uses AdminLayout
// - Auth: /login, /forgot-password - no shell (standalone)
// - Beta: /landing - standalone (CDK redirect)
//
// Anonymous users can access /app for search, but actions like
// saving favorites require login (handled at widget level).

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Layouts
import '../layouts/public_layout.dart';
import '../layouts/app_layout.dart';
import '../layouts/admin_layout.dart';

// Public pages
import '../features/public/pages/home_page.dart';
import '../features/public/pages/features_page.dart';
import '../features/public/pages/contact_page.dart';
import '../features/public/pages/pricing_page.dart';
import '../features/public/pages/why_it_works_page.dart';

// Auth pages (no shell)
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/admin_login_screen.dart';
import '../features/auth/screens/forgot_password_screen.dart';
import '../features/auth/screens/reset_password_screen.dart';

// App pages
import '../features/app/pages/app_page.dart';
import '../features/app/pages/request_detail_page.dart';
import '../features/app/pages/profile_page.dart';
import '../features/app/pages/new_request_page.dart';

// Admin pages
import '../features/admin/screens/admin_dashboard_screen.dart';

// Beta landing
import '../features/beta_landing/screens/beta_landing_screen.dart';

// Auth provider
import '../core/providers/auth_provider.dart' as app;

// Feature flags
import 'feature_flags.dart';

/// Custom page builder with no transitions for web
Page<dynamic> _buildPageWithTransitions(
  BuildContext context,
  GoRouterState state,
  Widget child,
) {
  if (kIsWeb) {
    // No transition on web (instant change)
    return NoTransitionPage(
      key: state.pageKey,
      child: child,
    );
  } else {
    // Default Material transition on mobile
    return MaterialPage(
      key: state.pageKey,
      child: child,
    );
  }
}

class AppRoutes {
  // Public routes
  static const String home = '/';
  static const String features = '/caracteristicas';
  static const String whyItWorks = '/por-que-funciona';
  static const String pricing = '/pricing';
  static const String contact = '/contacto';

  // Auth routes (no shell)
  static const String login = '/login';
  static const String adminLogin = '/admin/login';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';

  // App routes (AppLayout shell)
  static const String app = '/app';
  static const String appDashboard = '/app/dashboard';
  static const String appBuy = '/app/buy';
  static const String appSell = '/app/sell';
  static const String appFavorites = '/app/favorites';
  static const String appSearch = '/app/search';
  static const String newRequest = '/app/new';
  static const String profile = '/app/profile';

  // Legacy alias - keep for backward compatibility
  static const String dashboard = '/app/dashboard';

  // Admin routes (AdminLayout shell)
  static const String admin = '/admin';

  // Beta landing (CDK redirect target)
  static const String landing = '/landing';

  // Helper for request detail route
  static String request(String id) => '/app/request/$id';

  // Legacy helper - keep for backward compatibility
  static String evaluation(String id) => '/app/request/$id';
}

/// Create GoRouter instance
GoRouter createRouter(app.AuthProvider authProvider) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    refreshListenable: authProvider,
    redirect: (context, state) {
      final isAuthenticated = authProvider.isAuthenticated;
      final isAdmin = authProvider.isAdmin;
      final location = state.matchedLocation;

      // Redirect old /dashboard to /app
      if (location == '/dashboard') {
        final query = state.uri.queryParameters;
        if (query.isNotEmpty) {
          return '/app?${Uri(queryParameters: query).query}';
        }
        return '/app';
      }

      // Redirect old /evaluation/:id to /app/request/:id
      if (location.startsWith('/evaluation/')) {
        final id = location.replaceFirst('/evaluation/', '');
        return '/app/request/$id';
      }

      // Redirect old /profile to /app/profile
      if (location == '/profile') {
        return '/app/profile';
      }

      // Auth redirects
      final isGoingToLogin = location == AppRoutes.login || location == AppRoutes.adminLogin;
      final isGoingToProtectedApp = location == AppRoutes.profile ||
          location.startsWith('/app/request/') ||
          location == '/app/new';
      final isGoingToAdmin = location.startsWith('/admin') && location != AppRoutes.adminLogin;

      // === FEATURE FLAG: Landing Only Mode ===
      // When landingOnly is true (pre-launch), redirect login attempts to /landing
      if (FeatureFlags.landingOnly && isGoingToLogin) {
        return AppRoutes.landing;
      }

      // If not authenticated and going to protected route
      if (!isAuthenticated && isGoingToProtectedApp) {
        // In landing-only mode, redirect to landing instead of login
        if (FeatureFlags.landingOnly) {
          return AppRoutes.landing;
        }
        return '${AppRoutes.login}?redirect=${Uri.encodeComponent(location)}';
      }

      // If going to admin page and not admin, redirect to home
      if (isGoingToAdmin && !isAdmin) {
        return AppRoutes.home;
      }

      // If authenticated and going to login, redirect to app
      if (isAuthenticated && isGoingToLogin) {
        return AppRoutes.app;
      }

      return null; // No redirect
    },
    routes: [
      // === PUBLIC SHELL (navbar + footer) ===
      ShellRoute(
        builder: (context, state, child) => PublicLayout(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            pageBuilder: (context, state) => _buildPageWithTransitions(
              context,
              state,
              const HomePage(),
            ),
          ),
          GoRoute(
            path: AppRoutes.features,
            pageBuilder: (context, state) => _buildPageWithTransitions(
              context,
              state,
              const FeaturesPage(),
            ),
          ),
          GoRoute(
            path: AppRoutes.whyItWorks,
            pageBuilder: (context, state) => _buildPageWithTransitions(
              context,
              state,
              const WhyItWorksPage(),
            ),
          ),
          GoRoute(
            path: AppRoutes.pricing,
            pageBuilder: (context, state) => _buildPageWithTransitions(
              context,
              state,
              const PricingPage(),
            ),
          ),
          GoRoute(
            path: AppRoutes.contact,
            pageBuilder: (context, state) => _buildPageWithTransitions(
              context,
              state,
              const ContactPage(),
            ),
          ),
        ],
      ),

      // === BETA LANDING (standalone, CDK redirect target) ===
      GoRoute(
        path: AppRoutes.landing,
        pageBuilder: (context, state) {
          final ref = state.uri.queryParameters['ref'];
          return _buildPageWithTransitions(
            context,
            state,
            BetaLandingScreen(referralCode: ref),
          );
        },
      ),

      // === AUTH ROUTES (no shell) ===
      GoRoute(
        path: AppRoutes.login,
        pageBuilder: (context, state) => _buildPageWithTransitions(
          context,
          state,
          const LoginScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.adminLogin,
        pageBuilder: (context, state) => _buildPageWithTransitions(
          context,
          state,
          const AdminLoginScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        pageBuilder: (context, state) => _buildPageWithTransitions(
          context,
          state,
          const ForgotPasswordScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.resetPassword,
        pageBuilder: (context, state) {
          final email = state.uri.queryParameters['email'];
          return _buildPageWithTransitions(
            context,
            state,
            ResetPasswordScreen(email: email),
          );
        },
      ),

      // === APP SHELL (sidebar + header on desktop, bottom nav on mobile) ===
      // Anonymous users can access /app for search
      // Protected routes (/app/request/:id, /app/profile) require auth (handled in redirect)
      ShellRoute(
        builder: (context, state, child) => AppLayout(child: child),
        routes: [
          // /app redirects to /app/dashboard
          GoRoute(
            path: AppRoutes.app,
            redirect: (context, state) => AppRoutes.appDashboard,
          ),
          // Dashboard
          GoRoute(
            path: AppRoutes.appDashboard,
            pageBuilder: (context, state) {
              return _buildPageWithTransitions(
                context,
                state,
                const AppPage(filterParam: 'dashboard'),
              );
            },
          ),
          // Buy filter
          GoRoute(
            path: AppRoutes.appBuy,
            pageBuilder: (context, state) {
              return _buildPageWithTransitions(
                context,
                state,
                const AppPage(filterParam: 'buy'),
              );
            },
          ),
          // Sell filter
          GoRoute(
            path: AppRoutes.appSell,
            pageBuilder: (context, state) {
              return _buildPageWithTransitions(
                context,
                state,
                const AppPage(filterParam: 'sell'),
              );
            },
          ),
          // Favorites filter
          GoRoute(
            path: AppRoutes.appFavorites,
            pageBuilder: (context, state) {
              return _buildPageWithTransitions(
                context,
                state,
                const AppPage(filterParam: 'favorites'),
              );
            },
          ),
          // Search results
          GoRoute(
            path: AppRoutes.appSearch,
            pageBuilder: (context, state) {
              // queryParameters values are already URI-decoded by Dart's Uri parser
              final searchParam = state.uri.queryParameters['q'];
              return _buildPageWithTransitions(
                context,
                state,
                AppPage(
                  filterParam: 'search',
                  searchParam: searchParam,
                ),
              );
            },
          ),
          GoRoute(
            path: '/app/request/:id',
            pageBuilder: (context, state) {
              final requestId = state.pathParameters['id']!;
              return _buildPageWithTransitions(
                context,
                state,
                RequestDetailPage(requestId: requestId),
              );
            },
          ),
          GoRoute(
            path: '/app/new',
            pageBuilder: (context, state) {
              final action = state.uri.queryParameters['action'];
              return _buildPageWithTransitions(
                context,
                state,
                NewRequestPage(initialAction: action, showAsPage: true),
              );
            },
          ),
          GoRoute(
            path: AppRoutes.profile,
            pageBuilder: (context, state) => _buildPageWithTransitions(
              context,
              state,
              const ProfilePage(),
            ),
          ),
        ],
      ),

      // === ADMIN SHELL ===
      ShellRoute(
        builder: (context, state, child) => AdminLayout(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.admin,
            pageBuilder: (context, state) => _buildPageWithTransitions(
              context,
              state,
              const AdminDashboardScreen(),
            ),
          ),
        ],
      ),
    ],

    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.matchedLocation}')),
    ),
  );
}
