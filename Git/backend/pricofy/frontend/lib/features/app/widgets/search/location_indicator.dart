// Location Indicator Widget
//
// Shows the detected user location in the search UI.
// Compact version: only shows pin icon, tap to see full info in popover.
// Helps users understand where distances are calculated from.
//
// Supports two variants:
// - standard: Square icon (32x32) for use in control rows
// - searchBar: Circular icon (28x28) for embedding in search bar

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../config/theme.dart';
import '../../../../core/providers/location_provider.dart';
import '../../../../core/utils/country_flags.dart';

/// Visual variant for the location indicator
enum LocationIndicatorVariant {
  /// Square icon (32x32) for control rows
  standard,
  /// Circular icon (28x28) for search bar
  searchBar,
}

/// Compact indicator showing the user's detected location.
/// Shows only pin icon; tap to reveal full location in popover.
class LocationIndicator extends StatefulWidget {
  final LocationIndicatorVariant variant;

  const LocationIndicator({
    super.key,
    this.variant = LocationIndicatorVariant.standard,
  });

  @override
  State<LocationIndicator> createState() => _LocationIndicatorState();
}

class _LocationIndicatorState extends State<LocationIndicator> {
  final GlobalKey _iconKey = GlobalKey();
  OverlayEntry? _overlayEntry;
  bool _isPopoverVisible = false;

  @override
  void dispose() {
    _removeOverlay();
    super.dispose();
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) {
      setState(() => _isPopoverVisible = false);
    }
  }

  void _showPopover(BuildContext context, dynamic location) {
    if (_isPopoverVisible) {
      _removeOverlay();
      return;
    }

    final RenderBox? renderBox = _iconKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final position = renderBox.localToGlobal(Offset.zero);
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (context) => Stack(
        children: [
          // Tap barrier to close popover
          Positioned.fill(
            child: GestureDetector(
              onTap: _removeOverlay,
              behavior: HitTestBehavior.opaque,
              child: Container(color: Colors.transparent),
            ),
          ),
          // Popover positioned below the icon
          Positioned(
            left: position.dx,
            top: position.dy + size.height + 8,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(12),
              shadowColor: Colors.black26,
              child: _buildPopoverContent(location),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isPopoverVisible = true);
  }

  Widget _buildPopoverContent(dynamic location) {
    final flag = getCountryFlagEmoji(location.countryCode);

    // Build display parts
    final parts = <String>[];
    if (location.postalCode != null) {
      parts.add(location.postalCode!);
    }
    if (location.municipality != null) {
      parts.add(location.municipality!);
    }

    // Fallback to country code if no other info
    if (parts.isEmpty) {
      parts.add(location.countryCode);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      constraints: const BoxConstraints(maxWidth: 280),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: AppTheme.primary50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Icon(
                Icons.location_on_rounded,
                size: 16,
                color: AppTheme.primary600,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Flexible(
            child: Text(
              parts.join(' · '),
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppTheme.gray800,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            flag,
            style: const TextStyle(fontSize: 18),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final locationProvider = context.watch<LocationProvider>();
    final isSearchBar = widget.variant == LocationIndicatorVariant.searchBar;

    // Detecting state
    if (locationProvider.isDetecting) {
      return _buildDetectingState(isSearchBar);
    }

    // No location state
    final location = locationProvider.location;
    if (location == null) {
      // SearchBar variant shows disabled icon, standard hides completely
      if (isSearchBar) {
        return _buildNoLocationState();
      }
      return const SizedBox.shrink();
    }

    // Location found
    return _buildCompactIcon(context, location, isSearchBar);
  }

  Widget _buildDetectingState(bool isSearchBar) {
    return _PulsingLocationIcon(
      key: _iconKey,
      isSearchBar: isSearchBar,
    );
  }

  Widget _buildNoLocationState() {
    return Container(
      key: _iconKey,
      width: 28,
      height: 28,
      margin: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppTheme.gray100,
      ),
      child: Center(
        child: Icon(Icons.location_off_rounded, size: 14, color: AppTheme.gray400),
      ),
    );
  }

  Widget _buildCompactIcon(BuildContext context, dynamic location, bool isSearchBar) {
    final size = isSearchBar ? 28.0 : 32.0;
    final iconSize = isSearchBar ? 16.0 : 18.0;

    return GestureDetector(
      onTap: () => _showPopover(context, location),
      child: Container(
        key: _iconKey,
        width: size,
        height: size,
        margin: isSearchBar ? const EdgeInsets.all(2) : null,
        decoration: BoxDecoration(
          shape: isSearchBar ? BoxShape.circle : BoxShape.rectangle,
          borderRadius: isSearchBar ? null : BorderRadius.circular(10),
          // SearchBar variant uses gradient when active, standard uses solid color
          gradient: isSearchBar && _isPopoverVisible
              ? LinearGradient(
                  colors: [AppTheme.primary500, Colors.purple.shade500],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSearchBar && _isPopoverVisible
              ? null
              : (_isPopoverVisible ? AppTheme.primary50 : (isSearchBar ? AppTheme.primary50 : AppTheme.gray100)),
          border: isSearchBar && _isPopoverVisible
              ? null
              : Border.all(
                  color: _isPopoverVisible ? AppTheme.primary400 : (isSearchBar ? AppTheme.primary200 : AppTheme.gray200),
                  width: 1,
                ),
        ),
        child: Center(
          child: Icon(
            Icons.location_on_rounded,
            size: iconSize,
            color: _isPopoverVisible
                ? (isSearchBar ? Colors.white : AppTheme.primary600)
                : (isSearchBar ? AppTheme.primary600 : AppTheme.gray500),
          ),
        ),
      ),
    );
  }
}

/// Animated pulsing location icon for detecting state
class _PulsingLocationIcon extends StatefulWidget {
  final bool isSearchBar;

  const _PulsingLocationIcon({
    super.key,
    required this.isSearchBar,
  });

  @override
  State<_PulsingLocationIcon> createState() => _PulsingLocationIconState();
}

class _PulsingLocationIconState extends State<_PulsingLocationIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _opacityAnimation = Tween<double>(begin: 1.0, end: 0.3).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = widget.isSearchBar ? 28.0 : 32.0;
    final iconSize = widget.isSearchBar ? 16.0 : 18.0;

    return Container(
      width: size,
      height: size,
      margin: widget.isSearchBar ? const EdgeInsets.all(2) : null,
      decoration: BoxDecoration(
        color: AppTheme.gray100,
        shape: widget.isSearchBar ? BoxShape.circle : BoxShape.rectangle,
        borderRadius: widget.isSearchBar ? null : BorderRadius.circular(10),
      ),
      child: Center(
        child: FadeTransition(
          opacity: _opacityAnimation,
          child: Icon(
            Icons.location_on_rounded,
            size: iconSize,
            color: AppTheme.gray400,
          ),
        ),
      ),
    );
  }
}
