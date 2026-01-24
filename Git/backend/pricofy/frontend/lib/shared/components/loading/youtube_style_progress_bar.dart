// YouTube-style Progress Bar
//
// A thin, animated progress bar that sits below the search input.
// Provides smooth interpolation between progress values for better UX.

import 'package:flutter/material.dart';
import '../../../config/theme.dart';

class YouTubeStyleProgressBar extends StatelessWidget {
  final double progress;
  final bool isVisible;
  final Duration animationDuration;

  const YouTubeStyleProgressBar({
    super.key,
    required this.progress,
    this.isVisible = true,
    this.animationDuration = const Duration(milliseconds: 300),
  });

  @override
  Widget build(BuildContext context) {
    if (!isVisible) return const SizedBox.shrink();

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: progress.clamp(0.0, 1.0)),
      duration: animationDuration,
      curve: Curves.easeInOut,
      builder: (context, animatedProgress, child) {
        return Container(
          height: 3,
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppTheme.gray200,
            borderRadius: BorderRadius.circular(1.5),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: animatedProgress,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primary500,
                    AppTheme.primary600,
                  ],
                ),
                borderRadius: BorderRadius.circular(1.5),
              ),
            ),
          ),
        );
      },
    );
  }
}
