// Platform Attestation Service
//
// Generates platform-specific attestation proofs for native iOS/Android apps.
// Uses DeviceCheck (iOS) and Play Integrity API (Android) to cryptographically
// prove that the request comes from a legitimate, unmodified app.
//
// Security:
// - Web: Returns error (platform attestation not needed, uses reCAPTCHA)
// - Development: Generates mock tokens for local testing
// - Production: Calls native platform APIs for real validation

import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class PlatformAttestationService {
  static const _channel = MethodChannel('com.pricofy/platform_attestation');

  /// Generates platform-specific attestation proof
  ///
  /// [nonce] - Unique challenge from server
  /// [response] - PoW response to bind proof to
  ///
  /// Returns platform-specific token that can be validated by Apple/Google servers
  static Future<String> generateProof(String nonce, String response) async {
    if (kIsWeb) {
      throw Exception('Platform attestation not available on web');
    }

    if (Platform.isIOS) {
      return _generateiOSProof(nonce, response);
    } else if (Platform.isAndroid) {
      return _generateAndroidProof(nonce, response);
    }

    throw Exception('Unsupported platform');
  }

  /// Generates iOS DeviceCheck token
  ///
  /// Development: Returns mock token for local testing
  /// Production: Calls native DeviceCheck API
  static Future<String> _generateiOSProof(String nonce, String response) async {
    // Dev: Mock token for simulator testing
    if (kDebugMode && !kReleaseMode) {
      final mockData = '$nonce:$response:dev-ios-${Platform.operatingSystemVersion}';
      final hash = sha256.convert(utf8.encode(mockData)).toString();
      return 'DEV_DEVICE_TOKEN_$hash';
    }

    // Prod: Real DeviceCheck API
    try {
      final token = await _channel.invokeMethod('getDeviceCheckToken', {
        'nonce': nonce,
        'response': response,
      });
      return token as String;
    } catch (e) {
      if (kDebugMode) debugPrint('[PlatformAttest] iOS error: $e');
      rethrow;
    }
  }

  /// Generates Android Play Integrity token
  ///
  /// Development: Returns mock token for emulator testing
  /// Production: Calls native Play Integrity API
  static Future<String> _generateAndroidProof(String nonce, String response) async {
    // Dev: Mock token for emulator testing
    if (kDebugMode && !kReleaseMode) {
      final mockData = '$nonce:$response:dev-android-${Platform.operatingSystemVersion}';
      final hash = sha256.convert(utf8.encode(mockData)).toString();
      return 'DEV_PLAY_INTEGRITY_$hash';
    }

    // Prod: Real Play Integrity API
    try {
      final token = await _channel.invokeMethod('getPlayIntegrityToken', {
        'nonce': nonce,
        'response': response,
      });
      return token as String;
    } catch (e) {
      if (kDebugMode) debugPrint('[PlatformAttest] Android error: $e');
      rethrow;
    }
  }
}
