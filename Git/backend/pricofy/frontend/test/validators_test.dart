import 'package:flutter_test/flutter_test.dart';
import 'package:pricofy_front_flutter/core/utils/validators.dart';

void main() {
  group('Email Validation', () {
    test('should validate correct email', () {
      final result = validateEmail('test@gmail.com');
      expect(result.valid, true);
      expect(result.error, null);
    });

    test('should reject empty email', () {
      final result = validateEmail('');
      expect(result.valid, false);
      expect(result.error, 'El email es obligatorio');
    });

    test('should reject email with spaces', () {
      final result = validateEmail('test @gmail.com');
      expect(result.valid, false);
      expect(result.error, 'El formato del email no es válido');
    });

    test('should reject email without @', () {
      final result = validateEmail('testgmail.com');
      expect(result.valid, false);
      expect(result.error, 'El formato del email no es válido');
    });

    test('should reject email with multiple @', () {
      final result = validateEmail('test@gmail@com');
      expect(result.valid, false);
      expect(result.error, 'El formato del email no es válido');
    });

    test('should reject temporary email domains', () {
      final result = validateEmail('test@tempmail.com');
      expect(result.valid, false);
      expect(result.error, 'No se permiten emails temporales o desechables');
    });

    test('should reject 10minutemail domains', () {
      final result = validateEmail('test@10minutemail.com');
      expect(result.valid, false);
      expect(result.error, 'No se permiten emails temporales o desechables');
    });

    test('should reject mailinator domains', () {
      final result = validateEmail('test@mailinator.com');
      expect(result.valid, false);
      expect(result.error, 'No se permiten emails temporales o desechables');
    });

    test('should reject suspicious patterns', () {
      final result = validateEmail('test@fakeemail.com');
      expect(result.valid, false);
      expect(result.error, 'No se permiten emails temporales o desechables');
    });

    test('should validate gmail', () {
      final result = validateEmail('test@gmail.com');
      expect(result.valid, true);
      expect(result.error, null);
    });

    test('should validate yahoo', () {
      final result = validateEmail('test@yahoo.com');
      expect(result.valid, true);
      expect(result.error, null);
    });

    test('should validate hotmail', () {
      final result = validateEmail('test@hotmail.com');
      expect(result.valid, true);
      expect(result.error, null);
    });

    test('should validate outlook', () {
      final result = validateEmail('test@outlook.com');
      expect(result.valid, true);
      expect(result.error, null);
    });

    test('should reject email too long', () {
      final longEmail = 'a' * 250 + '@example.com';
      final result = validateEmail(longEmail);
      expect(result.valid, false);
      expect(result.error, 'El email es demasiado largo');
    });

    test('should reject domain without dot', () {
      final result = validateEmail('test@gmail');
      expect(result.valid, false);
      expect(result.error, 'El dominio del email debe contener un punto');
    });

    test('should reject domain ending with dot', () {
      final result = validateEmail('test@gmail.');
      expect(result.valid, false);
      expect(result.error, 'El formato del email no es válido');
    });

    test('should reject consecutive dots in domain', () {
      final result = validateEmail('test@gm..ail.com');
      expect(result.valid, false);
      expect(result.error, 'El formato del email no es válido');
    });

    test('should reject domain with invalid characters', () {
      final result = validateEmail('test@gm!ail.com');
      expect(result.valid, false);
      expect(result.error, 'El formato del email no es válido');
    });
  });
}
