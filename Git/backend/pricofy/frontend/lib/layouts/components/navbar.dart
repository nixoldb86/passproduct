// Navbar Component
//
// Fixed navigation bar for public pages (landing, pricing, etc.)
// Desktop: horizontal links + language + auth
// Mobile: hamburger menu

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../core/extensions/l10n_extension.dart';
import '../../core/providers/auth_provider.dart';
import 'language_selector.dart';
import 'auth_navbar.dart';

class Navbar extends StatefulWidget {
  const Navbar({super.key});

  @override
  State<Navbar> createState() => _NavbarState();
}

class _NavbarState extends State<Navbar> {
  bool _isMenuOpen = false;

  // Constantes para alturas responsive
  static const double desktopNavbarHeight = 64;
  static const double mobileNavbarHeight = 48;
  static const double desktopLogoHeight = 40;
  static const double mobileLogoHeight = 28;

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final l10n = context.l10n;
    final isMobile = MediaQuery.of(context).size.width < 768;

    // Logo destination: /app if authenticated, home if not
    final logoRoute = authProvider.isAuthenticated ? AppRoutes.app : AppRoutes.home;

    // Alturas responsivas
    final navbarHeight = isMobile ? mobileNavbarHeight : desktopNavbarHeight;
    final logoHeight = isMobile ? mobileLogoHeight : desktopLogoHeight;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Main navbar row
                SizedBox(
                  height: navbarHeight,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Logo
                      GestureDetector(
                        onTap: () => context.go(logoRoute),
                        child: Image.asset(
                          'assets/images/logo_sin_Fondo.PNG',
                          height: logoHeight,
                          fit: BoxFit.contain,
                        ),
                      ),

                      // Desktop Menu
                      if (!isMobile)
                        Row(
                          children: [
                            _buildNavLink(context, l10n.navbarFeatures, AppRoutes.features),
                            const SizedBox(width: 24),
                            _buildNavLink(context, l10n.navbarWhyItWorks, AppRoutes.whyItWorks),
                            const SizedBox(width: 24),
                            _buildNavLink(context, l10n.navbarPricing, AppRoutes.pricing),
                            const SizedBox(width: 24),
                            _buildNavLink(context, l10n.navbarContact, AppRoutes.contact),
                            const SizedBox(width: 24),
                            const LanguageSelector(),
                            const SizedBox(width: 24),
                            const AuthNavbar(),
                          ],
                        ),

                      // Mobile Menu Button
                      if (isMobile)
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () {
                            setState(() {
                              _isMenuOpen = !_isMenuOpen;
                            });
                          },
                          icon: Icon(
                            _isMenuOpen ? Icons.close : Icons.menu,
                            color: AppTheme.gray700,
                          ),
                        ),
                    ],
                  ),
                ),

                // Mobile Menu
                if (_isMenuOpen && isMobile) ...[
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildMobileNavLink(context, l10n.navbarFeatures, AppRoutes.features),
                        const SizedBox(height: 16),
                        _buildMobileNavLink(context, l10n.navbarWhyItWorks, AppRoutes.whyItWorks),
                        const SizedBox(height: 16),
                        _buildMobileNavLink(context, l10n.navbarPricing, AppRoutes.pricing),
                        const SizedBox(height: 16),
                        _buildMobileNavLink(context, l10n.navbarContact, AppRoutes.contact),
                        const SizedBox(height: 16),
                        const LanguageSelector(),
                        const SizedBox(height: 16),
                        const AuthNavbar(),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavLink(BuildContext context, String text, String route) {
    return GestureDetector(
      onTap: () {
        context.go(route);
        setState(() {
          _isMenuOpen = false;
        });
      },
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: Text(
          text,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppTheme.gray700,
          ),
        ),
      ),
    );
  }

  Widget _buildMobileNavLink(BuildContext context, String text, String route) {
    return GestureDetector(
      onTap: () {
        context.go(route);
        setState(() {
          _isMenuOpen = false;
        });
      },
      child: Text(
        text,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: AppTheme.gray700,
        ),
      ),
    );
  }
}
