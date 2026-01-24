// User Login Screen
//
// Unified login/signup flow with magic link (email + code)
// Matches web frontend behavior: auto-creates account if user doesn't exist
//
// Features:
// - Passwordless authentication (magic link via BFF → auth-service)
// - Social login (Google, Apple, Facebook) via Amplify
// - Auto user creation (unified login/signup)
// - Rate limiting & disposable email protection (backend)
//
// For admin login, see admin_login_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart' as app;
import '../../../core/providers/language_provider.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../config/routes.dart';
import 'package:amplify_flutter/amplify_flutter.dart' as amplify_core;

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  bool _codeSent = false;
  bool _loading = false;
  String? _error;

  // Session from sendCode (needed for verifyCode)
  String? _authSession;

  // BFF API Client from Provider
  BffApiClient get _apiClient => context.read<BffApiClient>();

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  /// Unified Login/Signup Flow via BFF → auth-service
  ///
  /// Step 1: initLogin - validates email, creates user in Cognito if needed
  /// Step 2: sendCode - initiates custom auth flow, sends email with code
  /// Note: reCAPTCHA tokens are automatically added by RecaptchaInterceptor
  Future<void> _handleSendCode() async {
    final email = _emailController.text.trim();
    final l10n = context.l10n;
    final languageProvider = context.read<LanguageProvider>();
    final language = languageProvider.languageCode;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // Step 1: Initialize login (validates email, creates user if needed)
      // RecaptchaInterceptor automatically adds X-Recaptcha-Token header
      if (kDebugMode) print('[Login] Step 1: initLogin');
      final initResult = await _apiClient.initLogin(email);
      if (kDebugMode) print('[Login] initLogin result: $initResult');

      // Check for errors in initLogin response
      if (initResult.containsKey('error')) {
        final errorObj = initResult['error'] as Map<String, dynamic>;
        throw ApiException(
          message: errorObj['message'] as String? ?? 'Error al inicializar login',
          code: errorObj['code'] as String? ?? 'UNKNOWN_ERROR',
        );
      }

      // Step 2: Send verification code via BFF → auth-service
      // RecaptchaInterceptor automatically adds X-Recaptcha-Token header
      if (kDebugMode) print('[Login] Step 2: sendCode (language: $language)');
      final sendResult = await _apiClient.sendCode(email, language: language);
      if (kDebugMode) print('[Login] sendCode result: ${sendResult.keys}');

      // Check for errors in sendCode response
      if (sendResult.containsKey('error')) {
        final errorObj = sendResult['error'] as Map<String, dynamic>;
        throw ApiException(
          message: errorObj['message'] as String? ?? 'Error al enviar código',
          code: errorObj['code'] as String? ?? 'UNKNOWN_ERROR',
        );
      }

      // Store session for verifyCode
      _authSession = sendResult['session'] as String?;

      if (_authSession == null || _authSession!.isEmpty) {
        throw Exception('No session returned from sendCode');
      }

      setState(() {
        _codeSent = true;
        _loading = false;
      });
    } on ApiException catch (e) {
      // Handle specific API errors
      String errorMessage;

      if (e.isDisposableEmail) {
        errorMessage = l10n.authErrorDisposableEmail;
      } else if (e.isEmailRateLimit || e.isIpRateLimit) {
        errorMessage = l10n.authErrorRateLimited;
      } else if (e.isRecaptchaFailed) {
        errorMessage = l10n.authErrorRecaptchaFailed;
      } else if (e.code == 'USER_NOT_FOUND') {
        errorMessage = l10n.authErrorUserNotFound;
      } else {
        errorMessage = e.message;
      }

      setState(() {
        _error = errorMessage;
        _loading = false;
      });
    } catch (e) {
      if (kDebugMode) print('[Login] Error: $e');

      setState(() {
        _error = l10n.authErrorSendCodeFailed;
        _loading = false;
      });
    }
  }

  /// Verify code via BFF → auth-service
  /// On success, receives JWT tokens and stores them
  /// Note: reCAPTCHA token is automatically added by RecaptchaInterceptor
  Future<void> _handleVerifyCode() async {
    final authProvider = context.read<app.AuthProvider>();
    final router = GoRouter.of(context);
    final l10n = context.l10n;
    final email = _emailController.text.trim();
    final code = _codeController.text.trim();

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      if (_authSession == null) {
        throw Exception('No auth session available');
      }

      // Verify code via BFF → auth-service
      // RecaptchaInterceptor automatically adds X-Recaptcha-Token header
      if (kDebugMode) print('[Login] Verifying code...');
      final verifyResult = await _apiClient.verifyCode(email, code, _authSession!);

      if (kDebugMode) print('[Login] verifyCode result keys: ${verifyResult.keys}');

      // Check for errors
      if (verifyResult.containsKey('error')) {
        final errorObj = verifyResult['error'] as Map<String, dynamic>;
        throw ApiException(
          message: errorObj['message'] as String? ?? 'Error al verificar código',
          code: errorObj['code'] as String? ?? 'UNKNOWN_ERROR',
        );
      }

      // Success! We have tokens
      if (verifyResult['success'] == true) {
        final idToken = verifyResult['idToken'] as String?;
        final accessToken = verifyResult['accessToken'] as String?;
        final refreshToken = verifyResult['refreshToken'] as String?;

        if (idToken != null && accessToken != null && refreshToken != null) {
          // Store tokens and update auth state
          // Note: We bypass Amplify.Auth.signIn since auth was done via BFF
          await authProvider.loginWithTokens(
            idToken: idToken,
            accessToken: accessToken,
            refreshToken: refreshToken,
          );

          if (mounted) {
            router.go(AppRoutes.dashboard);
          }
        } else {
          throw Exception('Missing tokens in response');
        }
      } else {
        // May need another challenge
        if (verifyResult.containsKey('session')) {
          _authSession = verifyResult['session'] as String?;
          setState(() {
            _error = l10n.authAdditionalVerificationRequired;
            _loading = false;
          });
        } else {
          throw Exception('Verification failed');
        }
      }
    } on ApiException catch (e) {
      String errorMessage;

      if (e.code == 'INVALID_CODE') {
        errorMessage = l10n.authCodeInvalid;
      } else {
        errorMessage = e.message;
      }

      setState(() {
        _error = errorMessage;
        _loading = false;
      });
    } catch (e) {
      if (kDebugMode) print('[Login] Verify error: $e');

      String errorMessage;

      if (e.toString().contains('CodeMismatch') || e.toString().contains('INVALID_CODE')) {
        errorMessage = l10n.authCodeInvalid;
      } else if (e.toString().contains('NotAuthorized') || e.toString().contains('expired')) {
        errorMessage = l10n.authCodeExpired;
      } else {
        errorMessage = l10n.authVerificationFailed;
      }

      setState(() {
        _error = errorMessage;
        _loading = false;
      });
    }
  }

  /// Handle social login (still uses Amplify for OAuth)
  Future<void> _handleSocialLogin(amplify_core.AuthProvider provider) async {
    final authProvider = context.read<app.AuthProvider>();
    final l10n = context.l10n;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await authProvider.signInWithSocial(provider);
      if (mounted) {
        context.go('/');
      }
    } catch (e) {
      if (kDebugMode) print('[Login] Social login error: $e');

      setState(() {
        _error = l10n.authErrorSendCodeFailed;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF3B82F6), // blue-500
              Color(0xFFA855F7), // purple-500
              Color(0xFF9333EA), // purple-600
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 450),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header
                    Text(
                      _codeSent
                          ? l10n.authEnterYourCode
                          : l10n.authWelcomeBack,
                      style: const TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1F2937),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _codeSent
                          ? l10n.authCheckYourEmailDescription
                          : l10n.authSignInDescription,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF6B7280),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    // Error message
                    if (_error != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          border: Border.all(color: Colors.red.shade400),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _error!,
                          style: TextStyle(
                            color: Colors.red.shade700,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],

                    if (!_codeSent) ...[
                      // Social Login Buttons
                      _buildSocialButton(
                        l10n.authSocialLoginWithGoogle,
                        Icons.g_mobiledata,
                        Colors.white,
                        const Color(0xFF1F2937),
                        Colors.grey.shade300,
                        () => _handleSocialLogin(amplify_core.AuthProvider.google),
                      ),
                      const SizedBox(height: 12),

                      _buildSocialButton(
                        l10n.authSocialLoginWithApple,
                        Icons.apple,
                        Colors.black,
                        Colors.white,
                        Colors.black,
                        () => _handleSocialLogin(amplify_core.AuthProvider.apple),
                      ),
                      const SizedBox(height: 12),

                      _buildSocialButton(
                        l10n.authSocialLoginWithFacebook,
                        Icons.facebook,
                        const Color(0xFF1877F2),
                        Colors.white,
                        const Color(0xFF1877F2),
                        () => _handleSocialLogin(amplify_core.AuthProvider.facebook),
                      ),
                      const SizedBox(height: 24),

                      // Divider
                      Row(
                        children: [
                          const Expanded(child: Divider()),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              l10n.commonOr,
                              style: const TextStyle(
                                color: Color(0xFF6B7280),
                                fontSize: 14,
                              ),
                            ),
                          ),
                          const Expanded(child: Divider()),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Email input
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: l10n.authEmailAddress,
                          hintText: 'your@email.com',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.email_outlined),
                        ),
                        autofillHints: const [AutofillHints.email],
                      ),
                      const SizedBox(height: 20),

                      // Send code button
                      ElevatedButton(
                        onPressed: _loading ? null : _handleSendCode,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          backgroundColor: const Color(0xFF667EEA),
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
                                l10n.authSendLoginCode,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ] else ...[
                      // Code sent info
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          border: Border.all(color: Colors.blue.shade400),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.authCheckYourEmail,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                                color: Colors.blue.shade800,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              l10n.authCheckYourEmailDescription,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.blue.shade700,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Code input
                      TextField(
                        controller: _codeController,
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        maxLength: 6,
                        style: const TextStyle(
                          fontSize: 28,
                          letterSpacing: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        decoration: InputDecoration(
                          labelText: l10n.authVerificationCode,
                          hintText: '123456',
                          counterText: '',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        autofocus: true,
                        onChanged: (value) {
                          // Auto-submit when 6 digits entered
                          if (value.length == 6) {
                            _handleVerifyCode();
                          }
                        },
                      ),
                      const SizedBox(height: 8),
                      Text(
                        l10n.authCheckYourEmailDescription,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF6B7280),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),

                      // Verify button
                      ElevatedButton(
                        onPressed: _loading || _codeController.text.length != 6
                            ? null
                            : _handleVerifyCode,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          backgroundColor: const Color(0xFF667EEA),
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
                                l10n.authVerifyAndLogin,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                      const SizedBox(height: 16),

                      // Actions
                      Column(
                        children: [
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _codeSent = false;
                                _codeController.clear();
                                _error = null;
                              });
                            },
                            child: Text(
                              l10n.authUseDifferentEmail,
                              style: const TextStyle(
                                color: Color(0xFF667EEA),
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed: _loading ? null : _handleSendCode,
                            child: Text(
                              l10n.authResendCode,
                              style: const TextStyle(
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 24),

                    // Footer
                    Column(
                      children: [
                        Text.rich(
                          TextSpan(
                            text: l10n.authTermsPrefix,
                            children: [
                              TextSpan(
                                text: l10n.authTermsOfService,
                                style: const TextStyle(
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                              TextSpan(text: l10n.authTermsAnd),
                              TextSpan(
                                text: l10n.authPrivacyPolicy,
                                style: const TextStyle(
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ],
                          ),
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF9CA3AF),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),

                        // New user message (matches web frontend)
                        if (!_codeSent)
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              l10n.authNewUserMessage,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF374151),
                                fontWeight: FontWeight.w500,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),

                        const SizedBox(height: 12),

                        // Admin login link
                        TextButton(
                          onPressed: () => context.go('/admin/login'),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                          child: Text(
                            l10n.authAdminLogin,
                            style: const TextStyle(
                              fontSize: 12,
                              decoration: TextDecoration.underline,
                              color: Color(0xFF6B7280),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton(
    String text,
    IconData icon,
    Color bgColor,
    Color textColor,
    Color borderColor,
    VoidCallback onPressed,
  ) {
    return ElevatedButton.icon(
      onPressed: _loading ? null : onPressed,
      icon: Icon(icon, color: textColor),
      label: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w600,
        ),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: bgColor,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: borderColor, width: 2),
        ),
        elevation: 0,
      ),
    );
  }
}
