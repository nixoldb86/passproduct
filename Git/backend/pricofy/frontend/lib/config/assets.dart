// App Assets Configuration
//
// Centralized constants for all asset paths.
// Use these constants instead of hardcoding paths in widgets.

class AppAssets {
  AppAssets._();

  // Logos
  static const String logo = 'assets/images/logos/logo.png';
  static const String logoIcon = 'assets/images/logos/icon.png';

  // Platform logos
  static const String wallapop = 'assets/images/platforms/wallapop.png';
  static const String milanuncios = 'assets/images/platforms/milanuncios.png';
  static const String vinted = 'assets/images/platforms/vinted.png';
  static const String backmarket = 'assets/images/platforms/backmarket.png';
  static const String ebay = 'assets/images/platforms/ebay.png';
  static const String leboncoin = 'assets/images/platforms/leboncoin.png';
  static const String olx = 'assets/images/platforms/olx.png';
  static const String kleinanzeigen = 'assets/images/platforms/kleinanzeigen.png';
  static const String subito = 'assets/images/platforms/subito.png';

  /// Get platform logo path by platform name
  static String platformLogo(String platform) {
    return switch (platform.toLowerCase()) {
      'wallapop' => wallapop,
      'milanuncios' => milanuncios,
      'vinted' => vinted,
      'backmarket' => backmarket,
      'ebay' => ebay,
      'leboncoin' => leboncoin,
      'olx' => olx,
      'kleinanzeigen' => kleinanzeigen,
      'subito' => subito,
      _ => logoIcon,
    };
  }

  /// Check if platform has a logo asset
  static bool hasPlatformLogo(String platform) {
    return ['wallapop', 'milanuncios', 'vinted', 'backmarket', 'ebay', 'leboncoin', 'olx', 'kleinanzeigen', 'subito']
        .contains(platform.toLowerCase());
  }
}
