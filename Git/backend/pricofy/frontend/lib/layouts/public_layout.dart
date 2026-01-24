// Public Layout
//
// Shell layout for public pages (landing, pricing, features, contact).
// Shows fixed Navbar at top and Footer at bottom.
// Used with ShellRoute in GoRouter.

import 'package:flutter/material.dart';

import 'components/navbar.dart';
import 'components/footer.dart';

class PublicLayout extends StatelessWidget {
  final Widget child;

  const PublicLayout({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 768;
    // Altura del navbar: 48px en móvil, 64px en desktop
    final navbarHeight = isMobile ? 48.0 : 64.0;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Scrollable content
          SingleChildScrollView(
            child: Column(
              children: [
                // Add top padding for fixed navbar
                SizedBox(height: navbarHeight),

                // Page content (from router)
                child,

                // Footer
                const Footer(),
              ],
            ),
          ),

          // Fixed navbar on top
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Navbar(),
          ),
        ],
      ),
    );
  }
}
