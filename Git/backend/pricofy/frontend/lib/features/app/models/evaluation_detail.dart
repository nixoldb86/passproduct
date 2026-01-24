// Evaluation Detail Models
//
// Data models for evaluation detail screen.
// Ported from Next.js monolito (app/dashboard/evaluation/[id]/page.tsx).
//
// Privacy-compliant:
// - Only city + postal code stored (no street/number)
// - GDPR compliant

import 'package:pricofy_front_flutter/core/models/coordinates.dart';

/// Main evaluation detail with scraping results
class EvaluationDetail {
  final String id;
  final String producto;
  final String categoria;
  final String condicion;
  final String? accion;
  final String ubicacion;
  final String ciudad;
  final String pais;
  final String? codigoPostal; // New: privacy-compliant
  final Coordinates? coordenadas; // Saved coordinates from submit
  final DateTime fecha;
  final ScrapingDetail scraping;

  const EvaluationDetail({
    required this.id,
    required this.producto,
    required this.categoria,
    required this.condicion,
    this.accion,
    required this.ubicacion,
    required this.ciudad,
    required this.pais,
    this.codigoPostal,
    this.coordenadas,
    required this.fecha,
    required this.scraping,
  });

  factory EvaluationDetail.fromJson(Map<String, dynamic> json) {
    return EvaluationDetail(
      id: json['id']?.toString() ?? '',
      producto: json['producto'] ?? '',
      categoria: json['categoria'] ?? '',
      condicion: json['condicion'] ?? '',
      accion: json['accion'],
      ubicacion: json['ubicacion'] ?? '',
      ciudad: json['ciudad'] ?? '',
      pais: json['pais'] ?? '',
      codigoPostal: json['codigo_postal'] ?? json['codigoPostal'],
      coordenadas: json['coordenadas'] != null 
          ? Coordinates.fromJson(json['coordenadas'])
          : null,
      fecha: DateTime.parse(json['fecha']),
      scraping: ScrapingDetail.fromJson(json['scraping'] ?? {}),
    );
  }

  /// Full location string for geocoding
  String get fullLocation {
    final parts = <String>[ciudad];
    if (codigoPostal != null) parts.add(codigoPostal!);
    parts.add(pais);
    return parts.join(', ');
  }

  /// Check if this is a sell action
  bool get isSellingAction {
    return accion?.toLowerCase().contains('vender') ?? false;
  }
}

/// Scraping results and statistics
class ScrapingDetail {
  final String id;
  final int totalEncontrados;
  final int totalAnalizados;
  final int totalDescartados;
  final int totalOutliers;
  final int totalFiltrados;
  final JsonCompradores jsonCompradores;
  final JsonVendedores? jsonVendedores;
  final List<String> plataformasConsultadas;
  final DateTime fecha;
  final String? tipoBusqueda; // 'directa' | 'completa'

  const ScrapingDetail({
    required this.id,
    required this.totalEncontrados,
    required this.totalAnalizados,
    required this.totalDescartados,
    required this.totalOutliers,
    required this.totalFiltrados,
    required this.jsonCompradores,
    this.jsonVendedores,
    required this.plataformasConsultadas,
    required this.fecha,
    this.tipoBusqueda,
  });

  factory ScrapingDetail.fromJson(Map<String, dynamic> json) {
    return ScrapingDetail(
      id: json['id']?.toString() ?? '',
      totalEncontrados: json['totalEncontrados'] ?? json['total_encontrados'] ?? 0,
      totalAnalizados: json['totalAnalizados'] ?? json['total_analizados'] ?? 0,
      totalDescartados: json['totalDescartados'] ?? json['total_descartados'] ?? 0,
      totalOutliers: json['totalOutliers'] ?? json['total_outliers'] ?? 0,
      totalFiltrados: json['totalFiltrados'] ?? json['total_filtrados'] ?? 0,
      jsonCompradores: JsonCompradores.fromJson(json['jsonCompradores'] ?? json['json_compradores'] ?? {}),
      jsonVendedores: json['jsonVendedores'] != null || json['json_vendedores'] != null
          ? JsonVendedores.fromJson(json['jsonVendedores'] ?? json['json_vendedores'])
          : null,
      plataformasConsultadas: List<String>.from(
        json['plataformasConsultadas'] ?? json['plataformas_consultadas'] ?? [],
      ),
      fecha: DateTime.parse(json['fecha'] ?? DateTime.now().toIso8601String()),
      tipoBusqueda: json['tipoBusqueda'] ?? json['tipo_busqueda'],
    );
  }

  /// Check if has buyer listings
  bool get hasBuyers => jsonCompradores.compradores.isNotEmpty;

  /// Check if has seller recommendations
  bool get hasSellers => jsonVendedores != null && (jsonVendedores!.vendedores?.isNotEmpty ?? false);
}

/// Buyers/compradores listings
class JsonCompradores {
  final List<Comprador> compradores;

  const JsonCompradores({required this.compradores});

  factory JsonCompradores.fromJson(Map<String, dynamic> json) {
    return JsonCompradores(
      compradores: (json['compradores'] as List?)
              ?.map((item) => Comprador.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  /// Get unique cities from all buyers
  Set<String> get uniqueCities {
    return compradores
        .where((c) => c.ciudadOZona.isNotEmpty)
        .map((c) => c.ciudadOZona)
        .toSet();
  }

  /// Get unique platforms
  Set<String> get uniquePlatforms {
    return compradores.map((c) => c.plataforma).toSet();
  }
}

/// Individual buyer listing/anuncio
class Comprador {
  final String titulo;
  final String plataforma;
  final double precioEur;
  final String estadoDeclarado;
  final String ciudadOZona;
  final String urlAnuncio;
  final String? productImage;
  final String? descripcion;
  final bool? isShippable;
  final bool? isTopProfile;
  final double? relevancia;
  final bool? matchCritico;
  final String? estadoInferido;
  
  // Calculated fields (not from JSON)
  Coordinates? coords;
  double? distanciaKm;

  Comprador({
    required this.titulo,
    required this.plataforma,
    required this.precioEur,
    required this.estadoDeclarado,
    required this.ciudadOZona,
    required this.urlAnuncio,
    this.productImage,
    this.descripcion,
    this.isShippable,
    this.isTopProfile,
    this.relevancia,
    this.matchCritico,
    this.estadoInferido,
    this.coords,
    this.distanciaKm,
  });

  factory Comprador.fromJson(Map<String, dynamic> json) {
    return Comprador(
      titulo: json['titulo'] ?? '',
      plataforma: json['plataforma'] ?? '',
      precioEur: (json['precio_eur'] ?? json['precioEur'] ?? 0).toDouble(),
      estadoDeclarado: json['estado_declarado'] ?? json['estadoDeclarado'] ?? '',
      ciudadOZona: json['ciudad_o_zona'] ?? json['ciudadOZona'] ?? '',
      urlAnuncio: json['url_anuncio'] ?? json['urlAnuncio'] ?? '',
      productImage: json['product_image'] ?? json['productImage'],
      descripcion: json['descripcion'],
      isShippable: json['is_shippable'] ?? json['isShippable'],
      isTopProfile: json['is_top_profile'] ?? json['isTopProfile'],
      relevancia: (json['relevancia'] ?? 0).toDouble(),
      matchCritico: json['match_critico'] ?? json['matchCritico'],
      estadoInferido: json['estado_inferido'] ?? json['estadoInferido'],
    );
  }

  /// Copy with calculated fields
  Comprador copyWith({
    Coordinates? coords,
    double? distanciaKm,
  }) {
    return Comprador(
      titulo: titulo,
      plataforma: plataforma,
      precioEur: precioEur,
      estadoDeclarado: estadoDeclarado,
      ciudadOZona: ciudadOZona,
      urlAnuncio: urlAnuncio,
      productImage: productImage,
      descripcion: descripcion,
      isShippable: isShippable,
      isTopProfile: isTopProfile,
      relevancia: relevancia,
      matchCritico: matchCritico,
      estadoInferido: estadoInferido,
      coords: coords ?? this.coords,
      distanciaKm: distanciaKm ?? this.distanciaKm,
    );
  }

  /// Platform color for UI
  String get platformColor {
    switch (plataforma.toLowerCase()) {
      case 'wallapop':
        return '#13C1AC'; // Wallapop teal
      case 'milanuncios':
        return '#FF6600'; // Milanuncios orange
      default:
        return '#667EEA'; // Primary blue
    }
  }
}

/// Sellers/vendedores recommendations
class JsonVendedores {
  final List<Vendedor>? vendedores;
  final String? descripcionAnuncio;

  const JsonVendedores({
    this.vendedores,
    this.descripcionAnuncio,
  });

  factory JsonVendedores.fromJson(Map<String, dynamic> json) {
    return JsonVendedores(
      vendedores: (json['vendedores'] as List?)
          ?.map((item) => Vendedor.fromJson(item as Map<String, dynamic>))
          .toList(),
      descripcionAnuncio: json['descripcion_anuncio'] ?? json['descripcionAnuncio'],
    );
  }

  /// Get vendedor by type
  Vendedor? getByType(String tipo) {
    return vendedores?.firstWhere(
      (v) => v.tipoPrecio == tipo,
      orElse: () => vendedores!.first,
    );
  }
}

/// Individual seller recommendation
class Vendedor {
  final String tipoPrecio; // 'minimo' | 'ideal' | 'rapido'
  final double precioEur;
  final String plataforma;
  final List<String> urls;
  final List<String> plataformaSugerida;

  const Vendedor({
    required this.tipoPrecio,
    required this.precioEur,
    required this.plataforma,
    required this.urls,
    required this.plataformaSugerida,
  });

  factory Vendedor.fromJson(Map<String, dynamic> json) {
    return Vendedor(
      tipoPrecio: json['tipo_precio'] ?? json['tipoPrecio'] ?? '',
      precioEur: (json['precio_eur'] ?? json['precioEur'] ?? 0).toDouble(),
      plataforma: json['plataforma'] ?? '',
      urls: List<String>.from(json['urls'] ?? []),
      plataformaSugerida: List<String>.from(
        json['plataforma_sugerida'] ?? json['plataformaSugerida'] ?? [],
      ),
    );
  }

  /// Get display label for tipo_precio
  String getLabel(String locale) {
    switch (tipoPrecio) {
      case 'minimo':
        return locale == 'es' ? 'Precio Mínimo' : 'Minimum Price';
      case 'ideal':
        return locale == 'es' ? 'Precio Ideal' : 'Ideal Price';
      case 'rapido':
        return locale == 'es' ? 'Venta Rápida' : 'Quick Sale';
      default:
        return tipoPrecio;
    }
  }

  /// Get color for tipo_precio
  String get color {
    switch (tipoPrecio) {
      case 'minimo':
        return '#10B981'; // Green
      case 'ideal':
        return '#667EEA'; // Blue
      case 'rapido':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  }
}

