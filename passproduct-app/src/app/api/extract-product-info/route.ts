import { NextResponse } from "next/server";
import OpenAI from "openai";
import { calculateWarranty } from "@/lib/warranty";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Categorías compactas (slug: ejemplos)
const CATEGORIES = "smartphones,tablets,laptops,desktops,monitors,consoles,audio,wearables,cameras,tv,projectors,appliances-large,appliances-small,climate,ebikes,scooters,drones,gaming,networking,storage,peripherals,other";

// Prompt compacto para imágenes - captura códigos de referencia
const SYSTEM_PROMPT_IMAGE = `Extrae info del producto en la imagen. JSON sin markdown:
{"brand":"str|null","model":"str|null","variant":"str|null","category":"slug","purchasePrice":num|null,"purchaseDate":"YYYY-MM-DD|null","purchaseStore":"str|null","serialNumber":"4 últimos|null","refCodes":["todos los códigos"],"rawDescription":"descripción exacta del ticket","confidence":"high|medium|low","imageType":"product|invoice"}

Categorías: ${CATEGORIES}
REGLAS CRÍTICAS:
- brand/model: SOLO si es una marca/modelo REAL (Apple, Samsung, Dyson V15...). NO códigos numéricos.
- Si el ticket dice "ASPIRADOR RECARGABLE" sin marca, brand=null, model=null
- refCodes: TODOS los códigos encontrados (Modelo:446986-01, Código:07746288500, SKU, EAN, Ref)
- rawDescription: copiar descripción exacta del ticket (ej: "ASPIRADOR RECARGABLE")
- Solo JSON`;

// Prompt compacto para texto/PDF - captura códigos de referencia  
const SYSTEM_PROMPT_TEXT = `Extrae productos de factura. JSON sin markdown:
{"multipleProducts":bool,"products":[{"brand":"str|null","model":"str|null","variant":"str|null","category":"slug","purchasePrice":num|null,"lineDescription":"descripción exacta","refCodes":["todos los códigos de esta línea"]}],"purchaseDate":"YYYY-MM-DD|null","purchaseStore":"str|null","confidence":"high|medium|low"}

Categorías: ${CATEGORIES}
REGLAS CRÍTICAS:
- brand/model: SOLO marcas/modelos REALES. NO poner códigos como "446986-01" en model.
- Si dice "ASPIRADOR RECARGABLE" sin marca específica, brand=null, model=null
- refCodes: CAPTURAR TODO (Dpto:0077, Código:07746288500, Modelo:446986-01, SKU, EAN, Ref)
- lineDescription: descripción exacta del ticket
- Ignora envíos/seguros/servicios, solo productos >20€
- Solo JSON`;

// Función para buscar producto por código de referencia
async function searchProductByRef(refCodes: string[], description: string, store: string, model?: string): Promise<{ brand: string; model: string; variant: string | null; category: string } | null> {
  // Combinar refCodes con el modelo si parece ser un código
  const allCodes = [...(refCodes || [])];
  if (model && /^\d{5,}|^\d+-\d+$|^[A-Z0-9]{6,}$/i.test(model)) {
    allCodes.push(model);
  }
  
  if (allCodes.length === 0) return null;
  
  // Construir query de búsqueda optimizada
  const searchTerms = [
    ...allCodes,
    description,
    store,
    "especificaciones producto"
  ].filter(Boolean).join(" ");
  
  console.log(`Búsqueda web: "${searchTerms}"`);
  
  try {
    // Intentar con Tavily primero
    const tavilyKey = process.env.TAVILY_API_KEY;
    let searchResults = "";
    
    if (tavilyKey) {
      const tavilyResponse = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${searchTerms} producto especificaciones`,
          search_depth: "basic",
          max_results: 3,
        }),
      });
      
      if (tavilyResponse.ok) {
        const tavilyData = await tavilyResponse.json();
        searchResults = tavilyData.results
          ?.map((r: { title: string; content: string }) => `${r.title}: ${r.content}`)
          .join("\n") || "";
      }
    }
    
    // Fallback a DuckDuckGo si no hay resultados
    if (!searchResults) {
      const ddgResponse = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(searchTerms)}&format=json&no_html=1`
      );
      if (ddgResponse.ok) {
        const ddgData = await ddgResponse.json();
        if (ddgData.Abstract) {
          searchResults = ddgData.Abstract;
        }
      }
    }
    
    if (!searchResults) return null;
    
    // Usar IA para extraer marca y modelo de los resultados
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Identifica marca y modelo del producto. JSON sin markdown:
{"brand":"str","model":"str","variant":"str|null","category":"slug"}
Categorías: ${CATEGORIES}
Solo JSON, sin explicaciones.`
        },
        {
          role: "user",
          content: `Códigos de referencia: ${refCodes.join(", ")}
Descripción en ticket: ${description}
Tienda: ${store}

Resultados de búsqueda:
${searchResults}

¿Qué producto es exactamente?`
        }
      ],
      max_tokens: 150,
      temperature: 0,
    });
    
    const responseText = completion.choices[0]?.message?.content?.trim() || "";
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error searching product by ref:", error);
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

const CATEGORY_MAP: Record<string, string> = {
  smartphones: "cat-smartphones",
  tablets: "cat-tablets",
  laptops: "cat-laptops",
  desktops: "cat-desktops",
  monitors: "cat-monitors",
  consoles: "cat-consoles",
  audio: "cat-audio",
  wearables: "cat-wearables",
  cameras: "cat-cameras",
  tv: "cat-tv",
  projectors: "cat-projectors",
  "appliances-large": "cat-appliances-large",
  "appliances-small": "cat-appliances-small",
  climate: "cat-climate",
  ebikes: "cat-ebikes",
  scooters: "cat-scooters",
  drones: "cat-drones",
  gaming: "cat-gaming",
  networking: "cat-networking",
  storage: "cat-storage",
  peripherals: "cat-peripherals",
  other: "cat-other",
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
                text: "Analiza esta imagen y extrae toda la información del producto:",
              },
              imageContent,
            ],
          },
        ],
        max_tokens: 400,
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
          
          // Si la descripción es genérica, buscar el producto real
          const hasRefCodes = (p.refCodes && p.refCodes.length > 0) || (model && /^\d{5,}$|^\d+-\d+$/.test(model));
          if (isGenericDescription(brand, model, p.lineDescription || "") && hasRefCodes) {
            console.log(`Buscando producto por referencias: ${(p.refCodes || []).join(", ")} + modelo: ${model}`);
            const searchResult = await searchProductByRef(
              p.refCodes || [],
              p.lineDescription || "",
              extractedData.purchaseStore || "",
              model
            );
            
            if (searchResult) {
              brand = searchResult.brand || brand;
              model = searchResult.model || model;
              variant = searchResult.variant || variant;
              category = searchResult.category || category;
              console.log(`Producto identificado: ${brand} ${model}`);
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
        return NextResponse.json({
          success: true,
          multipleProducts: true,
          products: enrichedProducts,
          // Datos comunes de la factura
          purchaseDate: extractedData.purchaseDate || "",
          purchaseStore: extractedData.purchaseStore || "",
          warrantyYears: extractedData.warrantyYears,
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
      
      if (isGenericDescription(brand, model, rawDesc) && hasRefCodes) {
        console.log(`Buscando producto por referencias: ${refCodes.join(", ")} + modelo: ${model}`);
        const searchResult = await searchProductByRef(
          refCodes,
          rawDesc,
          extractedData.purchaseStore || "",
          model
        );
        
        if (searchResult) {
          extractedData.brand = searchResult.brand || extractedData.brand;
          extractedData.model = searchResult.model || extractedData.model;
          extractedData.variant = searchResult.variant || extractedData.variant;
          extractedData.category = searchResult.category || extractedData.category;
          console.log(`Producto identificado: ${extractedData.brand} ${extractedData.model}`);
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
      } catch (error) {
        console.warn("Error calculating warranty:", error);
      }
    } else if (extractedData.purchaseDate && extractedData.warrantyYears) {
      // Fallback: si no tenemos categoría pero sí años de garantía de la factura
      try {
        const date = new Date(extractedData.purchaseDate);
        if (!isNaN(date.getTime())) {
          const endDate = new Date(date);
          endDate.setFullYear(endDate.getFullYear() + Number(extractedData.warrantyYears));
          if (!isNaN(endDate.getTime())) {
            warrantyEndDate = endDate.toISOString().split("T")[0];
            warrantyYears = Number(extractedData.warrantyYears);
            warrantyType = "manufacturer";
          }
        }
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
