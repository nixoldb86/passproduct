/**
 * Country Flags Utility
 *
 * Converts ISO 3166-1 alpha-2 country codes to flag emojis.
 * Uses Unicode regional indicator symbols.
 */

/// Returns flag emoji for a country code (e.g., "ES" -> flag emoji).
/// Uses Unicode regional indicator symbols to create flag emojis.
String getCountryFlagEmoji(String? countryCode) {
  if (countryCode == null || countryCode.length != 2) return '';

  final code = countryCode.toUpperCase();

  // Convert ASCII letters to regional indicator symbols
  // A-Z in ASCII is 0x41-0x5A
  // Regional indicators are 0x1F1E6-0x1F1FF
  final firstLetter = code.codeUnitAt(0) - 0x41 + 0x1F1E6;
  final secondLetter = code.codeUnitAt(1) - 0x41 + 0x1F1E6;

  return String.fromCharCodes([firstLetter, secondLetter]);
}

/// Returns a mapping of common country codes to their names.
Map<String, String> getCountryNames({bool spanish = true}) {
  if (spanish) {
    return {
      'ES': 'Espana',
      'FR': 'Francia',
      'DE': 'Alemania',
      'IT': 'Italia',
      'PT': 'Portugal',
      'GB': 'Reino Unido',
      'NL': 'Paises Bajos',
      'BE': 'Belgica',
      'AT': 'Austria',
      'CH': 'Suiza',
    };
  }
  return {
    'ES': 'Spain',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'PT': 'Portugal',
    'GB': 'United Kingdom',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'AT': 'Austria',
    'CH': 'Switzerland',
  };
}
