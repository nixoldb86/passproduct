import { NextResponse } from "next/server";
import OpenAI from "openai";
import { calculateWarranty } from "@/lib/warranty";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Categorías disponibles (ampliadas para cualquier producto)
const CATEGORIES = `smartphones,tablets,laptops,desktops,monitors,consoles,audio,wearables,cameras,tv,projectors,appliances-large,appliances-small,climate,ebikes,scooters,drones,gaming,networking,storage,peripherals,baby-strollers,baby-car-seats,baby-furniture,toys,furniture,garden,lighting,home-decor,fitness,bikes,sports,outdoor,footwear,clothing,fashion-luxury,watches-jewelry,bags,instruments,music-equipment,tools,power-tools,motorcycles,car-parts,collectibles,books-media,other`;

// Prompt unificado para imágenes de facturas/tickets - detecta múltiples productos
const SYSTEM_PROMPT_IMAGE = `Analiza la imagen de factura/ticket y extrae TODOS los productos. JSON sin markdown:

Si es una FOTO DE PRODUCTO (no factura):
{"imageType":"product","multipleProducts":false,"products":[{"brand":"str|null","model":"str|null","variant":"str|null","category":"slug","purchasePrice":null,"lineDescription":"descripción del producto","refCodes":[]}],"purchaseDate":null,"purchaseStore":null,"confidence":"high|medium|low"}

Si es una FACTURA/TICKET con productos:
{"imageType":"invoice","multipleProducts":bool,"products":[{"brand":"str|null","model":"str|null","variant":"str|null","category":"slug","purchasePrice":num|null,"lineDescription":"descripción exacta de la línea","refCodes":["TODOS los códigos de esta línea"]}],"purchaseDate":"YYYY-MM-DD","purchaseStore":"str|null","confidence":"high|medium|low"}

Categorías: ${CATEGORIES}

REGLAS CRÍTICAS:
- purchaseDate: OBLIGATORIO en facturas. Buscar "Fecha", "Date", día/mes/año. Formato YYYY-MM-DD
- multipleProducts: true si hay MÁS DE 1 producto en la factura
- products: array con CADA producto encontrado (puede ser 1 o varios)
- brand/model: SOLO marcas/modelos REALES (Apple, Samsung, Dyson V15...). NO códigos numéricos.
- Si dice "ASPIRADOR RECARGABLE" sin marca, brand=null, model=null
- refCodes: TODOS los códigos de cada línea (Modelo:446986-01, Código:07746288500, SKU, EAN, Dpto, Ref)
- lineDescription: copiar descripción EXACTA del ticket para cada producto
- purchasePrice: precio de CADA producto individual
- Ignora líneas de envío, seguros, descuentos, IVA - solo productos físicos >20€
- Solo JSON`;

// Prompt para texto/PDF - igual formato que imágenes
const SYSTEM_PROMPT_TEXT = `Extrae TODOS los productos de la factura. JSON sin markdown:
{"imageType":"invoice","multipleProducts":bool,"products":[{"brand":"str|null","model":"str|null","variant":"str|null","category":"slug","purchasePrice":num|null,"lineDescription":"descripción exacta","refCodes":["todos los códigos de esta línea"]}],"purchaseDate":"YYYY-MM-DD","purchaseStore":"str|null","confidence":"high|medium|low"}

Categorías: ${CATEGORIES}

REGLAS CRÍTICAS:
- purchaseDate: OBLIGATORIO. Buscar "Fecha", "Date", día/mes/año en el texto. Formato YYYY-MM-DD
- multipleProducts: true si hay MÁS DE 1 producto
- products: array con CADA producto (1 o más)
- brand/model: SOLO marcas/modelos REALES. NO códigos como "446986-01" en model.
- Si dice "ASPIRADOR RECARGABLE" sin marca específica, brand=null, model=null
- refCodes: CAPTURAR TODO (Dpto:0077, Código:07746288500, Modelo:446986-01, SKU, EAN, Ref)
- lineDescription: descripción exacta del ticket
- Ignora envíos/seguros/servicios, solo productos >20€
- Solo JSON`;

// Función para buscar producto por código de referencia usando búsqueda web
async function searchProductByRef(refCodes: string[], description: string, store: string, model?: string, price?: number): Promise<{ brand: string; model: string; variant: string | null; category: string } | null> {
  // Combinar refCodes con el modelo si parece ser un código
  const allCodes = [...(refCodes || [])];
  if (model && /^\d{5,}|^\d+-\d+$|^[A-Z0-9]{6,}$/i.test(model)) {
    allCodes.push(model);
  }
  
  if (allCodes.length === 0 && !description) return null;
  
  // Construir query de búsqueda
  const searchQuery = [
    ...allCodes.slice(0, 2), // Primeros 2 códigos
    description,
    store,
  ].filter(Boolean).join(" ");
  
  console.log(`🔍 Búsqueda web: "${searchQuery}"`);
  
  try {
    let searchResults = "";
    
    // Opción 1: Serper.dev (recomendado, gratuito hasta 2500/mes)
    const serperKey = process.env.SERPER_API_KEY;
    if (serperKey) {
      console.log("Usando Serper.dev para búsqueda...");
      const serperResponse = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: searchQuery,
          gl: "es",
          hl: "es",
          num: 5,
        }),
      });
      
      if (serperResponse.ok) {
        const serperData = await serperResponse.json();
        searchResults = serperData.organic
          ?.map((r: { title: string; snippet: string }) => `${r.title}: ${r.snippet}`)
          .join("\n") || "";
        
        // Incluir también el knowledge graph si existe
        if (serperData.knowledgeGraph?.description) {
          searchResults = `${serperData.knowledgeGraph.title}: ${serperData.knowledgeGraph.description}\n${searchResults}`;
        }
      }
    }
    
    // Opción 2: Tavily (alternativa)
    if (!searchResults) {
      const tavilyKey = process.env.TAVILY_API_KEY;
      if (tavilyKey) {
        console.log("Usando Tavily para búsqueda...");
        const tavilyResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: searchQuery,
            search_depth: "basic",
            max_results: 5,
          }),
        });
        
        if (tavilyResponse.ok) {
          const tavilyData = await tavilyResponse.json();
          searchResults = tavilyData.results
            ?.map((r: { title: string; content: string }) => `${r.title}: ${r.content}`)
            .join("\n") || "";
        }
      }
    }
    
    // Si no hay API de búsqueda configurada
    if (!searchResults) {
      console.warn("⚠️ No hay API de búsqueda configurada (SERPER_API_KEY o TAVILY_API_KEY)");
      console.warn("Para identificar productos por referencia, configura una de estas APIs en .env.local");
      
      // Fallback: intentar con GPT y su conocimiento (menos preciso)
      const fallbackCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Intenta identificar el producto basándote en tu conocimiento. JSON sin markdown:
{"brand":"str|null","model":"str|null","variant":"str|null","category":"slug"}
Categorías: ${CATEGORIES}
Si no puedes identificar con certeza, devuelve nulls.`
          },
          {
            role: "user",
            content: `Producto: ${description}, Tienda: ${store}, Precio: ${price}€, Códigos: ${allCodes.join(", ")}`
          }
        ],
        max_tokens: 100,
        temperature: 0,
      });
      
      const fallbackText = fallbackCompletion.choices[0]?.message?.content?.trim() || "";
      const fallbackJson = fallbackText.replace(/```json\n?|\n?```/g, "").trim();
      const fallbackResult = JSON.parse(fallbackJson);
      
      if (fallbackResult.brand && fallbackResult.model) {
        return fallbackResult;
      }
      return null;
    }
    
    console.log(`📄 Resultados encontrados (${searchResults.length} chars)`);
    
    // Usar GPT para extraer marca y modelo de los resultados de búsqueda
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Extrae la marca y modelo EXACTO del producto de los resultados de búsqueda.
JSON sin markdown:
{"brand":"str","model":"str","variant":"str|null","category":"slug"}
Categorías: ${CATEGORIES}

REGLAS IMPORTANTES:
- brand: La MARCA REAL de la empresa fabricante (ej: Sonpura, Apple, Samsung)
- model: El MODELO específico del producto (ej: Brisa V8 Titanio, iPhone 15 Pro)
- variant: Tecnologías o variantes (ej: Multisac, USB-C, 256GB)
- Si "Multisac" aparece como tecnología de Sonpura, marca=Sonpura, variant=Multisac
- Devuelve la marca y modelo REAL que aparece en los resultados, no inventes.`
        },
        {
          role: "user",
          content: `Identifica el producto exacto:

Códigos buscados: ${allCodes.join(", ")}
Descripción original: ${description}
Tienda: ${store}
Precio: ${price ? `${price}€` : "N/A"}

Resultados de búsqueda web:
${searchResults}

¿Qué marca y modelo específico es?`
        }
      ],
      max_tokens: 150,
      temperature: 0,
    });
    
    const responseText = completion.choices[0]?.message?.content?.trim() || "";
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleanJson);
    
    if (result.brand && result.model && result.brand.length > 1) {
      console.log(`✅ Producto identificado: ${result.brand} ${result.model}`);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error("Error en búsqueda de producto:", error);
    return null;
  }
}

// Detectar si la descripción es genérica
function isGenericDescription(brand: string | null, model: string | null, description: string): boolean {
  const genericTerms = [
    "aspirador", "televisor", "tv", "portatil", "laptop", "movil", "telefono",
    "auriculares", "altavoz", "camara", "consola", "tablet", "reloj", "smartwatch",
    "recargable", "inalambrico", "smart", "electrodomestico", "lavadora", "secadora",
    "frigorifico", "nevera", "horno", "microondas", "cafetera", "robot"
  ];
  
  const lowerBrand = (brand || "").toLowerCase().trim();
  const lowerModel = (model || "").toLowerCase().trim();
  const lowerDesc = (description || "").toLowerCase();
  
  // Si no hay marca, es genérico
  if (!brand || brand.length < 2) {
    return true;
  }
  
  // Si la marca es un término genérico, es genérico
  if (genericTerms.some(t => lowerBrand.includes(t))) {
    return true;
  }
  
  // Si el modelo parece ser un código de referencia (solo números o formato XXX-XX)
  if (model && /^\d{5,}$|^\d+-\d+$|^[0-9-]+$/.test(model.trim())) {
    return true;
  }
  
  // Si la descripción contiene términos genéricos sin marca conocida
  const knownBrands = ["apple", "samsung", "sony", "lg", "dyson", "philips", "bosch", "siemens", 
    "xiaomi", "huawei", "dell", "hp", "lenovo", "asus", "acer", "microsoft", "google", "bose",
    "jbl", "marshall", "bang", "olufsen", "miele", "electrolux", "rowenta", "tefal", "moulinex"];
  
  if (!knownBrands.some(b => lowerBrand.includes(b))) {
    if (genericTerms.some(t => lowerDesc.includes(t))) {
      return true;
    }
  }
  
  return false;
}

// Mapeo de categorías detectadas por IA -> IDs en BD PostgreSQL
// Los IDs usan formato cat-{slug} y deben coincidir con mockCategories y seed.ts
const CATEGORY_MAP: Record<string, string> = {
  // === ELECTRÓNICA DE CONSUMO ===
  smartphones: "cat-smartphones",
  phone: "cat-smartphones",
  mobile: "cat-smartphones",
  iphone: "cat-smartphones",
  android: "cat-smartphones",
  tablets: "cat-tablets",
  tablet: "cat-tablets",
  ipad: "cat-tablets",
  laptops: "cat-laptops",
  laptop: "cat-laptops",
  notebook: "cat-laptops",
  macbook: "cat-laptops",
  desktops: "cat-desktops",
  desktop: "cat-desktops",
  pc: "cat-desktops",
  computer: "cat-desktops",
  monitors: "cat-monitors",
  monitor: "cat-monitors",
  consoles: "cat-consoles",
  console: "cat-consoles",
  gaming: "cat-consoles",
  playstation: "cat-consoles",
  ps5: "cat-consoles",
  xbox: "cat-consoles",
  nintendo: "cat-consoles",
  audio: "cat-audio",
  headphones: "cat-audio",
  auriculares: "cat-audio",
  earbuds: "cat-audio",
  speakers: "cat-audio",
  speaker: "cat-audio",
  altavoces: "cat-audio",
  soundbar: "cat-audio",
  wearables: "cat-wearables",
  smartwatch: "cat-wearables",
  smartwatches: "cat-wearables",
  watch: "cat-wearables",
  applewatch: "cat-wearables",
  fitbit: "cat-wearables",
  cameras: "cat-cameras",
  camera: "cat-cameras",
  camara: "cat-cameras",
  dslr: "cat-cameras",
  gopro: "cat-cameras",
  tv: "cat-tv",
  tvs: "cat-tv",
  television: "cat-tv",
  projectors: "cat-projectors",
  projector: "cat-projectors",
  proyector: "cat-projectors",

  // === ELECTRODOMÉSTICOS ===
  "appliances-large": "cat-appliances-large",
  "appliances-small": "cat-appliances-small",
  appliances: "cat-appliances-small",
  electrodomestico: "cat-appliances-small",
  electrodomesticos: "cat-appliances-small",
  vacuums: "cat-appliances-small",
  vacuum: "cat-appliances-small",
  aspirador: "cat-appliances-small",
  aspiradora: "cat-appliances-small",
  roomba: "cat-appliances-small",
  climate: "cat-climate",
  aire: "cat-climate",
  calefaccion: "cat-climate",

  // === MOVILIDAD ===
  ebikes: "cat-ebikes",
  ebike: "cat-ebikes",
  scooters: "cat-scooters",
  scooter: "cat-scooters",
  patinete: "cat-scooters",
  drones: "cat-drones",
  drone: "cat-drones",
  dji: "cat-drones",

  // === BEBÉS Y NIÑOS ===
  "baby-strollers": "cat-baby-strollers",
  stroller: "cat-baby-strollers",
  cochecito: "cat-baby-strollers",
  carrito: "cat-baby-strollers",
  buggy: "cat-baby-strollers",
  yoyo: "cat-baby-strollers",
  babyzen: "cat-baby-strollers",
  "baby-car-seats": "cat-baby-car-seats",
  "car-seat": "cat-baby-car-seats",
  carseat: "cat-baby-car-seats",
  silla: "cat-baby-car-seats",
  maxicosi: "cat-baby-car-seats",
  "baby-furniture": "cat-baby-furniture",
  cuna: "cat-baby-furniture",
  toys: "cat-toys",
  juguete: "cat-toys",
  juguetes: "cat-toys",

  // === HOGAR ===
  furniture: "cat-furniture",
  mueble: "cat-furniture",
  muebles: "cat-furniture",
  sofa: "cat-furniture",
  garden: "cat-garden",
  jardin: "cat-garden",
  lighting: "cat-lighting",
  lampara: "cat-lighting",
  "home-decor": "cat-home-decor",
  decoracion: "cat-home-decor",

  // === DEPORTE ===
  fitness: "cat-fitness",
  gym: "cat-fitness",
  bikes: "cat-bikes",
  bike: "cat-bikes",
  bicicleta: "cat-bikes",
  sports: "cat-sports",
  deporte: "cat-sports",
  outdoor: "cat-outdoor",
  camping: "cat-outdoor",

  // === CALZADO Y ROPA ===
  footwear: "cat-footwear",
  shoes: "cat-footwear",
  calzado: "cat-footwear",
  zapatillas: "cat-footwear",
  botas: "cat-footwear",
  sneakers: "cat-footwear",
  running: "cat-footwear",
  trail: "cat-footwear",
  hiking: "cat-footwear",
  clothing: "cat-clothing",
  ropa: "cat-clothing",
  chaqueta: "cat-clothing",
  abrigo: "cat-clothing",

  // === MODA Y LUJO ===
  "fashion-luxury": "cat-fashion-luxury",
  lujo: "cat-fashion-luxury",
  "watches-jewelry": "cat-watches-jewelry",
  reloj: "cat-watches-jewelry",
  relojes: "cat-watches-jewelry",
  joyeria: "cat-watches-jewelry",
  bags: "cat-bags",
  bag: "cat-bags",
  bolso: "cat-bags",
  mochila: "cat-bags",

  // === MÚSICA ===
  instruments: "cat-instruments",
  instrument: "cat-instruments",
  instrumento: "cat-instruments",
  guitar: "cat-instruments",
  guitarra: "cat-instruments",
  piano: "cat-instruments",
  "music-equipment": "cat-music-equipment",

  // === HERRAMIENTAS ===
  tools: "cat-tools",
  tool: "cat-tools",
  herramienta: "cat-tools",
  herramientas: "cat-tools",
  "power-tools": "cat-power-tools",

  // === VEHÍCULOS ===
  motorcycles: "cat-motorcycles",
  moto: "cat-motorcycles",
  "car-parts": "cat-car-parts",
  
  // === OTROS ===
  collectibles: "cat-collectibles",
  "books-media": "cat-books-media",
  libros: "cat-books-media",
  other: "cat-other",
  otros: "cat-other",
};

export async function POST(request: Request) {
  try {
    const { imageBase64, imageUrl, pdfText } = await request.json();

    if (!imageBase64 && !imageUrl && !pdfText) {
      return NextResponse.json(
        { error: "Se requiere una imagen o texto del PDF" },
        { status: 400 }
      );
    }

    let completion;

    if (pdfText) {
      // Procesar texto de PDF (puede tener múltiples productos)
      completion = await openai.chat.completions.create({
        model: "gpt-4o", // Más rápido y estable
        messages: [
          { role: "system", content: SYSTEM_PROMPT_TEXT },
          {
            role: "user",
            content: `Analiza este texto de factura/ticket y extrae la información de TODOS los productos:\n\n${pdfText}`,
          },
        ],
        max_tokens: 800,
        temperature: 0,
      });
    } else {
      // Procesar imagen
      const imageContent = imageBase64
        ? {
            type: "image_url" as const,
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: "high" as const,
            },
          }
        : {
            type: "image_url" as const,
            image_url: {
              url: imageUrl,
              detail: "high" as const,
            },
          };

      completion = await openai.chat.completions.create({
        model: "gpt-4o", // Más rápido y estable
        messages: [
          { role: "system", content: SYSTEM_PROMPT_IMAGE },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analiza esta imagen de factura/ticket y extrae TODOS los productos que encuentres:",
              },
              imageContent,
            ],
          },
        ],
        max_tokens: 800, // Aumentado para soportar múltiples productos
        temperature: 0,
      });
    }

    const responseText = completion.choices[0]?.message?.content?.trim() || "";

    // Tipo para los datos extraídos
    type ExtractedDataType = {
      brand?: string;
      model?: string;
      variant?: string;
      category?: string;
      purchasePrice?: number;
      purchaseDate?: string;
      purchaseStore?: string;
      serialNumber?: string;
      refCodes?: string[];
      rawDescription?: string;
      lineDescription?: string;
      confidence?: string;
      imageType?: string;
      multipleProducts?: boolean;
      products?: Array<{
        brand?: string;
        model?: string;
        variant?: string;
        category?: string;
        purchasePrice?: number;
        lineDescription?: string;
        refCodes?: string[];
      }>;
      warrantyYears?: number;
    };

    // Intentar parsear el JSON de la respuesta
    let extractedData: ExtractedDataType;
    try {
      // Limpiar posibles marcadores de código markdown
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
      extractedData = JSON.parse(cleanJson);
    } catch {
      console.error("Error parsing AI response:", responseText);
      return NextResponse.json(
        { error: "Error al procesar la respuesta de la IA", raw: responseText },
        { status: 500 }
      );
    }

    // Detectar si es respuesta de múltiples productos (formato nuevo para PDFs)
    if (extractedData.multipleProducts !== undefined) {
      // Formato nuevo con múltiples productos
      const products = extractedData.products || [];
      
      if (products.length === 0) {
        return NextResponse.json({
          success: false,
          error: "No se detectaron productos en la factura",
        });
      }

      // Enriquecer productos con descripciones genéricas
      const enrichedProducts = await Promise.all(
        products.map(async (p: { brand?: string; model?: string; variant?: string; category?: string; purchasePrice?: number; lineDescription?: string; refCodes?: string[] }) => {
          let brand = p.brand || "";
          let model = p.model || "";
          let variant = p.variant || "";
          let category = p.category || "";
          const lineDesc = p.lineDescription || "";

          // Verificar si hay códigos de referencia
          const hasRefCodes = (p.refCodes && p.refCodes.length > 0) || (model && /^\d{5,}$|^\d+-\d+$/.test(model));

          // Verificar si la marca no es clara (vacía, muy corta, o desconocida)
          const isBrandUnclear = !brand || brand.length <= 3 || isGenericDescription(brand, model, lineDesc);

          // Buscar en internet si la marca no está clara Y hay descripción para buscar
          const shouldSearchWeb = (isBrandUnclear && lineDesc.length > 5) || hasRefCodes;

          if (shouldSearchWeb) {
            console.log(`🔍 Buscando producto en web: "${lineDesc}" (marca: "${brand}", refs: [${(p.refCodes || []).join(", ")}])`);
            const searchResult = await searchProductByRef(
              p.refCodes || [],
              lineDesc,
              extractedData.purchaseStore || "",
              model,
              p.purchasePrice
            );

            if (searchResult) {
              brand = searchResult.brand || brand;
              model = searchResult.model || model;
              variant = searchResult.variant || variant;
              category = searchResult.category || category;
              console.log(`✅ Producto identificado: ${brand} ${model}`);
            }
          }
          
          return {
            brand,
            model,
            variant,
            categoryId: category ? CATEGORY_MAP[category.toLowerCase()] || null : null,
            categorySlug: category,
            purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : null,
            lineDescription: p.lineDescription || `${brand} ${model}`,
            refCodes: p.refCodes || [],
          };
        })
      );

      // Si hay múltiples productos, devolver la lista para que el usuario elija
      if (extractedData.multipleProducts && enrichedProducts.length > 1) {
        // Calcular garantía para cada producto
        let commonWarrantyEndDate: string | null = null;
        let commonWarrantyYears: number | null = null;
        let commonWarrantyType: string | null = null;
        let commonWarrantyNotes: string | null = null;

        // Si hay fecha de compra, calcular garantía (será la misma para todos los productos de la factura)
        if (extractedData.purchaseDate) {
          try {
            const purchaseDate = new Date(extractedData.purchaseDate);
            if (!isNaN(purchaseDate.getTime())) {
              // Usar garantía legal española por defecto (3 años desde 2022)
              const isAfter2022 = purchaseDate >= new Date("2022-01-01");
              const defaultYears = isAfter2022 ? 3 : 2;

              const endDate = new Date(purchaseDate);
              endDate.setFullYear(endDate.getFullYear() + defaultYears);

              commonWarrantyEndDate = endDate.toISOString().split("T")[0];
              commonWarrantyYears = defaultYears;
              commonWarrantyType = "legal";
              commonWarrantyNotes = `Garantía legal española de ${defaultYears} años`;

              console.log("✅ Garantía calculada para múltiples productos:", {
                commonWarrantyEndDate,
                commonWarrantyYears,
              });
            }
          } catch {
            // Ignorar errores
          }
        }

        return NextResponse.json({
          success: true,
          multipleProducts: true,
          products: enrichedProducts,
          // Datos comunes de la factura
          purchaseDate: extractedData.purchaseDate || "",
          purchaseStore: extractedData.purchaseStore || "",
          warrantyEndDate: commonWarrantyEndDate || "",
          warrantyYears: commonWarrantyYears,
          warrantyType: commonWarrantyType,
          warrantyNotes: commonWarrantyNotes,
          confidence: extractedData.confidence || "medium",
          imageType: "invoice",
        });
      }

      // Si solo hay un producto, usar el formato normal
      const singleProduct = enrichedProducts[0];
      extractedData = {
        brand: singleProduct.brand,
        model: singleProduct.model,
        variant: singleProduct.variant,
        category: singleProduct.categorySlug,
        refCodes: singleProduct.refCodes,
        purchaseDate: extractedData.purchaseDate,
        purchaseStore: extractedData.purchaseStore,
        purchasePrice: singleProduct.purchasePrice ?? undefined,
        warrantyYears: extractedData.warrantyYears,
        confidence: extractedData.confidence,
        imageType: "invoice",
      };
    }
    
    // Para imágenes: verificar si necesitamos buscar por referencia
    if (extractedData.imageType !== "invoice" || !extractedData.multipleProducts) {
      const brand = extractedData.brand || "";
      const model = extractedData.model || "";
      const rawDesc = extractedData.rawDescription || extractedData.lineDescription || "";
      const refCodes = extractedData.refCodes || [];

      // Verificar si hay códigos de referencia o si el modelo parece ser un código
      const hasRefCodes = refCodes.length > 0 || (model && /^\d{5,}$|^\d+-\d+$/.test(model));

      // Verificar si la marca no es clara (vacía, muy corta, o desconocida)
      const isBrandUnclear = !brand || brand.length <= 3 || isGenericDescription(brand, model, rawDesc);

      // Buscar en internet si:
      // 1. La marca no está clara Y hay descripción del OCR para buscar
      // 2. O hay códigos de referencia para buscar
      const shouldSearchWeb = (isBrandUnclear && rawDesc.length > 5) || hasRefCodes;

      if (shouldSearchWeb) {
        console.log(`🔍 Buscando producto en web: "${rawDesc}" (marca: "${brand}", refs: [${refCodes.join(", ")}])`);
        const searchResult = await searchProductByRef(
          refCodes,
          rawDesc,
          extractedData.purchaseStore || "",
          model,
          extractedData.purchasePrice
        );

        if (searchResult) {
          extractedData.brand = searchResult.brand || extractedData.brand;
          extractedData.model = searchResult.model || extractedData.model;
          extractedData.variant = searchResult.variant || extractedData.variant;
          extractedData.category = searchResult.category || extractedData.category;
          console.log(`✅ Producto identificado: ${extractedData.brand} ${extractedData.model}`);
        }
      }
    }

    // Mapear la categoría al ID interno
    const categoryId = extractedData.category
      ? CATEGORY_MAP[extractedData.category.toLowerCase()] || null
      : null;

    // Validar fecha de compra
    let validPurchaseDate: string | null = null;
    let purchaseDateObj: Date | null = null;
    if (extractedData.purchaseDate) {
      try {
        const date = new Date(extractedData.purchaseDate);
        if (!isNaN(date.getTime())) {
          validPurchaseDate = extractedData.purchaseDate;
          purchaseDateObj = date;
        }
      } catch {
        validPurchaseDate = null;
      }
    }

    // Calcular garantía usando la lógica de país/categoría
    let warrantyEndDate: string | null = null;
    let warrantyYears: number | null = null;
    let warrantyType: string | null = null;
    let warrantyNotes: string | null = null;

    console.log("📅 Datos para cálculo de garantía:", {
      purchaseDate: validPurchaseDate,
      purchaseDateObj: purchaseDateObj?.toISOString(),
      categoryId,
      brand: extractedData.brand,
    });

    if (purchaseDateObj && categoryId) {
      try {
        const warrantyResult = calculateWarranty({
          categoryId,
          brand: extractedData.brand || undefined,
          purchaseDate: purchaseDateObj,
          country: "ES", // Por defecto España, se podría parametrizar
          manufacturerWarrantyYears: extractedData.warrantyYears 
            ? Number(extractedData.warrantyYears) 
            : undefined,
        });

        warrantyEndDate = warrantyResult.warrantyEndDate.toISOString().split("T")[0];
        warrantyYears = warrantyResult.warrantyYears;
        warrantyType = warrantyResult.warrantyType;
        warrantyNotes = warrantyResult.notes;
        
        console.log("✅ Garantía calculada:", {
          warrantyEndDate,
          warrantyYears,
          warrantyType,
          warrantyNotes,
        });
      } catch (error) {
        console.warn("Error calculating warranty:", error);
      }
    } else {
      console.log("⚠️ No se puede calcular garantía - falta:", {
        purchaseDateObj: !purchaseDateObj ? "❌ fecha" : "✅",
        categoryId: !categoryId ? "❌ categoría" : "✅",
      });
    }
    
    // Fallback: Si no se calculó garantía, usar garantía legal por defecto (3 años en España desde 2022)
    if (!warrantyEndDate && purchaseDateObj) {
      try {
        // Aplicar garantía legal española por defecto
        const isAfter2022 = purchaseDateObj >= new Date("2022-01-01");
        const defaultYears = isAfter2022 ? 3 : 2;
        
        const endDate = new Date(purchaseDateObj);
        endDate.setFullYear(endDate.getFullYear() + defaultYears);
        
        warrantyEndDate = endDate.toISOString().split("T")[0];
        warrantyYears = defaultYears;
        warrantyType = "legal";
        warrantyNotes = `Garantía legal española de ${defaultYears} años`;
        
        console.log("📋 Garantía legal por defecto aplicada:", {
          warrantyEndDate,
          warrantyYears,
        });
      } catch {
        // Ignorar errores
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        brand: extractedData.brand || "",
        model: extractedData.model || "",
        variant: extractedData.variant || "",
        categoryId,
        categorySlug: extractedData.category || "",
        purchasePrice: extractedData.purchasePrice ? Number(extractedData.purchasePrice) : null,
        purchaseDate: validPurchaseDate || "",
        purchaseStore: extractedData.purchaseStore || "",
        warrantyEndDate: warrantyEndDate || "",
        warrantyYears,
        warrantyType,
        warrantyNotes,
        serialLast4: extractedData.serialNumber || "",
        confidence: extractedData.confidence || "medium",
        imageType: extractedData.imageType || "product",
      },
    });
  } catch (error) {
    console.error("Error extracting product info:", error);
    return NextResponse.json(
      { error: "Error al analizar el archivo" },
      { status: 500 }
    );
  }
}
