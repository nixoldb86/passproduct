// User Status Section Widget
//
// Displays user's waitlist position (virtual or real).
// Shows different UI for approved vs pending users.

import 'package:flutter/material.dart';

import '../../../config/theme.dart';
import '../models/waitlist_user.dart';

class UserStatusSection extends StatelessWidget {
  final dynamic l10n;
  final bool isMobile;
  final WaitlistUser userStatus;
  final int maxRealPositions;
  final int firstRealPosition;

  const UserStatusSection({
    super.key,
    required this.l10n,
    required this.isMobile,
    required this.userStatus,
    required this.maxRealPositions,
    required this.firstRealPosition,
  });

  @override
  Widget build(BuildContext context) {
    final bool isApproved = userStatus.isApproved ||
        (userStatus.allStepsCompleted && userStatus.puestoReal != null);

    return Container(
      padding: EdgeInsets.all(isMobile ? 24 : 32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF312E81).withValues(alpha: 0.5), // primary-900/50
            const Color(0xFF581C87).withValues(alpha: 0.5), // purple-900/50
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppTheme.primary700,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          if (isApproved) ...[
            // Approved state
            Text(
              l10n.betaApprovedTitle,
              style: TextStyle(
                fontSize: isMobile ? 24 : 28,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              l10n.betaApprovedSubtitle
                  .replaceAll('{position}', userStatus.puestoReal.toString())
                  .replaceAll('{max}', (firstRealPosition + maxRealPositions - 1).toString()),
              style: TextStyle(
                fontSize: isMobile ? 16 : 20,
                color: AppTheme.gray300,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Text(
              '#${userStatus.puestoReal}',
              style: TextStyle(
                fontSize: isMobile ? 48 : 64,
                fontWeight: FontWeight.w700,
                color: AppTheme.primary400,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              l10n.betaRealPosition,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.gray400,
              ),
            ),
          ] else ...[
            // Registered but not approved
            Text(
              l10n.betaRegisteredTitle,
              style: TextStyle(
                fontSize: isMobile ? 24 : 28,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              l10n.betaRegisteredSubtitle,
              style: TextStyle(
                fontSize: isMobile ? 16 : 20,
                color: AppTheme.gray300,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Text(
              '#${userStatus.puestoVirtual}',
              style: TextStyle(
                fontSize: isMobile ? 48 : 64,
                fontWeight: FontWeight.w700,
                color: AppTheme.primary400,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              l10n.betaVirtualPosition,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.gray400,
              ),
            ),

            // Message when all steps completed but waiting for real position
            if (userStatus.allStepsCompleted && userStatus.puestoReal == null) ...[
              const SizedBox(height: 16),
              Text(
                l10n.betaStepsCompletedWaiting,
                style: TextStyle(
                  fontSize: 14,
                  color: const Color(0xFFFACC15), // yellow-400
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ],
      ),
    );
  }
}
