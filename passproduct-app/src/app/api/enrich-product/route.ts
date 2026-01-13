import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para buscar información actualizada en la web
async function searchProductInfo(productName: string): Promise<string | null> {
  try {
    // Usar Tavily API si está configurada
    if (process.env.TAVILY_API_KEY) {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `${productName} especificaciones técnicas características oficiales`,
          search_depth: "advanced",
          include_answer: true,
          max_results: 5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Combinar la respuesta con los resultados
        let webInfo = data.answer || "";
        if (data.results && data.results.length > 0) {
          webInfo += "\n\nFuentes:\n";
          for (const result of data.results.slice(0, 3)) {
            webInfo += `- ${result.title}: ${result.content}\n`;
          }
        }
        return webInfo;
      }
    }

    // Fallback: usar DuckDuckGo Instant Answer API (gratis, sin API key)
    const ddgResponse = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(productName + " specs")}&format=json&no_html=1`
    );
    
    if (ddgResponse.ok) {
      const ddgData = await ddgResponse.json();
      if (ddgData.Abstract) {
        return ddgData.Abstract;
      }
    }

    return null;
  } catch (error) {
    console.error("Error searching web:", error);
    return null;
  }
}

// Prompt optimizado para mínimo uso de tokens
const SYSTEM_PROMPT = `Experto en electrónica. Responde JSON compacto para producto dado.

FORMATO (sin campos vacíos, valores cortos):
{"accessories":[{"name":"str","typical":bool}],"manualUrl":"url","resaleValue":{"percentage":num,"minPrice":num,"maxPrice":num,"marketTrend":"stable|rising|falling"},"warrantyContact":{"phone":"str","url":"url","hours":"str"},"specs":[{"label":"str","value":"str"}]}

REGLAS:
- accessories: máx 4, solo incluidos de serie (typical:true)
- specs: máx 4, valores breves (<30 chars)
- warrantyContact: solo España, omitir email
- Si no conoces el producto, specs:[]
- NO inventar, mejor omitir
- Si hay INFO WEB, úsala como fuente

Solo JSON, sin markdown.`;

async function enrichWithAI(
  productDescription: string,
  priceContext: string,
  webContext: string = ""
): Promise<Record<string, unknown>> {
  // Prompt de usuario compacto
  const userPrompt = webContext 
    ? `${productDescription}${priceContext}\nINFO WEB:${webContext.substring(0, 500)}`
    : `${productDescription}${priceContext}`;

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
    const { brand, model, variant, categoryId, purchasePrice } = await request.json();

    if (!brand || !model) {
      return NextResponse.json(
        { error: "Se requiere marca y modelo" },
        { status: 400 }
      );
    }

    const productDescription = [brand, model, variant].filter(Boolean).join(" ");
    const priceContext = purchasePrice ? ` (${purchasePrice}€)` : "";

    // Primer intento: IA con conocimiento interno
    let enrichedData;
    try {
      enrichedData = await enrichWithAI(productDescription, priceContext);
    } catch (parseError) {
      console.error("Error parsing initial AI response:", parseError);
      enrichedData = { specs: [] };
    }

    // Si la IA no conoce el producto (specs vacío), buscar en la web
    const specsEmpty = !enrichedData.specs || (enrichedData.specs as unknown[]).length === 0;

    if (specsEmpty) {
      console.log(`Producto no reconocido: ${productDescription}. Buscando en web...`);
      const webInfo = await searchProductInfo(productDescription);
      
      if (webInfo) {
        try {
          enrichedData = await enrichWithAI(productDescription, priceContext, webInfo);
        } catch (retryError) {
          console.error("Error con web context:", retryError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        accessories: enrichedData.accessories || [],
        manualUrl: enrichedData.manualUrl || null,
        resaleValue: enrichedData.resaleValue || null,
        warrantyContact: enrichedData.warrantyContact || null,
        specs: enrichedData.specs || [],
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
