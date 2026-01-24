// API Configuration
//
// Centralized configuration for API endpoints
// Updated for BFF architecture

class ApiConfig {
  // BFF Base URLs
  static const String bffBaseUrlDev = 'https://api-dev.pricofy.com';
  static const String bffBaseUrlProd = 'https://api.pricofy.com';

  // Environment detection via --dart-define=ENV=prod
  // Build with: flutter build web --dart-define=ENV=prod
  static const String _env = String.fromEnvironment('ENV', defaultValue: 'dev');

  static bool get isProduction {
    return _env == 'prod' || _env == 'production';
  }

  // Get current BFF URL
  static String get bffBaseUrl {
    return isProduction ? bffBaseUrlProd : bffBaseUrlDev;
  }

  // BFF Endpoints
  // Session endpoints (PoW-based)
  static const String sessionChallengeEndpoint = '/session/challenge';
  static const String sessionVerifyEndpoint = '/session/verify';

  // Public endpoints (for anonymous users - no Cognito auth)
  static const String publicSearchEndpoint = '/public/search';
  static const String publicSearchResultsEndpoint = '/public/search/results';
  static const String publicSearchStatusEndpoint = '/public/search/status';
  static const String publicSearchHistoryEndpoint = '/public/search/history';

  // Private endpoints (for authenticated users - Cognito auth required)
  static const String privateSearchEndpoint = '/private/search';
  static const String privateSearchResultsEndpoint = '/private/search/results';
  static const String privateSearchStatusEndpoint = '/private/search/status';
  static const String privateSearchHistoryEndpoint = '/private/search/history';

  // User endpoints (authenticated)
  static const String userProfileEndpoint = '/user/profile';
  static const String userEvaluationsEndpoint = '/user/evaluations';

  // Other endpoints
  static const String contactEndpoint = '/contact';
  static const String detectCountryEndpoint = '/detect/country';
  static const String detectLocationEndpoint = '/detect/location';
  static const String submitRequestEndpoint = '/submit-request';
}
