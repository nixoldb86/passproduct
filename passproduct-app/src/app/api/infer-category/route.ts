import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Categorías disponibles en PassProduct
const CATEGORIES = [
  { id: "cat-smartphones", name: "Smartphones", keywords: ["iphone", "galaxy", "pixel", "xiaomi", "oneplus", "móvil", "teléfono"] },
  { id: "cat-tablets", name: "Tablets", keywords: ["ipad", "tab", "tablet", "surface"] },
  { id: "cat-laptops", name: "Portátiles", keywords: ["macbook", "laptop", "portátil", "notebook", "thinkpad", "xps", "zenbook"] },
  { id: "cat-consoles", name: "Consolas", keywords: ["playstation", "xbox", "nintendo", "switch", "ps5", "ps4", "consola"] },
  { id: "cat-audio", name: "Audio", keywords: ["airpods", "auriculares", "headphones", "altavoz", "speaker", "soundbar", "buds"] },
  { id: "cat-wearables", name: "Wearables", keywords: ["watch", "reloj", "smartwatch", "fitbit", "garmin", "band", "pulsera"] },
];

const SYSTEM_PROMPT = `Eres un clasificador de productos de electrónica de consumo. Tu trabajo es determinar la categoría correcta basándote en la información del producto.

Categorías disponibles:
- Smartphones: teléfonos móviles (iPhone, Samsung Galaxy, Pixel, etc.)
- Tablets: tablets y e-readers (iPad, Galaxy Tab, Surface Go, etc.)
- Portátiles: ordenadores portátiles (MacBook, ThinkPad, XPS, etc.)
- Consolas: consolas de videojuegos (PlayStation, Xbox, Nintendo Switch, etc.)
- Audio: auriculares, altavoces, soundbars (AirPods, Sony WH-1000XM, etc.)
- Wearables: smartwatches y pulseras fitness (Apple Watch, Galaxy Watch, Fitbit, etc.)

IMPORTANTE:
- Responde SOLO con el ID de la categoría, nada más.
- Si no puedes determinar la categoría con confianza, responde "unknown".
- Los IDs válidos son: cat-smartphones, cat-tablets, cat-laptops, cat-consoles, cat-audio, cat-wearables`;

export async function POST(request: Request) {
  try {
    const { brand, model, variant } = await request.json();

    if (!brand && !model) {
      return NextResponse.json(
        { error: "Se requiere al menos marca o modelo" },
        { status: 400 }
      );
    }

    // Construir la descripción del producto
    const productDescription = [brand, model, variant].filter(Boolean).join(" ");

    // Primero intentar con keywords locales (más rápido y gratis)
    const lowerDesc = productDescription.toLowerCase();
    for (const cat of CATEGORIES) {
      if (cat.keywords.some(keyword => lowerDesc.includes(keyword))) {
        return NextResponse.json({ 
          categoryId: cat.id, 
          categoryName: cat.name,
          confidence: "high",
          method: "keywords"
        });
      }
    }

    // Si no hay match por keywords, usar GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Producto: ${productDescription}` },
      ],
      temperature: 0,
      max_tokens: 20,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "unknown";
    
    // Validar que la respuesta sea una categoría válida
    const matchedCategory = CATEGORIES.find(cat => cat.id === response);
    
    if (matchedCategory) {
      return NextResponse.json({
        categoryId: matchedCategory.id,
        categoryName: matchedCategory.name,
        confidence: "medium",
        method: "ai"
      });
    }

    return NextResponse.json({
      categoryId: null,
      categoryName: null,
      confidence: "low",
      method: "ai"
    });

  } catch (error) {
    console.error("Error inferring category:", error);
    return NextResponse.json(
      { error: "Error al inferir categoría" },
      { status: 500 }
    );
  }
}
