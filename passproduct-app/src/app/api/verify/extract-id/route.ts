import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// SISTEMA OCR PAN-EUROPEO PARA DOCUMENTOS ID
// Soporta: DNI, NIE, Pasaportes y Tarjetas ID
// de todos los países de la Unión Europea
// ============================================

const SYSTEM_PROMPT = `Eres un experto en lectura de documentos de identidad de la UNIÓN EUROPEA.
Tu tarea es extraer datos de CUALQUIER documento de identidad europeo con máxima precisión.

## TIPOS DE DOCUMENTOS SOPORTADOS

### TARJETAS DE IDENTIDAD NACIONALES (ID Cards)
| País | Nombre documento | Formato número |
|------|------------------|----------------|
| España | DNI | 8 dígitos + 1 letra (12345678A) |
| España | NIE | X/Y/Z + 7 dígitos + letra (X1234567A) |
| Alemania | Personalausweis | 9 caracteres alfanuméricos (L01X00T47) |
| Francia | Carte Nationale d'Identité | 12 dígitos (010203045678) |
| Italia | Carta d'Identità Elettronica | 2 letras + 5 dígitos + 2 letras (CA12345AB) |
| Portugal | Cartão de Cidadão | 8 dígitos (12345678) |
| Países Bajos | Identiteitskaart | 9 caracteres (SPECI2014) |
| Bélgica | Carte d'identité / Identiteitskaart | 12 dígitos |
| Austria | Personalausweis | 7-8 dígitos |
| Polonia | Dowód osobisty | 3 letras + 6 dígitos (ABC123456) |
| Grecia | Δελτίο Ταυτότητας | 2 letras + 6 dígitos |
| Suecia | Nationellt ID-kort | 8 dígitos |
| Irlanda | Passport Card / Public Services Card | Variable |
| Rumanía | Carte de Identitate | 2 letras + 6 dígitos |
| Hungría | Személyi igazolvány | 6 dígitos + 2 letras |
| Chequia | Občanský průkaz | 9 dígitos |
| Finlandia | Henkilökortti | Variable |
| Dinamarca | Kørekort / ID-kort | Variable |

### PASAPORTES (Todos siguen formato ICAO 9303)
- Todos los pasaportes europeos tienen MRZ de 2 líneas de 44 caracteres

## ZONA MRZ (Machine Readable Zone) - CRÍTICO

La MRZ está en la parte inferior del documento y es LA FUENTE MÁS FIABLE.
Sigue el estándar ICAO 9303:

### Para Tarjetas ID (TD1 - 3 líneas de 30 caracteres):
Línea 1: TIPO<PAÍS<NÚMERO_DOCUMENTO<<<<<<<<CHECK
Línea 2: FECHA_NAC<CHECK<SEXO<FECHA_EXP<CHECK<NACIONALIDAD<<<<CHECK
Línea 3: APELLIDOS<<NOMBRES<<<<<<<<<<<<<<<

### Para Pasaportes (TD3 - 2 líneas de 44 caracteres):
Línea 1: P<PAÍS<APELLIDOS<<NOMBRES<<<<<<<<<<<<<<<<<<<<
Línea 2: NÚMERO<<<<<<<<<CHECK<NACIONALIDAD<FECHA_NAC<CHECK<SEXO<FECHA_EXP<CHECK<<<<<<<<<<<CHECK

### Caracteres especiales MRZ:
- "<" = separador/relleno
- Fechas: AAMMDD (año 2 dígitos, mes, día)
- Sexo: M (masculino), F (femenino), X (no especificado)

## INSTRUCCIONES DE EXTRACCIÓN

1. **PRIORIZA LA MRZ** si es visible - es la fuente más precisa
2. Si no hay MRZ clara, lee los campos visuales del documento
3. Detecta el PAÍS por:
   - Bandera visible
   - Texto del documento (RÉPUBLIQUE FRANÇAISE, BUNDESREPUBLIK DEUTSCHLAND, etc.)
   - Formato del número de documento
   - Idioma de las etiquetas
4. NUNCA inventes datos - devuelve null si no puedes leer un campo
5. Para fechas MRZ: convierte AAMMDD a DD/MM/YYYY

## ETIQUETAS POR IDIOMA (para campos visuales)

| Campo | ES | DE | FR | IT | PT | NL |
|-------|----|----|----|----|----|----|
| Apellidos | APELLIDOS | NAME/NACHNAME | NOM | COGNOME | APELIDOS | NAAM |
| Nombre | NOMBRE | VORNAME | PRÉNOM | NOME | NOME | VOORNAMEN |
| Fecha nac. | F. NACIMIENTO | GEBURTSTAG | DATE DE NAISSANCE | DATA DI NASCITA | DATA NASCIMENTO | GEBOORTEDATUM |
| Sexo | SEXO | GESCHLECHT | SEXE | SESSO | SEXO | GESLACHT |
| Nacionalidad | NACIONALIDAD | STAATSANGEHÖRIGKEIT | NATIONALITÉ | CITTADINANZA | NACIONALIDADE | NATIONALITEIT |
| Validez | VALIDEZ | GÜLTIG BIS | DATE D'EXPIRATION | SCADENZA | VALIDADE | GELDIG TOT |

## RESPUESTA

Responde ÚNICAMENTE con JSON válido (sin markdown, sin explicaciones):
{
  "documentType": "DNI" | "NIE" | "PASSPORT" | "ID_CARD" | "RESIDENCE_PERMIT" | "DRIVING_LICENSE" | "UNKNOWN",
  "documentNumber": "string o null",
  "firstName": "string o null",
  "lastName": "string o null",
  "dateOfBirth": "DD/MM/YYYY o null",
  "expirationDate": "DD/MM/YYYY o null",
  "nationality": "código ISO 3 letras (ESP, DEU, FRA, ITA, PRT, NLD, BEL, AUT, POL, GRC, SWE, IRL, ROU, HUN, CZE, FIN, DNK...) o null",
  "countryOfIssue": "código ISO 3 letras del país emisor o null",
  "sex": "M" | "F" | "X" | null,
  "placeOfBirth": "string o null",
  "address": "string o null (si aparece en el documento)",
  "mrz": {
    "found": true | false,
    "line1": "string o null",
    "line2": "string o null", 
    "line3": "string o null (solo TD1)",
    "checksumValid": true | false | null
  },
  "confidence": "high" | "medium" | "low",
  "readableFields": ["lista de campos leídos claramente"],
  "documentLanguage": "es" | "de" | "fr" | "it" | "pt" | "nl" | "pl" | "el" | "sv" | "fi" | "da" | "hu" | "cs" | "ro" | "other",
  "warnings": ["lista de advertencias si las hay"]
}`;

// Validación de checksum MRZ (estándar ICAO 9303)
function validateMRZChecksum(data: string, checkDigit: string): boolean {
  const weights = [7, 3, 1];
  const charValue = (char: string): number => {
    if (char >= "0" && char <= "9") return parseInt(char);
    if (char >= "A" && char <= "Z") return char.charCodeAt(0) - 55;
    if (char === "<") return 0;
    return 0;
  };

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += charValue(data[i]) * weights[i % 3];
  }

  const calculatedCheck = (sum % 10).toString();
  return calculatedCheck === checkDigit;
}

// Validar checksums de MRZ completa
function validateFullMRZ(mrz: { line1?: string; line2?: string; line3?: string }): {
  valid: boolean;
  details: string[];
} {
  const details: string[] = [];
  let allValid = true;

  // TD1 format (ID cards) - 3 lines of 30 chars
  if (mrz.line3 && mrz.line1?.length === 30) {
    // Line 1: Document number check (positions 5-14, check at 15)
    const docNum = mrz.line1.substring(5, 14);
    const docCheck = mrz.line1.substring(14, 15);
    if (!validateMRZChecksum(docNum, docCheck)) {
      details.push("Document number checksum invalid");
      allValid = false;
    }

    // Line 2: Birth date (0-6), check at 6; Expiry (8-14), check at 14
    if (mrz.line2 && mrz.line2.length === 30) {
      const birthDate = mrz.line2.substring(0, 6);
      const birthCheck = mrz.line2.substring(6, 7);
      if (!validateMRZChecksum(birthDate, birthCheck)) {
        details.push("Birth date checksum invalid");
        allValid = false;
      }

      const expiryDate = mrz.line2.substring(8, 14);
      const expiryCheck = mrz.line2.substring(14, 15);
      if (!validateMRZChecksum(expiryDate, expiryCheck)) {
        details.push("Expiry date checksum invalid");
        allValid = false;
      }
    }
  }

  // TD3 format (Passports) - 2 lines of 44 chars
  if (!mrz.line3 && mrz.line1?.length === 44 && mrz.line2?.length === 44) {
    // Line 2: Doc number (0-9), check at 9; Birth (13-19), check at 19; Expiry (21-27), check at 27
    const docNum = mrz.line2.substring(0, 9);
    const docCheck = mrz.line2.substring(9, 10);
    if (!validateMRZChecksum(docNum, docCheck)) {
      details.push("Document number checksum invalid");
      allValid = false;
    }

    const birthDate = mrz.line2.substring(13, 19);
    const birthCheck = mrz.line2.substring(19, 20);
    if (!validateMRZChecksum(birthDate, birthCheck)) {
      details.push("Birth date checksum invalid");
      allValid = false;
    }

    const expiryDate = mrz.line2.substring(21, 27);
    const expiryCheck = mrz.line2.substring(27, 28);
    if (!validateMRZChecksum(expiryDate, expiryCheck)) {
      details.push("Expiry date checksum invalid");
      allValid = false;
    }
  }

  if (details.length === 0) {
    details.push("All checksums valid");
  }

  return { valid: allValid, details };
}

// Convertir fecha MRZ (YYMMDD) a DD/MM/YYYY
function convertMRZDate(mrzDate: string): string | null {
  if (!mrzDate || mrzDate.length !== 6) return null;

  const yy = parseInt(mrzDate.substring(0, 2));
  const mm = mrzDate.substring(2, 4);
  const dd = mrzDate.substring(4, 6);

  // Determinar siglo: si YY > 30, asumimos 1900s, sino 2000s
  const year = yy > 30 ? 1900 + yy : 2000 + yy;

  return `${dd}/${mm}/${year}`;
}

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

    console.log("🇪🇺 Enviando imagen a OpenAI para extracción de ID europeo...");

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
              text: "Analiza este documento de identidad europeo. Extrae todos los datos visibles, priorizando la zona MRZ si está presente:",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No se obtuvo respuesta de OpenAI" },
        { status: 500 }
      );
    }

    console.log("📄 Respuesta de OpenAI:", content);

    // Parsear JSON de la respuesta
    let extractedData;
    try {
      const cleanJson = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      extractedData = JSON.parse(cleanJson);
    } catch {
      console.error("Error parseando respuesta de OpenAI:", content);
      return NextResponse.json(
        {
          success: false,
          error: "Error procesando respuesta",
          rawResponse: content,
        },
        { status: 500 }
      );
    }

    // Validar checksums de MRZ si están presentes
    let mrzValidation = { valid: false, details: ["MRZ not found"] };
    if (extractedData.mrz?.found) {
      mrzValidation = validateFullMRZ({
        line1: extractedData.mrz.line1,
        line2: extractedData.mrz.line2,
        line3: extractedData.mrz.line3,
      });
      extractedData.mrz.checksumValid = mrzValidation.valid;
      console.log("🔐 MRZ Checksum validation:", mrzValidation);
    }

    // Determinar confianza basada en múltiples factores
    let confidence = extractedData.confidence || "low";
    if (extractedData.mrz?.found && mrzValidation.valid) {
      confidence = "high";
    } else if (extractedData.mrz?.found) {
      confidence = "medium";
    }

    // Construir respuesta enriquecida
    const result = {
      success: true,
      data: {
        // Datos básicos
        documentType: extractedData.documentType || "UNKNOWN",
        documentNumber: extractedData.documentNumber || "",
        firstName: extractedData.firstName || "",
        lastName: extractedData.lastName || "",
        dateOfBirth: extractedData.dateOfBirth || "",
        expirationDate: extractedData.expirationDate || "",
        
        // Datos geográficos
        nationality: extractedData.nationality || null,
        countryOfIssue: extractedData.countryOfIssue || extractedData.nationality || null,
        placeOfBirth: extractedData.placeOfBirth || null,
        address: extractedData.address || null,
        
        // Datos personales
        sex: extractedData.sex || "",
        
        // Metadatos MRZ
        mrz: extractedData.mrz?.found
          ? {
              found: true,
              line1: extractedData.mrz.line1 || null,
              line2: extractedData.mrz.line2 || null,
              line3: extractedData.mrz.line3 || null,
              checksumValid: mrzValidation.valid,
              checksumDetails: mrzValidation.details,
            }
          : { found: false },
        
        // Metadatos de calidad
        confidence,
        documentLanguage: extractedData.documentLanguage || "other",
        readableFields: extractedData.readableFields || [],
        warnings: extractedData.warnings || [],
      },
    };

    console.log("✅ Extracción completada:", {
      type: result.data.documentType,
      country: result.data.countryOfIssue,
      confidence: result.data.confidence,
      mrzFound: result.data.mrz.found,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error en extract-id:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
