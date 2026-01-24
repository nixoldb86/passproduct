// Steps Progress Section Widget
//
// Shows waitlist steps with completion status.
// Users can verify step completion and copy referral link.

import 'package:flutter/material.dart';

import '../../../config/theme.dart';
import '../models/waitlist_user.dart';

class StepsProgressSection extends StatefulWidget {
  final dynamic l10n;
  final bool isMobile;
  final WaitlistUser userStatus;
  final bool checking;
  final String? error;
  final String referralLink;
  final VoidCallback onCheckStatus;
  final VoidCallback onCopyReferralLink;

  const StepsProgressSection({
    super.key,
    required this.l10n,
    required this.isMobile,
    required this.userStatus,
    required this.checking,
    this.error,
    required this.referralLink,
    required this.onCheckStatus,
    required this.onCopyReferralLink,
  });

  @override
  State<StepsProgressSection> createState() => _StepsProgressSectionState();
}

class _StepsProgressSectionState extends State<StepsProgressSection> {
  final Map<int, bool> _expanded = {1: false, 2: false, 3: false};

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(widget.isMobile ? 24 : 32),
      decoration: BoxDecoration(
        color: const Color(0xFF111827).withValues(alpha: 0.5), // gray-900/50
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF1F2937), // gray-800
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            widget.l10n.betaStepsTitle,
            style: TextStyle(
              fontSize: widget.isMobile ? 18 : 24,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),

          // Step 1: Follow
          _buildStepCard(
            stepNumber: 1,
            icon: Icons.person_add_outlined,
            iconColor: AppTheme.primary400,
            title: widget.l10n.betaStep1,
            description: widget.l10n.betaStep1Description,
            instructions: widget.l10n.betaStep1Instructions,
            isCompleted: widget.userStatus.step1Follow,
          ),
          const SizedBox(height: 16),

          // Step 2: Story/Comment
          _buildStepCard(
            stepNumber: 2,
            icon: Icons.chat_bubble_outline,
            iconColor: const Color(0xFFC084FC), // purple-400
            title: widget.l10n.betaStep2Title,
            description: widget.l10n.betaStep2Description,
            instructions: widget.l10n.betaStep2Instructions,
            isCompleted: widget.userStatus.step2Story,
          ),
          const SizedBox(height: 16),

          // Step 3: Invitations
          _buildStepCard(
            stepNumber: 3,
            icon: Icons.share_outlined,
            iconColor: const Color(0xFF4ADE80), // green-400
            title: widget.l10n.betaStep3Title,
            description: widget.l10n.betaStep3Description,
            instructions: widget.l10n.betaStep3Instructions,
            isCompleted: widget.userStatus.step3Invitations,
            showProgress: true,
          ),

          // Error message
          if (widget.error != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF7F1D1D).withValues(alpha: 0.5), // red-900/50
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: const Color(0xFFB91C1C), // red-700
                  width: 2,
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error,
                    color: Color(0xFFFECACA), // red-200
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      widget.error!,
                      style: const TextStyle(
                        color: Color(0xFFFECACA), // red-200
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 24),

          // Verify button
          ElevatedButton(
            onPressed: widget.checking ? null : widget.onCheckStatus,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary500,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              widget.checking ? widget.l10n.betaChecking : widget.l10n.betaVerifySteps,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepCard({
    required int stepNumber,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
    required String instructions,
    required bool isCompleted,
    bool showProgress = false,
  }) {
    final isExpanded = _expanded[stepNumber] ?? false;

    return Container(
      margin: EdgeInsets.symmetric(horizontal: widget.isMobile ? -8 : 0),
      decoration: BoxDecoration(
        color: isCompleted
            ? const Color(0xFF14532D).withValues(alpha: 0.3) // green-900/30
            : const Color(0xFF1F2937).withValues(alpha: 0.5), // gray-800/50
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCompleted
              ? const Color(0xFF15803D) // green-700
              : const Color(0xFF374151), // gray-700
          width: 2,
        ),
      ),
      child: Column(
        children: [
          // Header (clickable)
          InkWell(
            onTap: () {
              setState(() {
                _expanded[stepNumber] = !isExpanded;
              });
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: EdgeInsets.all(widget.isMobile ? 16 : 20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon circle
                  Container(
                    width: widget.isMobile ? 40 : 48,
                    height: widget.isMobile ? 40 : 48,
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? const Color(0xFF22C55E) // green-500
                          : const Color(0xFF374151), // gray-700
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Icon(
                      isCompleted ? Icons.check : icon,
                      color: isCompleted ? Colors.white : iconColor,
                      size: widget.isMobile ? 20 : 24,
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Title and description
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontSize: widget.isMobile ? 14 : 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          description,
                          style: TextStyle(
                            fontSize: widget.isMobile ? 13 : 15,
                            color: AppTheme.gray300,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Status + chevron
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isCompleted)
                        Text(
                          '✓ ${widget.l10n.betaCompleted}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF4ADE80), // green-400
                          ),
                        ),
                      const SizedBox(width: 8),
                      AnimatedRotation(
                        turns: isExpanded ? 0.5 : 0,
                        duration: const Duration(milliseconds: 200),
                        child: Icon(
                          Icons.keyboard_arrow_down,
                          color: AppTheme.gray400,
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Expandable content
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Container(
              width: double.infinity,
              margin: EdgeInsets.fromLTRB(
                widget.isMobile ? 16 : 20,
                0,
                widget.isMobile ? 16 : 20,
                widget.isMobile ? 16 : 20,
              ),
              padding: EdgeInsets.all(widget.isMobile ? 12 : 16),
              decoration: BoxDecoration(
                color: const Color(0xFF030712).withValues(alpha: 0.8), // gray-950/80
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: const Color(0xFF1F2937), // gray-800
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    instructions,
                    style: TextStyle(
                      fontSize: widget.isMobile ? 13 : 15,
                      color: AppTheme.gray400,
                      height: 1.6,
                    ),
                  ),

                  // Progress bar for step 3
                  if (showProgress) ...[
                    const SizedBox(height: 12),
                    Text(
                      widget.userStatus.step3Invitations
                          ? widget.l10n.betaStep3Complete
                          : widget.l10n.betaStep3Progress(
                              (3 - widget.userStatus.invitacionesRealizadas)
                                  .clamp(0, 3)
                                  .toString(),
                            ),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.gray300,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (widget.userStatus.invitacionesRealizadas / 3)
                            .clamp(0.0, 1.0),
                        minHeight: 12,
                        backgroundColor: const Color(0xFF374151), // gray-700
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppTheme.primary500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${widget.userStatus.invitacionesRealizadas} / 3 ${widget.l10n.betaInvitationsRegistered}',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.gray400,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Referral link section
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1F2937), // gray-800
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.l10n.betaShareLink,
                            style: TextStyle(
                              fontSize: 14,
                              color: AppTheme.gray400,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF374151), // gray-700
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    widget.referralLink,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.white,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton(
                                onPressed: widget.onCopyReferralLink,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primary500,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 10,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                                child: Text(
                                  widget.l10n.betaCopyLink,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            crossFadeState:
                isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
          ),
        ],
      ),
    );
  }
}
