/**
 * Calcula la fecha de fin de garantía según el tipo de producto, país y fecha de compra
 */

type Country = "ES" | "EU" | "US" | "UK" | "OTHER";

interface WarrantyConfig {
  legalYears: number; // Garantía legal mínima
  extendedYears?: number; // Garantía extendida del fabricante (si aplica)
  notes?: string;
}

// Garantías legales por país
const LEGAL_WARRANTY_BY_COUNTRY: Record<Country, { before2022: number; after2022: number }> = {
  ES: { before2022: 2, after2022: 3 }, // España: 3 años desde 01/01/2022
  EU: { before2022: 2, after2022: 3 }, // UE: Directiva 2019/771
  UK: { before2022: 6, after2022: 6 }, // UK: 6 años (England) / 5 años (Scotland)
  US: { before2022: 1, after2022: 1 }, // USA: varía por estado, típicamente 1 año implícita
  OTHER: { before2022: 1, after2022: 1 },
};

// Garantías extendidas típicas por categoría (años adicionales del fabricante)
const EXTENDED_WARRANTY_BY_CATEGORY: Record<string, number> = {
  // Grandes electrodomésticos suelen tener garantías más largas
  "cat-appliances-large": 2, // Muchos fabricantes dan 2 años extra (total 5 en España)
  "cat-climate": 2,
  // Apple tiene 1 año de fabricante (+ AppleCare)
  "cat-smartphones": 0,
  "cat-tablets": 0,
  "cat-laptops": 0,
  "cat-wearables": 0,
  // TVs premium a veces tienen garantía extendida
  "cat-tv": 1,
  // El resto usa la garantía legal
};

// Marcas con garantías especiales conocidas
const BRAND_WARRANTY_OVERRIDES: Record<string, Record<string, number>> = {
  // Apple: 1 año de fabricante (la legal cubre más en EU)
  Apple: {
    "cat-smartphones": 1,
    "cat-tablets": 1,
    "cat-laptops": 1,
    "cat-wearables": 1,
  },
  // Samsung: 2 años en muchos productos
  Samsung: {
    "cat-smartphones": 2,
    "cat-tablets": 2,
    "cat-tv": 2,
  },
  // Dyson: 2 años
  Dyson: {
    "cat-appliances-small": 2,
  },
  // Miele: 2 años + opción de extender
  Miele: {
    "cat-appliances-large": 2,
  },
  // Bosch: 2 años en electrodomésticos
  Bosch: {
    "cat-appliances-large": 2,
    "cat-appliances-small": 2,
  },
  // LG: 2 años + 10 años en compresores de frigoríficos
  LG: {
    "cat-appliances-large": 2,
    "cat-tv": 2,
  },
  // DJI: 1-2 años según producto
  DJI: {
    "cat-drones": 1,
  },
};

/**
 * Calcula la garantía para un producto
 */
export function calculateWarranty(params: {
  categoryId: string;
  brand?: string;
  purchaseDate: Date;
  country?: Country;
  manufacturerWarrantyYears?: number; // Si viene de la factura
}): {
  warrantyEndDate: Date;
  warrantyYears: number;
  warrantyType: "legal" | "manufacturer" | "extended";
  notes: string;
} {
  const { categoryId, brand, purchaseDate, country = "ES", manufacturerWarrantyYears } = params;

  // 1. Determinar garantía legal según país y fecha
  const isAfter2022 = purchaseDate >= new Date("2022-01-01");
  const legalWarranty = isAfter2022
    ? LEGAL_WARRANTY_BY_COUNTRY[country].after2022
    : LEGAL_WARRANTY_BY_COUNTRY[country].before2022;

  // 2. Verificar si hay garantía específica del fabricante
  let manufacturerWarranty = 0;
  if (brand && BRAND_WARRANTY_OVERRIDES[brand]?.[categoryId]) {
    manufacturerWarranty = BRAND_WARRANTY_OVERRIDES[brand][categoryId];
  }

  // 3. Verificar garantía extendida por categoría
  const extendedWarranty = EXTENDED_WARRANTY_BY_CATEGORY[categoryId] || 0;

  // 4. Si viene garantía de la factura, usarla como referencia
  if (manufacturerWarrantyYears && manufacturerWarrantyYears > 0) {
    manufacturerWarranty = Math.max(manufacturerWarranty, manufacturerWarrantyYears);
  }

  // 5. Determinar la garantía final (la mayor entre legal y fabricante)
  let finalWarrantyYears: number;
  let warrantyType: "legal" | "manufacturer" | "extended";
  let notes: string;

  // En la UE, la garantía legal prevalece si es mayor
  const totalManufacturerWarranty = manufacturerWarranty + extendedWarranty;

  if (legalWarranty >= totalManufacturerWarranty) {
    finalWarrantyYears = legalWarranty;
    warrantyType = "legal";
    notes = `Garantía legal ${country === "ES" ? "española" : "europea"} de ${legalWarranty} años`;
  } else {
    finalWarrantyYears = totalManufacturerWarranty;
    warrantyType = extendedWarranty > 0 ? "extended" : "manufacturer";
    notes = `Garantía del fabricante${brand ? ` (${brand})` : ""}: ${totalManufacturerWarranty} años`;
  }

  // 6. Calcular fecha de fin
  const warrantyEndDate = new Date(purchaseDate);
  warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + finalWarrantyYears);

  return {
    warrantyEndDate,
    warrantyYears: finalWarrantyYears,
    warrantyType,
    notes,
  };
}

/**
 * Obtiene información de garantía para mostrar al usuario
 */
export function getWarrantyInfo(country: Country = "ES"): string {
  const info = LEGAL_WARRANTY_BY_COUNTRY[country];
  
  if (country === "ES" || country === "EU") {
    return `En España/UE: ${info.after2022} años para compras desde 2022, ${info.before2022} años para compras anteriores.`;
  }
  
  return `Garantía legal: ${info.after2022} año(s)`;
}

/**
 * Verifica si la garantía está próxima a expirar (dentro de X días)
 */
export function isWarrantyExpiringSoon(warrantyEndDate: Date, daysThreshold: number = 60): boolean {
  const now = new Date();
  const daysRemaining = Math.ceil((warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysRemaining > 0 && daysRemaining <= daysThreshold;
}

/**
 * Verifica si la garantía ya expiró
 */
export function isWarrantyExpired(warrantyEndDate: Date): boolean {
  return new Date() > warrantyEndDate;
}
