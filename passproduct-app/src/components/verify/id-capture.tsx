"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, RotateCcw, Check, AlertCircle, Loader2, Edit3 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { motion } from "framer-motion";

interface IdCaptureProps {
  onCapture: (imageData: string) => void;
  onExtractedData: (data: ExtractedIdData | null) => void;
  isProcessing: boolean;
}

export interface ExtractedIdData {
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

export function IdCapture({ onCapture, onExtractedData, isProcessing }: IdCaptureProps) {
  const [captureMode, setCaptureMode] = useState<"camera" | "upload" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isExtractingData, setIsExtractingData] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedIdData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<ExtractedIdData>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCaptureMode("camera");
    setCameraError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Cámara trasera en móvil
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("No se pudo acceder a la cámara. Por favor, permite el acceso o sube una foto.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Dimensiones naturales del video (resolución real de la cámara)
    const videoNaturalWidth = video.videoWidth;
    const videoNaturalHeight = video.videoHeight;
    
    // Dimensiones del elemento video en pantalla
    const videoDisplayWidth = video.clientWidth;
    const videoDisplayHeight = video.clientHeight;
    
    // Calcular cómo object-cover escala el video
    const videoAspect = videoNaturalWidth / videoNaturalHeight;
    const displayAspect = videoDisplayWidth / videoDisplayHeight;
    
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = videoNaturalWidth;
    let sourceHeight = videoNaturalHeight;
    
    // object-cover: el video se escala para cubrir todo el contenedor, recortando lo que sobra
    if (videoAspect > displayAspect) {
      // Video más ancho que el contenedor - se recortan los lados
      sourceWidth = videoNaturalHeight * displayAspect;
      sourceX = (videoNaturalWidth - sourceWidth) / 2;
    } else {
      // Video más alto que el contenedor - se recorta arriba/abajo
      sourceHeight = videoNaturalWidth / displayAspect;
      sourceY = (videoNaturalHeight - sourceHeight) / 2;
    }
    
    // Ahora aplicamos el margen del 8% al área visible (el recuadro guía)
    const marginPercent = 0.08;
    const cropX = sourceX + (sourceWidth * marginPercent);
    const cropY = sourceY + (sourceHeight * marginPercent);
    const cropWidth = sourceWidth * (1 - 2 * marginPercent);
    const cropHeight = sourceHeight * (1 - 2 * marginPercent);
    
    // Configurar canvas con las dimensiones del recorte
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dibujar solo la zona del recuadro guía
      ctx.drawImage(
        video,
        cropX, cropY, cropWidth, cropHeight,  // Fuente: área dentro del recuadro
        0, 0, cropWidth, cropHeight            // Destino: todo el canvas
      );
      
      const imageData = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedImage(imageData);
      onCapture(imageData);
      stopCamera();
      
      // Procesar OCR con la imagen recortada
      processOCR(imageData);
    }
  }, [onCapture, stopCamera]);

  // Recortar imagen subida al centro (eliminar bordes excesivos)
  const cropUploadedImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        
        // Si la imagen es mucho más grande que proporción de ID, recortar al centro
        const aspectRatio = img.width / img.height;
        const targetAspect = 1.586; // Proporción de tarjeta ID (85.6/53.98)
        
        let cropX = 0;
        let cropY = 0;
        let cropWidth = img.width;
        let cropHeight = img.height;
        
        // Solo recortar si hay mucho espacio extra (más del 20%)
        const marginThreshold = 0.1;
        
        if (aspectRatio > targetAspect * 1.2) {
          // Imagen demasiado ancha - recortar lados
          const newWidth = img.height * targetAspect;
          cropX = (img.width - newWidth) / 2;
          cropWidth = newWidth;
        } else if (aspectRatio < targetAspect / 1.2) {
          // Imagen demasiado alta - recortar arriba/abajo
          const newHeight = img.width / targetAspect;
          cropY = (img.height - newHeight) / 2;
          cropHeight = newHeight;
        }
        
        // Aplicar margen adicional del 5% para limpiar bordes
        const extraMargin = 0.05;
        cropX += cropWidth * extraMargin;
        cropY += cropHeight * extraMargin;
        cropWidth *= (1 - 2 * extraMargin);
        cropHeight *= (1 - 2 * extraMargin);
        
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = imageData;
    });
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const originalImage = event.target?.result as string;
      
      // Recortar imagen al centro para eliminar bordes
      const croppedImage = await cropUploadedImage(originalImage);
      
      setCapturedImage(croppedImage);
      onCapture(croppedImage);
      setCaptureMode("upload");
      
      // Procesar OCR con imagen recortada
      processOCR(croppedImage);
    };
    reader.readAsDataURL(file);
  }, [onCapture]);

  // Preprocesar imagen para mejorar OCR - versión mejorada
  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        
        // Escalar imagen para mejor OCR
        const scale = Math.max(1, 1500 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Dibujar imagen escalada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Obtener datos de imagen
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;
        
        // Paso 1: Convertir a escala de grises
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        
        // Paso 2: Aumentar contraste suavemente
        const factor = 1.3;
        for (let i = 0; i < data.length; i += 4) {
          const adjusted = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }
        
        // Paso 3: Sharpening ligero para mejorar bordes de texto
        // (Simplificado: no binarizamos para mantener más información)
        
        ctx.putImageData(imageDataObj, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageData;
    });
  };

  const processOCR = async (imageData: string) => {
    setIsExtractingData(true);
    setExtractedData(null);
    
    try {
      // PRIMERO: Intentar con OpenAI GPT-4o Vision (más preciso)
      console.log("Intentando extracción con IA (OpenAI)...");
      
      try {
        const response = await fetch("/api/verify/extract-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log("Datos extraídos con IA:", result.data);
          
          // Calcular confianza basada en campos leídos
          let confidence = 0.9; // Alta confianza base con IA
          if (result.data.confidence === "medium") confidence = 0.7;
          if (result.data.confidence === "low") confidence = 0.5;
          if (!result.data.documentNumber) confidence *= 0.5;
          if (!result.data.firstName) confidence *= 0.8;
          if (!result.data.lastName) confidence *= 0.8;
          
          const parsedData: ExtractedIdData = {
            documentType: result.data.documentType as ExtractedIdData["documentType"],
            documentNumber: result.data.documentNumber || "",
            firstName: result.data.firstName || "",
            lastName: result.data.lastName || "",
            dateOfBirth: result.data.dateOfBirth || "",
            expirationDate: result.data.expirationDate || "",
            nationality: result.data.nationality || "ESP",
            sex: result.data.sex || "",
            faceImage: imageData, // Pass the ID image for face comparison
            confidence,
            rawText: `IA: ${result.data.readableFields?.join(", ") || "campos extraídos"}`,
          };
          
          setExtractedData(parsedData);
          onExtractedData(parsedData);
          return; // Éxito con IA, no necesitamos Tesseract
        }
      } catch (aiError) {
        console.warn("Error con IA, intentando con OCR local:", aiError);
      }
      
      // FALLBACK: Usar Tesseract.js si OpenAI falla
      console.log("Usando OCR local (Tesseract)...");
      
      // Preprocesar imagen
      const processedImage = await preprocessImage(imageData);
      
      // Importar Tesseract dinámicamente para que se ejecute en el cliente
      const Tesseract = (await import("tesseract.js")).default;
      
      // Primer intento: imagen procesada con español
      const result = await Tesseract.recognize(processedImage, "spa", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      
      let rawText = result.data.text;
      let confidence = result.data.confidence / 100;
      
      console.log("=== OCR RAW TEXT ===");
      console.log(rawText);
      console.log("=== END RAW TEXT ===");
      console.log("OCR Confidence:", confidence);
      
      // Si la confianza es baja, intentar con la imagen original
      if (confidence < 0.5) {
        console.log("Baja confianza, intentando con imagen original...");
        const result2 = await Tesseract.recognize(imageData, "spa+eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              console.log(`OCR Progress (2): ${Math.round(m.progress * 100)}%`);
            }
          },
        });
        
        if (result2.data.confidence > result.data.confidence) {
          rawText = result2.data.text;
          confidence = result2.data.confidence / 100;
          console.log("Usando resultado de imagen original");
        }
      }
      
      // Parse the extracted text
      const parsedData = parseSpanishId(rawText, confidence);
      // Add the captured image for face comparison
      parsedData.faceImage = imageData;
      
      setExtractedData(parsedData);
      onExtractedData(parsedData);
    } catch (error) {
      console.error("Error processing OCR:", error);
      // Crear datos vacíos para edición manual
      setExtractedData({
        documentType: "UNKNOWN",
        documentNumber: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        expirationDate: "",
        nationality: "ESP",
        sex: "",
        faceImage: imageData, // Pass the ID image for face comparison
        confidence: 0,
        rawText: "",
      });
      onExtractedData(null);
    } finally {
      setIsExtractingData(false);
    }
  };
  
  // Parse MRZ (Machine Readable Zone) - más fiable que OCR normal
  const parseMRZ = (text: string): Partial<ExtractedIdData> | null => {
    const lines = text.split("\n").map(l => l.trim().replace(/\s/g, ""));
    
    // Buscar líneas MRZ (contienen muchos < y tienen longitud fija)
    const mrzLines = lines.filter(l => 
      l.includes("<") && 
      (l.length >= 30 || l.match(/^[A-Z0-9<]{30,}$/))
    );
    
    if (mrzLines.length >= 2) {
      console.log("MRZ detectado:", mrzLines);
      
      // DNI español MRZ format (TD1 - 3 líneas de 30 caracteres)
      // Línea 1: ID + país + número documento
      // Línea 2: Fecha nac + sexo + fecha exp + nacionalidad
      // Línea 3: Apellidos << Nombres
      
      const result: Partial<ExtractedIdData> = {};
      
      for (const line of mrzLines) {
        // Buscar número de documento en MRZ
        const docMatch = line.match(/([A-Z]?)(\d{8})([A-Z])/);
        if (docMatch) {
          const prefix = docMatch[1];
          const num = docMatch[2];
          const letter = docMatch[3];
          
          if (prefix && ["X", "Y", "Z"].includes(prefix)) {
            result.documentType = "NIE";
            result.documentNumber = `${prefix}${num}${letter}`;
          } else {
            result.documentType = "DNI";
            result.documentNumber = `${num}${letter}`;
          }
        }
        
        // Buscar fechas en formato MRZ (YYMMDD)
        const dateMatches = line.match(/(\d{6})/g);
        if (dateMatches) {
          for (const dateStr of dateMatches) {
            const yy = parseInt(dateStr.slice(0, 2), 10);
            const mm = parseInt(dateStr.slice(2, 4), 10);
            const dd = parseInt(dateStr.slice(4, 6), 10);
            
            if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
              const year = yy > 50 ? 1900 + yy : 2000 + yy;
              const date = `${dd.toString().padStart(2, "0")}/${mm.toString().padStart(2, "0")}/${year}`;
              
              // Si es fecha pasada, probablemente nacimiento
              if (year < 2010 && !result.dateOfBirth) {
                result.dateOfBirth = date;
              }
              // Si es fecha futura, probablemente caducidad
              else if (year > new Date().getFullYear() && !result.expirationDate) {
                result.expirationDate = date;
              }
            }
          }
        }
        
        // Buscar sexo
        if (line.match(/[<\d][MF][<\d]/)) {
          const sexMatch = line.match(/[<\d]([MF])[<\d]/);
          if (sexMatch) {
            result.sex = sexMatch[1];
          }
        }
        
        // Buscar nombres (línea con <<)
        if (line.includes("<<")) {
          const nameParts = line.split("<<").filter(Boolean);
          if (nameParts.length >= 2) {
            result.lastName = nameParts[0].replace(/<+/g, " ").trim();
            result.firstName = nameParts[1].replace(/<+/g, " ").trim();
          } else if (nameParts.length === 1) {
            const parts = nameParts[0].split("<").filter(Boolean);
            if (parts.length >= 2) {
              result.lastName = parts[0];
              result.firstName = parts.slice(1).join(" ");
            }
          }
        }
      }
      
      if (result.documentNumber) {
        return result;
      }
    }
    
    return null;
  };

  // Parse Spanish ID document - específico para DNI español
  const parseSpanishId = (text: string, ocrConfidence: number): ExtractedIdData => {
    // Limpiar y normalizar el texto
    const cleanText = text
      .replace(/[|¦]/g, "I")  // OCR confunde | con I
      .replace(/[º°]/g, "")   // Quitar símbolos de grado
      .replace(/\s+/g, " ");  // Normalizar espacios
    
    const upperText = cleanText.toUpperCase();
    const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
    
    console.log("=== LÍNEAS DEL OCR ===");
    lines.forEach((line, i) => console.log(`${i}: ${line}`));
    console.log("=== FIN LÍNEAS ===");
    
    let documentType: ExtractedIdData["documentType"] = "DNI";
    let documentNumber = "";
    let firstName = "";
    let lastName = "";
    let dateOfBirth = "";
    let expirationDate = "";
    let nationality = "ESP";
    let sex = "";
    
    // 1. BUSCAR NÚMERO DE DOCUMENTO (lo más fiable)
    // DNI: 8 dígitos + letra al final de una línea o solo
    const dniPatterns = [
      /(\d{8}\s*[A-Z])\b/gi,           // 47224229P
      /(\d{8})\s*([A-Z])\b/gi,         // 47224229 P
      /DNI\s*(\d{8}\s*[A-Z])/gi,       // DNI 47224229P
    ];
    
    for (const pattern of dniPatterns) {
      const matches = upperText.matchAll(pattern);
      for (const match of matches) {
        const num = (match[1] + (match[2] || "")).replace(/\s/g, "");
        if (/^\d{8}[A-Z]$/.test(num)) {
          documentNumber = num;
          documentType = "DNI";
          break;
        }
      }
      if (documentNumber) break;
    }
    
    // NIE: X/Y/Z + 7 dígitos + letra
    if (!documentNumber) {
      const nieMatch = upperText.match(/([XYZ]\d{7}[A-Z])/);
      if (nieMatch) {
        documentNumber = nieMatch[1];
        documentType = "NIE";
      }
    }
    
    // 2. BUSCAR APELLIDOS - línea que contiene "APELLIDOS" o está justo después
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();
      
      // Buscar patrón "APELLIDOS" seguido de nombres en la misma línea
      const apellidosMatch = line.match(/APELLIDOS?\s+([A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*)/);
      if (apellidosMatch && !lastName) {
        const potential = apellidosMatch[1].trim();
        // Filtrar palabras que no son apellidos
        if (!potential.match(/^(DOCUMENTO|NACIONAL|IDENTIDAD|ESPAÑA|ESP|SEXO|NOMBRE)$/)) {
          lastName = cleanName(potential);
        }
      }
      
      // Si la línea es solo "APELLIDOS", el apellido está en la siguiente línea
      if (line.match(/^APELLIDOS?\s*$/) && i + 1 < lines.length && !lastName) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.match(/^[A-ZÁÉÍÓÚÑ\s]+$/) && nextLine.length > 2) {
          lastName = cleanName(nextLine);
        }
      }
    }
    
    // 3. BUSCAR NOMBRE - línea que contiene "NOMBRE" seguido del nombre
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase();
      
      // Patrón "NOMBRE" seguido del nombre
      const nombreMatch = line.match(/NOMBRE\s+([A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*)/);
      if (nombreMatch && !firstName) {
        const potential = nombreMatch[1].trim();
        if (!potential.match(/^(DOCUMENTO|NACIONAL|IDENTIDAD|ESPAÑA|ESP|SEXO|APELLIDOS?)$/)) {
          firstName = cleanName(potential);
        }
      }
      
      // Si la línea es solo "NOMBRE", el nombre está en la siguiente línea
      if (line.match(/^NOMBRE\s*$/) && i + 1 < lines.length && !firstName) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.match(/^[A-ZÁÉÍÓÚÑ\s]+$/) && nextLine.length > 2) {
          firstName = cleanName(nextLine);
        }
      }
    }
    
    // 4. BUSCAR SEXO - "SEXO M" o "SEXO F" o solo "M" cerca de "NACIONALIDAD"
    const sexMatch = upperText.match(/SEXO\s*([MF])\b/);
    if (sexMatch) {
      sex = sexMatch[1];
    } else {
      // Buscar M o F aislados cerca de ESP o NACIONALIDAD
      const sexNearNac = upperText.match(/\b([MF])\s+(ESP|NACIONALIDAD)/);
      if (sexNearNac) {
        sex = sexNearNac[1];
      }
    }
    
    // 5. BUSCAR FECHAS
    // Formato DNI español: DD MM YYYY (con espacios) o DD/MM/YYYY
    const datePatterns = [
      /(\d{2})\s+(\d{2})\s+(\d{4})/g,     // 08 01 1986
      /(\d{2})[\/-](\d{2})[\/-](\d{4})/g, // 08/01/1986 o 08-01-1986
      /(\d{2})\.(\d{2})\.(\d{4})/g,       // 08.01.1986
    ];
    
    const foundDates: { str: string; date: Date; context: string }[] = [];
    
    for (const pattern of datePatterns) {
      let match;
      const textCopy = cleanText;
      while ((match = pattern.exec(textCopy)) !== null) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
          const dateStr = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
          const context = textCopy.substring(Math.max(0, match.index - 20), match.index + match[0].length + 10);
          foundDates.push({
            str: dateStr,
            date: new Date(year, month - 1, day),
            context: context.toUpperCase()
          });
        }
      }
    }
    
    console.log("Fechas encontradas:", foundDates);
    
    // Clasificar fechas por contexto
    const now = new Date();
    for (const fd of foundDates) {
      if (fd.context.includes("NACIMIENTO") || fd.context.includes("NAC")) {
        dateOfBirth = fd.str;
      } else if (fd.context.includes("VALIDEZ") || fd.context.includes("VALID") || fd.context.includes("EXP")) {
        expirationDate = fd.str;
      } else if (fd.date < now && fd.date.getFullYear() < 2010 && !dateOfBirth) {
        // Fecha antigua = probablemente nacimiento
        dateOfBirth = fd.str;
      } else if (fd.date > now && !expirationDate) {
        // Fecha futura = caducidad
        expirationDate = fd.str;
      }
    }
    
    // 6. INTENTAR MRZ SI HAY
    const mrzData = parseMRZ(text);
    if (mrzData) {
      console.log("Datos de MRZ:", mrzData);
      if (!documentNumber && mrzData.documentNumber) documentNumber = mrzData.documentNumber;
      if (!firstName && mrzData.firstName) firstName = mrzData.firstName;
      if (!lastName && mrzData.lastName) lastName = mrzData.lastName;
      if (!dateOfBirth && mrzData.dateOfBirth) dateOfBirth = mrzData.dateOfBirth;
      if (!expirationDate && mrzData.expirationDate) expirationDate = mrzData.expirationDate;
      if (!sex && mrzData.sex) sex = mrzData.sex;
    }
    
    // 7. CALCULAR CONFIANZA
    let dataConfidence = ocrConfidence;
    if (!documentNumber) dataConfidence *= 0.2;
    if (!firstName) dataConfidence *= 0.5;
    if (!lastName) dataConfidence *= 0.5;
    if (!dateOfBirth) dataConfidence *= 0.7;
    
    console.log("Resultado final:", { documentType, documentNumber, firstName, lastName, dateOfBirth, expirationDate, sex });
    
    return {
      documentType,
      documentNumber,
      firstName,
      lastName,
      dateOfBirth,
      expirationDate,
      nationality,
      sex,
      faceImage: null,
      confidence: Math.min(dataConfidence, 1),
      rawText: text,
    };
  };
  
  const cleanName = (name: string): string => {
    return name
      .trim()
      .replace(/[^A-ZÁÉÍÓÚÑ\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setCaptureMode(null);
    setExtractedData(null);
    setIsEditing(false);
    setEditedData({});
    onExtractedData(null);
    stopCamera();
  }, [stopCamera, onExtractedData]);

  const startEditing = () => {
    if (extractedData) {
      setEditedData({
        documentType: extractedData.documentType,
        documentNumber: extractedData.documentNumber,
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        dateOfBirth: extractedData.dateOfBirth,
        sex: extractedData.sex,
      });
      setIsEditing(true);
    }
  };

  const saveEditedData = () => {
    if (extractedData && editedData) {
      const updatedData: ExtractedIdData = {
        ...extractedData,
        documentType: (editedData.documentType as ExtractedIdData["documentType"]) || extractedData.documentType,
        documentNumber: editedData.documentNumber || extractedData.documentNumber,
        firstName: editedData.firstName || extractedData.firstName,
        lastName: editedData.lastName || extractedData.lastName,
        dateOfBirth: editedData.dateOfBirth || extractedData.dateOfBirth,
        sex: editedData.sex || extractedData.sex,
        confidence: 1, // Manual = 100% confianza
      };
      setExtractedData(updatedData);
      onExtractedData(updatedData);
      setIsEditing(false);
    }
  };

  const updateEditField = (field: keyof ExtractedIdData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Foto de tu documento de identidad
        </h3>
        <p className="text-sm text-foreground-muted mt-1">
          DNI, NIE o Pasaporte español/europeo
        </p>
      </div>

      {/* Capture area */}
      <div className="relative aspect-[3/2] bg-surface-1 rounded-2xl overflow-hidden border-2 border-dashed border-border">
        {!capturedImage && !captureMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={startCamera}
                size="lg"
                leftIcon={<Camera className="h-5 w-5" />}
              >
                Usar cámara
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Upload className="h-5 w-5" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Subir foto
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Camera view */}
        {captureMode === "camera" && !capturedImage && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Guide overlay - proporciones de tarjeta ID (85.6mm x 53.98mm ≈ 1.586:1) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Oscurecer zonas fuera del recuadro */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Área de captura (transparente) */}
              <div 
                className="absolute border-2 border-accent rounded-xl bg-transparent"
                style={{
                  top: "8%",
                  left: "8%",
                  right: "8%",
                  bottom: "8%",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Esquinas decorativas */}
                <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-xl" />
                <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-xl" />
              </div>
              
              {/* Instrucciones */}
              <div className="absolute top-2 left-0 right-0 text-center">
                <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                  📄 Coloca el DNI dentro del recuadro
                </span>
              </div>
            </div>
            
            {cameraError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-surface-1 rounded-xl p-4 max-w-sm text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-foreground-muted">{cameraError}</p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => {
                      setCaptureMode(null);
                      setCameraError(null);
                    }}
                  >
                    Volver
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Captured image preview */}
        {capturedImage && (
          <div className="absolute inset-0">
            <img
              src={capturedImage}
              alt="Documento capturado"
              className="w-full h-full object-contain bg-black"
            />
            
            {/* Processing overlay */}
            {isExtractingData && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
                  <p className="text-white mt-2">Leyendo documento...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera controls - FUERA del recuadro de captura */}
      {captureMode === "camera" && !capturedImage && !cameraError && (
        <div className="relative flex justify-center items-center mt-4">
          {/* Cancelar a la izquierda */}
          <Button
            variant="ghost"
            className="absolute left-0"
            onClick={() => {
              stopCamera();
              setCaptureMode(null);
            }}
          >
            Cancelar
          </Button>
          {/* Botón captura centrado */}
          <Button
            onClick={capturePhoto}
            size="lg"
            className="!rounded-full !w-16 !h-16 !p-0 bg-accent hover:bg-accent/90"
          >
            <div className="w-12 h-12 rounded-full border-4 border-white" />
          </Button>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Extracted data preview */}
      {extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-1 rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            {extractedData.confidence > 0.5 ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <span className="font-medium text-foreground">
              {isEditing ? "Editar datos" : "Datos extraídos"}
            </span>
            {!isEditing && (
              <>
                <span className="text-xs text-foreground-muted ml-auto mr-2">
                  Confianza: {Math.round(extractedData.confidence * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEditing}
                  leftIcon={<Edit3 className="h-3 w-3" />}
                >
                  Editar
                </Button>
              </>
            )}
          </div>
          
          {extractedData.confidence < 0.5 && !isEditing && (
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm p-2 rounded-lg mb-3">
              ⚠️ La lectura automática no fue muy precisa. Por favor, verifica y edita los datos si es necesario.
            </div>
          )}
          
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-foreground-muted mb-1 block">Tipo documento</label>
                  <select
                    value={editedData.documentType || "DNI"}
                    onChange={(e) => updateEditField("documentType", e.target.value)}
                    className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-foreground text-sm"
                  >
                    <option value="DNI">DNI</option>
                    <option value="NIE">NIE</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-foreground-muted mb-1 block">Número documento *</label>
                  <input
                    type="text"
                    value={editedData.documentNumber || ""}
                    onChange={(e) => updateEditField("documentNumber", e.target.value.toUpperCase())}
                    placeholder="12345678A"
                    className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground-muted mb-1 block">Nombre *</label>
                  <input
                    type="text"
                    value={editedData.firstName || ""}
                    onChange={(e) => updateEditField("firstName", e.target.value)}
                    placeholder="Juan"
                    className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground-muted mb-1 block">Apellidos *</label>
                  <input
                    type="text"
                    value={editedData.lastName || ""}
                    onChange={(e) => updateEditField("lastName", e.target.value)}
                    placeholder="García López"
                    className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground-muted mb-1 block">Fecha nacimiento</label>
                  <input
                    type="text"
                    value={editedData.dateOfBirth || ""}
                    onChange={(e) => updateEditField("dateOfBirth", e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground-muted mb-1 block">Sexo</label>
                  <select
                    value={editedData.sex || ""}
                    onChange={(e) => updateEditField("sex", e.target.value)}
                    className="w-full h-10 px-3 bg-surface-2 border border-border rounded-lg text-foreground text-sm"
                  >
                    <option value="">Sin especificar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={saveEditedData}
                  disabled={!editedData.documentNumber || !editedData.firstName || !editedData.lastName}
                >
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-foreground-muted">Tipo:</span>
                <p className="text-foreground font-medium">{extractedData.documentType || "-"}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Número:</span>
                <p className="text-foreground font-medium">{extractedData.documentNumber || "-"}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Nombre:</span>
                <p className="text-foreground font-medium">{extractedData.firstName || "-"}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Apellidos:</span>
                <p className="text-foreground font-medium">{extractedData.lastName || "-"}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Fecha nacimiento:</span>
                <p className="text-foreground font-medium">{extractedData.dateOfBirth || "-"}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Sexo:</span>
                <p className="text-foreground font-medium">
                  {extractedData.sex === "M" ? "Masculino" : extractedData.sex === "F" ? "Femenino" : "-"}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Reset button */}
      {capturedImage && !isExtractingData && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={resetCapture}
          >
            Volver a capturar
          </Button>
        </div>
      )}
    </div>
  );
}
