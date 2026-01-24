// App Theme Configuration
//
// Migrated from pricofy-frontend/tailwind.config.ts and app/globals.css
// Replicates the exact brand colors, typography (Poppins), spacing, and button styles

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors (from tailwind.config.ts)
  static const Color primary50 = Color(0xFFF5F3FF);
  static const Color primary100 = Color(0xFFEDE9FE);
  static const Color primary200 = Color(0xFFDDD6FE);
  static const Color primary300 = Color(0xFFC4B5FD);
  static const Color primary400 = Color(0xFFA78BFA);
  static const Color primary500 = Color(0xFF8B5CF6);
  static const Color primary600 = Color(0xFF667EEA); // Main blue
  static const Color primary700 = Color(0xFF764BA2); // Main purple
  static const Color primary800 = Color(0xFF5B21B6);
  static const Color primary900 = Color(0xFF4C1D95);

  // Gray Colors (standard Material Design grays)
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);

  // Additional colors for feature cards
  static const Color purple500 = Color(0xFFA855F7);
  static const Color pink500 = Color(0xFFEC4899);
  static const Color blue500 = Color(0xFF3B82F6);
  static const Color cyan500 = Color(0xFF06B6D4);
  static const Color green500 = Color(0xFF22C55E);
  static const Color emerald500 = Color(0xFF10B981);
  static const Color orange500 = Color(0xFFF97316);
  static const Color red500 = Color(0xFFEF4444);

  // Platform colors (marketplace branding)
  static const Color wallapopColor = Color(0xFF13C1AC);
  static const Color milanunciosColor = Color(0xFFFF6600);
  static const Color vintedColor = Color(0xFF09B1BA);
  static const Color backmarketColor = Color(0xFF000000);
  static const Color leboncoinColor = Color(0xFFFF6E14);
  static const Color kleinanzeigenColor = Color(0xFF1D4B00); // Verdun Green
  static const Color subitoColor = Color(0xFFE13333); // Subito Red
  static const Color olxColor = Color(0xFF002F34); // OLX Dark Teal
  static const Color ebayColor = Color(0xFF0064D2); // eBay Blue

  /// Get platform brand color by platform name
  static Color platformColor(String platform) {
    return switch (platform.toLowerCase()) {
      'wallapop' => wallapopColor,
      'milanuncios' => milanunciosColor,
      'vinted' => vintedColor,
      'backmarket' => backmarketColor,
      'leboncoin' => leboncoinColor,
      'ebay' => ebayColor,
      'kleinanzeigen' => kleinanzeigenColor,
      'subito' => subitoColor,
      'olx' => olxColor,
      _ => gray500,
    };
  }

  // Gradient (from-primary-600 to-primary-700) - used in btn-primary
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary600, primary700],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // Spacing values (Tailwind-like spacing scale)
  static const double spacing4 = 4.0;
  static const double spacing8 = 8.0;
  static const double spacing12 = 12.0;
  static const double spacing16 = 16.0;
  static const double spacing20 = 20.0;
  static const double spacing24 = 24.0;
  static const double spacing32 = 32.0;
  static const double spacing48 = 48.0;
  static const double spacing64 = 64.0;

  // Border Radius
  static const double radiusSm = 4.0;
  static const double radiusMd = 8.0;
  static const double radiusLg = 12.0;
  static const double radiusXl = 16.0;
  static const double radius2xl = 24.0;
  static const double radiusFull = 9999.0; // Perfect circles

  // Shadow values (consistent with Tailwind shadow scale)
  static final BoxShadow shadowSm = BoxShadow(
    color: Colors.black.withValues(alpha: 0.05),
    blurRadius: 4,
    offset: const Offset(0, 1),
  );

  static final BoxShadow shadowMd = BoxShadow(
    color: Colors.black.withValues(alpha: 0.08),
    blurRadius: 8,
    offset: const Offset(0, 2),
  );

  static final BoxShadow shadowLg = BoxShadow(
    color: Colors.black.withValues(alpha: 0.1),
    blurRadius: 10,
    offset: const Offset(0, 4),
  );

  static final BoxShadow shadowXl = BoxShadow(
    color: Colors.black.withValues(alpha: 0.15),
    blurRadius: 15,
    offset: const Offset(0, 6),
  );

  /// Light Theme
  static ThemeData lightTheme() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: primary600,
        secondary: primary700,
        surface: Colors.white,
        error: Colors.red.shade600,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: gray900,
        onError: Colors.white,
      ),

      scaffoldBackgroundColor: Colors.white,

      // Typography (Poppins from Google Fonts)
      // Weights: 300, 400, 500, 600, 700 (from app/layout.tsx)
      textTheme: GoogleFonts.poppinsTextTheme(
        const TextTheme(
          // Display styles (large titles)
          displayLarge: TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.w700,
            color: Color(0xFF111827),
            height: 1.2,
          ),
          displayMedium: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
            height: 1.2,
          ),
          displaySmall: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
            height: 1.2,
          ),

          // Headline styles
          headlineLarge: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
            height: 1.3,
          ),
          headlineMedium: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
            height: 1.3,
          ),
          headlineSmall: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
            height: 1.3,
          ),

          // Title styles
          titleLarge: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Color(0xFF111827),
            height: 1.4,
          ),
          titleMedium: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Color(0xFF111827),
            height: 1.4,
          ),
          titleSmall: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF111827),
            height: 1.4,
          ),

          // Body styles
          bodyLarge: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: Color(0xFF111827),
            height: 1.5,
          ),
          bodyMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: Color(0xFF111827),
            height: 1.5,
          ),
          bodySmall: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w400,
            color: Color(0xFF6B7280),
            height: 1.5,
          ),

          // Label styles (buttons, etc)
          labelLarge: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
            height: 1.0,
          ),
          labelMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.white,
            height: 1.0,
          ),
          labelSmall: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Colors.white,
            height: 1.0,
          ),
        ),
      ),

      // AppBar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: gray900,
        elevation: 1,
        shadowColor: Colors.black.withValues(alpha: 0.05),
        centerTitle: false,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: gray900,
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,

        // Default border
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusLg),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB), width: 1),
        ),

        // Enabled border
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusLg),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB), width: 1),
        ),

        // Focused border
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusLg),
          borderSide: const BorderSide(color: primary600, width: 2),
        ),

        // Error border
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusLg),
          borderSide: BorderSide(color: Colors.red.shade500, width: 1),
        ),

        // Focused error border
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusLg),
          borderSide: BorderSide(color: Colors.red.shade600, width: 2),
        ),

        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),

        hintStyle: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: gray400,
        ),

        labelStyle: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: gray700,
        ),

        errorStyle: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: Colors.red.shade600,
        ),
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusLg),
          ),
          elevation: 4,
          textStyle: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          side: const BorderSide(color: primary600, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusLg),
          ),
          foregroundColor: primary600,
          textStyle: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Text Button Theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          foregroundColor: primary600,
          textStyle: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        elevation: 2,
        shadowColor: Colors.black.withValues(alpha: 0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusXl),
        ),
        color: Colors.white,
      ),

      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE5E7EB),
        thickness: 1,
        space: 1,
      ),

      // Scroll behavior (smooth scroll)
      scrollbarTheme: ScrollbarThemeData(
        thumbColor: WidgetStateProperty.all(gray300),
        trackColor: WidgetStateProperty.all(gray100),
        radius: const Radius.circular(4),
      ),
    );
  }
}
