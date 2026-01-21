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
// FILTRADO CON IA (CON LOGGING)
// ============================================

async function filterRelevantListingsWithAI(
  anuncios: AnuncioNormalizado[],
  product: { brand: string; model: string; variant?: string; purchasePrice?: number },
  logger: MarketLogger
): Promise<AnuncioNormalizado[]> {
  if (anuncios.length === 0) return [];
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const anunciosParaAnalizar = anuncios.slice(0, 50).map((a, i) => ({
    index: i,
    titulo: a.titulo,
    precio: a.precio,
    descripcion: a.descripcion.substring(0, 200),
  }));
  
  // Crear nombre corto del producto para búsqueda flexible
  const productShortNames = [
    `${product.brand} ${product.model}`,
    product.model,
  ];
  if (product.model.includes(' ')) {
    productShortNames.push(product.model.split(' ')[0]); // e.g., "PlayStation" de "PlayStation 5"
  }
  
  const prompt = `Eres un experto en análisis de mercado de segunda mano. DEBES identificar TODOS los anuncios que vendan el PRODUCTO COMPLETO del usuario.

PRODUCTO DEL USUARIO:
- Marca: ${product.brand}
- Modelo: ${product.model}
${product.variant ? `- Variante: ${product.variant}` : ''}
${product.purchasePrice ? `- Precio de compra original: ${product.purchasePrice}€` : ''}

SINÓNIMOS ACEPTABLES:
${product.model === 'PlayStation 5' ? '- "PS5", "PlayStation 5", "Play Station 5", "Playstation5" son TODOS lo mismo\n- "Slim", "Digital", "Disco", "Lector" son VARIANTES válidas de la consola completa' : ''}
${product.brand === 'Dyson' ? '- "Aspiradora", "Aspirador", "Vacuum" son lo mismo\n- V15, V15s, V15 Detect son variantes válidas' : ''}

ANUNCIOS ENCONTRADOS:
${JSON.stringify(anunciosParaAnalizar, null, 2)}

🟢 INCLUIR (SER MUY INCLUSIVO):
- CUALQUIER anuncio que venda la CONSOLA/PRODUCTO COMPLETO
- Títulos con variaciones: "PS5 Slim", "PlayStation 5 Slim", "Consola PS5", etc.
- Productos "nuevos", "seminuevos", "como nuevo", "poco uso", "precintado"
- Aunque diga "sin mando" o "sin caja" SI el precio sugiere producto completo (>200€ para consolas)
- Aunque tenga errores ortográficos: "ocacion" = "ocasión", "Playstion" = "PlayStation"

🔴 EXCLUIR (SOLO estos casos):
- ACCESORIOS claramente separados: mandos sueltos, cables, cargadores, fundas, soportes
- SOLO la caja vacía o embalaje
- PIEZAS de reparación: lectores, placas, ventiladores
- Productos de OTRA GENERACIÓN: PS4, PS3, PS2 (NO son PS5)
- Precio < 50€ (muy bajo para ser el producto completo)
- El título dice EXPLÍCITAMENTE "para PS5" (indica accesorio)

⚠️ EN CASO DE DUDA: INCLUIR el anuncio (es mejor incluir de más que excluir de más)

RESPUESTA OBLIGATORIA en JSON:
{
  "relevant_indices": [lista de índices a INCLUIR],
  "excluded": [{"index": X, "reason": "razón breve"}]
}

EJEMPLO para PS5 Slim:
- "PlayStation 5 Slim Sony.Nueva a estrenar 420€" → INCLUIR (es PS5 Slim completa)
- "PS5 Slim Digital Blanca 850GB 350€" → INCLUIR (es PS5 Slim Digital completa)
- "Mando DualSense PS5 50€" → EXCLUIR (accesorio, dice "Mando")
- "PS4 Slim 150€" → EXCLUIR (es PS4, no PS5)`;

  try {
    logger.addPhase('AI_FILTERING_START', {
      message: 'Iniciando filtrado con IA',
      model: 'gpt-4o-mini',
      anuncios_to_analyze: anunciosParaAnalizar.length,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    // Aceptar ambos formatos: relevant_indices o indices_seleccionados
    const relevantIndices: number[] = result.relevant_indices || result.indices_seleccionados || [];
    const excludedByAI: Array<{ index: number; reason: string }> = result.excluded || result.excluidos || [];
    
    // Obtener anuncios seleccionados
    const selectedAnuncios = relevantIndices
      .filter(i => i >= 0 && i < anuncios.length)
      .map(i => ({ ...anuncios[i], relevancia: 1 }));
    
    // Crear mapa de razones de exclusión de la IA
    const exclusionReasons = new Map<number, string>();
    excludedByAI.forEach(e => exclusionReasons.set(e.index, e.reason));
    
    // Log del filtrado IA con detalle de descartados (usando razones de la IA)
    logger.logAIFiltering(
      anuncios.length,
      prompt,
      result,
      relevantIndices.length,
      anuncios.map(a => ({ titulo: a.titulo, precio: a.precio, descripcion: a.descripcion })),
      selectedAnuncios.map(a => ({ titulo: a.titulo, precio: a.precio })),
      exclusionReasons
    );
    
    return selectedAnuncios;
  } catch (error) {
    logger.addPhase('AI_FILTERING_ERROR', {
      message: 'Error en filtrado IA, usando fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Fallback
    return anuncios.filter(a => {
      const titulo = a.titulo_normalizado;
      const brand = normalizeText(product.brand);
      const model = normalizeText(product.model);
      return titulo.includes(brand) && titulo.includes(model);
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
    const { brand, model, variant, purchasePrice } = body;
    
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
    
    // PASO 2: Filtrar con IA
    const relevantAnuncios = await filterRelevantListingsWithAI(
      allAnuncios,
      { brand, model, variant, purchasePrice },
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
