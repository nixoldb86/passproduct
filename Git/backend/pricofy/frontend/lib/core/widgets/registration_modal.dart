// Registration Modal
//
// Shows a modal prompting guest users to register when they try to access
// restricted features. Redirects to landing page for registration.

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../config/theme.dart';
import '../../../config/api_config.dart';
import '../extensions/l10n_extension.dart';

/// Modal that prompts guest users to register
class RegistrationModal extends StatelessWidget {
  final String? contextMessage;

  const RegistrationModal({super.key, this.contextMessage});

  /// Show the registration modal
  static Future<void> show(BuildContext context, {String? message}) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (_) => RegistrationModal(contextMessage: message),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primary100, Colors.purple.shade100],
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.lock_outline,
                color: AppTheme.primary600,
                size: 24,
              ),
            ),
            const SizedBox(height: 16),

            // Title
            Text(
              l10n.registrationModalTitle,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),

            // Context message
            Text(
              contextMessage ?? l10n.registrationModalDefault,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.gray600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),

            // Benefits list
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.gray50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.registrationModalBenefitsTitle,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.gray700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildBenefitItem(l10n.registrationModalBenefit1),
                  _buildBenefitItem(l10n.registrationModalBenefit2),
                  _buildBenefitItem(l10n.registrationModalBenefit3),
                  _buildBenefitItem(l10n.registrationModalBenefit4),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Buttons
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  Navigator.of(context).pop();
                  // Redirigir siempre a landing para registro
                  final landingUrl = ApiConfig.isProduction
                      ? 'https://pricofy.com/landing'
                      : 'https://dev.pricofy.com/#/landing';
                  final uri = Uri.parse(landingUrl);
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.platformDefault);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  l10n.registrationModalSignUp,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  side: BorderSide(color: AppTheme.gray300),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  l10n.registrationModalLater,
                  style: TextStyle(
                    color: AppTheme.gray700,
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

  Widget _buildBenefitItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.check,
            size: 16,
            color: AppTheme.primary600,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.gray600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
