// Footer Component
//
// Footer with 4 columns: Brand, Product, Company, Legal
// Dark gradient background

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../config/theme.dart';
import '../../config/routes.dart';
import '../../core/extensions/l10n_extension.dart';

class Footer extends StatelessWidget {
  const Footer({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.gray900, AppTheme.gray900, AppTheme.primary900],
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 48),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1280),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 4 columns grid
            LayoutBuilder(
              builder: (context, constraints) {
                final isMobile = constraints.maxWidth < 768;

                if (isMobile) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildBrandColumn(l10n),
                      const SizedBox(height: 32),
                      _buildProductColumn(context, l10n),
                      const SizedBox(height: 32),
                      _buildCompanyColumn(context, l10n),
                      const SizedBox(height: 32),
                      _buildLegalColumn(context, l10n),
                    ],
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _buildBrandColumn(l10n)),
                    Expanded(child: _buildProductColumn(context, l10n)),
                    Expanded(child: _buildCompanyColumn(context, l10n)),
                    Expanded(child: _buildLegalColumn(context, l10n)),
                  ],
                );
              },
            ),

            const SizedBox(height: 32),
            Container(height: 1, color: AppTheme.gray800),
            const SizedBox(height: 32),

            // Copyright
            Center(
              child: Text(
                '© ${DateTime.now().year} Pricofy. ${l10n.footerCopyright}',
                style: TextStyle(fontSize: 14, color: AppTheme.gray300),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 16),

            // reCAPTCHA notice
            Center(
              child: Wrap(
                alignment: WrapAlignment.center,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    l10n.footerRecaptchaProtected,
                    style: TextStyle(fontSize: 12, color: AppTheme.gray400),
                  ),
                  GestureDetector(
                    onTap: () {},
                    child: MouseRegion(
                      cursor: SystemMouseCursors.click,
                      child: Text(
                        l10n.footerRecaptchaPrivacy,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.primary400,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                  Text(
                    l10n.footerRecaptchaAnd,
                    style: TextStyle(fontSize: 12, color: AppTheme.gray400),
                  ),
                  GestureDetector(
                    onTap: () {},
                    child: MouseRegion(
                      cursor: SystemMouseCursors.click,
                      child: Text(
                        l10n.footerRecaptchaTerms,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.primary400,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                  Text(
                    l10n.footerRecaptchaApply,
                    style: TextStyle(fontSize: 12, color: AppTheme.gray400),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBrandColumn(dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [AppTheme.primary400, AppTheme.primary600],
          ).createShader(bounds),
          child: const Text(
            'Pricofy',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          l10n.footerDescription,
          style: TextStyle(fontSize: 14, color: AppTheme.gray300),
        ),
      ],
    );
  }

  Widget _buildProductColumn(BuildContext context, dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.footerProduct,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        _buildFooterLink(context, l10n.footerFeatures, AppRoutes.features),
        const SizedBox(height: 8),
        _buildFooterLink(context, l10n.footerPricing, AppRoutes.pricing),
        const SizedBox(height: 8),
        _buildFooterLink(context, l10n.footerDocumentation, '#'),
      ],
    );
  }

  Widget _buildCompanyColumn(BuildContext context, dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.footerCompany,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        _buildFooterLink(context, l10n.footerAbout, '#'),
        const SizedBox(height: 8),
        _buildFooterLink(context, l10n.footerBlog, '#'),
        const SizedBox(height: 8),
        _buildFooterLink(context, l10n.footerContact, AppRoutes.contact),
      ],
    );
  }

  Widget _buildLegalColumn(BuildContext context, dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.footerLegal,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        _buildFooterLink(context, l10n.footerPrivacy, '#'),
        const SizedBox(height: 8),
        _buildFooterLink(context, l10n.footerTerms, '#'),
        const SizedBox(height: 8),
        _buildFooterLink(context, l10n.footerCookies, '#'),
      ],
    );
  }

  Widget _buildFooterLink(BuildContext context, String text, String route) {
    return GestureDetector(
      onTap: () {
        if (route != '#') {
          context.go(route);
        }
      },
      child: MouseRegion(
        cursor: route != '#' ? SystemMouseCursors.click : SystemMouseCursors.basic,
        child: Text(
          text,
          style: TextStyle(fontSize: 14, color: AppTheme.gray300),
        ),
      ),
    );
  }
}
