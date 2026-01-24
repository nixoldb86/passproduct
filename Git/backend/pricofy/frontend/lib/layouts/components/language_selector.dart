// Language Selector Widget
//
// Dropdown to switch between ES/EN/FR/PT/DE/IT (6 languages)

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../core/providers/language_provider.dart';

class LanguageSelector extends StatelessWidget {
  const LanguageSelector({super.key});

  @override
  Widget build(BuildContext context) {
    final languageProvider = context.watch<LanguageProvider>();

    return PopupMenuButton<AppLanguage>(
      offset: const Offset(0, 40),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          border: Border.all(color: AppTheme.gray300),
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              _getLanguageFlag(languageProvider.language),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
            const SizedBox(width: 4),
            Icon(Icons.arrow_drop_down, size: 20, color: AppTheme.gray700),
          ],
        ),
      ),
      itemBuilder: (context) => [
        PopupMenuItem<AppLanguage>(
          value: AppLanguage.es,
          child: Row(
            children: [
              const Text('🇪🇸'),
              const SizedBox(width: 8),
              const Text('Español'),
              if (languageProvider.language == AppLanguage.es)
                const Padding(
                  padding: EdgeInsets.only(left: 8),
                  child: Icon(Icons.check, size: 16),
                ),
            ],
          ),
        ),
        PopupMenuItem<AppLanguage>(
          value: AppLanguage.en,
          child: Row(
            children: [
              const Text('🇬🇧'),
              const SizedBox(width: 8),
              const Text('English'),
              if (languageProvider.language == AppLanguage.en)
                const Padding(
                  padding: EdgeInsets.only(left: 8),
                  child: Icon(Icons.check, size: 16),
                ),
            ],
          ),
        ),
        PopupMenuItem<AppLanguage>(
          value: AppLanguage.fr,
          child: Row(
            children: [
              const Text('🇫🇷'),
              const SizedBox(width: 8),
              const Text('Français'),
              if (languageProvider.language == AppLanguage.fr)
                const Padding(
                  padding: EdgeInsets.only(left: 8),
                  child: Icon(Icons.check, size: 16),
                ),
            ],
          ),
        ),
        PopupMenuItem<AppLanguage>(
          value: AppLanguage.pt,
          child: Row(
            children: [
              const Text('🇵🇹'),
              const SizedBox(width: 8),
              const Text('Português'),
              if (languageProvider.language == AppLanguage.pt)
                const Padding(
                  padding: EdgeInsets.only(left: 8),
                  child: Icon(Icons.check, size: 16),
                ),
            ],
          ),
        ),
        PopupMenuItem<AppLanguage>(
          value: AppLanguage.de,
          child: Row(
            children: [
              const Text('🇩🇪'),
              const SizedBox(width: 8),
              const Text('Deutsch'),
              if (languageProvider.language == AppLanguage.de)
                const Padding(
                  padding: EdgeInsets.only(left: 8),
                  child: Icon(Icons.check, size: 16),
                ),
            ],
          ),
        ),
        PopupMenuItem<AppLanguage>(
          value: AppLanguage.it,
          child: Row(
            children: [
              const Text('🇮🇹'),
              const SizedBox(width: 8),
              const Text('Italiano'),
              if (languageProvider.language == AppLanguage.it)
                const Padding(
                  padding: EdgeInsets.only(left: 8),
                  child: Icon(Icons.check, size: 16),
                ),
            ],
          ),
        ),
      ],
      onSelected: (language) {
        languageProvider.setLanguage(language);
      },
    );
  }

  String _getLanguageFlag(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.es: return '🇪🇸 ES';
      case AppLanguage.en: return '🇬🇧 EN';
      case AppLanguage.fr: return '🇫🇷 FR';
      case AppLanguage.pt: return '🇵🇹 PT';
      case AppLanguage.de: return '🇩🇪 DE';
      case AppLanguage.it: return '🇮🇹 IT';
    }
  }
}
