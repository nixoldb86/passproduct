// App Configuration
//
// Delegates to Environment class for all configuration values.
// Values are loaded from SSM at build time via Makefile.

import 'environment.dart';

class AppConfig {
  // API Configuration
  static String get apiGatewayUrl => Environment.apiBaseUrl;

  // reCAPTCHA Configuration
  static String get recaptchaSiteKey => Environment.recaptchaSiteKey;

  // Cognito Configuration
  static String get userPoolId => Environment.userPoolId;
  static String get userPoolClientId => Environment.userPoolClientId;
  static String get cognitoRegion => Environment.cognitoRegion;

  // OAuth Configuration
  static String get oauthDomain => Environment.oauthDomain;
  static List<String> get oauthScopes => Environment.oauthScopes;
  static String get oauthRedirectSignIn => Environment.oauthRedirectSignIn;
  static String get oauthRedirectSignOut => Environment.oauthRedirectSignOut;

  // App Configuration
  static String get appName => Environment.appName;
  static String get appVersion => Environment.appVersion;

  // Feature Flags
  static bool get enableAnalytics => Environment.enableAnalytics;
  static bool get enableDebugLogging => Environment.enableDebugLogging;

  // Amplify Configuration JSON
  static String get amplifyConfigJson => Environment.amplifyConfigJson;
}
