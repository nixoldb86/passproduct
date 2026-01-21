import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TIPOS
// ============================================

interface LogEntry {
  timestamp: string;
  phase: string;
  data: unknown;
}

interface MarketAnalysisLog {
  id: string;
  startedAt: string;
  completedAt?: string;
  request: {
    brand: string;
    model: string;
    variant?: string;
    purchasePrice?: number;
    keywords: string;
  };
  phases: LogEntry[];
  summary?: {
    totalTime: number;
    wallapopRequests: number;
    totalListingsFound: number;
    relevantListings: number;
    outliersRemoved: number;
    finalPrices: {
      minimo: number;
      ideal: number;
      rapido: number;
    };
  };
}

// ============================================
// LOGGER CLASS
// ============================================

export class MarketLogger {
  private log: MarketAnalysisLog;
  private startTime: number;
  private logsDir: string;

  constructor(brand: string, model: string, variant?: string, purchasePrice?: number) {
    this.startTime = Date.now();
    const timestamp = new Date().toISOString();
    const id = `market-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Directorio de logs en la raíz del proyecto
    this.logsDir = path.join(process.cwd(), 'logs', 'market-analysis');
    
    this.log = {
      id,
      startedAt: timestamp,
      request: {
        brand,
        model,
        variant,
        purchasePrice,
        keywords: [brand, model, variant].filter(Boolean).join(' '),
      },
      phases: [],
    };

    this.addPhase('INIT', {
      message: 'Iniciando análisis de mercado',
      request: this.log.request,
    });
  }

  addPhase(phase: string, data: unknown): void {
    this.log.phases.push({
      timestamp: new Date().toISOString(),
      phase,
      data,
    });
  }

  logCurl(url: string, headers: Record<string, string>, isFirstPage: boolean): void {
    // Construir el curl command
    const headerStrings = Object.entries(headers)
      .map(([key, value]) => `-H '${key}: ${value}'`)
      .join(' \\\n  ');

    const curlCommand = `curl -X GET '${url}' \\\n  ${headerStrings}`;

    this.addPhase(isFirstPage ? 'WALLAPOP_REQUEST_PAGE_1' : 'WALLAPOP_REQUEST_PAGE_2', {
      message: isFirstPage ? 'Primera petición a Wallapop' : 'Segunda petición (paginación)',
      url,
      headers_used: {
        'User-Agent': headers['User-Agent'],
        'Accept-Language': headers['Accept-Language'],
        'sec-ch-ua': headers['sec-ch-ua'],
        'sec-ch-ua-platform': headers['sec-ch-ua-platform'],
      },
      curl_command: curlCommand,
    });
  }

  logWallapopResponse(
    pageNumber: number,
    totalItems: number,
    extractedItems: Array<{
      id: string;
      titulo: string;
      precio: number;
      ciudad: string;
      is_shippable: boolean;
    }>,
    nextPage?: string
  ): void {
    this.addPhase(`WALLAPOP_RESPONSE_PAGE_${pageNumber}`, {
      message: `Respuesta de Wallapop - Página ${pageNumber}`,
      total_items_in_response: totalItems,
      items_extracted: extractedItems.length,
      has_next_page: !!nextPage,
      extracted_listings: extractedItems.map(item => ({
        id: item.id,
        titulo: item.titulo,
        precio: `${item.precio}€`,
        ciudad: item.ciudad,
        envio: item.is_shippable ? 'Sí' : 'No',
      })),
    });
  }

  logNormalization(
    originalCount: number,
    normalizedItems: Array<{
      id: string;
      titulo_normalizado: string;
      precio_normalizado: number;
    }>
  ): void {
    this.addPhase('NORMALIZATION', {
      message: 'Normalización de datos',
      original_count: originalCount,
      normalized_count: normalizedItems.length,
      sample_normalizations: normalizedItems.slice(0, 5).map(item => ({
        id: item.id,
        titulo_normalizado: item.titulo_normalizado,
        precio: `${item.precio_normalizado}€`,
      })),
    });
  }

  logAIFiltering(
    inputCount: number,
    prompt: string,
    aiResponse: { relevant_indices: number[]; reasoning?: string; excluded?: Array<{ index: number; reason: string }> },
    outputCount: number,
    allAnuncios: Array<{ titulo: string; precio: number; descripcion?: string }>,
    selectedAnuncios: Array<{ titulo: string; precio: number }>,
    exclusionReasons?: Map<number, string>
  ): void {
    // Identificar anuncios descartados
    const selectedIndices = new Set(aiResponse.relevant_indices);
    const descartados = allAnuncios
      .map((anuncio, index) => ({ ...anuncio, index }))
      .filter(a => !selectedIndices.has(a.index))
      .map(a => {
        // Usar razón de la IA si está disponible, sino inferir
        let razon = exclusionReasons?.get(a.index) || '';
        
        // Si no hay razón de la IA, inferir basándose en el título/precio
        if (!razon) {
          const tituloLower = a.titulo.toLowerCase();
          
          if (tituloLower.includes('caja') || tituloLower.includes('box')) {
            razon = 'Es solo la caja del producto';
          } else if (tituloLower.includes('funda') || tituloLower.includes('case') || tituloLower.includes('protector')) {
            razon = 'Es un accesorio (funda/protector)';
          } else if (tituloLower.includes('cargador') || tituloLower.includes('cable')) {
            razon = 'Es un accesorio (cargador/cable)';
          } else if (tituloLower.includes('tubo') || tituloLower.includes('filtro') || tituloLower.includes('cubo') || tituloLower.includes('bateria')) {
            razon = 'Es una pieza o accesorio suelto';
          } else if (tituloLower.includes('pieza') || tituloLower.includes('reparar') || tituloLower.includes('averiado') || tituloLower.includes('roto')) {
            razon = 'Producto defectuoso o para piezas';
          } else if (tituloLower.includes('mando') || tituloLower.includes('controller') || tituloLower.includes('joystick')) {
            razon = 'Es un accesorio (mando/controller)';
          } else if (tituloLower.includes('soporte') || tituloLower.includes('base')) {
            razon = 'Es un accesorio (soporte/base)';
          } else if (a.precio < 50) {
            razon = 'Precio muy bajo para ser el producto completo';
          } else {
            razon = 'Descartado por la IA (sin razón específica)';
          }
        }
        
        return {
          index: a.index,
          titulo: a.titulo,
          precio: `${a.precio}€`,
          razon_descarte: razon,
        };
      });

    this.addPhase('AI_FILTERING', {
      message: 'Filtrado con IA (OpenAI GPT-4o-mini)',
      input_count: inputCount,
      prompt_summary: prompt.substring(0, 500) + '...',
      ai_response: {
        indices_seleccionados: aiResponse.relevant_indices,
        razonamiento: aiResponse.reasoning,
      },
      anuncios_seleccionados: selectedAnuncios.map(a => ({
        titulo: a.titulo,
        precio: `${a.precio}€`,
      })),
      anuncios_descartados: {
        total: descartados.length,
        detalle: descartados,
      },
      output_count: outputCount,
      filtered_out: inputCount - outputCount,
    });
  }

  logOutlierDetection(
    inputCount: number,
    purchasePrice: number | undefined,
    bounds: { lower: number; upper: number },
    removedItems: Array<{ titulo: string; precio: number; reason: string }>,
    outputCount: number,
    extraInfo?: { promedio?: number; iqrLimits?: { lower: number; upper: number } }
  ): void {
    this.addPhase('OUTLIER_DETECTION', {
      message: 'Detección y eliminación de outliers',
      method: 'IQR + Margen mínimo 20% + Desviación > 30%',
      description: 'Solo se descartan anuncios si: (1) están fuera de límites Y (2) la desviación > 30%. Sin límite superior por revalorización (escasez, descatalogados, coleccionismo).',
      input_count: inputCount,
      purchase_price: purchasePrice ? `${purchasePrice}€` : 'No proporcionado',
      calculated_bounds: {
        lower: `${Math.round(bounds.lower)}€`,
        upper: `${Math.round(bounds.upper)}€`,
        nota: 'Límites permisivos que combinan IQR y margen mínimo del 20%',
      },
      outliers_removed: removedItems.length,
      outliers_detail: removedItems.length > 0 
        ? removedItems.map(item => ({
            titulo: item.titulo,
            precio: `${item.precio}€`,
            razon: item.reason,
          }))
        : 'Ningún anuncio descartado - todos los precios están dentro del rango aceptable',
      output_count: outputCount,
    });
  }

  logPriceCalculation(
    prices: number[],
    calculations: {
      min: number;
      max: number;
      average: number;
      minimo: number;
      ideal: number;
      rapido: number;
    },
    percentageRetained?: number
  ): void {
    this.addPhase('PRICE_CALCULATION', {
      message: 'Cálculo de precios recomendados',
      input_prices: prices.map(p => `${p}€`),
      statistics: {
        minimo: `${calculations.min}€`,
        maximo: `${calculations.max}€`,
        promedio: `${Math.round(calculations.average)}€`,
      },
      recommended_prices: {
        minimo: `${calculations.minimo}€ (el más bajo del mercado - venta instantánea)`,
        ideal: `${calculations.ideal}€ (promedio del mercado - precio justo)`,
        rapido: `${calculations.rapido}€ (90% del promedio - sin malvender)`,
      },
      value_retention: percentageRetained 
        ? `${percentageRetained}% del valor original`
        : 'No calculado (sin precio de compra)',
    });
  }

  finalize(summary: Omit<NonNullable<MarketAnalysisLog['summary']>, 'totalTime'>): void {
    const endTime = Date.now();
    this.log.completedAt = new Date().toISOString();
    this.log.summary = {
      ...summary,
      totalTime: endTime - this.startTime,
    };

    this.addPhase('COMPLETE', {
      message: 'Análisis completado',
      total_time_ms: endTime - this.startTime,
      total_time_human: `${((endTime - this.startTime) / 1000).toFixed(2)} segundos`,
      summary: {
        peticiones_wallapop: summary!.wallapopRequests,
        anuncios_encontrados: summary!.totalListingsFound,
        anuncios_relevantes: summary!.relevantListings,
        outliers_eliminados: summary!.outliersRemoved,
        precios_finales: {
          minimo: `${summary!.finalPrices.minimo}€`,
          ideal: `${summary!.finalPrices.ideal}€`,
          rapido: `${summary!.finalPrices.rapido}€`,
        },
      },
    });

    // Guardar el log en archivo
    this.saveToFile();
  }

  private saveToFile(): void {
    try {
      // Crear directorio si no existe
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }

      // Nombre del archivo con fecha y hora
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const filename = `${dateStr}_${timeStr}_${this.log.request.brand}_${this.log.request.model}.json`;
      const filepath = path.join(this.logsDir, filename);

      // Escribir el log formateado
      fs.writeFileSync(filepath, JSON.stringify(this.log, null, 2), 'utf-8');

      console.log(`📝 Log guardado: ${filepath}`);
    } catch (error) {
      console.error('❌ Error guardando log:', error);
    }
  }

  getLog(): MarketAnalysisLog {
    return this.log;
  }
}
