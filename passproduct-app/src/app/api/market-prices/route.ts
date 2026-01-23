import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { MarketLogger } from "@/lib/market-logger";

// ============================================
// CONFIGURACIÓN DE HEADERS ROTATIVOS
// ============================================

const userAgents = [
  // macOS - Chrome 141-138
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  // Windows - Chrome 141-138
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  // Linux - Chrome 141-138
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  // macOS - Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  // Windows - Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
];

const chromeVersions = [
  { major: '141', minor: '0', brand: 'Google Chrome' },
  { major: '140', minor: '0', brand: 'Google Chrome' },
  { major: '139', minor: '0', brand: 'Google Chrome' },
  { major: '138', minor: '0', brand: 'Google Chrome' },
  { major: '141', minor: '0', brand: 'Chromium' },
  { major: '140', minor: '0', brand: 'Chromium' },
  { major: '141', minor: '0', brand: 'Not_A Brand' },
  { major: '140', minor: '0', brand: 'Not_A Brand' },
];

const platforms = [
  { name: 'macOS', value: '"macOS"' },
  { name: 'Windows', value: '"Windows"' },
  { name: 'Linux', value: '"Linux"' },
];

const acceptLanguages = [
  'es-ES,es;q=0.9,en;q=0.8',
  'es-ES,es;q=0.9',
  'es,en-US;q=0.9,en;q=0.8',
  'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
  'es-ES,es;q=0.9,en;q=0.8,fr;q=0.7',
  'es,es-ES;q=0.9,en;q=0.8',
  'es-ES,es;q=0.9,ca;q=0.8,en;q=0.7',
  'es-ES,es;q=0.9,en-US;q=0.8',
  'es,en;q=0.9',
  'es-ES,es;q=0.95,en;q=0.8',
  'es-ES,es;q=0.9,en;q=0.8,pt;q=0.7',
  'es,es-ES;q=0.9,en-US;q=0.8,en;q=0.7',
];

const acceptEncodings = [
  'gzip, deflate, br',
  'gzip, deflate, br, zstd',
  'gzip, deflate',
  'gzip, br',
  'gzip, deflate, br, compress',
];

const cacheControls = [
  'max-age=0',
  'no-cache',
  'max-age=0, no-cache',
  'no-cache, no-store',
  'max-age=0, no-cache, no-store',
];

// ============================================
// TIPOS
// ============================================

interface WallapopItem {
  id: string;
  title: string;
  description: string;
  price: { amount: number; currency: string };
  images: Array<{ urls: { small: string; medium: string; big: string } }>;
  web_slug: string;
  location: {
    city: string;
    latitude: number;
    longitude: number;
    country_code: string;
  };
  shipping?: { item_is_shippable: boolean };
  is_top_profile?: { flag: boolean };
}

interface AnuncioRaw {
  id: string;
  titulo: string;
  precio: number;
  descripcion: string;
  ciudad_o_zona: string;
  url_anuncio: string;
  imagen: string;
  is_shippable: boolean;
  is_top_profile: boolean;
  latitude: number;
  longitude: number;
}

interface AnuncioNormalizado extends AnuncioRaw {
  titulo_normalizado: string;
  precio_normalizado: number;
  relevancia?: number;
}

interface MarketPriceResult {
  success: boolean;
  product: {
    brand: string;
    model: string;
    variant?: string;
    purchasePrice?: number;
  };
  marketAnalysis: {
    totalListingsFound: number;
    relevantListings: number;
    outlierRemoved: number;
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
    recommendedPrices: {
      minimo: number;
      ideal: number;
      rapido: number;
    };
    percentageRetained?: number;
    marketTrend: 'stable' | 'rising' | 'falling';
    notes: string;
  };
  listings: AnuncioNormalizado[];
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomHeaders(): Record<string, string> {
  const userAgent = randomElement(userAgents);
  const chromeVersion = randomElement(chromeVersions);
  const platform = randomElement(platforms);
  const acceptLang = randomElement(acceptLanguages);
  const acceptEncoding = randomElement(acceptEncodings);
  const cacheControl = randomElement(cacheControls);
  
  const secChUaVariations = [
    `"${chromeVersion.brand}";v="${chromeVersion.major}", "Not?A_Brand";v="8", "Chromium";v="${chromeVersion.major}"`,
    `"${chromeVersion.brand}";v="${chromeVersion.major}", "Not_A Brand";v="8", "Chromium";v="${chromeVersion.major}"`,
    `"${chromeVersion.brand}";v="${chromeVersion.major}.${chromeVersion.minor}", "Not?A_Brand";v="8", "Chromium";v="${chromeVersion.major}"`,
    `"${chromeVersion.brand}";v="${chromeVersion.major}", "Chromium";v="${chromeVersion.major}", "Not?A_Brand";v="8"`,
  ];
  const secChUa = randomElement(secChUaVariations);
  
  const mpid = `-${Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': acceptEncoding,
    'Accept-Language': acceptLang,
    'Cache-Control': cacheControl,
    'Connection': 'keep-alive',
    'Origin': 'https://es.wallapop.com',
    'Referer': 'https://es.wallapop.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': userAgent,
    'deviceos': '0',
    'mpid': mpid,
    'sec-ch-ua': secChUa,
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': platform.value,
    'x-appversion': '812940',
    'x-deviceos': '0',
  };
  
  if (Math.random() > 0.3) {
    headers['DNT'] = '1';
  }
  if (Math.random() > 0.7) {
    headers['Pragma'] = 'no-cache';
  }
  
  return headers;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractWallapopData(item: WallapopItem): AnuncioRaw {
  return {
    id: item.id,
    titulo: item.title,
    precio: item.price.amount,
    descripcion: item.description || '',
    ciudad_o_zona: item.location?.city || 'Desconocido',
    url_anuncio: `https://es.wallapop.com/item/${item.web_slug}`,
    imagen: item.images?.[0]?.urls?.small || '',
    is_shippable: item.shipping?.item_is_shippable || false,
    is_top_profile: item.is_top_profile?.flag || false,
    latitude: item.location?.latitude || 0,
    longitude: item.location?.longitude || 0,
  };
}

function normalizeAnuncio(anuncio: AnuncioRaw): AnuncioNormalizado {
  return {
    ...anuncio,
    titulo_normalizado: normalizeText(anuncio.titulo),
    precio_normalizado: Math.round(anuncio.precio * 100) / 100,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// CONSULTA A WALLAPOP (CON LOGGING)
// ============================================

async function fetchWallapopPage(
  keywords: string,
  logger: MarketLogger,
  pageNumber: number,
  nextPage?: string,
  latitude: number = 40.4259419,
  longitude: number = -3.5654669,
  distanceKm: number = 300
): Promise<{ items: WallapopItem[]; nextPage?: string; extractedItems: AnuncioRaw[] }> {
  const headers = generateRandomHeaders();
  
  let url: string;
  if (nextPage) {
    url = `https://api.wallapop.com/api/v3/search?next_page=${encodeURIComponent(nextPage)}&source=deep_link&latitude=${latitude}&longitude=${longitude}&distance_in_km=${distanceKm}`;
  } else {
    url = `https://api.wallapop.com/api/v3/search?source=search_box&keywords=${encodeURIComponent(keywords)}&order_by=most_relevance&latitude=${latitude}&longitude=${longitude}&distance_in_km=${distanceKm}`;
  }
  
  // Log del curl
  logger.logCurl(url, headers, pageNumber === 1);
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    logger.addPhase(`WALLAPOP_ERROR_PAGE_${pageNumber}`, {
      message: `Error en petición a Wallapop`,
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`Wallapop API error: ${response.status}`);
  }
  
  const data = await response.json();
  const items: WallapopItem[] = data.data?.section?.payload?.items || [];
  const extractedItems = items.map(extractWallapopData);
  
  // Log de la respuesta (solo datos extraídos)
  logger.logWallapopResponse(
    pageNumber,
    items.length,
    extractedItems.map(item => ({
      id: item.id,
      titulo: item.titulo,
      precio: item.precio,
      ciudad: item.ciudad_o_zona,
      is_shippable: item.is_shippable,
    })),
    data.meta?.next_page
  );
  
  return {
    items,
    nextPage: data.meta?.next_page,
    extractedItems,
  };
}

async function fetchAllWallapopListings(
  keywords: string,
  logger: MarketLogger,
  maxPages: number = 2
): Promise<{ anuncios: AnuncioNormalizado[]; wallapopRequests: number }> {
  const allAnuncios: AnuncioNormalizado[] = [];
  let nextPage: string | undefined;
  let wallapopRequests = 0;
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const result = await fetchWallapopPage(keywords, logger, page, nextPage);
      wallapopRequests++;
      
      const anuncios = result.extractedItems.map(normalizeAnuncio);
      allAnuncios.push(...anuncios);
      
      if (!result.nextPage) {
        logger.addPhase('WALLAPOP_PAGINATION_END', {
          message: 'No hay más páginas disponibles',
          total_pages_fetched: page,
        });
        break;
      }
      
      nextPage = result.nextPage;
      
      if (page < maxPages) {
        const delayMs = 1000 + Math.random() * 2000;
        logger.addPhase('RATE_LIMIT_DELAY', {
          message: `Esperando para evitar rate limiting`,
          delay_ms: Math.round(delayMs),
        });
        await delay(delayMs);
      }
    } catch (error) {
      logger.addPhase(`WALLAPOP_FETCH_ERROR_PAGE_${page}`, {
        message: `Error obteniendo página ${page}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      break;
    }
  }
  
  // Log de normalización
  logger.logNormalization(
    allAnuncios.length,
    allAnuncios.map(a => ({
      id: a.id,
      titulo_normalizado: a.titulo_normalizado,
      precio_normalizado: a.precio_normalizado,
    }))
  );
  
  return { anuncios: allAnuncios, wallapopRequests };
}

// ============================================
// FILTRADO CON IA (CON LOGGING) - PROMPT TOML
// ============================================

// Mapeo de condiciones del prompt a nuestro sistema
const CONDITION_MAP: Record<string, string> = {
  'n': 'NEW',        // Precintado, sellado
  'ln': 'LIKE_NEW',  // Como nuevo
  'g': 'GOOD',       // Buen estado (muy bueno)
  'u': 'USED',       // Usado (bueno)
  'a': 'ACCEPTABLE', // Aceptable
  'nd': 'GOOD',      // No determinado -> default a GOOD
};

// Orden de condiciones (1 = mejor, 5 = peor)
const CONDITION_ORDER: Record<string, number> = {
  'n': 1,    // new - mejor
  'ln': 2,   // like_new
  'g': 3,    // good
  'u': 4,    // used
  'a': 5,    // acceptable - peor
  'nd': 3,   // not determined -> asumimos good
};

// Mapeo del sistema del usuario a código de condición
const USER_CONDITION_TO_CODE: Record<string, string> = {
  'NEW': 'n',
  'LIKE_NEW': 'ln',
  'GOOD': 'g',
  'VERY_GOOD': 'g',  // alias
  'USED': 'u',
  'ACCEPTABLE': 'a',
};

// Función para verificar si un estado de anuncio es igual o mejor que el del usuario
function isConditionEqualOrBetter(adCondition: string, userConditionCode: string): boolean {
  const adOrder = CONDITION_ORDER[adCondition] || 3;
  const userOrder = CONDITION_ORDER[userConditionCode] || 3;
  return adOrder <= userOrder; // Menor número = mejor estado
}

// Parser simple de TOML para la respuesta de la IA
function parseTOMLResponse(toml: string): Array<{ index: number; match: boolean; condition: string }> {
  const results: Array<{ index: number; match: boolean; condition: string }> = [];
  
  // Buscar todos los bloques [[r]]
  const blocks = toml.split('[[r]]').slice(1); // Ignorar lo que hay antes del primer [[r]]
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    let index = -1;
    let match = false;
    let condition = 'nd';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('i=')) {
        index = parseInt(trimmed.substring(2), 10);
      } else if (trimmed.startsWith('m=')) {
        match = trimmed.substring(2) === '1';
      } else if (trimmed.startsWith('c=')) {
        condition = trimmed.substring(2).replace(/"/g, '').trim();
      }
    }
    
    if (index >= 0) {
      results.push({ index, match, condition });
    }
  }
  
  return results;
}

async function filterRelevantListingsWithAI(
  anuncios: AnuncioNormalizado[],
  product: { brand: string; model: string; variant?: string; purchasePrice?: number; condition?: string },
  logger: MarketLogger
): Promise<AnuncioNormalizado[]> {
  if (anuncios.length === 0) return [];
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Limitar a 80 anuncios para el análisis
  const anunciosParaAnalizar = anuncios.slice(0, 80);
  
  // Construir query de búsqueda
  const searchQuery = `${product.brand} ${product.model}${product.variant ? ` ${product.variant}` : ''}`;
  
  // Construir el prompt en formato TOML
  let prompt = `Per item: 1) match title to query (EXACT model) 2) classify condition

q="${searchQuery}"
l="es"

`;

  // Añadir cada anuncio como [[i]]
  anunciosParaAnalizar.forEach((a, i) => {
    const titulo = a.titulo.replace(/"/g, '\\"');
    const descripcion = a.descripcion.substring(0, 300).replace(/"/g, '\\"').replace(/\n/g, ' ');
    prompt += `[[i]]
n=${i}
t="${titulo}"
d="${descripcion}"

`;
  });

  prompt += `Input: q=query, l=language, [[i]] with n=index, t=title, d=description
Language: Spanish (Spain)

Conditions (use nd ONLY if impossible):
n: sealed/unopened | ln: opened+flawless | g: light wear | u: visible wear | a: broken

Keywords (semantic, not literal):
• n: sealed/unopened → "precintado", "sin abrir", "sellado"
• ln: opened+flawless → "como nuevo", "impecable", "sin uso"
• g: light wear → "buen/excelente estado", "usado 1-6 meses"
• u: visible wear → "usado >6 meses", "señales uso"

CRITICAL Match Rules:
Generations/Sizes exact: ❌ "iPhone 12" ≠ "iPhone 13" | ❌ "Sofá 2 plazas" ≠ "3 plazas" | ❌ "Talla 42" ≠ "43"
Accessories NOT product: ❌ "Funda/Cargador/Caja iPhone" NOT "iPhone" | ❌ "Sábanas/Funda almohada" NOT "cama/almohada"

Output [[r]] with i=index, m=match(1=yes 0=no), c=condition(n/ln/g/u/a/nd).
CRITICAL: If input has N items [[i]], output MUST have exactly N results [[r]]. Never skip items.
ONLY TOML, NO explanations:

[[r]]
i=0
m=1
c="ln"

[[r]]
i=1
m=0
c="u"`;

  try {
    logger.addPhase('AI_FILTERING_START', {
      message: 'Iniciando filtrado con IA (TOML prompt)',
      model: 'gpt-4o-mini',
      anuncios_to_analyze: anunciosParaAnalizar.length,
      search_query: searchQuery,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4000,
    });
    
    const rawResponse = response.choices[0].message.content || '';
    const parsedResults = parseTOMLResponse(rawResponse);
    
    // Separar matches y no-matches
    const matches = parsedResults.filter(r => r.match);
    const nonMatches = parsedResults.filter(r => !r.match);
    
    // Obtener anuncios seleccionados con su condición
    const selectedAnuncios = matches
      .filter(r => r.index >= 0 && r.index < anuncios.length)
      .map(r => ({
        ...anuncios[r.index],
        relevancia: 1,
        condition_detected: CONDITION_MAP[r.condition] || 'GOOD',
      }));
    
    // Crear mapa de razones de exclusión
    const exclusionReasons = new Map<number, string>();
    nonMatches.forEach(r => {
      exclusionReasons.set(r.index, `No coincide (condition: ${r.condition})`);
    });
    
    // Log del filtrado IA
    logger.logAIFiltering(
      anuncios.length,
      `TOML prompt with query: "${searchQuery}"`,
      {
        total_parsed: parsedResults.length,
        matches: matches.length,
        non_matches: nonMatches.length,
        conditions_detected: matches.map(m => ({ index: m.index, condition: m.condition })),
      },
      selectedAnuncios.length,
      anuncios.map(a => ({ titulo: a.titulo, precio: a.precio, descripcion: a.descripcion })),
      selectedAnuncios.map(a => ({ 
        titulo: a.titulo, 
        precio: a.precio,
        condition: a.condition_detected,
      })),
      exclusionReasons
    );
    
    // Filtrar por estado si el usuario tiene un estado específico
    if (product.condition) {
      const userConditionCode = USER_CONDITION_TO_CODE[product.condition.toUpperCase()] || 'g';
      
      const filteredByCondition = selectedAnuncios.filter(anuncio => {
        // Obtener el código de condición del anuncio
        const match = matches.find(m => anuncios[m.index]?.titulo === anuncio.titulo);
        const adConditionCode = match?.condition || 'nd';
        return isConditionEqualOrBetter(adConditionCode, userConditionCode);
      });
      
      // Log del filtrado por condición
      logger.addPhase('CONDITION_FILTERING', {
        message: 'Filtrado por estado del producto',
        user_condition: product.condition,
        user_condition_code: userConditionCode,
        before_filter: selectedAnuncios.length,
        after_filter: filteredByCondition.length,
        removed_by_condition: selectedAnuncios.length - filteredByCondition.length,
        kept_conditions: filteredByCondition.map(a => a.condition_detected),
      });
      
      return filteredByCondition;
    }
    
    return selectedAnuncios;
    
  } catch (error) {
    logger.addPhase('AI_FILTERING_ERROR', {
      message: 'Error en filtrado IA, usando fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Fallback: filtro básico por texto
    return anuncios.filter(a => {
      const titulo = a.titulo_normalizado;
      const brand = normalizeText(product.brand);
      const model = normalizeText(product.model);
      return titulo.includes(brand) || titulo.includes(model);
    });
  }
}

// ============================================
// DETECCIÓN DE OUTLIERS (CON LOGGING)
// ============================================

function removeOutliers(
  anuncios: AnuncioNormalizado[],
  purchasePrice: number | undefined,
  logger: MarketLogger
): { filtered: AnuncioNormalizado[]; removed: number } {
  if (anuncios.length < 3) {
    logger.addPhase('OUTLIER_DETECTION_SKIPPED', {
      message: 'Muy pocos anuncios para detectar outliers',
      count: anuncios.length,
    });
    return { filtered: anuncios, removed: 0 };
  }
  
  const precios = anuncios.map(a => a.precio_normalizado).sort((a, b) => a - b);
  const promedio = precios.reduce((sum, p) => sum + p, 0) / precios.length;
  
  // Calcular IQR
  const q1Index = Math.floor(precios.length * 0.25);
  const q3Index = Math.floor(precios.length * 0.75);
  const q1 = precios[q1Index];
  const q3 = precios[q3Index];
  const iqr = q3 - q1;
  
  // Límites IQR clásicos
  let lowerBoundIQR = q1 - 1.5 * iqr;
  let upperBoundIQR = q3 + 1.5 * iqr;
  
  // MEJORA: Garantizar un margen mínimo de ±20% respecto al promedio
  // Esto evita descartar anuncios con diferencias pequeñas
  const minMargin = promedio * 0.20;
  const lowerBoundMargin = promedio - minMargin;
  const upperBoundMargin = promedio + minMargin;
  
  // Usar el límite más permisivo entre IQR y margen mínimo
  let lowerBound = Math.min(lowerBoundIQR, lowerBoundMargin);
  let upperBound = Math.max(upperBoundIQR, upperBoundMargin);
  
  // Si tenemos precio de compra, añadir solo límite INFERIOR de sentido común
  // NO ponemos límite superior porque un producto puede revalorizarse:
  // - Escasez (PS5 durante rotura de stock)
  // - Productos descatalogados
  // - Ediciones limitadas / coleccionismo
  if (purchasePrice) {
    const absMinExpected = purchasePrice * 0.10; // Mínimo absoluto: 10% del precio original
    // NO hay límite superior - el mercado manda
    
    // Solo aplicar límite inferior para detectar precios absurdamente bajos
    lowerBound = Math.max(lowerBound, absMinExpected);
    // upperBound NO se toca - permitimos precios por encima del PVP original
  }
  
  const removedItems: Array<{ titulo: string; precio: number; reason: string }> = [];
  
  const filtered = anuncios.filter(a => {
    const precio = a.precio_normalizado;
    const desviacionPorcentaje = Math.abs(precio - promedio) / promedio * 100;
    
    // MEJORA: Solo descartar si la desviación es > 30% respecto al promedio
    // O si está fuera de los límites absolutos (basados en precio de compra)
    if (precio < lowerBound && desviacionPorcentaje > 30) {
      removedItems.push({
        titulo: a.titulo,
        precio: precio,
        reason: `Precio ${precio}€ muy bajo (${desviacionPorcentaje.toFixed(1)}% por debajo del promedio ${Math.round(promedio)}€)`,
      });
      return false;
    }
    if (precio > upperBound && desviacionPorcentaje > 30) {
      removedItems.push({
        titulo: a.titulo,
        precio: precio,
        reason: `Precio ${precio}€ muy alto (${desviacionPorcentaje.toFixed(1)}% por encima del promedio ${Math.round(promedio)}€)`,
      });
      return false;
    }
    return true;
  });
  
  // Log de outliers con información mejorada
  logger.logOutlierDetection(
    anuncios.length,
    purchasePrice,
    { lower: lowerBound, upper: upperBound },
    removedItems,
    filtered.length
  );
  
  return {
    filtered,
    removed: anuncios.length - filtered.length,
  };
}

// ============================================
// CÁLCULO DE PRECIOS (CON LOGGING)
// ============================================

function calculatePrices(
  anuncios: AnuncioNormalizado[],
  purchasePrice: number | undefined,
  logger: MarketLogger
): MarketPriceResult['marketAnalysis'] {
  if (anuncios.length === 0) {
    logger.addPhase('PRICE_CALCULATION_EMPTY', {
      message: 'No hay anuncios para calcular precios',
    });
    return {
      totalListingsFound: 0,
      relevantListings: 0,
      outlierRemoved: 0,
      priceRange: { min: 0, max: 0, average: 0 },
      recommendedPrices: { minimo: 0, ideal: 0, rapido: 0 },
      marketTrend: 'stable',
      notes: 'No se encontraron anuncios relevantes para este producto.',
    };
  }
  
  const precios = anuncios.map(a => a.precio_normalizado).sort((a, b) => a - b);
  
  const min = precios[0];
  const max = precios[precios.length - 1];
  const average = precios.reduce((sum, p) => sum + p, 0) / precios.length;
  
  // PRECIO MÍNIMO: el más bajo del mercado (venta muy rápida pero menos dinero)
  const minPrice = min;
  // PRECIO IDEAL: el promedio del mercado (precio justo)
  const idealPrice = Math.round(average);
  // PRECIO RÁPIDO: 10% por debajo del promedio (vender rápido SIN malvender)
  const fastPrice = Math.round(average * 0.9);
  
  let percentageRetained: number | undefined;
  if (purchasePrice && purchasePrice > 0) {
    percentageRetained = Math.round((idealPrice / purchasePrice) * 100);
  }
  
  // Log de cálculo de precios
  logger.logPriceCalculation(
    precios,
    {
      min: minPrice,
      max,
      average,
      minimo: minPrice,     // El más bajo del mercado
      ideal: idealPrice,    // El promedio (precio justo)
      rapido: fastPrice,    // 90% del promedio (vender rápido sin malvender)
    },
    percentageRetained
  );
  
  let marketTrend: 'stable' | 'rising' | 'falling' = 'stable';
  const priceSpread = (max - min) / average;
  if (priceSpread > 0.4) {
    marketTrend = 'falling';
  }
  
  let notes = `Análisis basado en ${anuncios.length} anuncios similares.`;
  if (percentageRetained) {
    notes += ` El producto mantiene aproximadamente el ${percentageRetained}% de su valor original.`;
  }
  if (anuncios.filter(a => a.is_shippable).length > anuncios.length * 0.7) {
    notes += ' La mayoría de vendedores ofrecen envío.';
  }
  
  return {
    totalListingsFound: anuncios.length,
    relevantListings: anuncios.length,
    outlierRemoved: 0,
    priceRange: {
      min: Math.round(min),
      max: Math.round(max),
      average: Math.round(average),
    },
    recommendedPrices: {
      minimo: minPrice,      // "Si quieres vender rápido, baja a este precio"
      ideal: idealPrice,     // "Este es el precio de mercado justo"
      rapido: fastPrice,     // "Para vender más rápido sin malvender" (90% del ideal)
    },
    percentageRetained,
    marketTrend,
    notes,
  };
}

// ============================================
// ENDPOINT PRINCIPAL
// ============================================

export async function POST(request: NextRequest) {
  let logger: MarketLogger | null = null;
  
  try {
    const body = await request.json();
    const { brand, model, variant, purchasePrice, condition } = body;
    
    if (!brand || !model) {
      return NextResponse.json(
        { success: false, error: 'Se requiere marca y modelo' },
        { status: 400 }
      );
    }
    
    // Inicializar logger
    logger = new MarketLogger(brand, model, variant, purchasePrice);
    
    const keywords = [brand, model, variant].filter(Boolean).join(' ');
    
    // PASO 1: Obtener anuncios de Wallapop
    const { anuncios: allAnuncios, wallapopRequests } = await fetchAllWallapopListings(
      keywords,
      logger,
      2
    );
    
    if (allAnuncios.length === 0) {
      logger.finalize({
        wallapopRequests,
        totalListingsFound: 0,
        relevantListings: 0,
        outliersRemoved: 0,
        finalPrices: { minimo: 0, ideal: 0, rapido: 0 },
      });
      
      return NextResponse.json({
        success: true,
        product: { brand, model, variant, purchasePrice },
        marketAnalysis: {
          totalListingsFound: 0,
          relevantListings: 0,
          outlierRemoved: 0,
          priceRange: { min: 0, max: 0, average: 0 },
          recommendedPrices: { minimo: 0, ideal: 0, rapido: 0 },
          marketTrend: 'stable',
          notes: 'No se encontraron anuncios para este producto en Wallapop.',
        },
        listings: [],
      });
    }
    
    // PASO 2: Filtrar con IA (incluyendo filtrado por condición del producto)
    const relevantAnuncios = await filterRelevantListingsWithAI(
      allAnuncios,
      { brand, model, variant, purchasePrice, condition },
      logger
    );
    
    // PASO 3: Eliminar outliers
    const { filtered: finalAnuncios, removed: outliersRemoved } = removeOutliers(
      relevantAnuncios,
      purchasePrice,
      logger
    );
    
    // PASO 4: Calcular precios
    const marketAnalysis = calculatePrices(finalAnuncios, purchasePrice, logger);
    marketAnalysis.totalListingsFound = allAnuncios.length;
    marketAnalysis.relevantListings = relevantAnuncios.length;
    marketAnalysis.outlierRemoved = outliersRemoved;
    
    // Finalizar logger
    logger.finalize({
      wallapopRequests,
      totalListingsFound: allAnuncios.length,
      relevantListings: relevantAnuncios.length,
      outliersRemoved,
      finalPrices: marketAnalysis.recommendedPrices,
    });
    
    const result: MarketPriceResult = {
      success: true,
      product: { brand, model, variant, purchasePrice },
      marketAnalysis,
      listings: finalAnuncios.slice(0, 10),
    };
    
    return NextResponse.json(result);
  } catch (error) {
    if (logger) {
      logger.addPhase('ERROR', {
        message: 'Error en el análisis de mercado',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    console.error('❌ Error en análisis de mercado:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al analizar precios de mercado' 
      },
      { status: 500 }
    );
  }
}
