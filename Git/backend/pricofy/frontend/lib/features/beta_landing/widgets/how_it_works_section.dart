// How It Works Section Widget
//
// Accordion-style section explaining the beta waitlist process.
// Each step can be expanded to show detailed instructions.

import 'package:flutter/material.dart';

import '../../../config/theme.dart';

class HowItWorksSection extends StatefulWidget {
  final dynamic l10n;
  final bool isMobile;

  const HowItWorksSection({
    super.key,
    required this.l10n,
    required this.isMobile,
  });

  @override
  State<HowItWorksSection> createState() => _HowItWorksSectionState();
}

class _HowItWorksSectionState extends State<HowItWorksSection> {
  final Map<int, bool> _expanded = {1: false, 2: false, 3: false};

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(widget.isMobile ? 12 : 24),
      decoration: BoxDecoration(
        color: const Color(0xFF111827).withValues(alpha: 0.5), // gray-900/50
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF1F2937), // gray-800
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            widget.l10n.betaHowItWorksTitle,
            style: TextStyle(
              fontSize: widget.isMobile ? 20 : 28,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            widget.l10n.betaHowItWorksDescription,
            style: TextStyle(
              fontSize: widget.isMobile ? 14 : 16,
              color: AppTheme.gray300,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: widget.isMobile ? 20 : 32),

          // Step 1
          _buildStepAccordion(
            stepNumber: 1,
            icon: Icons.person_add_outlined,
            iconColor: AppTheme.primary400,
            title: widget.l10n.betaStep1Title,
            description: widget.l10n.betaStep1Description,
            instructions: widget.l10n.betaStep1Instructions,
          ),
          const SizedBox(height: 16),

          // Step 2
          _buildStepAccordion(
            stepNumber: 2,
            icon: Icons.chat_bubble_outline,
            iconColor: const Color(0xFFC084FC), // purple-400
            title: widget.l10n.betaStep2Title,
            description: widget.l10n.betaStep2Description,
            instructions: widget.l10n.betaStep2Instructions,
          ),
          const SizedBox(height: 16),

          // Step 3
          _buildStepAccordion(
            stepNumber: 3,
            icon: Icons.share_outlined,
            iconColor: const Color(0xFF4ADE80), // green-400
            title: widget.l10n.betaStep3Title,
            description: widget.l10n.betaStep3Description,
            instructions: widget.l10n.betaStep3Instructions,
          ),
        ],
      ),
    );
  }

  Widget _buildStepAccordion({
    required int stepNumber,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
    required String instructions,
  }) {
    final isExpanded = _expanded[stepNumber] ?? false;

    return Container(
      margin: EdgeInsets.symmetric(horizontal: widget.isMobile ? -8 : 0),
      decoration: BoxDecoration(
        color: const Color(0xFF1F2937).withValues(alpha: 0.5), // gray-800/50
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF374151), // gray-700
          width: 1,
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
              padding: EdgeInsets.all(widget.isMobile ? 12 : 20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon
                  Container(
                    width: widget.isMobile ? 40 : 48,
                    height: widget.isMobile ? 40 : 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF374151), // gray-700
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Icon(
                      icon,
                      color: iconColor,
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
                            fontWeight: FontWeight.w700,
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

                  // Chevron
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
            ),
          ),

          // Expandable content
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Container(
              width: double.infinity,
              margin: EdgeInsets.fromLTRB(
                widget.isMobile ? 12 : 20,
                0,
                widget.isMobile ? 12 : 20,
                widget.isMobile ? 12 : 20,
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
              child: Text(
                instructions,
                style: TextStyle(
                  fontSize: widget.isMobile ? 13 : 15,
                  color: AppTheme.gray400,
                  height: 1.6,
                ),
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
