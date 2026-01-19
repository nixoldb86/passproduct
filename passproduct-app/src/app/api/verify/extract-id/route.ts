import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres un experto en lectura de documentos de identidad españoles y europeos.
Analiza la imagen del documento de identidad y extrae los siguientes datos.

IMPORTANTE:
- Extrae SOLO los datos que puedas leer claramente de la imagen
- Para campos que no puedas leer, devuelve null
- El número de documento es CRÍTICO - asegúrate de leerlo correctamente
- DNI español: 8 dígitos + 1 letra (ej: 12345678A)
- NIE español: X/Y/Z + 7 dígitos + 1 letra (ej: X1234567A)
- Fechas en formato DD/MM/YYYY

Responde SOLO con JSON válido, sin markdown ni explicaciones:
{
  "documentType": "DNI" | "NIE" | "PASSPORT" | "ID_CARD" | "UNKNOWN",
  "documentNumber": "string o null",
  "firstName": "string o null",
  "lastName": "string o null", 
  "dateOfBirth": "DD/MM/YYYY o null",
  "expirationDate": "DD/MM/YYYY o null",
  "nationality": "código ISO 3 letras o null",
  "sex": "M" | "F" | null,
  "confidence": "high" | "medium" | "low",
  "readableFields": ["lista de campos que pudiste leer claramente"]
}`;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó imagen" },
        { status: 400 }
      );
    }

    // Verificar que la imagen sea base64 válida
    const isBase64 = image.startsWith("data:image/");
    if (!isBase64) {
      return NextResponse.json(
        { success: false, error: "Formato de imagen inválido" },
        { status: 400 }
      );
    }

    console.log("Enviando imagen a OpenAI para extracción de ID...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extrae los datos de este documento de identidad español/europeo:",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high", // Alta resolución para mejor lectura
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0, // Determinístico para mayor precisión
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: "No se obtuvo respuesta de OpenAI" },
        { status: 500 }
      );
    }

    console.log("Respuesta de OpenAI:", content);

    // Parsear JSON de la respuesta
    let extractedData;
    try {
      // Limpiar posibles marcadores de markdown
      const cleanJson = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Error parseando respuesta de OpenAI:", content);
      return NextResponse.json(
        { success: false, error: "Error procesando respuesta", rawResponse: content },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        documentType: extractedData.documentType || "UNKNOWN",
        documentNumber: extractedData.documentNumber || "",
        firstName: extractedData.firstName || "",
        lastName: extractedData.lastName || "",
        dateOfBirth: extractedData.dateOfBirth || "",
        expirationDate: extractedData.expirationDate || "",
        nationality: extractedData.nationality || "ESP",
        sex: extractedData.sex || "",
        confidence: extractedData.confidence || "low",
        readableFields: extractedData.readableFields || [],
      },
    });
  } catch (error) {
    console.error("Error en extract-id:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
