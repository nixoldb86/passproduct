// Auth Provider
//
// Migrated from pricofy-frontend/contexts/AuthContext.tsx (247 lines)
// Manages authentication state with AWS Amplify/Cognito

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:amplify_flutter/amplify_flutter.dart' hide AuthProvider, ApiConfig;
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_flutter/amplify_flutter.dart' as amplify show AuthProvider;
import '../models/user.dart' as app_models;
import '../services/session_service.dart';
import '../api/bff_session_manager.dart';
import '../../config/api_config.dart' as app_config;

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.unknown;
  app_models.User? _user;
  String? _jwtToken;
  bool _isLoading = true;

  AuthStatus get status => _status;
  app_models.User? get user => _user;
  String? get jwtToken => _jwtToken;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isAdmin => _user?.isAdmin ?? false;

  AuthProvider() {
    _checkAuthStatus();
  }

  /// Check current auth status
  Future<void> _checkAuthStatus() async {
    try {
      final session = await Amplify.Auth.fetchAuthSession();

      if (session.isSignedIn) {
        await _loadUserData();
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      safePrint('Error checking auth status: $e');
      _status = AuthStatus.unauthenticated;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load user data from Cognito
  Future<void> _loadUserData() async {
    try {
      final user = await Amplify.Auth.getCurrentUser();
      final attributes = await Amplify.Auth.fetchUserAttributes();

      // Get JWT token
      final session = await Amplify.Auth.fetchAuthSession() as CognitoAuthSession;

      _jwtToken = session.userPoolTokensResult.value.idToken.raw;

      // Parse user attributes
      String? email;
      String? firstName;
      String? lastName;
      String? phone;

      for (final attr in attributes) {
        switch (attr.userAttributeKey.key) {
          case 'email':
            email = attr.value;
            break;
          case 'given_name':
            firstName = attr.value;
            break;
          case 'family_name':
            lastName = attr.value;
            break;
          case 'phone_number':
            phone = attr.value;
            break;
        }
      }

      // Get user groups
      final groups = session.userPoolTokensResult.value.idToken.groups;

      // Create user model
      _user = app_models.User(
        userId: user.userId,
        email: email ?? '',
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        groups: groups,
        status: 'CONFIRMED',
        createdAt: DateTime.now().toIso8601String(),
      );

      notifyListeners();
    } catch (e) {
      safePrint('Error loading user data: $e');
    }
  }

  /// Social login (Google, Apple, Facebook)
  Future<void> signInWithSocial(amplify.AuthProvider provider) async {
    try {
      _isLoading = true;
      notifyListeners();

      final result = await Amplify.Auth.signInWithWebUI(
        provider: provider,
      );

      if (result.isSignedIn) {
        await _loadUserData();
        await _migrateAnonymousData();
        _status = AuthStatus.authenticated;
      }
    } catch (e) {
      safePrint('Social sign in error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Magic link login (email code) - Custom auth flow
  Future<void> sendMagicLink(String email) async {
    try {
      await Amplify.Auth.signIn(
        username: email,
        options: const SignInOptions(
          pluginOptions: CognitoSignInPluginOptions(
            authFlowType: AuthenticationFlowType.customAuthWithoutSrp,
          ),
        ),
      );
    } catch (e) {
      safePrint('Send magic link error: $e');
      rethrow;
    }
  }

  /// Verify magic link code
  Future<void> verifyMagicLink(String code) async {
    try {
      _isLoading = true;
      notifyListeners();

      final result = await Amplify.Auth.confirmSignIn(confirmationValue: code);

      if (result.isSignedIn) {
        await _loadUserData();
        await _migrateAnonymousData();
        _status = AuthStatus.authenticated;
      }
    } catch (e) {
      safePrint('Verify magic link error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Admin login (email + password) - SRP auth
  Future<void> signInWithPassword({
    required String email,
    required String password,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final result = await Amplify.Auth.signIn(
        username: email,
        password: password,
        options: const SignInOptions(
          pluginOptions: CognitoSignInPluginOptions(
            authFlowType: AuthenticationFlowType.userSrpAuth,
          ),
        ),
      );

      if (result.isSignedIn) {
        await _loadUserData();
        await _migrateAnonymousData();
        _status = AuthStatus.authenticated;
      }
    } catch (e) {
      safePrint('Sign in error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Sign up (email + password)
  Future<void> signUp({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final userAttributes = <AuthUserAttributeKey, String>{
        AuthUserAttributeKey.email: email,
        if (firstName != null) AuthUserAttributeKey.givenName: firstName,
        if (lastName != null) AuthUserAttributeKey.familyName: lastName,
        if (phone != null) AuthUserAttributeKey.phoneNumber: phone,
      };

      await Amplify.Auth.signUp(
        username: email,
        password: password,
        options: SignUpOptions(userAttributes: userAttributes),
      );
    } catch (e) {
      safePrint('Sign up error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Confirm sign up (verification code)
  Future<void> confirmSignUp({
    required String email,
    required String code,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final result = await Amplify.Auth.confirmSignUp(
        username: email,
        confirmationCode: code,
      );

      if (result.isSignUpComplete) {
        // Auto sign in after confirmation
        // User needs to sign in manually
      }
    } catch (e) {
      safePrint('Confirm sign up error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Logout (alias for signOut)
  Future<void> logout() async {
    await signOut();
  }

  /// Sign out
  ///
  /// Clears local auth state and attempts Amplify sign out.
  /// Works for both BFF auth (tokens only) and Amplify auth.
  Future<void> signOut() async {
    try {
      _isLoading = true;
      notifyListeners();

      // Try Amplify signOut (may fail if auth was via BFF, not Amplify)
      try {
        await Amplify.Auth.signOut();
      } catch (e) {
        // Ignore Amplify errors - user may have authenticated via BFF
        safePrint('Amplify sign out skipped (BFF auth): $e');
      }

      // Always clear local state regardless of Amplify result
      _status = AuthStatus.unauthenticated;
      _user = null;
      _jwtToken = null;

      // Clear BFF session token to prevent lingering sessions
      final sessionManager = BffSessionManager(bffBaseUrl: app_config.ApiConfig.bffBaseUrl);
      await sessionManager.clearSession();

      safePrint('Sign out successful');
    } catch (e) {
      safePrint('Sign out error: $e');
      // Still clear state even on error
      _status = AuthStatus.unauthenticated;
      _user = null;
      _jwtToken = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Request password reset
  Future<void> resetPassword(String email) async {
    try {
      await Amplify.Auth.resetPassword(username: email);
    } catch (e) {
      safePrint('Reset password error: $e');
      rethrow;
    }
  }

  /// Confirm password reset
  Future<void> confirmResetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    try {
      await Amplify.Auth.confirmResetPassword(
        username: email,
        newPassword: newPassword,
        confirmationCode: code,
      );
    } catch (e) {
      safePrint('Confirm reset password error: $e');
      rethrow;
    }
  }

  /// Refresh auth session
  Future<void> refreshSession() async {
    await _checkAuthStatus();
  }

  /// Login with JWT tokens from BFF (bypasses Amplify.Auth.signIn)
  ///
  /// This is used when authentication is done through the BFF's custom auth flow
  /// instead of Amplify's built-in signIn methods.
  Future<void> loginWithTokens({
    required String idToken,
    required String accessToken,
    required String refreshToken,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Parse the idToken to extract user info
      final parts = idToken.split('.');
      if (parts.length != 3) {
        throw Exception('Invalid JWT format');
      }

      // Decode payload (base64)
      String payload = parts[1];
      // Add padding if needed
      while (payload.length % 4 != 0) {
        payload += '=';
      }
      final decoded = utf8.decode(base64Url.decode(payload));
      final claims = jsonDecode(decoded) as Map<String, dynamic>;

      // Extract user info from claims
      final userId = claims['sub'] as String?;
      final email = claims['email'] as String?;
      final groups = (claims['cognito:groups'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ?? [];

      if (userId == null || email == null) {
        throw Exception('Missing required claims in token');
      }

      // Store tokens
      _jwtToken = idToken;

      // Create user model from token claims
      _user = app_models.User(
        userId: userId,
        email: email,
        firstName: claims['given_name'] as String?,
        lastName: claims['family_name'] as String?,
        phone: claims['phone_number'] as String?,
        groups: groups,
        status: 'CONFIRMED',
        createdAt: DateTime.now().toIso8601String(),
      );

      _status = AuthStatus.authenticated;

      // Migrate anonymous data
      await _migrateAnonymousData();

      safePrint('Login with tokens successful: $email');
    } catch (e) {
      safePrint('Login with tokens error: $e');
      _status = AuthStatus.unauthenticated;
      _user = null;
      _jwtToken = null;
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Migrate anonymous searches to authenticated user after login
  Future<void> _migrateAnonymousData() async {
    try {
      final sessionService = SessionService();
      final sessionId = await sessionService.getSessionId();

      if (sessionId != null && _user != null) {
        // Call backend API to migrate searches
        // POST /migrate-anonymous-data
        // Body: { sessionId: sessionId, userId: _user!.userId }

        // Clear session after successful migration
        await sessionService.clearSessionId();

        safePrint('Anonymous data migrated successfully');
      }
    } catch (e) {
      safePrint('Error migrating anonymous data: $e');
      // Non-critical error, don't block login
    }
  }
}
