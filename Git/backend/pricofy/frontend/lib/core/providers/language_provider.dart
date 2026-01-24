// Language Provider
//
// Migrated from pricofy-frontend/contexts/LanguageContext.tsx
// Manages app language state (ES/EN/FR/PT/DE/IT) with SharedPreferences persistence
// Supports automatic language detection for web browsers and mobile devices

import 'dart:ui' show Locale;

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../utils/locale_detector.dart';

/// Supported application languages
enum AppLanguage {
  es, // Spanish
  en, // English
  fr, // French
  pt, // Portuguese
  de, // German
  it  // Italian
}

class LanguageProvider extends ChangeNotifier {
  static const String _storageKey = 'app_language';

  AppLanguage _language = AppLanguage.en; // Default English
  SharedPreferences? _prefs;

  LanguageProvider() {
    _initLanguage();
  }

  AppLanguage get language => _language;

  bool get isSpanish => _language == AppLanguage.es;
  bool get isEnglish => _language == AppLanguage.en;
  bool get isFrench => _language == AppLanguage.fr;
  bool get isPortuguese => _language == AppLanguage.pt;
  bool get isGerman => _language == AppLanguage.de;
  bool get isItalian => _language == AppLanguage.it;

  /// Initialize language: load from preferences or detect device/browser language
  Future<void> _initLanguage() async {
    _prefs = await SharedPreferences.getInstance();
    final storedLanguage = _prefs?.getString(_storageKey);

    if (storedLanguage != null) {
      _language = _parseLanguageCode(storedLanguage);
      notifyListeners();
    } else {
      // No stored language, detect automatically
      _language = _detectDeviceLanguage();
      // Save the detected language
      await _prefs?.setString(_storageKey, _languageToCode(_language));
      notifyListeners();
    }
  }

  /// Detect device/browser language and map to AppLanguage
  AppLanguage _detectDeviceLanguage() {
    try {
      final detectedLang = detectDeviceLocale();

      if (detectedLang != null && detectedLang.isNotEmpty) {
        // Extract language code (e.g., "es-ES" -> "es", "en_US" -> "en")
        final langCode = detectedLang.split(RegExp(r'[-_]'))[0].toLowerCase();

        switch (langCode) {
          case 'es':
            return AppLanguage.es;
          case 'en':
            return AppLanguage.en;
          case 'fr':
            return AppLanguage.fr;
          case 'pt':
            return AppLanguage.pt;
          case 'de':
            return AppLanguage.de;
          case 'it':
            return AppLanguage.it;
          default:
            // Unsupported language, fallback to English
            return AppLanguage.en;
        }
      }
    } catch (e) {
      // Detection failed, fallback to English
      debugPrint('Language detection failed: $e');
    }

    return AppLanguage.en;
  }

  /// Parse language code string to AppLanguage enum
  AppLanguage _parseLanguageCode(String code) {
    switch (code) {
      case 'es':
        return AppLanguage.es;
      case 'en':
        return AppLanguage.en;
      case 'fr':
        return AppLanguage.fr;
      case 'pt':
        return AppLanguage.pt;
      case 'de':
        return AppLanguage.de;
      case 'it':
        return AppLanguage.it;
      default:
        return AppLanguage.en; // Fallback to English
    }
  }

  /// Convert AppLanguage to string code
  String _languageToCode(AppLanguage language) {
    switch (language) {
      case AppLanguage.es:
        return 'es';
      case AppLanguage.en:
        return 'en';
      case AppLanguage.fr:
        return 'fr';
      case AppLanguage.pt:
        return 'pt';
      case AppLanguage.de:
        return 'de';
      case AppLanguage.it:
        return 'it';
    }
  }

  /// Set language and persist to storage
  Future<void> setLanguage(AppLanguage newLanguage) async {
    if (_language == newLanguage) return;

    _language = newLanguage;

    // Save to SharedPreferences
    await _prefs?.setString(_storageKey, _languageToCode(newLanguage));

    notifyListeners();
  }

  /// Toggle between ES and EN
  Future<void> toggleLanguage() async {
    await setLanguage(
      _language == AppLanguage.es ? AppLanguage.en : AppLanguage.es,
    );
  }

  /// Get language code
  String get languageCode {
    return _languageToCode(_language);
  }

  /// Get Flutter Locale for MaterialApp localization
  Locale get locale {
    return Locale(_languageToCode(_language));
  }
}
