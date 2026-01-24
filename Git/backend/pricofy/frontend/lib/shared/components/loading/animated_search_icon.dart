// Animated Search Icon
//
// Transitions between search icon (lupa) and loading spinner.
// Shows spinner when searching, returns to lupa when user edits text.

import 'package:flutter/material.dart';

class AnimatedSearchIcon extends StatelessWidget {
  final bool isSearching;
  final bool isEditing;
  final double size;
  final Color color;

  const AnimatedSearchIcon({
    super.key,
    required this.isSearching,
    this.isEditing = false,
    this.size = 20,
    this.color = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    // Show lupa if user is editing (even if still searching in background)
    final showSpinner = isSearching && !isEditing;

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: ScaleTransition(
            scale: animation,
            child: child,
          ),
        );
      },
      child: showSpinner
          ? SizedBox(
              key: const ValueKey('spinner'),
              width: size,
              height: size,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            )
          : Icon(
              Icons.search,
              key: const ValueKey('search'),
              color: color,
              size: size,
            ),
    );
  }
}
