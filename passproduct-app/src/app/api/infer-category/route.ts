import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Categorías disponibles en SecondWallet - ampliadas para cualquier producto
const CATEGORIES = [
  // Electrónica
  { id: "cat-smartphones", name: "Smartphones", keywords: ["iphone", "galaxy", "pixel", "xiaomi", "oneplus", "móvil", "teléfono", "smartphone"] },
  { id: "cat-tablets", name: "Tablets", keywords: ["ipad", "tab", "tablet", "surface", "kindle"] },
  { id: "cat-laptops", name: "Portátiles", keywords: ["macbook", "laptop", "portátil", "notebook", "thinkpad", "xps", "zenbook", "chromebook"] },
  { id: "cat-desktops", name: "Ordenadores", keywords: ["imac", "pc", "desktop", "sobremesa", "mac mini", "mac studio"] },
  { id: "cat-monitors", name: "Monitores", keywords: ["monitor", "pantalla", "display", "ultrawide"] },
  { id: "cat-consoles", name: "Consolas", keywords: ["playstation", "xbox", "nintendo", "switch", "ps5", "ps4", "consola", "steam deck"] },
  { id: "cat-audio", name: "Audio", keywords: ["airpods", "auriculares", "headphones", "altavoz", "speaker", "soundbar", "buds", "beats", "bose", "sonos"] },
  { id: "cat-wearables", name: "Wearables", keywords: ["apple watch", "galaxy watch", "smartwatch", "fitbit", "garmin", "band", "oura"] },
  { id: "cat-cameras", name: "Cámaras", keywords: ["canon", "nikon", "sony alpha", "fujifilm", "gopro", "cámara", "mirrorless", "réflex", "dslr"] },
  { id: "cat-tv", name: "Televisores", keywords: ["televisor", "tv", "smart tv", "oled", "qled", "samsung tv", "lg tv"] },
  { id: "cat-projectors", name: "Proyectores", keywords: ["proyector", "projector", "epson", "benq", "optoma"] },
  { id: "cat-appliances-large", name: "Grandes Electrodomésticos", keywords: ["lavadora", "secadora", "lavavajillas", "frigorífico", "nevera", "horno", "cocina"] },
  { id: "cat-appliances-small", name: "Pequeños Electrodomésticos", keywords: ["aspirador", "dyson", "roomba", "thermomix", "cafetera", "tostadora", "batidora", "robot cocina", "freidora"] },
  { id: "cat-climate", name: "Climatización", keywords: ["aire acondicionado", "calefactor", "ventilador", "purificador", "humidificador", "daikin"] },
  { id: "cat-ebikes", name: "Bicicletas Eléctricas", keywords: ["ebike", "bicicleta eléctrica", "cowboy", "vanmoof", "specialized turbo"] },
  { id: "cat-scooters", name: "Patinetes Eléctricos", keywords: ["patinete", "scooter", "xiaomi scooter", "segway", "ninebot"] },
  { id: "cat-drones", name: "Drones", keywords: ["drone", "dji", "mavic", "mini", "phantom", "fpv"] },
  { id: "cat-gaming", name: "Gaming", keywords: ["gaming", "razer", "logitech g", "steelseries", "corsair", "mando", "controller"] },
  { id: "cat-networking", name: "Redes", keywords: ["router", "mesh", "wifi", "eero", "unifi", "nas", "synology"] },
  { id: "cat-storage", name: "Almacenamiento", keywords: ["ssd", "disco duro", "hdd", "pendrive", "usb", "tarjeta sd", "microsd"] },
  { id: "cat-peripherals", name: "Periféricos", keywords: ["teclado", "ratón", "mouse", "keyboard", "webcam", "hub", "dock"] },
  // Bebés y niños
  { id: "cat-baby-strollers", name: "Carritos de Bebé", keywords: ["carrito", "silla paseo", "bugaboo", "yoyo", "babyzen", "stokke", "cochecito", "gemelar"] },
  { id: "cat-baby-car-seats", name: "Sillas de Coche", keywords: ["silla coche", "maxicosi", "maxi-cosi", "cybex", "britax", "isofix", "grupo 0", "grupo 1", "grupo 2"] },
  { id: "cat-baby-furniture", name: "Mobiliario Bebé", keywords: ["cuna", "minicuna", "cambiador", "trona", "hamaca bebé", "parque bebé"] },
  { id: "cat-toys", name: "Juguetes", keywords: ["lego", "playmobil", "juguete", "muñeca", "peluche", "puzzle", "nerf", "barbie", "hot wheels"] },
  // Hogar
  { id: "cat-furniture", name: "Muebles", keywords: ["sofá", "mesa", "silla", "armario", "estantería", "cama", "colchón", "escritorio", "ikea"] },
  { id: "cat-garden", name: "Jardín", keywords: ["cortacésped", "robot jardín", "husqvarna", "barbacoa", "weber", "piscina", "manguera"] },
  { id: "cat-lighting", name: "Iluminación", keywords: ["lámpara", "foco", "led", "philips hue", "bombilla inteligente", "flexo"] },
  { id: "cat-home-decor", name: "Decoración", keywords: ["cuadro", "espejo", "alfombra", "cortina", "jarrón"] },
  // Deporte
  { id: "cat-fitness", name: "Fitness", keywords: ["cinta correr", "bicicleta estática", "elíptica", "peloton", "mancuernas", "pesas", "banco", "multiestación"] },
  { id: "cat-bikes", name: "Bicicletas", keywords: ["bicicleta", "mountain bike", "mtb", "bici carretera", "gravel", "specialized", "trek", "giant", "cannondale"] },
  { id: "cat-sports", name: "Deporte", keywords: ["golf", "tenis", "pádel", "esquí", "snowboard", "surf", "tabla", "raqueta"] },
  { id: "cat-outdoor", name: "Outdoor", keywords: ["tienda campaña", "saco dormir", "mochila", "trekking", "escalada", "kayak"] },
  // Calzado y Ropa
  { id: "cat-footwear", name: "Calzado", keywords: ["zapatillas", "botas", "bota", "zapatos", "sneakers", "running", "trail", "hiking", "senderismo", "quechua", "salomon", "merrell", "nike", "adidas", "new balance", "asics", "puma", "reebok", "converse", "vans", "timberland", "caterpillar", "geox", "clarks", "decathlon", "sh500", "sh100", "mh500"] },
  { id: "cat-clothing", name: "Ropa", keywords: ["chaqueta", "abrigo", "cazadora", "jersey", "sudadera", "camiseta", "pantalón", "vaqueros", "jeans", "vestido", "falda", "camisa", "polo", "parka", "plumas", "anorak", "softshell", "gore-tex", "impermeable", "cortavientos", "forclaz", "evadict"] },
  // Moda y lujo
  { id: "cat-fashion-luxury", name: "Moda de Lujo", keywords: ["louis vuitton", "gucci", "prada", "chanel", "hermès", "dior", "balenciaga", "burberry"] },
  { id: "cat-watches-jewelry", name: "Relojes y Joyería", keywords: ["rolex", "omega", "tag heuer", "cartier", "tissot", "seiko", "casio g-shock", "joya", "anillo", "collar"] },
  { id: "cat-bags", name: "Bolsos y Maletas", keywords: ["bolso", "maleta", "samsonite", "rimowa", "tumi", "mochila", "bandolera"] },
  // Música
  { id: "cat-instruments", name: "Instrumentos", keywords: ["guitarra", "piano", "teclado", "batería", "violín", "fender", "gibson", "yamaha", "roland"] },
  { id: "cat-music-equipment", name: "Equipo Musical", keywords: ["amplificador", "mezclador", "dj", "pioneer", "technics", "controlador dj", "plato", "micrófono"] },
  // Herramientas
  { id: "cat-tools", name: "Herramientas", keywords: ["destornillador", "llave", "herramienta", "caja herramientas", "stanley"] },
  { id: "cat-power-tools", name: "Herramientas Eléctricas", keywords: ["taladro", "amoladora", "sierra", "lijadora", "bosch", "makita", "dewalt", "milwaukee"] },
  // Vehículos
  { id: "cat-motorcycles", name: "Motos", keywords: ["moto", "motocicleta", "vespa", "scooter 125", "yamaha", "honda", "kawasaki", "bmw moto"] },
  { id: "cat-car-parts", name: "Recambios Coche", keywords: ["neumático", "llanta", "batería coche", "aceite", "filtro", "freno"] },
  // Otros
  { id: "cat-collectibles", name: "Coleccionismo", keywords: ["colección", "vintage", "antigüedad", "carta", "pokemon", "funko", "vinilo", "disco"] },
  { id: "cat-books-media", name: "Libros", keywords: ["libro", "cómic", "manga", "revista", "dvd", "bluray", "vinilo"] },
];

// Mapeo de categorías para validación
const CATEGORY_IDS = CATEGORIES.map(c => c.id);

const SYSTEM_PROMPT = `Eres un clasificador universal de productos. Tu trabajo es determinar la categoría correcta de CUALQUIER tipo de producto.

CATEGORÍAS DISPONIBLES:

📱 ELECTRÓNICA:
- cat-smartphones: Teléfonos móviles (iPhone, Samsung Galaxy, Xiaomi, etc.)
- cat-tablets: Tablets (iPad, Galaxy Tab, Surface, Kindle)
- cat-laptops: Portátiles (MacBook, ThinkPad, Dell XPS)
- cat-desktops: Ordenadores de sobremesa (iMac, PC gaming)
- cat-monitors: Monitores y pantallas
- cat-consoles: Consolas (PlayStation, Xbox, Nintendo Switch, Steam Deck)
- cat-audio: Audio (auriculares, altavoces, soundbars, AirPods)
- cat-wearables: Wearables (Apple Watch, Fitbit, Garmin)
- cat-cameras: Cámaras (Canon, Nikon, Sony, GoPro)
- cat-tv: Televisores
- cat-projectors: Proyectores

🏠 ELECTRODOMÉSTICOS:
- cat-appliances-large: Grandes (lavadora, nevera, lavavajillas)
- cat-appliances-small: Pequeños (aspirador, Dyson, Roomba, Thermomix, cafetera)
- cat-climate: Climatización (aire acondicionado, calefactor)

🚲 MOVILIDAD:
- cat-ebikes: Bicicletas eléctricas
- cat-scooters: Patinetes eléctricos
- cat-drones: Drones (DJI, Mavic)

🎮 GAMING Y TECH:
- cat-gaming: Accesorios gaming (Razer, Logitech G)
- cat-networking: Redes (router, NAS, mesh wifi)
- cat-storage: Almacenamiento (SSD, disco duro)
- cat-peripherals: Periféricos (teclado, ratón, webcam)

👶 BEBÉS Y NIÑOS:
- cat-baby-strollers: Carritos y sillas paseo (Bugaboo, Babyzen Yoyo, Stokke)
- cat-baby-car-seats: Sillas de coche (Cybex, Maxi-Cosi)
- cat-baby-furniture: Mobiliario bebé (cuna, trona)
- cat-toys: Juguetes (LEGO, Playmobil)

🏡 HOGAR:
- cat-furniture: Muebles (sofá, mesa, cama, colchón)
- cat-garden: Jardín (cortacésped, barbacoa)
- cat-lighting: Iluminación (lámparas, Philips Hue)
- cat-home-decor: Decoración

🏃 DEPORTE:
- cat-fitness: Fitness (cinta correr, bicicleta estática, pesas)
- cat-bikes: Bicicletas (MTB, carretera, gravel)
- cat-sports: Equipamiento deportivo (golf, tenis, pádel, esquí)
- cat-outdoor: Outdoor y camping

👟 CALZADO Y ROPA:
- cat-footwear: Calzado (zapatillas, botas, running, trail, hiking, Quechua, Salomon, Nike, Adidas)
- cat-clothing: Ropa (chaquetas, abrigos, cazadoras, sudaderas, pantalones, Gore-Tex)

👜 MODA Y LUJO:
- cat-fashion-luxury: Moda de lujo (Louis Vuitton, Gucci, Chanel)
- cat-watches-jewelry: Relojes y joyería (Rolex, Omega, Cartier)
- cat-bags: Bolsos y maletas

🎸 MÚSICA:
- cat-instruments: Instrumentos (guitarra, piano, batería)
- cat-music-equipment: Equipos DJ/música (mezclador, amplificador)

🔧 HERRAMIENTAS:
- cat-tools: Herramientas manuales
- cat-power-tools: Herramientas eléctricas (Bosch, Makita, DeWalt)

🏍️ VEHÍCULOS:
- cat-motorcycles: Motos y ciclomotores
- cat-car-parts: Recambios y accesorios de coche

📦 OTROS:
- cat-collectibles: Coleccionismo (vinilos, cartas, Funko)
- cat-books-media: Libros y medios
- cat-other: Otros (si no encaja en ninguna)

INSTRUCCIONES:
1. Analiza marca, modelo y descripción del producto
2. Responde SOLO con el ID de categoría (ej: cat-baby-strollers)
3. Si no estás seguro, usa la categoría más probable
4. Solo responde "cat-other" si realmente no encaja en ninguna`;

export async function POST(request: Request) {
  try {
    const { brand, model, variant, description } = await request.json();

    if (!brand && !model && !description) {
      return NextResponse.json(
        { error: "Se requiere al menos marca, modelo o descripción" },
        { status: 400 }
      );
    }

    // Construir la descripción del producto
    const productDescription = [brand, model, variant, description].filter(Boolean).join(" ");

    // Primero intentar con keywords locales (más rápido y gratis)
    const lowerDesc = productDescription.toLowerCase();
    for (const cat of CATEGORIES) {
      const matchCount = cat.keywords.filter(keyword => lowerDesc.includes(keyword)).length;
      if (matchCount >= 1) {
        // Si hay match de keyword, verificar con más precisión
        if (matchCount >= 2 || cat.keywords.some(k => lowerDesc.includes(k) && k.length > 4)) {
          console.log(`📂 Categoría por keywords: ${cat.name} (${cat.id})`);
          return NextResponse.json({ 
            categoryId: cat.id, 
            categoryName: cat.name,
            confidence: "high",
            method: "keywords"
          });
        }
      }
    }

    // Si no hay match claro por keywords, usar GPT
    console.log(`🤖 Inferiendo categoría con IA para: ${productDescription}`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Producto: ${productDescription}` },
      ],
      temperature: 0,
      max_tokens: 30,
    });

    const response = completion.choices[0]?.message?.content?.trim().toLowerCase() || "cat-other";
    
    // Limpiar respuesta (a veces GPT añade texto extra)
    const categoryId = CATEGORY_IDS.find(id => response.includes(id)) || "cat-other";
    
    // Buscar info de la categoría
    const matchedCategory = CATEGORIES.find(cat => cat.id === categoryId);
    
    console.log(`✅ Categoría inferida: ${matchedCategory?.name || "Otros"} (${categoryId})`);
    
    return NextResponse.json({
      categoryId: matchedCategory?.id || "cat-other",
      categoryName: matchedCategory?.name || "Otros",
      confidence: categoryId === "cat-other" ? "low" : "medium",
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
