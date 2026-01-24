// Use Cases Section Widget
//
// Migrated from pricofy-frontend/components/UseCases.tsx (128 lines)
// 2 cards: Sell and Buy

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/providers/form_provider.dart';

class UseCasesSection extends StatelessWidget {
  const UseCasesSection({super.key});

  @override
  Widget build(BuildContext context) {
    final formProvider = context.read<FormProvider>();
    final l10n = context.l10n;

    return Container(
      color: AppTheme.gray50,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 80),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1280),
          child: Column(
            children: [
              // Title
              Text(
                l10n.useCasesTitle,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              // Cards Grid
              LayoutBuilder(
                builder: (context, constraints) {
                  final isMobile = constraints.maxWidth < 768;

                  if (isMobile) {
                    return Column(
                      children: [
                        _buildSellCard(context, l10n, formProvider),
                        const SizedBox(height: 32),
                        _buildBuyCard(context, l10n, formProvider),
                      ],
                    );
                  }

                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _buildSellCard(context, l10n, formProvider),
                      ),
                      const SizedBox(width: 32),
                      Expanded(
                        child: _buildBuyCard(context, l10n, formProvider),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSellCard(
    BuildContext context,
    dynamic l10n,
    FormProvider formProvider,
  ) {
    return _HoverUseCaseCard(
      title: l10n.useCasesSellTitle,
      description: l10n.useCasesSellDescription,
      steps: [
        l10n.useCasesSellStep1,
        l10n.useCasesSellStep2,
        l10n.useCasesSellStep3,
      ],
      buttonText: l10n.useCasesSellButton,
      icon: Icons.add,
      iconBgColor: Colors.green,
      onPressed: () => formProvider.openSellForm(),
    );
  }

  Widget _buildBuyCard(
    BuildContext context,
    dynamic l10n,
    FormProvider formProvider,
  ) {
    return _HoverUseCaseCard(
      title: l10n.useCasesBuyTitle,
      description: l10n.useCasesBuyDescription,
      steps: [
        l10n.useCasesBuyStep1,
        l10n.useCasesBuyStep2,
        l10n.useCasesBuyStep3,
      ],
      buttonText: l10n.useCasesBuyButton,
      icon: Icons.search,
      iconBgColor: AppTheme.primary600,
      onPressed: () => formProvider.openBuyForm(),
    );
  }

}

class _HoverUseCaseCard extends StatefulWidget {
  final String title;
  final String description;
  final List<String> steps;
  final String buttonText;
  final IconData icon;
  final Color iconBgColor;
  final VoidCallback onPressed;

  const _HoverUseCaseCard({
    required this.title,
    required this.description,
    required this.steps,
    required this.buttonText,
    required this.icon,
    required this.iconBgColor,
    required this.onPressed,
  });

  @override
  State<_HoverUseCaseCard> createState() => _HoverUseCaseCardState();
}

class _HoverUseCaseCardState extends State<_HoverUseCaseCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        transform: Matrix4.identity()..translateByDouble(0.0, _isHovered ? -8.0 : 0.0, 0.0, 1.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusXl),
          border: Border.all(
            color: _isHovered ? AppTheme.primary500 : Colors.transparent,
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: _isHovered
                  ? AppTheme.primary500.withValues(alpha: 0.2)
                  : Colors.black.withValues(alpha: 0.05),
              blurRadius: _isHovered ? 30 : 10,
              offset: Offset(0, _isHovered ? 12 : 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: widget.iconBgColor,
                    shape: BoxShape.circle,
                    boxShadow: [
                      if (_isHovered)
                        BoxShadow(
                          color: widget.iconBgColor.withValues(alpha: 0.4),
                          blurRadius: 12,
                        ),
                    ],
                  ),
                  child: AnimatedScale(
                    scale: _isHovered ? 1.2 : 1.0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(widget.icon, color: Colors.white, size: 24),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              widget.description,
              style: TextStyle(
                fontSize: 16,
                color: AppTheme.gray700,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ...widget.steps.map((step) => Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: const BoxDecoration(
                          color: Colors.green,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check,
                            color: Colors.white, size: 12),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          step,
                          style:
                              TextStyle(fontSize: 14, color: AppTheme.gray600),
                        ),
                      ),
                    ],
                  ),
                )),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: widget.onPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  ),
                  elevation: _isHovered ? 8 : 4,
                  shadowColor: AppTheme.primary600.withValues(alpha: 0.4),
                ),
                child: Text(
                  widget.buttonText,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
