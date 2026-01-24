// Reset Password Screen
//
// Allows users to confirm password reset with verification code.
// Code is received via email from forgot-password flow.
//
// Matches pricofy-frontend/app/reset-password/page.tsx

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../config/theme.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String? email;

  const ResetPasswordScreen({super.key, this.email});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _loading = false;
  bool _success = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.email != null) {
      _emailController.text = widget.email!;
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validatePassword(String? value) {
    final l10n = context.l10n;
    if (value == null || value.isEmpty) {
      return l10n.authPasswordRequired;
    }
    if (value.length < 8) {
      return l10n.authPasswordMinLength;
    }
    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return l10n.authPasswordNeedsUppercase;
    }
    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return l10n.authPasswordNeedsLowercase;
    }
    if (!RegExp(r'[0-9]').hasMatch(value)) {
      return l10n.authPasswordNeedsDigit;
    }
    return null;
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    // Validate passwords match
    if (_newPasswordController.text != _confirmPasswordController.text) {
      final l10n = context.l10n;
      setState(() {
        _error = l10n.authPasswordsDoNotMatch;
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await Amplify.Auth.confirmResetPassword(
        username: _emailController.text.trim(),
        newPassword: _newPasswordController.text,
        confirmationCode: _codeController.text.trim(),
      );

      setState(() {
        _success = true;
      });

      // Redirect to login after 3 seconds
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) {
        context.go('/admin/login');
      }
    } on AuthException catch (e) {
      setState(() {
        if (e.message.contains('CodeMismatchException')) {
          _error = 'Invalid verification code';
        } else if (e.message.contains('ExpiredCodeException')) {
          _error = 'Verification code expired. Please request a new one.';
        } else if (e.message.contains('InvalidPasswordException')) {
          _error = 'Password does not meet requirements';
        } else {
          _error = e.message;
        }
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to reset password: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.primary600,
              AppTheme.primary700,
            ],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Header
                        Icon(
                          Icons.lock_reset,
                          size: 64,
                          color: AppTheme.primary600,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          l10n.authResetPassword,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          l10n.authResetPasswordDescription,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 32),

                        // Success Message
                        if (_success) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green[50],
                              border: Border.all(color: Colors.green[300]!),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  l10n.authPasswordResetSuccess,
                                  style: TextStyle(
                                    color: Colors.green[700],
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  l10n.authRedirectingToLogin,
                                  style: TextStyle(
                                    color: Colors.green[700],
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Error Message
                        if (_error != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red[50],
                              border: Border.all(color: Colors.red[300]!),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _error!,
                              style: TextStyle(
                                color: Colors.red[700],
                                fontSize: 14,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Form
                        if (!_success) ...[
                          // Email
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              labelText: l10n.authEmailAddress,
                              prefixIcon: const Icon(Icons.email_outlined),
                              hintText: 'admin@pricofy.com',
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return l10n.authEmailRequired;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          // Verification Code
                          TextFormField(
                            controller: _codeController,
                            keyboardType: TextInputType.number,
                            maxLength: 6,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 24,
                              letterSpacing: 8,
                            ),
                            decoration: InputDecoration(
                              labelText: l10n.authVerificationCode,
                              hintText: '123456',
                              counterText: '',
                              helperText: l10n.authVerificationCodeHelper,
                            ),
                            validator: (value) {
                              if (value == null || value.length != 6) {
                                return l10n.authMfaCodeRequired;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          // New Password
                          TextFormField(
                            controller: _newPasswordController,
                            obscureText: true,
                            decoration: InputDecoration(
                              labelText: l10n.authNewPassword,
                              prefixIcon: const Icon(Icons.lock_outline),
                              hintText: '••••••••',
                              helperText: l10n.authPasswordRequirements,
                              helperMaxLines: 2,
                            ),
                            validator: (value) => _validatePassword(value),
                          ),
                          const SizedBox(height: 16),

                          // Confirm Password
                          TextFormField(
                            controller: _confirmPasswordController,
                            obscureText: true,
                            decoration: InputDecoration(
                              labelText: l10n.authConfirmPassword,
                              prefixIcon: const Icon(Icons.lock_outline),
                              hintText: '••••••••',
                            ),
                            validator: (value) {
                              if (value != _newPasswordController.text) {
                                return l10n.authPasswordsDoNotMatch;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),

                          // Submit Button
                          ElevatedButton(
                            onPressed: _loading ? null : _handleSubmit,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              backgroundColor: AppTheme.primary600,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: _loading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  )
                                : Text(
                                    l10n.authResetPassword,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                          ),

                          const SizedBox(height: 16),

                          // Links
                          Column(
                            children: [
                              TextButton(
                                onPressed: () => context.go('/forgot-password'),
                                child: Text(
                                  l10n.authResendCode,
                                  style: TextStyle(
                                    color: AppTheme.primary600,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.go('/admin/login'),
                                child: Text(
                                  l10n.authBackToAdminLogin,
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

