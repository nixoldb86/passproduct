// Contact Page
//
// Contact form with validation and API submission

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../config/theme.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../core/utils/validators.dart';

class ContactPage extends StatefulWidget {
  const ContactPage({super.key});

  @override
  State<ContactPage> createState() => _ContactPageState();
}

class _ContactPageState extends State<ContactPage> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _emailController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _comentarioController = TextEditingController();

  bool _isSubmitting = false;
  bool _submitSuccess = false;
  String? _submitError;

  @override
  void dispose() {
    _nombreController.dispose();
    _emailController.dispose();
    _telefonoController.dispose();
    _comentarioController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
      _submitError = null;
    });

    try {
      final apiClient = context.read<BffApiClient>();
      await apiClient.submitContact(
        nombre: _nombreController.text.trim(),
        email: _emailController.text.trim(),
        telefono: _telefonoController.text.trim(),
        comentario: _comentarioController.text.trim(),
      );

      setState(() {
        _submitSuccess = true;
        _isSubmitting = false;
      });

      // Reset form after 3 seconds
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) {
        setState(() {
          _nombreController.clear();
          _emailController.clear();
          _telefonoController.clear();
          _comentarioController.clear();
          _submitSuccess = false;
        });
      }
    } catch (e) {
      setState(() {
        _submitError = e.toString();
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    // Content only - layout (navbar + footer) provided by PublicLayout shell
    return Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppTheme.primary50, Colors.white],
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 80),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 896),
            child: Column(
              children: [
                // Title
                Text(
                  l10n.contactTitle,
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.gray900,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),

                // Description
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 600),
                  child: Text(
                    l10n.contactDescription,
                    style: TextStyle(fontSize: 20, color: AppTheme.gray600),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 48),

                // Contact Info + Form
                LayoutBuilder(
                  builder: (context, constraints) {
                    final isMobile = constraints.maxWidth < 1024;

                    if (isMobile) {
                      return Column(
                        children: [
                          _buildContactInfo(l10n),
                          const SizedBox(height: 32),
                          _buildContactForm(l10n),
                        ],
                      );
                    }

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 1, child: _buildContactInfo(l10n)),
                        const SizedBox(width: 32),
                        Expanded(flex: 2, child: _buildContactForm(l10n)),
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

  Widget _buildContactInfo(dynamic l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.contactContactInfo,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppTheme.gray900,
          ),
        ),
        const SizedBox(height: 24),

        // Email
        _buildInfoItem(
          Icons.email_outlined,
          l10n.contactEmail,
          'sales@pricofy.com',
        ),
        const SizedBox(height: 16),

        // Phone
        _buildInfoItem(
          Icons.phone_outlined,
          l10n.contactPhone,
          '+34 600 000 000',
        ),
        const SizedBox(height: 16),

        // Location
        _buildInfoItem(
          Icons.location_on_outlined,
          l10n.contactLocation,
          l10n.contactLocationValue,
        ),
        const SizedBox(height: 24),

        // Schedule
        Container(
          padding: const EdgeInsets.only(top: 24),
          decoration: BoxDecoration(
            border: Border(top: BorderSide(color: AppTheme.gray200)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.contactSchedule,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.gray900,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '${l10n.contactScheduleWeekdays}: ${l10n.contactScheduleWeekdaysTime}',
                style: TextStyle(fontSize: 14, color: AppTheme.gray600),
              ),
              const SizedBox(height: 4),
              Text(
                '${l10n.contactScheduleWeekend}: ${l10n.contactScheduleWeekendTime}',
                style: TextStyle(fontSize: 14, color: AppTheme.gray600),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String title, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: AppTheme.primary100,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: Icon(icon, color: AppTheme.primary600, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.gray900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(fontSize: 16, color: AppTheme.primary600),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildContactForm(dynamic l10n) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusXl),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(32),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.contactSendMessage,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppTheme.gray900,
              ),
            ),
            const SizedBox(height: 24),

            // Nombre
            TextFormField(
              controller: _nombreController,
              decoration: InputDecoration(
                labelText: '${l10n.contactName} *',
                hintText: l10n.contactNamePlaceholder,
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return l10n.contactErrorsNameRequired;
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Email
            TextFormField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: '${l10n.contactEmail} *',
                hintText: l10n.contactEmailPlaceholder,
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                final result = validateEmail(value ?? '');
                if (!result.valid) {
                  return result.error ?? l10n.contactErrorsEmailInvalid;
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Teléfono
            TextFormField(
              controller: _telefonoController,
              decoration: InputDecoration(
                labelText: '${l10n.contactPhoneLabel} *',
                hintText: l10n.contactPhonePlaceholder,
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return l10n.contactErrorsPhoneRequired;
                }
                if (!RegExp(r'^[\d\s\-\+\(\)]+$').hasMatch(value)) {
                  return l10n.contactErrorsPhoneInvalid;
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Comentario
            TextFormField(
              controller: _comentarioController,
              decoration: InputDecoration(
                labelText: '${l10n.contactComment} *',
                hintText: l10n.contactCommentPlaceholder,
              ),
              maxLines: 6,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return l10n.contactErrorsCommentRequired;
                }
                if (value.trim().length < 10) {
                  return l10n.contactErrorsCommentMinLength;
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Error message
            if (_submitError != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red.shade200),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: Text(
                  _submitError!,
                  style: TextStyle(color: Colors.red.shade700),
                ),
              ),

            // Success message
            if (_submitSuccess)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  border: Border.all(color: Colors.green.shade200),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: Text(
                  l10n.contactSuccess,
                  style: TextStyle(color: Colors.green.shade700),
                ),
              ),

            // Submit button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  ),
                  elevation: 4,
                ),
                child: Text(
                  _isSubmitting ? l10n.contactSending : l10n.contactSend,
                  style: const TextStyle(
                    fontSize: 18,
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
