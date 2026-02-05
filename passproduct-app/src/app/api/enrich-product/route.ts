import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tipos para resultados de búsqueda
type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

// Función para buscar con Serper (Google)
async function searchWithSerper(query: string): Promise<SearchResult[]> {
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) return [];

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "es",
        hl: "es",
        num: 5,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return (data.organic || []).map((r: { title: string; link: string; snippet: string }) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));
    }
  } catch (error) {
    console.error("Error en búsqueda Serper:", error);
  }
  return [];
}

// Buscar imágenes del producto (para wallet cuando no hay foto real)
async function searchProductImages(brand: string, model: string, variant?: string): Promise<string[]> {
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) return [];

  const query = [brand, model, variant].filter(Boolean).join(" ");
  console.log(`🖼️ Buscando imágenes: ${query}`);

  try {
    const response = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": serperKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, gl: "es", hl: "es", num: 5 }),
    });

    if (response.ok) {
      const data = await response.json();
      const images = (data.images || [])
        .filter((img: { imageUrl: string }) => {
          const url = img.imageUrl.toLowerCase();
          return !url.includes("icon") && !url.includes("logo") && !url.includes("favicon") &&
                 (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".webp") ||
                  url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png") || url.includes(".webp"));
        })
        .slice(0, 3)
        .map((img: { imageUrl: string }) => img.imageUrl);

      if (images.length > 0) {
        console.log(`✅ Encontradas ${images.length} imágenes`);
        return images;
      }
    }
  } catch (error) {
    console.error("Error buscando imágenes:", error);
  }
  return [];
}

// Mapeo de marcas a sus dominios oficiales
const BRAND_DOMAINS: Record<string, string[]> = {
  // Marcas Decathlon
  quechua: ["decathlon.es", "decathlon.com", "quechua.com"],
  forclaz: ["decathlon.es", "decathlon.com"],
  evadict: ["decathlon.es", "decathlon.com"],
  kalenji: ["decathlon.es", "decathlon.com"],
  domyos: ["decathlon.es", "decathlon.com"],
  btwin: ["decathlon.es", "decathlon.com"],
  tribord: ["decathlon.es", "decathlon.com"],
  kipsta: ["decathlon.es", "decathlon.com"],
  // Tecnología
  apple: ["apple.com", "support.apple.com"],
  samsung: ["samsung.com"],
  sony: ["sony.es", "sony.com"],
  lg: ["lg.com"],
  xiaomi: ["mi.com", "xiaomi.com"],
  huawei: ["consumer.huawei.com", "huawei.com"],
  // Electrodomésticos
  dyson: ["dyson.es", "dyson.com"],
  philips: ["philips.es", "philips.com"],
  bosch: ["bosch-home.es", "bosch.com"],
  siemens: ["siemens-home.bsh-group.com"],
  miele: ["miele.es", "miele.com"],
  // Deportes
  nike: ["nike.com"],
  adidas: ["adidas.es", "adidas.com"],
  salomon: ["salomon.com"],
  // Genéricos de confianza
  _trusted: ["support.", "manual.", "docs.", "help.", "download."],
};

// Verificar si un dominio es válido para una marca
function isValidDomainForBrand(url: string, brand: string): boolean {
  const lowerBrand = brand.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Obtener dominios oficiales de la marca
  const officialDomains = BRAND_DOMAINS[lowerBrand] || [];

  // Verificar si el URL es de un dominio oficial de la marca
  for (const domain of officialDomains) {
    if (lowerUrl.includes(domain)) {
      return true;
    }
  }

  // Verificar si contiene el nombre de la marca en el dominio
  if (lowerUrl.includes(lowerBrand + ".")) {
    return true;
  }

  // Verificar subdominios de confianza (support.*, manual.*, etc.)
  for (const trusted of BRAND_DOMAINS._trusted) {
    if (lowerUrl.includes(trusted) && lowerUrl.includes(lowerBrand)) {
      return true;
    }
  }

  return false;
}

// Buscar URL del manual de usuario
async function searchManualUrl(brand: string, model: string): Promise<string | null> {
  console.log(`🔍 Buscando manual: ${brand} ${model}`);

  // Determinar dominio de búsqueda
  const lowerBrand = brand.toLowerCase();
  const officialDomains = BRAND_DOMAINS[lowerBrand];
  const siteDomain = officialDomains?.[0] || `${lowerBrand}.com`;

  const results = await searchWithSerper(`${brand} ${model} manual usuario PDF site:${siteDomain}`);

  // Buscar resultado que parezca un manual Y sea de dominio válido
  for (const result of results) {
    const lowerTitle = result.title.toLowerCase();
    const lowerLink = result.link.toLowerCase();

    // Verificar que el dominio sea válido para la marca
    if (!isValidDomainForBrand(result.link, brand)) {
      console.log(`⚠️ Dominio no válido para ${brand}: ${result.link}`);
      continue;
    }

    if (
      lowerTitle.includes("manual") ||
      lowerTitle.includes("instrucciones") ||
      lowerTitle.includes("user guide") ||
      lowerLink.includes("manual") ||
      lowerLink.includes(".pdf") ||
      lowerLink.includes("support") ||
      lowerLink.includes("download")
    ) {
      console.log(`✅ Manual encontrado (dominio verificado): ${result.link}`);
      return result.link;
    }
  }

  // Segunda búsqueda más general pero con validación de dominio
  const results2 = await searchWithSerper(`"${brand}" "${model}" manual PDF`);
  for (const result of results2) {
    // Verificar dominio válido
    if (!isValidDomainForBrand(result.link, brand)) {
      continue;
    }

    if (result.link.includes(".pdf") || result.title.toLowerCase().includes("manual")) {
      console.log(`✅ Manual encontrado (2da búsqueda, dominio verificado): ${result.link}`);
      return result.link;
    }
  }

  console.log("❌ Manual no encontrado en dominios oficiales");
  return null;
}

// Buscar página de soporte/garantía
async function searchSupportUrl(brand: string, model: string): Promise<{ url: string | null; phone: string | null }> {
  console.log(`🔍 Buscando soporte: ${brand} ${model}`);
  
  const results = await searchWithSerper(`${brand} soporte técnico garantía España contacto`);
  
  let supportUrl: string | null = null;
  let phone: string | null = null;

  for (const result of results) {
    const lowerTitle = result.title.toLowerCase();
    const lowerLink = result.link.toLowerCase();
    
    // Buscar página de soporte
    if (
      !supportUrl &&
      (lowerTitle.includes("soporte") ||
       lowerTitle.includes("support") ||
       lowerTitle.includes("contacto") ||
       lowerTitle.includes("garantía") ||
       lowerTitle.includes("atención al cliente") ||
       lowerLink.includes("support") ||
       lowerLink.includes("contact") ||
       lowerLink.includes("help"))
    ) {
      // Preferir dominios oficiales de la marca
      if (lowerLink.includes(brand.toLowerCase()) || !supportUrl) {
        supportUrl = result.link;
        console.log(`✅ Soporte encontrado: ${result.link}`);
      }
    }

    // Buscar teléfono en snippets
    if (!phone) {
      const phoneMatch = result.snippet.match(/(\d{3}[\s.-]?\d{3}[\s.-]?\d{3}|\d{9}|900\s?\d{6})/);
      if (phoneMatch) {
        phone = phoneMatch[0].replace(/[\s.-]/g, "");
        if (phone.length === 9) {
          phone = phone.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
        }
        console.log(`✅ Teléfono encontrado: ${phone}`);
      }
    }
  }

  return { url: supportUrl, phone };
}

// Función para buscar información general del producto
async function searchProductInfo(productName: string): Promise<string | null> {
  try {
    // Usar Serper si está configurado
    const serperKey = process.env.SERPER_API_KEY;
    if (serperKey) {
      const results = await searchWithSerper(`${productName} especificaciones características`);
      if (results.length > 0) {
        return results.map(r => `${r.title}: ${r.snippet}`).join("\n");
      }
    }

    // Fallback: Tavily
    if (process.env.TAVILY_API_KEY) {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `${productName} especificaciones técnicas`,
          search_depth: "basic",
          max_results: 3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let webInfo = data.answer || "";
        if (data.results?.length > 0) {
          webInfo += "\n" + data.results.slice(0, 3).map((r: { title: string; content: string }) => 
            `${r.title}: ${r.content}`
          ).join("\n");
        }
        return webInfo;
      }
    }

    return null;
  } catch (error) {
    console.error("Error searching web:", error);
    return null;
  }
}

// Prompt optimizado para mínimo uso de tokens
const SYSTEM_PROMPT = `Experto en productos de consumo. Responde JSON compacto para producto dado.

FORMATO (sin campos vacíos, valores cortos):
{"accessories":[{"name":"str","typical":bool}],"manualUrl":"url","resaleValue":{"percentage":num,"minPrice":num,"maxPrice":num,"marketTrend":"stable|rising|falling"},"warrantyContact":{"phone":"str","url":"url","hours":"str"},"specs":[{"label":"str","value":"str"}]}

REGLAS CRÍTICAS:
- IMPORTANTE: Usa la variante/talla para identificar el tipo EXACTO de producto
  - Tallas numéricas (36-50): CALZADO (botas, zapatillas)
  - Tallas letra (XS, S, M, L, XL): ROPA (chaquetas, camisetas)
  - Ejemplo: "SH500 X-WARM M BLACK 39" = BOTAS talla 39, NO chaqueta
- accessories: máx 4, solo incluidos de serie (typical:true)
  - CALZADO: cordones, plantillas, bolsa transporte (NO capucha, NO puños)
  - ROPA: capucha, puños, bolsillos, cordón ajuste
- specs: máx 4, valores breves (<30 chars)
  - CALZADO: impermeabilidad, suela, aislamiento, peso
  - ROPA: tejido, capas, transpirabilidad
- warrantyContact: solo España, omitir email
- Si no conoces el producto, specs:[]
- NO inventar, mejor omitir
- Si hay INFO WEB, úsala como fuente

Solo JSON, sin markdown.`;

async function enrichWithAI(
  productDescription: string,
  priceContext: string,
  webContext: string = "",
  categoryId: string = ""
): Promise<Record<string, unknown>> {
  // Añadir contexto de categoría si está disponible
  const categoryContext = categoryId ? ` [Categoría: ${categoryId.replace("cat-", "")}]` : "";

  // Prompt de usuario compacto con contexto de categoría
  const userPrompt = webContext
    ? `${productDescription}${categoryContext}${priceContext}\nINFO WEB:${webContext.substring(0, 500)}`
    : `${productDescription}${categoryContext}${priceContext}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // Más rápido y estable
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 600,
    temperature: 0.2,
  });

  const responseText = completion.choices[0]?.message?.content?.trim() || "";
  const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
  
  // Intentar parsear, si falla intentar arreglar JSON truncado
  try {
    return JSON.parse(cleanJson);
  } catch {
    // Intentar cerrar el JSON si está truncado
    let fixedJson = cleanJson;
    
    // Contar llaves y corchetes abiertos
    const openBraces = (fixedJson.match(/{/g) || []).length;
    const closeBraces = (fixedJson.match(/}/g) || []).length;
    const openBrackets = (fixedJson.match(/\[/g) || []).length;
    const closeBrackets = (fixedJson.match(/]/g) || []).length;
    
    // Cerrar arrays y objetos pendientes
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixedJson += "]";
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixedJson += "}";
    }
    
    try {
      return JSON.parse(fixedJson);
    } catch {
      console.error("Could not parse or fix JSON:", cleanJson.substring(0, 200));
      return { specs: [], accessories: [] };
    }
  }
}

export async function POST(request: Request) {
  try {
    const { brand, model, variant, categoryId, purchasePrice, needsImages } = await request.json();

    if (!brand || !model) {
      return NextResponse.json(
        { error: "Se requiere marca y modelo" },
        { status: 400 }
      );
    }

    const productDescription = [brand, model, variant].filter(Boolean).join(" ");
    const priceContext = purchasePrice ? ` (${purchasePrice}€)` : "";

    console.log(`\n📦 Enriqueciendo producto: ${productDescription} (needsImages: ${needsImages})`);

    // Ejecutar búsquedas en paralelo para mayor velocidad
    const [manualUrlResult, supportResult, webInfoResult, stockImages] = await Promise.all([
      // Buscar URL del manual
      searchManualUrl(brand, model),
      // Buscar página de soporte
      searchSupportUrl(brand, model),
      // Buscar información general del producto
      searchProductInfo(productDescription),
      // Buscar imágenes solo si se necesitan (usuario no subió foto)
      needsImages ? searchProductImages(brand, model, variant) : Promise.resolve([]),
    ]);

    // Enriquecer con IA (specs, accesorios, valor reventa)
    let enrichedData;
    try {
      enrichedData = await enrichWithAI(
        productDescription,
        priceContext,
        webInfoResult || "",
        categoryId || ""
      );
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      enrichedData = { specs: [], accessories: [] };
    }

    // Combinar datos de IA con URLs reales de búsqueda web
    const warrantyContact = {
      ...(enrichedData.warrantyContact || {}),
      // Sobrescribir con datos reales de búsqueda
      url: supportResult.url || (enrichedData.warrantyContact as { url?: string })?.url || null,
      phone: supportResult.phone || (enrichedData.warrantyContact as { phone?: string })?.phone || null,
    };

    // Limpiar warrantyContact si está vacío
    const hasWarrantyContact = warrantyContact.url || warrantyContact.phone || 
      (warrantyContact as { email?: string }).email || (warrantyContact as { hours?: string }).hours;

    console.log(`✅ Enriquecimiento completado para ${brand} ${model}\n`);

    return NextResponse.json({
      success: true,
      data: {
        accessories: enrichedData.accessories || [],
        // Usar URL real de búsqueda, con fallback a la sugerida por IA
        manualUrl: manualUrlResult || enrichedData.manualUrl || null,
        resaleValue: enrichedData.resaleValue || null,
        warrantyContact: hasWarrantyContact ? warrantyContact : null,
        specs: enrichedData.specs || [],
        // Imágenes de stock (solo para visualización, NO para venta)
        stockImages: stockImages.length > 0 ? stockImages : null,
      },
    });
  } catch (error) {
    console.error("Error enriching product:", error);
    return NextResponse.json(
      { error: "Error al enriquecer el producto" },
      { status: 500 }
    );
  }
}
