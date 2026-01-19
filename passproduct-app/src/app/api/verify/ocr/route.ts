import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import crypto from "crypto";

interface ExtractedIdData {
  documentType: "DNI" | "NIE" | "PASSPORT" | "UNKNOWN";
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  expirationDate: string;
  nationality: string;
  sex: string;
  faceImage: string | null;
  confidence: number;
  rawText: string;
}

// Spanish DNI/NIE patterns
const DNI_PATTERN = /\b(\d{8}[A-Z])\b/i;
const NIE_PATTERN = /\b([XYZ]\d{7}[A-Z])\b/i;

// Date patterns (DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY)
const DATE_PATTERN = /\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\b/g;

// MRZ (Machine Readable Zone) patterns for Spanish ID
const MRZ_LINE1_PATTERN = /^[A-Z<]{30}$/m;
const MRZ_LINE2_PATTERN = /^\d{7}[A-Z<]\d{7}[A-Z<]/m;

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Process image with Tesseract
    const result = await Tesseract.recognize(image, "spa+eng", {
      logger: (m) => {
        // Optionally log progress
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const rawText = result.data.text;
    const confidence = result.data.confidence / 100;

    console.log("OCR Raw Text:", rawText);
    console.log("OCR Confidence:", confidence);

    // Parse extracted text
    const extractedData = parseSpanishId(rawText, confidence);

    return NextResponse.json({
      success: true,
      extractedData,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process image" },
      { status: 500 }
    );
  }
}

function parseSpanishId(text: string, ocrConfidence: number): ExtractedIdData {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const upperText = text.toUpperCase();

  let documentType: ExtractedIdData["documentType"] = "UNKNOWN";
  let documentNumber = "";
  let firstName = "";
  let lastName = "";
  let dateOfBirth = "";
  let expirationDate = "";
  let nationality = "ESP";
  let sex = "";

  // Detect document type and extract number
  const dniMatch = upperText.match(DNI_PATTERN);
  const nieMatch = upperText.match(NIE_PATTERN);

  if (dniMatch) {
    documentType = "DNI";
    documentNumber = dniMatch[1].toUpperCase();
  } else if (nieMatch) {
    documentType = "NIE";
    documentNumber = nieMatch[1].toUpperCase();
  }

  // Check for passport indicators
  if (
    upperText.includes("PASAPORTE") ||
    upperText.includes("PASSPORT") ||
    upperText.includes("P<ESP")
  ) {
    documentType = "PASSPORT";
  }

  // Extract dates
  const dateMatches = text.match(DATE_PATTERN) || [];
  const parsedDates = dateMatches
    .map((d) => {
      const normalized = d.replace(/[\/\.]/g, "-");
      const parts = normalized.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        // Validate date
        if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
          return { original: d, day, month, year, date: new Date(year, month - 1, day) };
        }
      }
      return null;
    })
    .filter(Boolean);

  // Sort dates to identify birth date (oldest) and expiration (future)
  const now = new Date();
  const pastDates = parsedDates.filter((d) => d && d.date < now);
  const futureDates = parsedDates.filter((d) => d && d.date > now);

  // Birth date is likely the oldest past date
  if (pastDates.length > 0) {
    pastDates.sort((a, b) => a!.date.getTime() - b!.date.getTime());
    const birthDate = pastDates[0];
    if (birthDate) {
      dateOfBirth = birthDate.original;
    }
  }

  // Expiration date is the future date
  if (futureDates.length > 0) {
    const expDate = futureDates[0];
    if (expDate) {
      expirationDate = expDate.original;
    }
  }

  // Extract names from common patterns
  // Look for patterns like "APELLIDOS" / "NOMBRE" labels
  const apellidosMatch = text.match(/APELLIDOS?\s*[:\-]?\s*([A-ZÁÉÍÓÚÑ\s]+)/i);
  const nombreMatch = text.match(/NOMBRE\s*[:\-]?\s*([A-ZÁÉÍÓÚÑ\s]+)/i);

  if (apellidosMatch) {
    lastName = cleanName(apellidosMatch[1]);
  }
  if (nombreMatch) {
    firstName = cleanName(nombreMatch[1]);
  }

  // If not found, try to extract from MRZ or structured format
  if (!firstName || !lastName) {
    // Try to find capitalized name lines
    const nameLines = lines.filter((line) => {
      // Look for lines that are mostly uppercase letters
      const letterCount = (line.match(/[A-ZÁÉÍÓÚÑ]/g) || []).length;
      const totalChars = line.length;
      return (
        letterCount / totalChars > 0.8 &&
        totalChars > 3 &&
        totalChars < 50 &&
        !line.match(/\d{4}/) && // Exclude lines with years
        !line.match(/DNI|NIE|ESPAÑA|ESPANA|ESP/i) // Exclude labels
      );
    });

    if (nameLines.length >= 2 && !lastName) {
      lastName = cleanName(nameLines[0]);
      firstName = cleanName(nameLines[1]);
    } else if (nameLines.length === 1 && !lastName) {
      const parts = nameLines[0].split(/\s+/);
      if (parts.length >= 2) {
        lastName = cleanName(parts.slice(0, -1).join(" "));
        firstName = cleanName(parts[parts.length - 1]);
      }
    }
  }

  // Extract sex
  if (upperText.includes(" M ") || upperText.match(/\bSEXO\s*[:\-]?\s*M\b/i)) {
    sex = "M";
  } else if (upperText.includes(" F ") || upperText.match(/\bSEXO\s*[:\-]?\s*F\b/i)) {
    sex = "F";
  }

  // Calculate confidence based on what we found
  let dataConfidence = ocrConfidence;
  if (!documentNumber) dataConfidence *= 0.5;
  if (!firstName) dataConfidence *= 0.7;
  if (!lastName) dataConfidence *= 0.7;
  if (!dateOfBirth) dataConfidence *= 0.8;

  return {
    documentType,
    documentNumber,
    firstName,
    lastName,
    dateOfBirth,
    expirationDate,
    nationality,
    sex,
    faceImage: null, // Would need image processing to extract face
    confidence: Math.min(dataConfidence, 1),
    rawText: text,
  };
}

function cleanName(name: string): string {
  return name
    .trim()
    .replace(/[^A-ZÁÉÍÓÚÑ\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
