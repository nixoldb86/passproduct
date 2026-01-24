// Admin Login Screen
//
// Admin login with email + password (traditional auth)
// Matches pricofy-frontend/app/admin/login/page.tsx
//
// Features:
// - Email + Password authentication
// - Handles NEW_PASSWORD_REQUIRED challenge
// - Handles MFA challenges (if enabled)
// - Redirects to /admin on success
// - Link to forgot-password (TODO: implement page)

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../config/theme.dart';

class AdminLoginScreen extends StatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  State<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends State<AdminLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _mfaCodeController = TextEditingController();

  bool _loading = false;
  String? _error;
  bool _needsPasswordChange = false;
  bool _needsMFA = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _mfaCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // Use traditional sign in (email + password)
      final result = await Amplify.Auth.signIn(
        username: _emailController.text.trim(),
        password: _passwordController.text,
      );

      if (result.isSignedIn) {
        // Successfully signed in - reload auth state
        // AuthProvider will detect the signed in state automatically
        // via Hub events, but we can force a reload here
        await Future.delayed(const Duration(milliseconds: 500));
        
        if (mounted) {
          context.go('/admin');
        }
      } else {
        // Handle challenges
        if (result.nextStep.signInStep == AuthSignInStep.confirmSignInWithNewPassword) {
          setState(() {
            _needsPasswordChange = true;
            _error = null;
          });
        } else if (result.nextStep.signInStep == AuthSignInStep.confirmSignInWithSmsMfaCode ||
                   result.nextStep.signInStep == AuthSignInStep.confirmSignInWithCustomChallenge ||
                   result.nextStep.signInStep == AuthSignInStep.confirmSignInWithTotpMfaCode) {
          setState(() {
            _needsMFA = true;
            _error = null;
          });
        } else {
          setState(() {
            _error = 'Sign in incomplete: ${result.nextStep.signInStep}';
          });
        }
      }
    } on AuthException catch (e) {
      setState(() {
        if (e.message.contains('NotAuthorizedException') ||
            e.message.contains('Incorrect username or password')) {
          _error = 'Invalid email or password';
        } else if (e.message.contains('UserNotFoundException')) {
          _error = 'User not found';
        } else if (e.message.contains('TooManyRequestsException')) {
          _error = 'Too many attempts. Please try again later.';
        } else {
          _error = e.message;
        }
      });
    } catch (e) {
      setState(() {
        _error = 'Login failed: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _handlePasswordChange() async {
    if (_newPasswordController.text != _confirmPasswordController.text) {
      setState(() {
        _error = 'Passwords do not match';
      });
      return;
    }

    if (_newPasswordController.text.length < 8) {
      setState(() {
        _error = 'Password must be at least 8 characters';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final result = await Amplify.Auth.confirmSignIn(
        confirmationValue: _newPasswordController.text,
      );

      if (result.isSignedIn) {
        // AuthProvider will reload automatically via Hub events
        await Future.delayed(const Duration(milliseconds: 300));
        
        if (mounted) {
          context.go('/admin');
        }
      }
    } on AuthException catch (e) {
      setState(() {
        _error = e.message;
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _handleMFAVerification() async {
    if (_mfaCodeController.text.length != 6) {
      setState(() {
        _error = 'Please enter a 6-digit code';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final result = await Amplify.Auth.confirmSignIn(
        confirmationValue: _mfaCodeController.text,
      );

      if (result.isSignedIn) {
        // AuthProvider will reload automatically via Hub events
        await Future.delayed(const Duration(milliseconds: 300));
        
        if (mounted) {
          context.go('/admin');
        }
      }
    } on AuthException catch (e) {
      setState(() {
        if (e.message.contains('CodeMismatchException')) {
          _error = 'Invalid MFA code. Please try again.';
        } else {
          _error = e.message;
        }
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
                          Icons.admin_panel_settings,
                          size: 64,
                          color: AppTheme.primary600,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          l10n.authAdminLogin,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          l10n.authAdminLoginRestricted,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 32),

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

                        // Password Change Form
                        if (_needsPasswordChange) ...[
                          Text(
                            l10n.authPasswordChangeRequired,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _newPasswordController,
                            obscureText: true,
                            decoration: InputDecoration(
                              labelText: l10n.authNewPassword,
                              prefixIcon: const Icon(Icons.lock_outline),
                            ),
                            validator: (value) {
                              if (value == null || value.length < 8) {
                                return l10n.authPasswordMinLength;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _confirmPasswordController,
                            obscureText: true,
                            decoration: InputDecoration(
                              labelText: l10n.authConfirmPassword,
                              prefixIcon: const Icon(Icons.lock_outline),
                            ),
                            validator: (value) {
                              if (value != _newPasswordController.text) {
                                return l10n.authPasswordsDoNotMatch;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: _loading ? null : _handlePasswordChange,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              backgroundColor: AppTheme.primary600,
                              foregroundColor: Colors.white,
                            ),
                            child: Text(
                              _loading
                                  ? l10n.authChanging
                                  : l10n.authChangePassword,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ]
                        // MFA Verification Form
                        else if (_needsMFA) ...[
                          Text(
                            l10n.authMfaEnterCode,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _mfaCodeController,
                            keyboardType: TextInputType.number,
                            maxLength: 6,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 24,
                              letterSpacing: 8,
                            ),
                            decoration: InputDecoration(
                              labelText: l10n.authMfaCode,
                              hintText: '123456',
                              counterText: '',
                            ),
                            validator: (value) {
                              if (value == null || value.length != 6) {
                                return l10n.authMfaCodeRequired;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: _loading ? null : _handleMFAVerification,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              backgroundColor: AppTheme.primary600,
                              foregroundColor: Colors.white,
                            ),
                            child: Text(
                              _loading
                                  ? l10n.authVerifying
                                  : l10n.authVerifyCode,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ]
                        // Normal Login Form
                        else ...[
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
                              if (!value.contains('@')) {
                                return l10n.authEmailInvalid;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: true,
                            decoration: InputDecoration(
                              labelText: l10n.authPassword,
                              prefixIcon: const Icon(Icons.lock_outline),
                              hintText: '••••••••',
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return l10n.authPasswordRequired;
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),

                          // Login Button
                          ElevatedButton(
                            onPressed: _loading ? null : _handleLogin,
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
                                    l10n.authSignIn,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                          ),

                          const SizedBox(height: 16),

                          // Forgot Password Link
                          Center(
                            child: TextButton(
                              onPressed: () => context.go('/forgot-password'),
                              child: Text(
                                l10n.authForgotPasswordQuestion,
                                style: TextStyle(
                                  color: AppTheme.primary600,
                                ),
                              ),
                            ),
                          ),

                          const Divider(height: 32),

                          // Back to User Login
                          Center(
                            child: TextButton.icon(
                              onPressed: () => context.go('/login'),
                              icon: const Icon(Icons.arrow_back),
                              label: Text(
                                l10n.authBackToUserLogin,
                              ),
                            ),
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
