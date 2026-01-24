// Main App Entry Point
//
// Configures Amplify, Providers, Router, and Theme.
// Entry point for the Pricofy Flutter application.

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';

import 'config/app_config.dart';
import 'config/environment.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'l10n/app_localizations.dart';
import 'core/providers/auth_provider.dart' as app;
import 'core/providers/language_provider.dart';
import 'core/providers/location_provider.dart';
import 'core/providers/form_provider.dart';
import 'core/providers/wallet_provider.dart';
import 'core/providers/subscription_provider.dart';
import 'core/providers/search_provider.dart';
import 'core/api/bff_api_client.dart';
import 'core/api/bff_session_manager.dart';
import 'core/services/favorites_service.dart';
import 'core/services/stripe_service.dart';
import 'config/stripe_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Configure Amplify
  await _configureAmplify();

  // Initialize Stripe (skip on web - not fully supported)
  if (!kIsWeb) {
    await StripeConfig.initialize();
  }

  // Session is created lazily by BffSessionManager when first API call is made
  // No security gate needed - endpoints are protected by BFF
  runApp(const PricofyApp());
}

/// Configure AWS Amplify
Future<void> _configureAmplify() async {
  try {
    final authPlugin = AmplifyAuthCognito();
    await Amplify.addPlugin(authPlugin);

    // Configure from JSON
    await Amplify.configure(AppConfig.amplifyConfigJson);

    safePrint('✅ Amplify configured successfully');
  } catch (e) {
    safePrint('❌ Error configuring Amplify: $e');
  }
}

class PricofyApp extends StatelessWidget {
  const PricofyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Auth Provider
        ChangeNotifierProvider(create: (_) => app.AuthProvider()),

        // Language Provider
        ChangeNotifierProvider(create: (_) => LanguageProvider()),

        // Form Provider
        ChangeNotifierProvider(create: (_) => FormProvider()),

        // BFF API Client (PoW-based sessions)
        // Initialize BffSessionManager and start auto-refresh for token management
        Provider<BffApiClient>(
          create: (_) {
            final client = BffApiClient(baseUrl: Environment.apiBaseUrl);
            // Start auto-refresh mechanism for proactive token renewal
            // This handles timer-based refresh and visibility change events
            BffSessionManager.instance.startAutoRefresh();
            return client;
          },
          dispose: (_, client) {
            // Stop auto-refresh when app is disposed
            BffSessionManager.instance.stopAutoRefresh();
          },
        ),

        // Location Provider (detects user location once at app load)
        ChangeNotifierProxyProvider<BffApiClient, LocationProvider>(
          create: (context) => LocationProvider(
            apiClient: Provider.of<BffApiClient>(context, listen: false),
          ),
          update: (_, apiClient, previous) =>
              previous ?? LocationProvider(apiClient: apiClient),
        ),

        // Stripe Service
        Provider<StripeService>(
          create: (_) => StripeService(),
        ),

        // Wallet Provider
        ChangeNotifierProxyProvider2<BffApiClient, StripeService, WalletProvider>(
          create: (ctx) => WalletProvider(
            apiClient: Provider.of<BffApiClient>(ctx, listen: false),
            stripeService: Provider.of<StripeService>(ctx, listen: false),
          ),
          update: (_, apiClient, stripeService, __) => WalletProvider(
            apiClient: apiClient,
            stripeService: stripeService,
          ),
        ),

        // Subscription Provider
        ChangeNotifierProxyProvider2<BffApiClient, StripeService, SubscriptionProvider>(
          create: (ctx) => SubscriptionProvider(
            apiClient: Provider.of<BffApiClient>(ctx, listen: false),
            stripeService: Provider.of<StripeService>(ctx, listen: false),
          ),
          update: (_, apiClient, stripeService, __) => SubscriptionProvider(
            apiClient: apiClient,
            stripeService: stripeService,
          ),
        ),

        // Search Provider
        ChangeNotifierProxyProvider2<BffApiClient, LocationProvider, SearchProvider>(
          create: (context) => SearchProvider(
            apiClient: Provider.of<BffApiClient>(context, listen: false),
            locationProvider: Provider.of<LocationProvider>(context, listen: false),
          ),
          update: (_, apiClient, locationProvider, previous) =>
              previous ?? SearchProvider(
                apiClient: apiClient,
                locationProvider: locationProvider,
              ),
        ),

        // Favorites Service
        Provider<FavoritesService>(
          create: (_) => FavoritesService()..initialize(),
        ),
      ],
      child: Consumer2<app.AuthProvider, LanguageProvider>(
        builder: (context, authProvider, languageProvider, _) {
          return MaterialApp.router(
            title: AppConfig.appName,
            theme: AppTheme.lightTheme(),
            debugShowCheckedModeBanner: false,
            routerConfig: createRouter(authProvider),
            // Localization configuration
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
            locale: languageProvider.locale,
          );
        },
      ),
    );
  }
}

