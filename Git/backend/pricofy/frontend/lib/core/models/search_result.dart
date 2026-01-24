// Search Result Model
//
// Represents a listing found by the search-orchestrator scrapers.
// Contains product information from Wallapop, Milanuncios, etc.

class SearchResult {
  final String id;
  final String title;
  final double price;
  final String url;
  final String platform;  // 'wallapop', 'milanuncios', etc.
  final String? imageUrl;
  final String? imageThumbnail;  // Smaller thumbnail version
  final String? description;
  final String? location;
  final String? countryCode;  // ISO 3166-1 alpha-2 country code of the listing's location (e.g., 'ES', 'FR')
  final String? marketplaceCountry;  // Country of the marketplace searched (e.g., 'IT' for Wallapop Italy)
  final String? seller;
  final DateTime? publishedAt;
  final DateTime? modifiedAt;  // Last modification date
  final double? relevanceScore;  // AI-generated relevance score (0-1)
  final double? distance;  // Distance in km from search origin
  final double? gpsLat;  // Latitude of listing location (for map view)
  final double? gpsLon;  // Longitude of listing location (for map view)
  final bool isShippable;  // Whether the item can be shipped
  final Map<String, dynamic>? metadata;

  // Platform-specific optional fields
  final String? condition;    // new, like_new, good, used, acceptable (Vinted, Milanuncios)
  final String? brand;        // Product brand (Vinted)
  final String? model;        // Product model (Vinted electronics)
  final String? size;         // Size for clothing (Vinted)
  final String? category;     // Category name (Wallapop)
  final String? subcategory;  // Subcategory name (Wallapop)
  final String? sellerName;   // Seller display name
  final int? views;           // View count (Wallapop)
  final int? favorites;       // Favorite count (Wallapop)
  final List<String>? images; // Additional images

  SearchResult({
    required this.id,
    required this.title,
    required this.price,
    required this.url,
    required this.platform,
    this.imageUrl,
    this.imageThumbnail,
    this.description,
    this.location,
    this.countryCode,
    this.marketplaceCountry,
    this.seller,
    this.publishedAt,
    this.modifiedAt,
    this.relevanceScore,
    this.distance,
    this.gpsLat,
    this.gpsLon,
    this.isShippable = false,
    this.metadata,
    this.condition,
    this.brand,
    this.model,
    this.size,
    this.category,
    this.subcategory,
    this.sellerName,
    this.views,
    this.favorites,
    this.images,
  });

  /// Factory from JSON - uses normalized field names from search-service
  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      id: json['id'] as String? ?? json['url'] as String? ?? '',
      title: json['title'] as String? ?? '',
      price: _parsePrice(json['price']),
      url: json['url'] as String? ?? '',
      platform: json['platform'] as String? ?? 'unknown',
      imageUrl: json['imageUrl'] as String?,
      imageThumbnail: json['imageThumbnail'] as String?,
      description: json['description'] as String?,
      location: json['location'] as String?,
      countryCode: json['countryCode'] as String? ?? json['country_code'] as String?,
      marketplaceCountry: json['marketplaceCountry'] as String?,
      seller: json['seller'] as String? ?? json['sellerName'] as String?,
      publishedAt: _parseDate(json['publishedAt']),
      modifiedAt: _parseDate(json['modifiedAt']),
      relevanceScore: _parseDouble(json['relevanceScore']),
      distance: _parseDouble(json['distance']),
      gpsLat: _parseDouble(json['gpsLat']),
      gpsLon: _parseDouble(json['gpsLon']),
      isShippable: json['isShippable'] as bool? ?? false,
      metadata: json['metadata'] as Map<String, dynamic>?,
      // Platform-specific fields
      condition: json['condition'] as String?,
      brand: json['brand'] as String?,
      model: json['model'] as String?,
      size: json['size'] as String?,
      category: json['category'] as String?,
      subcategory: json['subcategory'] as String?,
      sellerName: json['sellerName'] as String?,
      views: json['views'] as int?,
      favorites: json['favorites'] as int?,
      images: (json['images'] as List<dynamic>?)?.cast<String>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'price': price,
      'url': url,
      'platform': platform,
      if (imageUrl != null) 'imageUrl': imageUrl,
      if (imageThumbnail != null) 'imageThumbnail': imageThumbnail,
      if (description != null) 'description': description,
      if (location != null) 'location': location,
      if (countryCode != null) 'countryCode': countryCode,
      if (marketplaceCountry != null) 'marketplaceCountry': marketplaceCountry,
      if (seller != null) 'seller': seller,
      if (publishedAt != null) 'publishedAt': publishedAt!.toIso8601String(),
      if (modifiedAt != null) 'modifiedAt': modifiedAt!.toIso8601String(),
      if (relevanceScore != null) 'relevanceScore': relevanceScore,
      if (distance != null) 'distance': distance,
      if (gpsLat != null) 'gpsLat': gpsLat,
      if (gpsLon != null) 'gpsLon': gpsLon,
      'isShippable': isShippable,
      if (metadata != null) 'metadata': metadata,
      // Platform-specific fields
      if (condition != null) 'condition': condition,
      if (brand != null) 'brand': brand,
      if (model != null) 'model': model,
      if (size != null) 'size': size,
      if (category != null) 'category': category,
      if (subcategory != null) 'subcategory': subcategory,
      if (sellerName != null) 'sellerName': sellerName,
      if (views != null) 'views': views,
      if (favorites != null) 'favorites': favorites,
      if (images != null) 'images': images,
    };
  }

  static double _parsePrice(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) {
      // Remove currency symbols and parse
      final cleaned = value.replaceAll(RegExp(r'[^\d.,]'), '').replaceAll(',', '.');
      return double.tryParse(cleaned) ?? 0.0;
    }
    return 0.0;
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is String) {
      return DateTime.tryParse(value);
    }
    if (value is int) {
      // Unix timestamp
      return DateTime.fromMillisecondsSinceEpoch(value * 1000);
    }
    return null;
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  /// Platform display name
  String get platformDisplayName {
    switch (platform.toLowerCase()) {
      case 'wallapop':
        return 'Wallapop';
      case 'milanuncios':
        return 'Milanuncios';
      case 'vinted':
        return 'Vinted';
      case 'backmarket':
        return 'Back Market';
      default:
        return platform;
    }
  }

  /// Formatted price string
  String get formattedPrice {
    return '${price.toStringAsFixed(2)} \u20AC';
  }

  /// Formatted distance string
  String? get formattedDistance {
    if (distance == null) return null;
    if (distance! < 1) {
      return '${(distance! * 1000).round()} m';
    }
    return '${distance!.toStringAsFixed(1)} km';
  }

  /// Check if listing has distance
  bool get hasDistance => distance != null;

  /// Check if listing has image
  bool get hasImage => imageUrl != null && imageUrl!.isNotEmpty;

  /// Check if listing has thumbnail
  bool get hasThumbnail => imageThumbnail != null && imageThumbnail!.isNotEmpty;

  /// Preferred image URL (thumbnail if available, otherwise full image)
  String? get preferredImageUrl => imageThumbnail ?? imageUrl;

  /// Check if listing has GPS coordinates (for map view)
  bool get hasGps => gpsLat != null && gpsLon != null;

  /// Check if listing has condition
  bool get hasCondition => condition != null && condition!.isNotEmpty;

  /// Check if listing has brand
  bool get hasBrand => brand != null && brand!.isNotEmpty;

  /// Check if listing has size
  bool get hasSize => size != null && size!.isNotEmpty;

  /// Check if listing has category
  bool get hasCategory => category != null && category!.isNotEmpty;

  /// Localized condition display name
  String get conditionDisplayName {
    switch (condition) {
      case 'new':
        return 'Nuevo';
      case 'like_new':
        return 'Como nuevo';
      case 'good':
        return 'Buen estado';
      case 'used':
        return 'Usado';
      case 'acceptable':
        return 'Aceptable';
      default:
        return condition ?? '';
    }
  }

  @override
  String toString() {
    return 'SearchResult(title: $title, price: $price, platform: $platform)';
  }
}
