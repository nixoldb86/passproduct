// Motivational Text Rotator
//
// Displays rotating motivational messages during search.
// Only visible when searching AND no results yet.

import 'dart:async';
import 'package:flutter/material.dart';
import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';

class MotivationalTextRotator extends StatefulWidget {
  final Duration rotationInterval;

  const MotivationalTextRotator({
    super.key,
    this.rotationInterval = const Duration(seconds: 3),
  });

  @override
  State<MotivationalTextRotator> createState() => _MotivationalTextRotatorState();
}

class _MotivationalTextRotatorState extends State<MotivationalTextRotator> {
  int _currentIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(widget.rotationInterval, (timer) {
      if (mounted) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % 4;
        });
      }
    });
  }

  String _getMessage(dynamic l10n) {
    switch (_currentIndex) {
      case 0:
        return l10n.searchProgressSearching;
      case 1:
        return l10n.searchProgressAnalyzing;
      case 2:
        return l10n.searchProgressFinding;
      case 3:
        return l10n.searchProgressAlmostDone;
      default:
        return l10n.searchProgressSearching;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, 0.3),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOut,
            )),
            child: child,
          ),
        );
      },
      child: Text(
        _getMessage(l10n),
        key: ValueKey<int>(_currentIndex),
        style: TextStyle(
          fontSize: 14,
          color: AppTheme.gray600,
          fontWeight: FontWeight.w500,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}
