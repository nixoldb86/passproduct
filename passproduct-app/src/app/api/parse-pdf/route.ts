import { NextResponse } from "next/server";
import { extractText, renderPageAsImage } from "unpdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extraer texto del PDF
    const { text, totalPages } = await extractText(arrayBuffer);
    
    // Renderizar primera página como imagen
    let imageBase64 = null;
    try {
      const imageResult = await renderPageAsImage(uint8Array, 1, {
        scale: 2, // 2x para mejor calidad
      });
      
      // Convertir a base64
      if (imageResult) {
        const base64 = Buffer.from(imageResult).toString("base64");
        imageBase64 = `data:image/png;base64,${base64}`;
      }
    } catch (renderError) {
      console.warn("Could not render PDF as image:", renderError);
      // Continuar sin imagen - no es crítico
    }
    
    return NextResponse.json({
      success: true,
      text,
      numPages: totalPages,
      image: imageBase64,
    });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json(
      { error: "Error al procesar el PDF" },
      { status: 500 }
    );
  }
}
