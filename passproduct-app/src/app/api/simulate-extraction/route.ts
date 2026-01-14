import { NextResponse } from "next/server";

/**
 * Simulación del proceso de extracción de datos de factura
 * Este endpoint simula cómo la IA procesa la factura del colchón Multisac
 */
export async function POST(request: Request) {
  try {
    // Simular el proceso paso a paso
    
    // PASO 1: Extracción inicial de la factura (GPT-4 Vision)
    console.log("📸 PASO 1: Usuario sube foto de factura");
    console.log("🤖 IA analiza la imagen con GPT-4 Vision...");
    
    const extractedData = {
      imageType: "invoice",
      multipleProducts: false,
      products: [{
        brand: null, // La IA detecta "MULTISAC" pero no está segura si es marca o descripción
        model: "BRISA V8TITANIO", // Detectado del campo "Modelo"
        variant: null,
        category: "furniture", // Inferido: colchón = mobiliario
        purchasePrice: 755.00,
        lineDescription: "COLCHON MULTISAC",
        refCodes: ["08632114586", "0086"], // Código y departamento
      }],
      purchaseDate: "2024-03-01",
      purchaseStore: "El Corte Inglés",
      confidence: "medium", // Media porque no está segura de la marca
    };
    
    console.log("✅ Datos extraídos iniciales:");
    console.log(JSON.stringify(extractedData, null, 2));
    
    // PASO 2: Detectar que necesita búsqueda web
    console.log("\n🔍 PASO 2: Detectando necesidad de búsqueda web...");
    const needsSearch = !extractedData.products[0].brand || 
                       extractedData.products[0].brand.length < 2;
    
    if (needsSearch) {
      console.log("⚠️ Marca no identificada o genérica. Buscando en internet...");
      
      // PASO 3: Construir query de búsqueda
      const searchQuery = [
        "08632114586",
        "0086",
        "COLCHON MULTISAC BRISA V8TITANIO",
        "El Corte Inglés"
      ].join(" ");
      
      console.log(`\n🌐 PASO 3: Búsqueda web con query: "${searchQuery}"`);
      console.log("🔍 Consultando Serper.dev (Google Search API)...");
      
      // Simular resultados de búsqueda (en producción usaría Serper real)
      const mockSearchResults = `
        Multisac Brisa V8 Titanio - Colchón de muelles ensacados: El colchón Multisac Brisa V8 Titanio es un modelo premium de la marca española Multisac. Características: muelles ensacados individualmente, tratamiento Titanio para mayor frescor, firmeza media-alta...
        
        Multisac Brisa V8 Titanio - El Corte Inglés: Colchón Multisac Brisa V8 Titanio disponible en El Corte Inglés. Precio: 755€. Dimensiones: 90x190, 135x190, 150x190, 180x200. Garantía 10 años...
        
        Multisac - Wikipedia: Multisac es una marca española de colchones fundada en 1972. Especializada en colchones de muelles ensacados. Modelos: Brisa, Nautilus, Atlantis...
      `;
      
      console.log("📄 Resultados encontrados:");
      console.log(mockSearchResults);
      
      // PASO 4: GPT analiza los resultados y extrae marca/modelo
      console.log("\n🤖 PASO 4: GPT-4 analiza los resultados de búsqueda...");
      
      const identifiedProduct = {
        brand: "Multisac",
        model: "Brisa V8 Titanio",
        variant: null,
        category: "furniture",
      };
      
      console.log("✅ Producto identificado:");
      console.log(JSON.stringify(identifiedProduct, null, 2));
      
      // Actualizar datos extraídos
      extractedData.products[0].brand = identifiedProduct.brand;
      extractedData.products[0].model = identifiedProduct.model;
      extractedData.products[0].category = identifiedProduct.category;
      extractedData.confidence = "high"; // Ahora es alta confianza
      
      console.log("\n📦 RESULTADO FINAL:");
      console.log({
        brand: extractedData.products[0].brand,
        model: extractedData.products[0].model,
        category: extractedData.products[0].category,
        purchasePrice: extractedData.products[0].purchasePrice,
        purchaseDate: extractedData.purchaseDate,
        purchaseStore: extractedData.purchaseStore,
        confidence: extractedData.confidence,
      });
      
      return NextResponse.json({
        success: true,
        simulation: {
          step1_extraction: {
            description: "IA analiza la imagen de la factura",
            extracted: {
              brand: null,
              model: "BRISA V8TITANIO",
              description: "COLCHON MULTISAC",
              codes: ["08632114586", "0086"],
            },
            confidence: "medium",
          },
          step2_detection: {
            description: "Sistema detecta que necesita búsqueda web",
            reason: "Marca no identificada claramente en la factura",
          },
          step3_web_search: {
            description: "Búsqueda en internet con Serper.dev",
            query: searchQuery,
            results: mockSearchResults.trim(),
          },
          step4_identification: {
            description: "GPT-4 analiza resultados y extrae marca/modelo",
            identified: identifiedProduct,
          },
          final_result: {
            brand: "Multisac",
            model: "Brisa V8 Titanio",
            category: "furniture",
            purchasePrice: 755.00,
            purchaseDate: "2024-03-01",
            purchaseStore: "El Corte Inglés",
            confidence: "high",
          },
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "No se necesitó búsqueda web",
      data: extractedData,
    });
  } catch (error) {
    console.error("Error en simulación:", error);
    return NextResponse.json(
      { error: "Error en la simulación" },
      { status: 500 }
    );
  }
}
