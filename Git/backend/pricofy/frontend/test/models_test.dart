import 'package:flutter_test/flutter_test.dart';
import 'package:pricofy_front_flutter/core/models/user.dart';

void main() {
  group('User Model', () {
    test('should create user with required fields', () {
      final user = User(
        userId: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        groups: ['user'],
        status: 'CONFIRMED',
        createdAt: '2023-01-01T00:00:00Z',
      );

      expect(user.userId, '123');
      expect(user.email, 'test@example.com');
      expect(user.firstName, 'John');
      expect(user.lastName, 'Doe');
      expect(user.phone, '+1234567890');
      expect(user.groups, ['user']);
      expect(user.status, 'CONFIRMED');
      expect(user.createdAt, '2023-01-01T00:00:00Z');
    });

    test('should create user with optional fields as null', () {
      final user = User(
        userId: '123',
        email: 'test@example.com',
        groups: ['user'],
        status: 'CONFIRMED',
        createdAt: '2023-01-01T00:00:00Z',
      );

      expect(user.firstName, null);
      expect(user.lastName, null);
      expect(user.phone, null);
    });

    test('should check if user is admin', () {
      final adminUser = User(
        userId: '123',
        email: 'admin@example.com',
        groups: ['admin', 'user'],
        status: 'CONFIRMED',
        createdAt: '2023-01-01T00:00:00Z',
      );

      final regularUser = User(
        userId: '456',
        email: 'user@example.com',
        groups: ['user'],
        status: 'CONFIRMED',
        createdAt: '2023-01-01T00:00:00Z',
      );

      expect(adminUser.isAdmin, true);
      expect(regularUser.isAdmin, false);
    });

    test('should create user from JSON', () {
      final json = {
        'userId': '123',
        'email': 'test@example.com',
        'firstName': 'John',
        'lastName': 'Doe',
        'phone': '+1234567890',
        'groups': ['user'],
        'status': 'CONFIRMED',
        'createdAt': '2023-01-01T00:00:00Z',
      };

      final user = User.fromJson(json);

      expect(user.userId, '123');
      expect(user.email, 'test@example.com');
      expect(user.firstName, 'John');
      expect(user.lastName, 'Doe');
      expect(user.phone, '+1234567890');
      expect(user.groups, ['user']);
      expect(user.status, 'CONFIRMED');
      expect(user.createdAt, '2023-01-01T00:00:00Z');
    });

    test('should convert user to JSON', () {
      final user = User(
        userId: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        groups: ['user'],
        status: 'CONFIRMED',
        createdAt: '2023-01-01T00:00:00Z',
      );

      final json = user.toJson();

      expect(json['userId'], '123');
      expect(json['email'], 'test@example.com');
      expect(json['firstName'], 'John');
      expect(json['lastName'], 'Doe');
      expect(json['phone'], '+1234567890');
      expect(json['groups'], ['user']);
      expect(json['status'], 'CONFIRMED');
      expect(json['createdAt'], '2023-01-01T00:00:00Z');
    });

    test('should handle null values in JSON', () {
      final json = {
        'userId': '123',
        'email': 'test@example.com',
        'groups': ['user'],
        'status': 'CONFIRMED',
        'createdAt': '2023-01-01T00:00:00Z',
      };

      final user = User.fromJson(json);

      expect(user.firstName, null);
      expect(user.lastName, null);
      expect(user.phone, null);
    });
  });
}
