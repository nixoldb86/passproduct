// home_page_test.dart
//
// Widget test for HomePage - verifies rendering with proper providers.
// Uses Scaffold wrapper to provide Material context for TextField widgets.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:pricofy_front_flutter/features/public/pages/home_page.dart';
import 'package:pricofy_front_flutter/core/providers/language_provider.dart';
import 'package:pricofy_front_flutter/core/providers/auth_provider.dart';
import 'package:pricofy_front_flutter/core/providers/form_provider.dart';
import 'package:pricofy_front_flutter/l10n/app_localizations.dart';

void main() {
  testWidgets('HomePage renders correctly', (tester) async {
    // Set a larger surface size to avoid overflow errors
    tester.view.physicalSize = const Size(1920, 4000);
    tester.view.devicePixelRatio = 1.0;

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => LanguageProvider()),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => FormProvider()),
        ],
        child: MaterialApp(
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: AppLocalizations.supportedLocales,
          home: const Scaffold(
            body: SingleChildScrollView(
              child: HomePage(),
            ),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.byType(HomePage), findsOneWidget);
    expect(find.byType(Text), findsWidgets);

    // Reset view size
    addTearDown(() => tester.view.resetPhysicalSize());
  });
}
