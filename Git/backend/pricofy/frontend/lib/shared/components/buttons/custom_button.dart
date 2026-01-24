// Custom Button Widgets
//
// Migrated from pricofy-frontend/app/globals.css
// Replicates .btn-primary and .btn-secondary styles

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

/// Primary Button Widget
///
/// Replicates .btn-primary from globals.css:
/// - Gradient background (from-primary-600 to-primary-700)
/// - White text, font-semibold
/// - px-6 py-3 (24px horizontal, 12px vertical)
/// - rounded-lg (12px)
/// - shadow-lg with hover effect
/// - Hover: gradient shifts from-primary-700 to-primary-800
class PrimaryButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final double? fontSize;

  const PrimaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.width,
    this.padding,
    this.fontSize,
  });

  @override
  State<PrimaryButton> createState() => _PrimaryButtonState();
}

class _PrimaryButtonState extends State<PrimaryButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final effectivePadding =
        widget.padding ??
        const EdgeInsets.symmetric(horizontal: 24, vertical: 12);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Container(
        width: widget.width,
        decoration: BoxDecoration(
          // Gradient shifts on hover (primary-700 to primary-800)
          gradient: _isHovered
              ? const LinearGradient(
                  colors: [AppTheme.primary700, AppTheme.primary800],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                )
              : AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          boxShadow: [
            // shadow-lg
            BoxShadow(
              color: AppTheme.primary600.withValues(alpha: 0.3),
              blurRadius: _isHovered ? 15 : 10, // shadow-xl on hover
              offset: Offset(0, _isHovered ? 6 : 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isLoading ? null : widget.onPressed,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            child: Container(
              padding: effectivePadding,
              child: Center(
                child: widget.isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        widget.text,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: widget.fontSize ?? 16,
                          fontWeight: FontWeight.w600, // font-semibold
                          height: 1.0,
                        ),
                        textAlign: TextAlign.center,
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Secondary Button Widget
///
/// Replicates .btn-secondary from globals.css:
/// - White background
/// - Primary-600 text color
/// - Border-2 border-primary-600 (2px border)
/// - px-6 py-3 (24px horizontal, 12px vertical)
/// - rounded-lg (12px)
/// - font-semibold
/// - Hover: bg-primary-50
class SecondaryButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final double? fontSize;

  const SecondaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.width,
    this.padding,
    this.fontSize,
  });

  @override
  State<SecondaryButton> createState() => _SecondaryButtonState();
}

class _SecondaryButtonState extends State<SecondaryButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final effectivePadding =
        widget.padding ??
        const EdgeInsets.symmetric(horizontal: 24, vertical: 12);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Container(
        width: widget.width,
        decoration: BoxDecoration(
          color: _isHovered ? AppTheme.primary50 : Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          border: Border.all(color: AppTheme.primary600, width: 2),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isLoading ? null : widget.onPressed,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            child: Container(
              padding: effectivePadding,
              child: Center(
                child: widget.isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: AppTheme.primary600,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        widget.text,
                        style: TextStyle(
                          color: AppTheme.primary600,
                          fontSize: widget.fontSize ?? 16,
                          fontWeight: FontWeight.w600, // font-semibold
                          height: 1.0,
                        ),
                        textAlign: TextAlign.center,
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
