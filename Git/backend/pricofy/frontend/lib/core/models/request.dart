// Request Model
//
// Represents a product evaluation request submitted by a user.
// The backend processes this by scraping marketplaces and applying AI analysis.

import 'package:equatable/equatable.dart';

class Request extends Equatable {
  final String id;
  final String email;
  final String pais;
  final String ciudad;
  final String accion; // 'vender' or 'comprar'
  final String tipoProducto;
  final String modeloMarca;
  final String estado;
  final String? accesorios;
  final String? urgencia; // Only for 'vender'
  final List<String>? fotosUrls; // Photo URLs (S3)
  final String createdAt;
  final String? updatedAt;

  const Request({
    required this.id,
    required this.email,
    required this.pais,
    required this.ciudad,
    required this.accion,
    required this.tipoProducto,
    required this.modeloMarca,
    required this.estado,
    this.accesorios,
    this.urgencia,
    this.fotosUrls,
    required this.createdAt,
    this.updatedAt,
  });

  factory Request.fromJson(Map<String, dynamic> json) {
    // Safe string parser - handles null, empty, and missing fields
    String safeString(dynamic value, [String defaultValue = '']) {
      if (value == null) return defaultValue;
      return value.toString();
    }

    // Safe list parser
    List<String>? safeStringList(dynamic value) {
      if (value == null) return null;
      if (value is List) {
        return value.map((e) => e.toString()).toList();
      }
      return null;
    }

    return Request(
      id: safeString(json['id'], 'unknown'),
      email: safeString(json['email']),
      pais: safeString(json['pais']),
      ciudad: safeString(json['ciudad']),
      accion: safeString(json['accion']),
      // Backend uses snake_case, map to camelCase
      tipoProducto: safeString(json['tipo_producto'] ?? json['tipoProducto']),
      modeloMarca: safeString(json['modelo_marca'] ?? json['modeloMarca']),
      estado: safeString(json['estado']),
      accesorios: json['accesorios']?.toString(),
      urgencia: json['urgencia']?.toString(),
      // Backend uses fotos_urls (snake_case)
      fotosUrls: safeStringList(json['fotos_urls'] ?? json['fotosUrls']),
      // Backend uses created_at (snake_case)
      createdAt: safeString(json['created_at'] ?? json['createdAt'], DateTime.now().toIso8601String()),
      updatedAt: (json['updated_at'] ?? json['updatedAt'])?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'pais': pais,
      'ciudad': ciudad,
      'accion': accion,
      'tipoProducto': tipoProducto,
      'modeloMarca': modeloMarca,
      'estado': estado,
      if (accesorios != null) 'accesorios': accesorios,
      if (urgencia != null) 'urgencia': urgencia,
      if (fotosUrls != null) 'fotosUrls': fotosUrls,
      'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }

  @override
  List<Object?> get props => [
    id,
    email,
    pais,
    ciudad,
    accion,
    tipoProducto,
    modeloMarca,
    estado,
    accesorios,
    urgencia,
    fotosUrls,
    createdAt,
    updatedAt,
  ];
}
