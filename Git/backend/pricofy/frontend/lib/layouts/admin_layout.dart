// Admin Layout
//
// Shell layout for admin pages (/admin/*).
// Used with ShellRoute in GoRouter.
//
// NOTE: During migration, AdminDashboardScreen includes its own layout.
// This shell passes through the child directly.
// All routes require admin authentication.

import 'package:flutter/material.dart';

class AdminLayout extends StatelessWidget {
  final Widget child;

  const AdminLayout({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    // During migration: AdminDashboardScreen includes its own layout
    // so we just pass through the child directly.
    // TODO: After migration, add admin navbar + sidebar here.
    return child;
  }
}
