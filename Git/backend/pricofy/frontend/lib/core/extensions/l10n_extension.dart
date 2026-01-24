// Localization Extension
//
// Provides convenient access to AppLocalizations via BuildContext.
// Use `context.l10n` instead of `AppLocalizations.of(context)!`

import 'package:flutter/widgets.dart';
import '../../l10n/app_localizations.dart';

extension L10nContext on BuildContext {
  /// Get the current AppLocalizations instance.
  /// Throws if localizations are not configured in the widget tree.
  AppLocalizations get l10n {
    final localizations = AppLocalizations.of(this);
    if (localizations == null) {
      throw FlutterError(
        'AppLocalizations not found. '
        'Make sure MaterialApp has localizationsDelegates and supportedLocales configured.',
      );
    }
    return localizations;
  }

  /// Get the current AppLocalizations instance, or null if not available.
  AppLocalizations? get l10nOrNull => AppLocalizations.of(this);
}
