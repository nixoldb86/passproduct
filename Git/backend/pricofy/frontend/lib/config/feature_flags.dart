// Feature Flags Configuration
//
// Centralized feature flag definitions loaded from SSM at build time.
// Values are passed via --dart-define flags in Makefile.
//
// Usage:
//   if (FeatureFlags.landingOnly) { ... }
//   context.go(FeatureFlags.loginRoute);
//
// Adding new flags:
// 1. Add SSM parameter in CDK (infra/lib/stacks/frontend-flutter-stack.ts)
// 2. Add const field with String.fromEnvironment here
// 3. Add getter to parse boolean
// 4. Update Makefile to fetch from SSM and pass to flutter build

import 'routes.dart';

/// Centralized feature flags for the application.
/// All flags are loaded at build time from SSM via --dart-define.
class FeatureFlags {
  // Private constructor - static utility class
  FeatureFlags._();

  // ========================================
  // Raw values from --dart-define
  // ========================================

  /// Raw landing-only flag from environment.
  /// When 'true', login/signup redirects to /landing (pre-launch mode).
  static const String _landingOnlyRaw = String.fromEnvironment(
    'FEATURE_LANDING_ONLY',
    defaultValue: 'false', // Default: login enabled (for local dev without SSM)
  );

  // ========================================
  // Parsed boolean getters
  // ========================================

  /// When true, login/signup buttons redirect to /landing.
  /// This is the "pre-launch" mode where users can only access the landing page.
  ///
  /// - Dev: typically false (login works normally for development)
  /// - Prod v1: true (only landing page available)
  /// - Prod (future): false (full app available)
  static bool get landingOnly => _parseBool(_landingOnlyRaw, defaultValue: false);

  // ========================================
  // Helper getters for common use cases
  // ========================================

  /// Returns the appropriate route for login action.
  /// - When landingOnly is true: returns /landing
  /// - When landingOnly is false: returns /login
  static String get loginRoute =>
      landingOnly ? AppRoutes.landing : AppRoutes.login;

  /// Returns true if login functionality is available.
  /// Inverse of landingOnly for semantic clarity.
  static bool get loginEnabled => !landingOnly;

  // ========================================
  // Helper methods
  // ========================================

  /// Parse string to boolean with fallback
  static bool _parseBool(String value, {required bool defaultValue}) {
    if (value.isEmpty) return defaultValue;
    return value.toLowerCase() == 'true';
  }

  /// Debug info for logging (useful during development)
  static Map<String, dynamic> get debugInfo => {
        'landingOnly': landingOnly,
        'loginEnabled': loginEnabled,
        'loginRoute': loginRoute,
      };
}
