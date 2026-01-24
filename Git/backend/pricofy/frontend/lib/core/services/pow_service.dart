// Puzzle Service (Deterministic Challenge-Response)
//
// Solves challenges using 5 different algorithm types for obfuscation.
// NOT a real PoW - the goal is to complicate reverse engineering, not CPU cost.
// TLS fingerprinting is the real anti-bot barrier.
//
// - Type 1: Simple HMAC
// - Type 2: Double hash with secret sandwich
// - Type 3: XOR then hash
// - Type 4: Reversed nonce + hash chain
// - Type 5: Custom mix with magic constant
//
// Secret is compiled at build time via --dart-define=POW_SECRET

import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart' show kDebugMode, kIsWeb;
import 'platform_attestation_service.dart';

class PoWService {
  // Secret compiled at build time from SSM (NO FALLBACK for security)
  static const String _secret = String.fromEnvironment('POW_SECRET');

  /// Constructor validates secret at runtime
  PoWService() {
    _validateSecret();
  }

  /// Validate that secret was provided at build time
  void _validateSecret() {
    if (_secret.isEmpty) {
      throw StateError(
        'CRITICAL: POW_SECRET not provided at build time!\n'
        'Build command must include: --dart-define=POW_SECRET=<value>',
      );
    }

    // Prevent using dev fallback in production
    if (_secret == 'dev-secret-fallback') {
      throw StateError(
        'CRITICAL: Using dev fallback secret in production build!\n'
        'This is a security vulnerability.',
      );
    }
  }

  /// Solve challenge according to type (deterministic - instant)
  ///
  /// Returns Map with:
  /// - Web: {'response': String}
  /// - Native: {'response': String, 'platform': 'native', 'platformProof': String}
  Future<Map<String, dynamic>> solveChallenge({
    required String nonce,
    required int type,
  }) async {
    if (kDebugMode) {
      print('[Puzzle] Solving type=$type (deterministic)');
    }

    final startTime = DateTime.now();

    final response = switch (type) {
      1 => _solveType1(nonce),
      2 => _solveType2(nonce),
      3 => _solveType3(nonce),
      4 => _solveType4(nonce),
      5 => _solveType5(nonce),
      _ => throw Exception('Unknown challenge type: $type'),
    };

    final duration = DateTime.now().difference(startTime);
    if (kDebugMode) {
      print('[Puzzle] ✅ Solved in ${duration.inMilliseconds}ms');
    }

    // Web: Simple response string
    if (kIsWeb) {
      return {'response': response};
    }

    // Native: Add platform attestation proof
    try {
      final platformProof = await PlatformAttestationService.generateProof(nonce, response);

      if (kDebugMode) {
        print('[Puzzle] ✅ Platform proof generated');
      }

      return {
        'response': response,
        'platform': 'native',
        'platformProof': platformProof,
      };
    } catch (e) {
      if (kDebugMode) {
        print('[Puzzle] ⚠️ Platform proof failed: $e');
      }
      // Fallback: Return just response (BFF will reject if platform proof required)
      return {'response': response};
    }
  }

  /// Type 1: Simple HMAC
  String _solveType1(String nonce) {
    return _hmac(_secret, nonce).substring(0, 16);
  }

  /// Type 2: Double hash with secret sandwich
  String _solveType2(String nonce) {
    final innerHash = _sha256(nonce);
    return _sha256('$_secret$innerHash$_secret').substring(0, 16);
  }

  /// Type 3: XOR then hash
  String _solveType3(String nonce) {
    final xored = _xorStrings(nonce, _secret);
    return _sha256(xored).substring(0, 16);
  }

  /// Type 4: Reversed nonce + hash chain
  String _solveType4(String nonce) {
    final reversed = nonce.split('').reversed.join();
    final firstHash = _sha256('$reversed$_secret');
    return _sha256('$firstHash$nonce').substring(0, 16);
  }

  /// Type 5: Custom mix with magic constant
  String _solveType5(String nonce) {
    final mixed = _customMix(nonce, _secret);
    return _hmac(_secret, mixed).substring(0, 16);
  }

  /// Custom mix algorithm (must match backend exactly)
  String _customMix(String nonce, String secret) {
    final nonceBytes = utf8.encode(nonce);
    final secretBytes = utf8.encode(secret);

    // XOR with rotation (magic rotation = 7)
    final mixed = List<int>.generate(nonceBytes.length, (i) {
      final rotatedIndex = (i + 7) % secretBytes.length;
      return nonceBytes[i] ^ secretBytes[rotatedIndex];
    });

    // Add magic constant
    const magic = 0xDEADBEEF;
    final magicStr = magic.toRadixString(16);

    return base64.encode(mixed) + magicStr;
  }

  /// XOR two strings (circular)
  String _xorStrings(String str1, String str2) {
    final bytes1 = utf8.encode(str1);
    final bytes2 = utf8.encode(str2);
    final maxLen = bytes1.length > bytes2.length ? bytes1.length : bytes2.length;

    final result = List<int>.generate(maxLen, (i) {
      final b1 = bytes1[i % bytes1.length];
      final b2 = bytes2[i % bytes2.length];
      return b1 ^ b2;
    });

    return base64.encode(result);
  }

  /// SHA256 hash
  String _sha256(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// HMAC-SHA256
  String _hmac(String secret, String data) {
    final key = utf8.encode(secret);
    final bytes = utf8.encode(data);
    final hmacSha256 = Hmac(sha256, key);
    final digest = hmacSha256.convert(bytes);
    return digest.toString();
  }
}
