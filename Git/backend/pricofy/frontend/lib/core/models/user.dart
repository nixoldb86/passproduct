// User Model
//
// Represents a Cognito user

import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String userId;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final List<String> groups; // ['admin'] or ['user']
  final String status; // 'CONFIRMED', 'UNCONFIRMED', etc.
  final String createdAt;
  final String? updatedAt;

  const User({
    required this.userId,
    required this.email,
    this.firstName,
    this.lastName,
    this.phone,
    required this.groups,
    required this.status,
    required this.createdAt,
    this.updatedAt,
  });

  bool get isAdmin => groups.contains('admin');

  String get fullName {
    if (firstName == null && lastName == null) {
      return email;
    }
    return '${firstName ?? ''} ${lastName ?? ''}'.trim();
  }

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle empty strings from backend as null for optional fields
    String? parseOptionalString(dynamic value) {
      if (value == null) return null;
      final str = value as String;
      return str.isEmpty ? null : str;
    }

    return User(
      userId: json['userId'] as String,
      email: json['email'] as String,
      firstName: parseOptionalString(json['firstName']),
      lastName: parseOptionalString(json['lastName']),
      phone: parseOptionalString(json['phone']),
      groups: json['groups'] != null
          ? List<String>.from(json['groups'] as List)
          : ['user'], // Default to 'user' group if not provided
      status: json['status'] as String? ?? 'CONFIRMED', // Default status
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'email': email,
      if (firstName != null) 'firstName': firstName,
      if (lastName != null) 'lastName': lastName,
      if (phone != null) 'phone': phone,
      'groups': groups,
      'status': status,
      'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  User copyWith({
    String? userId,
    String? email,
    String? firstName,
    String? lastName,
    String? phone,
    List<String>? groups,
    String? status,
    String? createdAt,
    String? updatedAt,
  }) {
    return User(
      userId: userId ?? this.userId,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      groups: groups ?? this.groups,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
    userId,
    email,
    firstName,
    lastName,
    phone,
    groups,
    status,
    createdAt,
    updatedAt,
  ];
}
