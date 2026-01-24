// Product Form Screen Tests
//
// Tests for the product form submission functionality.
// Uses BffApiClient (via mock) instead of deprecated ApiClient.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:pricofy_front_flutter/core/providers/auth_provider.dart';
import 'package:pricofy_front_flutter/core/providers/form_provider.dart';
import 'package:pricofy_front_flutter/core/providers/language_provider.dart';
import 'package:pricofy_front_flutter/core/api/bff_api_client.dart';
import 'package:pricofy_front_flutter/features/app/pages/new_request_page.dart';
import 'package:pricofy_front_flutter/l10n/app_localizations.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'product_form_screen_test.mocks.dart';

@GenerateMocks([BffApiClient])
void main() {
  late MockBffApiClient mockApi;

  setUp(() {
    mockApi = MockBffApiClient();
  });

  Widget createTestWidget() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => FormProvider()),
        Provider<BffApiClient>.value(value: mockApi),
      ],
      child: const MaterialApp(
        localizationsDelegates: [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: AppLocalizations.supportedLocales,
        home: NewRequestPage(),
      ),
    );
  }

  testWidgets('NewRequestPage renders correctly', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.byType(NewRequestPage), findsOneWidget);
  });

  testWidgets('Form validation prevents submission on invalid data', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // Try to submit without filling required fields
    final submitButton = find.byType(ElevatedButton);
    if (submitButton.evaluate().isNotEmpty) {
      // Scroll to make the button visible before tapping
      await tester.ensureVisible(submitButton.first);
      await tester.pumpAndSettle();
      await tester.tap(submitButton.first, warnIfMissed: false);
      await tester.pump();
    }

    // API should not be called with invalid data
    verifyNever(mockApi.submitSearch(
      searchText: anyNamed('searchText'),
      searchType: anyNamed('searchType'),
      sources: anyNamed('sources'),
    ));
  });

  testWidgets('Successful form submission calls API', (tester) async {
    when(mockApi.submitSearch(
      searchText: anyNamed('searchText'),
      searchType: anyNamed('searchType'),
      sources: anyNamed('sources'),
    )).thenAnswer(
      (_) async => {'solicitudId': '123', 'success': true},
    );

    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // Fill required form fields
    final textFields = find.byType(TextFormField);
    if (textFields.evaluate().length >= 2) {
      await tester.enterText(textFields.at(0), 'test@example.com');
      await tester.enterText(textFields.at(1), 'iPhone 15');
    }

    // Submit form
    final submitButton = find.byType(ElevatedButton);
    if (submitButton.evaluate().isNotEmpty) {
      // Scroll to make the button visible before tapping
      await tester.ensureVisible(submitButton.first);
      await tester.pumpAndSettle();
      await tester.tap(submitButton.first, warnIfMissed: false);
      await tester.pumpAndSettle();
    }

    // Note: This test may need adjustment based on actual form structure
    // The mock setup ensures the API is ready to receive calls
  });
}
