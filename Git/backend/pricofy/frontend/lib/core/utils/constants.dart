/**
 * Constants
 * 
 * Migrated from pricofy-frontend/lib/europeanCountries.ts
 * Contains complete list of 52 European countries
 */

/// Complete list of European countries (52 countries)
const List<String> europeanCountries = [
  'Albania',
  'Alemania',
  'Andorra',
  'Armenia',
  'Austria',
  'Azerbaiyán',
  'Bélgica',
  'Bielorrusia',
  'Bosnia y Herzegovina',
  'Bulgaria',
  'Chipre',
  'Croacia',
  'Dinamarca',
  'Eslovaquia',
  'Eslovenia',
  'España',
  'Estonia',
  'Finlandia',
  'Francia',
  'Georgia',
  'Grecia',
  'Hungría',
  'Irlanda',
  'Islandia',
  'Italia',
  'Kazajistán',
  'Letonia',
  'Liechtenstein',
  'Lituania',
  'Luxemburgo',
  'Malta',
  'Moldavia',
  'Mónaco',
  'Montenegro',
  'Noruega',
  'Países Bajos',
  'Polonia',
  'Portugal',
  'Reino Unido',
  'República Checa',
  'Rumanía',
  'Rusia',
  'San Marino',
  'Serbia',
  'Suecia',
  'Suiza',
  'Turquía',
  'Ucrania',
  'Vaticano',
];

/// Sort countries alphabetically in Spanish
List<String> sortCountriesAlphabetically(List<String> countries) {
  final sorted = List<String>.from(countries);
  sorted.sort((a, b) => a.compareTo(b));
  return sorted;
}

/// Get ordered country list with detected country first
///
/// Returns: [detectedCountry, ...rest sorted alphabetically]
List<String> getOrderedCountries(String? detectedCountry) {
  final allCountries = sortCountriesAlphabetically(europeanCountries);

  if (detectedCountry == null || detectedCountry.isEmpty) {
    return allCountries;
  }

  // Remove detected country from list
  final filteredCountries = allCountries
      .where((country) => country != detectedCountry)
      .toList();

  // Return: [detected country, ...rest alphabetically sorted]
  return [detectedCountry, ...filteredCountries];
}

/// Product types (12 categories)
const List<String> productTypes = [
  'Electrónica',
  'Móviles y Tablets',
  'Informática',
  'Audio y Video',
  'Coches',
  'Motos',
  'Ropa y Accesorios',
  'Hogar y Jardín',
  'Deportes y Ocio',
  'Libros y Música',
  'Juguetes y Bebés',
  'Otros',
];

/// Product conditions (5 levels with stars)
const List<String> productConditions = [
  'Nuevo ⭐⭐⭐⭐⭐',
  'Como nuevo ⭐⭐⭐⭐',
  'Buen estado ⭐⭐⭐',
  'Usado ⭐⭐',
  'Necesita reparación ⭐',
];

/// Urgency levels (for selling)
const List<String> urgencyLevels = [
  'Quiero vender rápido',
  'No tengo prisa',
  'Estoy buscando el mejor precio',
];

/// Maximum photos allowed
const int maxPhotos = 6;

/// Maximum photo size (5MB)
const int maxPhotoSizeBytes = 5 * 1024 * 1024;

/// Allowed MIME types for photos
const List<String> allowedPhotoMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
