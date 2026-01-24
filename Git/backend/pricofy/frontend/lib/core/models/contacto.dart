// Contacto Model
//
// Represents a contact form submission

import 'package:equatable/equatable.dart';

class Contacto extends Equatable {
  final String id;
  final String nombre;
  final String email;
  final String telefono;
  final String comentario;
  final String createdAt;

  const Contacto({
    required this.id,
    required this.nombre,
    required this.email,
    required this.telefono,
    required this.comentario,
    required this.createdAt,
  });

  factory Contacto.fromJson(Map<String, dynamic> json) {
    // Safe string parser - never crashes, always returns a string
    String safeString(dynamic value, [String defaultValue = '']) {
      if (value == null) return defaultValue;
      return value.toString();
    }

    return Contacto(
      id: safeString(json['id'], 'unknown'),
      nombre: safeString(json['nombre']),
      email: safeString(json['email']),
      telefono: safeString(json['telefono']),
      comentario: safeString(json['comentario']),
      createdAt: safeString(json['created_at'] ?? json['createdAt'], DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'email': email,
      'telefono': telefono,
      'comentario': comentario,
      'createdAt': createdAt,
    };
  }

  @override
  List<Object?> get props => [
    id,
    nombre,
    email,
    telefono,
    comentario,
    createdAt,
  ];
}
