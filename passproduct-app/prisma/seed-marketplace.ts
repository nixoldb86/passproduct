import { PrismaClient, ProductCondition, ListingStatus, VerificationLevel } from "@prisma/client";

const prisma = new PrismaClient();

// Ciudades españolas con coordenadas
const locations = [
  { city: "Madrid", lat: 40.4168, lng: -3.7038 },
  { city: "Barcelona", lat: 41.3851, lng: 2.1734 },
  { city: "Valencia", lat: 39.4699, lng: -0.3763 },
  { city: "Sevilla", lat: 37.3891, lng: -5.9845 },
  { city: "Bilbao", lat: 43.2630, lng: -2.9350 },
  { city: "Zaragoza", lat: 41.6488, lng: -0.8891 },
  { city: "Málaga", lat: 36.7213, lng: -4.4214 },
  { city: "Murcia", lat: 37.9922, lng: -1.1307 },
  { city: "Palma de Mallorca", lat: 39.5696, lng: 2.6502 },
  { city: "Las Palmas", lat: 28.1235, lng: -15.4363 },
  { city: "Alicante", lat: 38.3452, lng: -0.4810 },
  { city: "Córdoba", lat: 37.8882, lng: -4.7794 },
  { city: "Valladolid", lat: 41.6523, lng: -4.7245 },
  { city: "Vigo", lat: 42.2406, lng: -8.7207 },
  { city: "Gijón", lat: 43.5453, lng: -5.6635 },
  { city: "Granada", lat: 37.1773, lng: -3.5986 },
  { city: "A Coruña", lat: 43.3623, lng: -8.4115 },
  { city: "Vitoria-Gasteiz", lat: 42.8467, lng: -2.6716 },
  { city: "San Sebastián", lat: 43.3183, lng: -1.9812 },
  { city: "Santander", lat: 43.4623, lng: -3.8100 },
];

// Nombres españoles realistas
const firstNames = [
  "Carlos", "María", "Alejandro", "Laura", "Pablo", "Ana", "David", "Carmen",
  "Javier", "Lucía", "Sergio", "Marta", "Daniel", "Elena", "Adrián", "Sara",
  "Roberto", "Cristina", "Fernando", "Patricia", "Miguel", "Raquel", "Iván", "Beatriz",
  "Álvaro", "Sandra", "Rubén", "Nuria", "Mario", "Isabel"
];

const lastNames = [
  "García", "López", "Martínez", "Sánchez", "Fernández", "González", "Rodríguez",
  "Pérez", "Gómez", "Ruiz", "Díaz", "Hernández", "Moreno", "Muñoz", "Álvarez",
  "Romero", "Jiménez", "Torres", "Blanco", "Navarro", "Domínguez", "Vázquez"
];

// Generar usuarios vendedores
function generateSellers(count: number) {
  const sellers = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const gender = ["men", "women"][i % 2];
    const photoId = 20 + i;
    sellers.push({
      clerkId: `user_marketplace_${i + 1}`,
      email: `seller${i + 1}@passproduct.demo`,
      firstName,
      lastName,
      avatarUrl: `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`,
      country: "ES",
      isIdentityVerified: i % 3 === 0, // 33% verificados
    });
  }
  return sellers;
}

// Datos de productos por categoría con información realista
const productData = [
  // === SMARTPHONES (20 productos) ===
  {
    category: "smartphones",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    variant: "256GB Titanio Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1469,
    price: 1150,
    title: "iPhone 15 Pro Max 256GB Negro - Impecable con garantía",
    description: "Vendo iPhone 15 Pro Max en perfecto estado. Comprado en septiembre 2024 en Apple Store. Siempre usado con funda y protector de pantalla de cristal templado. Batería al 99%. Incluye caja original, cargador USB-C y cable. Factura disponible para garantía. Motivo de venta: cambio a Android.",
    photos: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80"],
    accessories: { cargador: true, cable: true, caja: true, factura: true },
    warranty: true,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Apple",
    model: "iPhone 14",
    variant: "128GB Azul",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 909,
    price: 520,
    title: "iPhone 14 128GB Azul - Muy buen estado",
    description: "iPhone 14 en muy buen estado general. Pequeña marca en esquina inferior (ver fotos) que no afecta al funcionamiento. Pantalla perfecta. Batería al 87%. Libre de operador. Incluye cargador compatible y funda de silicona.",
    photos: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80"],
    accessories: { cargador: true, funda: true },
    warranty: false,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    variant: "512GB Titanio Gris",
    condition: ProductCondition.NEW,
    purchasePrice: 1569,
    price: 1350,
    title: "Samsung S24 Ultra 512GB NUEVO PRECINTADO",
    description: "Samsung Galaxy S24 Ultra completamente nuevo y precintado. Regalo duplicado de empresa. Modelo español con garantía Samsung de 2 años. Color Titanio Gris, 512GB de almacenamiento. Incluye S Pen integrado.",
    photos: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80"],
    accessories: { caja_sellada: true },
    warranty: true,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Samsung",
    model: "Galaxy S23",
    variant: "256GB Negro",
    condition: ProductCondition.GOOD,
    purchasePrice: 959,
    price: 450,
    title: "Samsung Galaxy S23 256GB - Buen estado",
    description: "Galaxy S23 en buen estado de uso. Algún arañazo superficial en marco (típico del uso). Pantalla sin marcas. Batería al 91%. Funciona perfecto. Se entrega con cargador rápido 25W original.",
    photos: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80"],
    accessories: { cargador: true },
    warranty: false,
    verified: false,
  },
  {
    category: "smartphones",
    brand: "Xiaomi",
    model: "14 Ultra",
    variant: "512GB Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1299,
    price: 999,
    title: "Xiaomi 14 Ultra - Cámara Leica increíble",
    description: "Xiaomi 14 Ultra en estado impecable. La mejor cámara del mercado con óptica Leica. Apenas 2 meses de uso. Incluye funda original de cuero y cargador 90W. Perfecto para fotografía móvil profesional.",
    photos: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"],
    accessories: { cargador: true, funda: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Google",
    model: "Pixel 8 Pro",
    variant: "256GB Obsidiana",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1099,
    price: 780,
    title: "Google Pixel 8 Pro 256GB - Fotografía pura",
    description: "Pixel 8 Pro prácticamente nuevo. Las mejores fotos con IA de Google. Android puro con 7 años de actualizaciones garantizadas. Incluye todos los accesorios originales y factura de Google Store.",
    photos: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80"],
    accessories: { cargador: true, cable: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "OnePlus",
    model: "12",
    variant: "256GB Verde",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 899,
    price: 620,
    title: "OnePlus 12 256GB - Potencia bestial",
    description: "OnePlus 12 en muy buen estado. Snapdragon 8 Gen 3, el más potente. Carga 100W en 25 minutos. Pantalla 2K 120Hz impresionante. Vendo por cambio a iPhone. Incluye cargador SuperVOOC original.",
    photos: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80"],
    accessories: { cargador: true, cable: true },
    warranty: false,
    verified: false,
  },

  // === LAPTOPS (15 productos) ===
  {
    category: "laptops",
    brand: "Apple",
    model: "MacBook Pro 14\"",
    variant: "M3 Pro 18GB 512GB",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 2499,
    price: 2100,
    title: "MacBook Pro 14 M3 Pro - Máquina de trabajo",
    description: "MacBook Pro 14 pulgadas con chip M3 Pro. Configuración potente: 18GB RAM y 512GB SSD. Ciclos de batería: 42. Pantalla XDR espectacular. Perfecto para desarrollo, diseño o edición de vídeo. Incluye cargador 96W MagSafe.",
    photos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"],
    accessories: { cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "laptops",
    brand: "Apple",
    model: "MacBook Air 15\"",
    variant: "M3 16GB 512GB Medianoche",
    condition: ProductCondition.NEW,
    purchasePrice: 1999,
    price: 1750,
    title: "MacBook Air 15 M3 NUEVO - Regalo duplicado",
    description: "MacBook Air 15\" con M3 completamente nuevo. Precintado de fábrica. Regalo de boda duplicado. Configuración top: 16GB RAM, 512GB SSD. Color Medianoche. Factura Apple Store para garantía completa.",
    photos: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80"],
    accessories: { caja_sellada: true, factura: true },
    warranty: true,
    verified: true,
  },
  {
    category: "laptops",
    brand: "Lenovo",
    model: "ThinkPad X1 Carbon Gen 11",
    variant: "i7-1365U 16GB 512GB",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1899,
    price: 1100,
    title: "ThinkPad X1 Carbon - El portátil profesional",
    description: "ThinkPad X1 Carbon de 11ª generación. Intel i7, 16GB RAM, 512GB SSD. Pantalla 14\" 2.8K OLED increíble. Teclado legendario ThinkPad. 890 gramos de peso. Perfecto para trabajo híbrido. Batería 8+ horas reales.",
    photos: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80"],
    accessories: { cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "laptops",
    brand: "ASUS",
    model: "ROG Zephyrus G14",
    variant: "Ryzen 9 RTX 4070 32GB",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1999,
    price: 1550,
    title: "ASUS ROG Zephyrus G14 - Gaming portátil top",
    description: "El mejor portátil gaming en 14 pulgadas. Ryzen 9 7940HS + RTX 4070. 32GB RAM, 1TB SSD. Pantalla 165Hz QHD+ increíble para jugar. Solo 1.5kg de peso. Usado 3 meses, como nuevo.",
    photos: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"],
    accessories: { cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "laptops",
    brand: "Dell",
    model: "XPS 15 9530",
    variant: "i7-13700H 32GB 1TB",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 2199,
    price: 1450,
    title: "Dell XPS 15 - Pantalla OLED impresionante",
    description: "Dell XPS 15 con pantalla OLED 3.5K táctil. Colores perfectos para edición foto/vídeo. i7 de 13ª gen, 32GB RAM, 1TB SSD. Diseño premium todo aluminio. Webcam IR para Windows Hello.",
    photos: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80"],
    accessories: { cargador: true },
    warranty: false,
    verified: true,
  },
  {
    category: "laptops",
    brand: "HP",
    model: "Spectre x360 14",
    variant: "i7 Evo 16GB 1TB",
    condition: ProductCondition.GOOD,
    purchasePrice: 1699,
    price: 850,
    title: "HP Spectre x360 - Convertible elegante",
    description: "HP Spectre x360 convertible 2-en-1. Pantalla OLED 14\" táctil que gira 360°. Modo tablet con stylus incluido. Intel i7 Evo, 16GB RAM. Carcasa premium en negro y dorado. Perfecto para creativos.",
    photos: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"],
    accessories: { cargador: true, stylus: true },
    warranty: false,
    verified: false,
  },

  // === CONSOLAS (12 productos) ===
  {
    category: "consoles",
    brand: "Sony",
    model: "PlayStation 5",
    variant: "Edición Disco 1TB",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 549,
    price: 400,
    title: "PS5 con lector de discos - 2 mandos",
    description: "PlayStation 5 versión con lector de discos. Incluye 2 mandos DualSense (blanco y negro). Base vertical incluida. Funciona perfecto. Vendo porque apenas juego ya. Posibilidad de incluir juegos.",
    photos: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80", "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80"],
    accessories: { mando_extra: true, base_vertical: true, cable_hdmi: true },
    warranty: false,
    verified: true,
  },
  {
    category: "consoles",
    brand: "Sony",
    model: "PlayStation 5",
    variant: "Digital Edition",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 449,
    price: 350,
    title: "PS5 Digital impecable - Poco uso",
    description: "PS5 Digital Edition prácticamente nueva. Comprada hace 6 meses pero apenas la he usado (trabajo mucho). Mando DualSense sin deriva. Caja y accesorios originales. Regalo tarjeta PSN 20€.",
    photos: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80"],
    accessories: { mando: true, cable_hdmi: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "consoles",
    brand: "Microsoft",
    model: "Xbox Series X",
    variant: "1TB Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 499,
    price: 380,
    title: "Xbox Series X - La más potente",
    description: "Xbox Series X en muy buen estado. La consola más potente del mercado. 4K nativo a 120fps. 1TB SSD ultra rápido. Incluye mando y Game Pass Ultimate 3 meses. Silenciosa y sin problemas.",
    photos: ["https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80"],
    accessories: { mando: true, gamepass: true },
    warranty: false,
    verified: true,
  },
  {
    category: "consoles",
    brand: "Nintendo",
    model: "Switch OLED",
    variant: "Blanco",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 349,
    price: 280,
    title: "Nintendo Switch OLED blanca - Como nueva",
    description: "Switch OLED modelo blanco. Pantalla OLED espectacular, mucho mejor que la original. Joy-Cons sin drift. Dock incluido. Base de carga Pro Controller compatible. Cristal templado puesto desde el día 1.",
    photos: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80"],
    accessories: { dock: true, joycons: true, grip: true },
    warranty: true,
    verified: true,
  },
  {
    category: "consoles",
    brand: "Nintendo",
    model: "Switch Lite",
    variant: "Turquesa",
    condition: ProductCondition.GOOD,
    purchasePrice: 199,
    price: 130,
    title: "Nintendo Switch Lite turquesa + funda",
    description: "Switch Lite en buen estado. Algunos arañazos en carcasa (de uso normal). Pantalla perfecta con protector. Batería dura bien. Ideal como segunda consola o para niños. Incluye funda de transporte.",
    photos: ["https://images.unsplash.com/photo-1569429593410-b498b3fb3387?w=800&q=80"],
    accessories: { funda: true, cargador: true },
    warranty: false,
    verified: false,
  },
  {
    category: "consoles",
    brand: "Valve",
    model: "Steam Deck",
    variant: "512GB OLED",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 679,
    price: 580,
    title: "Steam Deck OLED 512GB - PC gaming portátil",
    description: "Steam Deck OLED, la versión mejorada. Pantalla OLED HDR increíble. 512GB de almacenamiento. Toda tu biblioteca de Steam en el bolsillo. Incluye dock USB-C y funda original. Comprada en noviembre 2024.",
    photos: ["https://images.unsplash.com/photo-1640955014216-75201056c829?w=800&q=80"],
    accessories: { dock: true, funda: true, cargador: true },
    warranty: true,
    verified: true,
  },

  // === AUDIO (15 productos) ===
  {
    category: "audio",
    brand: "Apple",
    model: "AirPods Pro 2",
    variant: "USB-C",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 279,
    price: 200,
    title: "AirPods Pro 2 USB-C - Cancelación brutal",
    description: "AirPods Pro 2ª generación con estuche USB-C. Cancelación de ruido adaptativa increíble. Audio espacial con seguimiento de cabeza. Puntas de silicona talla M y S. Comprados en Apple hace 4 meses.",
    photos: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80"],
    accessories: { estuche: true, puntas_extra: true },
    warranty: true,
    verified: true,
  },
  {
    category: "audio",
    brand: "Apple",
    model: "AirPods Max",
    variant: "Gris Espacial",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 579,
    price: 380,
    title: "AirPods Max Gris - Sonido premium",
    description: "AirPods Max en muy buen estado. El mejor sonido de Apple. Cancelación de ruido top. Almohadillas sin desgaste. Batería excelente (20+ horas). Incluye Smart Case original y cable Lightning.",
    photos: ["https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80"],
    accessories: { smart_case: true, cable: true },
    warranty: false,
    verified: true,
  },
  {
    category: "audio",
    brand: "Sony",
    model: "WH-1000XM5",
    variant: "Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 379,
    price: 270,
    title: "Sony XM5 negros - Los mejores auriculares",
    description: "Sony WH-1000XM5, los mejores auriculares con cancelación de ruido del mercado. Estado impecable. 30 horas de batería. Multipoint para dos dispositivos. Incluye estuche y cables originales.",
    photos: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    accessories: { estuche: true, cable_audio: true, cable_usb: true },
    warranty: true,
    verified: true,
  },
  {
    category: "audio",
    brand: "Sony",
    model: "WF-1000XM5",
    variant: "Plata",
    condition: ProductCondition.NEW,
    purchasePrice: 299,
    price: 250,
    title: "Sony WF-1000XM5 NUEVOS precintados",
    description: "Sony WF-1000XM5 completamente nuevos y precintados. Los mejores in-ear del mundo. Regalo de empresa repetido. Color plata/champagne. Garantía Sony completa.",
    photos: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80"],
    accessories: { caja_sellada: true },
    warranty: true,
    verified: true,
  },
  {
    category: "audio",
    brand: "Bose",
    model: "QuietComfort Ultra",
    variant: "Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 499,
    price: 350,
    title: "Bose QC Ultra - Confort supremo",
    description: "Bose QuietComfort Ultra, los más cómodos del mercado. Audio inmersivo espacial. Cancelación de ruido excelente. Usado 6 meses para teletrabajo. Incluye todos los accesorios.",
    photos: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"],
    accessories: { estuche: true, cable: true, adaptador_avion: true },
    warranty: true,
    verified: true,
  },
  {
    category: "audio",
    brand: "Sennheiser",
    model: "Momentum 4",
    variant: "Grafito",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 349,
    price: 250,
    title: "Sennheiser Momentum 4 - Sonido audiófilo",
    description: "Sennheiser Momentum 4 Wireless. Sonido de calidad audiófila. 60 horas de batería increíbles. Plegables y muy portátiles. Controles táctiles en las copas. Ecualizador en app.",
    photos: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80"],
    accessories: { estuche: true, cable: true },
    warranty: true,
    verified: false,
  },
  {
    category: "audio",
    brand: "Sonos",
    model: "Era 300",
    variant: "Blanco",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 499,
    price: 380,
    title: "Sonos Era 300 - Audio espacial Dolby Atmos",
    description: "Sonos Era 300 blanco. Altavoz inteligente con Dolby Atmos y audio espacial. 6 drivers para sonido envolvente real. WiFi y Bluetooth. Comprado hace 3 meses. Como nuevo.",
    photos: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80"],
    accessories: { cable_alimentacion: true },
    warranty: true,
    verified: true,
  },
  {
    category: "audio",
    brand: "JBL",
    model: "Charge 5",
    variant: "Azul",
    condition: ProductCondition.GOOD,
    purchasePrice: 189,
    price: 100,
    title: "JBL Charge 5 azul - Altavoz todoterreno",
    description: "JBL Charge 5 en buen estado. Resistente al agua IP67. Batería de 20 horas. Puede cargar el móvil. Sonido potente para exteriores. Algunas marcas de uso pero funciona perfecto.",
    photos: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"],
    accessories: { cable_usb: true },
    warranty: false,
    verified: false,
  },

  // === WEARABLES (10 productos) ===
  {
    category: "wearables",
    brand: "Apple",
    model: "Apple Watch Ultra 2",
    variant: "49mm Titanio",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 899,
    price: 720,
    title: "Apple Watch Ultra 2 - El reloj aventurero",
    description: "Apple Watch Ultra 2 en estado impecable. Pantalla más brillante del mercado (3000 nits). GPS de doble frecuencia ultra preciso. Buceo hasta 40m. Incluye 3 correas: Alpine, Trail y Ocean.",
    photos: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80"],
    accessories: { correa_alpine: true, correa_trail: true, correa_ocean: true, cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "wearables",
    brand: "Apple",
    model: "Apple Watch Series 9",
    variant: "45mm GPS Aluminio",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 449,
    price: 320,
    title: "Apple Watch S9 45mm - Salud y fitness",
    description: "Apple Watch Series 9 de 45mm en aluminio Medianoche. GPS. Sensor de oxígeno en sangre y ECG. Detección de caídas. Muy buen estado con cristal sin marcas. Correa deportiva negra.",
    photos: ["https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80"],
    accessories: { correa: true, cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "wearables",
    brand: "Samsung",
    model: "Galaxy Watch 6 Classic",
    variant: "47mm Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 429,
    price: 300,
    title: "Galaxy Watch 6 Classic - Bisel giratorio",
    description: "Samsung Galaxy Watch 6 Classic con bisel giratorio físico. El mejor smartwatch Android. Pantalla Super AMOLED 1.5\". GPS, NFC, monitorización avanzada de sueño. Como nuevo.",
    photos: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80"],
    accessories: { correa_extra: true, cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "wearables",
    brand: "Garmin",
    model: "Fenix 7X Pro",
    variant: "Sapphire Solar",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 999,
    price: 650,
    title: "Garmin Fenix 7X Pro Solar - El rey del outdoor",
    description: "Garmin Fenix 7X Pro con carga solar y cristal de zafiro. El reloj definitivo para trail, montaña y triatlón. Mapas topográficos. Batería de semanas. Linterna LED integrada. Muy buen estado.",
    photos: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
    accessories: { cargador: true, correa_extra: true },
    warranty: false,
    verified: true,
  },
  {
    category: "wearables",
    brand: "Garmin",
    model: "Forerunner 265",
    variant: "Negro/Gris",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 449,
    price: 350,
    title: "Garmin FR 265 - El runner perfecto",
    description: "Garmin Forerunner 265 con pantalla AMOLED. El mejor reloj para running. Métricas de entrenamiento avanzadas. Planes adaptativos. GPS preciso. Comprado hace 2 meses, apenas usado.",
    photos: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80"],
    accessories: { cargador: true, caja: true },
    warranty: true,
    verified: true,
  },

  // === TABLETS (8 productos) ===
  {
    category: "tablets",
    brand: "Apple",
    model: "iPad Pro 12.9\"",
    variant: "M2 256GB WiFi",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1449,
    price: 950,
    title: "iPad Pro 12.9 M2 - La tablet profesional",
    description: "iPad Pro 12.9\" con chip M2. Pantalla Liquid Retina XDR ProMotion 120Hz. 256GB WiFi. Perfecto para diseño, ilustración y productividad. Compatible con Apple Pencil 2 y Magic Keyboard.",
    photos: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80"],
    accessories: { cargador: true, cable: true },
    warranty: true,
    verified: true,
  },
  {
    category: "tablets",
    brand: "Apple",
    model: "iPad Air",
    variant: "M2 256GB Azul",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 799,
    price: 650,
    title: "iPad Air M2 Azul - Potencia y ligereza",
    description: "iPad Air con chip M2, 256GB, color Azul. El equilibrio perfecto entre potencia y portabilidad. Pantalla 10.9\" Liquid Retina. Touch ID en botón. Comprado en octubre 2024, impecable.",
    photos: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80"],
    accessories: { cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "tablets",
    brand: "Samsung",
    model: "Galaxy Tab S9 Ultra",
    variant: "512GB Grafito",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1299,
    price: 950,
    title: "Samsung Tab S9 Ultra - Pantalla gigante AMOLED",
    description: "Galaxy Tab S9 Ultra con pantalla de 14.6\" Dynamic AMOLED 2X. La tablet Android más grande y potente. S Pen incluido. 512GB. DeX para usar como PC. Estado impecable.",
    photos: ["https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80"],
    accessories: { s_pen: true, cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "tablets",
    brand: "Apple",
    model: "iPad 10ª gen",
    variant: "64GB Rosa",
    condition: ProductCondition.GOOD,
    purchasePrice: 449,
    price: 300,
    title: "iPad 10 generación Rosa - Para el día a día",
    description: "iPad de 10ª generación en color Rosa. 64GB WiFi. Pantalla 10.9\". Chip A14 Bionic. USB-C. Perfecto para consumo multimedia, estudios y uso casual. Pequeña marca en esquina.",
    photos: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80"],
    accessories: { cargador: true },
    warranty: false,
    verified: false,
  },

  // === CÁMARAS (8 productos) ===
  {
    category: "cameras",
    brand: "Sony",
    model: "Alpha 7 IV",
    variant: "Cuerpo",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 2699,
    price: 1900,
    title: "Sony A7 IV - Full frame híbrida",
    description: "Sony Alpha 7 IV solo cuerpo. 33MP full frame. Vídeo 4K 60p 10-bit. Autofocus con seguimiento de ojos brutal. Estabilización de 5 ejes. Disparos: 15.000. Incluye batería extra original.",
    photos: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80"],
    accessories: { bateria_extra: true, correa: true, cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "cameras",
    brand: "Canon",
    model: "EOS R6 Mark II",
    variant: "Cuerpo",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 2829,
    price: 2200,
    title: "Canon R6 Mark II - Velocidad extrema",
    description: "Canon EOS R6 Mark II, la mejor cámara para acción y eventos. 40fps en ráfaga. 4K 60p oversampled. Autofocus con detección de vehículos. Apenas 5.000 disparos. Estado impecable.",
    photos: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80"],
    accessories: { bateria: true, cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "cameras",
    brand: "Fujifilm",
    model: "X-T5",
    variant: "Plata + 18-55mm",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 2199,
    price: 1750,
    title: "Fujifilm X-T5 plata + kit - Estética retro",
    description: "Fujifilm X-T5 en plata con objetivo 18-55mm f/2.8-4. 40MP APS-C. Simulaciones de película legendarias. Diseño retro precioso. Vídeo 6.2K. Apenas usada, comprada para viaje.",
    photos: ["https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&q=80"],
    accessories: { objetivo_18_55: true, bateria: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "cameras",
    brand: "DJI",
    model: "Osmo Pocket 3",
    variant: "Creator Combo",
    condition: ProductCondition.NEW,
    purchasePrice: 669,
    price: 580,
    title: "DJI Pocket 3 Creator NUEVO - Vlog perfecto",
    description: "DJI Osmo Pocket 3 Creator Combo nuevo precintado. Sensor 1 pulgada, 4K 120fps. Gimbal de 3 ejes. Pantalla giratoria. Micrófono inalámbrico incluido. Perfecto para creadores de contenido.",
    photos: ["https://images.unsplash.com/photo-1617859047452-8510bcf207fd?w=800&q=80"],
    accessories: { caja_sellada: true },
    warranty: true,
    verified: true,
  },

  // === TV (5 productos) ===
  {
    category: "tv",
    brand: "LG",
    model: "OLED C3",
    variant: "55\" 4K",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1399,
    price: 950,
    title: "LG OLED C3 55\" - Cine en casa",
    description: "LG OLED55C3 en perfecto estado. Negros infinitos, colores espectaculares. 4K 120Hz con HDMI 2.1 para gaming. Dolby Vision y Atmos. WebOS 23. Comprada en enero 2024. Sin burn-in.",
    photos: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80"],
    accessories: { mando: true, cable_alimentacion: true },
    warranty: true,
    verified: true,
  },
  {
    category: "tv",
    brand: "Samsung",
    model: "Neo QLED QN90C",
    variant: "65\" 4K",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1799,
    price: 1100,
    title: "Samsung QN90C 65\" - Brillo extremo",
    description: "Samsung Neo QLED QN90C de 65 pulgadas. Mini LED con brillo brutal, ideal para salones luminosos. Gaming Hub integrado. 4K 144Hz. Tizen OS. Perfecta para día y noche.",
    photos: ["https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80"],
    accessories: { mando: true, cable: true },
    warranty: true,
    verified: true,
  },
  {
    category: "tv",
    brand: "Sony",
    model: "Bravia XR A80L",
    variant: "55\" OLED",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1599,
    price: 1150,
    title: "Sony A80L OLED 55\" - Procesador XR",
    description: "Sony Bravia XR A80L OLED de 55\". Procesador XR Cognitive para imagen realista. Acoustic Surface Audio+, el sonido sale de la pantalla. Google TV. Perfecto para cine y series.",
    photos: ["https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80"],
    accessories: { mando: true, caja: true },
    warranty: true,
    verified: true,
  },

  // === BICICLETAS ELÉCTRICAS (5 productos) ===
  {
    category: "ebikes",
    brand: "VanMoof",
    model: "S5",
    variant: "Gris Oscuro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 2998,
    price: 1500,
    title: "VanMoof S5 - Diseño holandés premium",
    description: "VanMoof S5 en muy buen estado. Motor 250W con boost hasta 68Nm. Cambio automático de 4 velocidades. Antirrobo integrado. App con todas las funciones. Batería al 95%. Km: 1.200.",
    photos: ["https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80"],
    accessories: { cargador: true, llave_fisica: true },
    warranty: false,
    verified: true,
  },
  {
    category: "ebikes",
    brand: "Cowboy",
    model: "Cowboy 4",
    variant: "Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 2990,
    price: 1800,
    title: "Cowboy 4 - La e-bike urbana perfecta",
    description: "Cowboy 4 en estado impecable. Motor de 250W, 45Nm. Batería extraíble 70km autonomía. Detección automática de subidas. Pantalla integrada. GPS antirrobo. Solo 500km recorridos.",
    photos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    accessories: { cargador: true, candado: true },
    warranty: true,
    verified: true,
  },

  // === PATINETES ELÉCTRICOS (4 productos) ===
  {
    category: "scooters",
    brand: "Xiaomi",
    model: "Electric Scooter 4 Pro",
    variant: "Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 699,
    price: 450,
    title: "Xiaomi Scooter 4 Pro - 25km/h legal",
    description: "Xiaomi Electric Scooter 4 Pro en muy buen estado. Motor 350W nominal (700W pico). 25km/h velocidad DGT. Autonomía 45km. Neumáticos 10\" tubeless. Freno de disco. App Mi Home.",
    photos: ["https://images.unsplash.com/photo-1604868189265-219ba7ffc5f5?w=800&q=80"],
    accessories: { cargador: true },
    warranty: false,
    verified: true,
  },
  {
    category: "scooters",
    brand: "Segway",
    model: "Ninebot Max G2",
    variant: "Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 949,
    price: 700,
    title: "Ninebot Max G2 - El tanque de los patinetes",
    description: "Segway Ninebot Max G2 prácticamente nuevo. Autonomía de 70km reales. Suspensión delantera y trasera. Ruedas 10\" resistentes a pinchazos. Carga rápida. Apple Find My integrado.",
    photos: ["https://images.unsplash.com/photo-1604868189265-219ba7ffc5f5?w=800&q=80"],
    accessories: { cargador: true, caja: true },
    warranty: true,
    verified: true,
  },

  // === DRONES (3 productos) ===
  {
    category: "drones",
    brand: "DJI",
    model: "Mini 4 Pro",
    variant: "Fly More Combo",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1039,
    price: 850,
    title: "DJI Mini 4 Pro Fly More - Menos de 249g",
    description: "DJI Mini 4 Pro con combo Fly More. Menos de 249g = sin licencia. 4K 100fps HDR. Detección de obstáculos 360°. 3 baterías (34min cada una). Usado solo 10 veces. Como nuevo.",
    photos: ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80"],
    accessories: { baterias_3: true, mando: true, estuche: true, cargador_hub: true },
    warranty: true,
    verified: true,
  },
  {
    category: "drones",
    brand: "DJI",
    model: "Air 3",
    variant: "Combo",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1349,
    price: 1050,
    title: "DJI Air 3 Combo - Doble cámara profesional",
    description: "DJI Air 3 con doble cámara (24mm y 70mm). Sensor dual 1/1.3\". 4K 60fps en ambas. 46 min de vuelo. Seguimiento ActiveTrack 5.0. Combo con 3 baterías y estuche.",
    photos: ["https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800&q=80"],
    accessories: { baterias_3: true, mando: true, estuche: true, filtros_nd: true },
    warranty: true,
    verified: true,
  },

  // === MUEBLES (5 productos) ===
  {
    category: "furniture",
    brand: "IKEA",
    model: "MALM",
    variant: "Cama 160cm roble",
    condition: ProductCondition.GOOD,
    purchasePrice: 299,
    price: 120,
    title: "Cama IKEA MALM 160cm roble - Con colchón",
    description: "Cama MALM de IKEA en roble, 160x200cm. Incluye somier de láminas LURÖY. Estado general bueno. Algunas marcas de uso normales. Regalo colchón HÖVÅG en buen estado. Solo recogida en persona.",
    photos: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80"],
    accessories: { somier: true, colchon: true },
    warranty: false,
    verified: false,
  },
  {
    category: "furniture",
    brand: "Herman Miller",
    model: "Aeron",
    variant: "Size B Grafito",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1599,
    price: 850,
    title: "Herman Miller Aeron B - La silla definitiva",
    description: "Herman Miller Aeron tamaño B (el más común). Color grafito. Brazos 4D ajustables. Soporte lumbar PostureFit SL. Ruedas para suelo duro. De oficina premium, muy bien cuidada.",
    photos: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80"],
    accessories: { ruedas: true },
    warranty: true,
    verified: true,
  },

  // === INSTRUMENTOS MUSICALES (4 productos) ===
  {
    category: "instruments",
    brand: "Fender",
    model: "Player Stratocaster",
    variant: "Sunburst",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 849,
    price: 550,
    title: "Fender Player Strat MX - Sunburst clásico",
    description: "Fender Player Stratocaster Made in Mexico. Color 3-Color Sunburst con mástil de arce. Pastillas Alnico V. Trémolo clásico. Trastes en buen estado. Incluye funda acolchada.",
    photos: ["https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&q=80"],
    accessories: { funda: true, correa: true, cable: true },
    warranty: false,
    verified: true,
  },
  {
    category: "instruments",
    brand: "Yamaha",
    model: "P-125",
    variant: "Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 699,
    price: 480,
    title: "Yamaha P-125 - Piano digital compacto",
    description: "Yamaha P-125 en excelente estado. 88 teclas pesadas GHS. Sonido de piano de cola CFX. Polifonía 192 voces. Incluye pedal sustain y soporte de partituras. Apenas usado.",
    photos: ["https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80"],
    accessories: { pedal: true, atril: true, adaptador: true },
    warranty: true,
    verified: true,
  },

  // === FITNESS (4 productos) ===
  {
    category: "fitness",
    brand: "Technogym",
    model: "MyRun",
    variant: "Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 3500,
    price: 1800,
    title: "Technogym MyRun - Cinta de correr premium",
    description: "Cinta Technogym MyRun, la Rolls Royce de las cintas. Superficie amortiguada, silenciosa. Plegable. Conecta con apps de entrenamiento. Poco uso doméstico. Transporte a cargo del comprador.",
    photos: ["https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80"],
    accessories: { llave_seguridad: true, alfombra: true },
    warranty: false,
    verified: true,
  },
  {
    category: "fitness",
    brand: "Peloton",
    model: "Bike+",
    variant: "Negro",
    condition: ProductCondition.GOOD,
    purchasePrice: 2495,
    price: 1200,
    title: "Peloton Bike+ - Spinning con clases",
    description: "Peloton Bike+ con pantalla giratoria de 24\". Perfecta para clases en directo y bajo demanda. Resistencia automática. Altavoces integrados. Zapatillas Peloton incluidas (talla 42).",
    photos: ["https://images.unsplash.com/photo-1591741535018-d4dc7e6e5d69?w=800&q=80"],
    accessories: { zapatillas: true, mancuernas: true },
    warranty: false,
    verified: true,
  },

  // === HERRAMIENTAS (2 productos) ===
  {
    category: "power-tools",
    brand: "Makita",
    model: "DHP453",
    variant: "18V Set",
    condition: ProductCondition.GOOD,
    purchasePrice: 299,
    price: 150,
    title: "Makita taladro percutor 18V + 2 baterías",
    description: "Taladro percutor Makita DHP453 con 2 baterías 18V 3Ah y cargador. Par de 42Nm. 2 velocidades. Mandril 13mm. Usado en bricolaje doméstico. Funciona perfecto. Maletín incluido.",
    photos: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80"],
    accessories: { baterias_2: true, cargador: true, maletin: true },
    warranty: false,
    verified: false,
  },

  // === RELOJES DE LUJO (2 productos) ===
  {
    category: "watches-jewelry",
    brand: "Tudor",
    model: "Black Bay 58",
    variant: "Navy Blue",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 4150,
    price: 3600,
    title: "Tudor Black Bay 58 Azul - Set completo",
    description: "Tudor Black Bay 58 en versión azul. 39mm perfectos. Calibre MT5402 COSC. Cristal zafiro. Comprado en joyería oficial en 2024. Set completo con caja, papeles y garantía Tudor.",
    photos: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
    accessories: { caja_completa: true, papeles: true, correa_extra: true },
    warranty: true,
    verified: true,
  },
  {
    category: "watches-jewelry",
    brand: "Omega",
    model: "Speedmaster Moonwatch",
    variant: "Hesalite",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 7100,
    price: 5800,
    title: "Omega Speedmaster Moonwatch - El reloj lunar",
    description: "Omega Speedmaster Professional Moonwatch con cristal Hesalite (el clásico). Calibre 3861. El reloj que fue a la luna. Revisión oficial Omega en 2023. Box completo con todos los extras.",
    photos: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80"],
    accessories: { caja_lunar: true, nato_strap: true, herramienta: true },
    warranty: true,
    verified: true,
  },
];

function getRandomLocation() {
  return locations[Math.floor(Math.random() * locations.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(1, daysAgo));
  return date;
}

async function main() {
  console.log("🛒 Seeding marketplace with 100 realistic listings...\n");

  // 1. Verificar que existen las categorías
  const existingCategories = await prisma.category.findMany();
  if (existingCategories.length === 0) {
    console.error("❌ No hay categorías en la BD. Ejecuta primero: npx prisma db seed");
    process.exit(1);
  }
  const categoryMap: { [slug: string]: string } = {};
  existingCategories.forEach(c => { categoryMap[c.slug] = c.id; });
  console.log(`✅ Found ${existingCategories.length} categories\n`);

  // 2. Crear usuarios vendedores
  const sellers = generateSellers(25);
  const createdSellerIds: string[] = [];

  for (const seller of sellers) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: seller.email } });
      if (existing) {
        createdSellerIds.push(existing.id);
      } else {
        const created = await prisma.user.create({ data: seller });
        createdSellerIds.push(created.id);
        console.log(`  👤 Created seller: ${seller.firstName} ${seller.lastName}`);
      }
    } catch (e) {
      // Si ya existe por clerkId, buscarlo
      const existing = await prisma.user.findFirst({ where: { email: seller.email } });
      if (existing) createdSellerIds.push(existing.id);
    }
  }
  console.log(`\n✅ ${createdSellerIds.length} sellers ready\n`);

  // 3. Crear productos y listings
  let listingCount = 0;

  for (const item of productData) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.warn(`⚠️ Category not found: ${item.category}`);
      continue;
    }

    const sellerIdx = listingCount % createdSellerIds.length;
    const sellerId = createdSellerIds[sellerIdx];
    const loc = getRandomLocation();

    const warrantyEndDate = item.warranty
      ? new Date(Date.now() + getRandomInt(180, 730) * 24 * 60 * 60 * 1000)
      : null;

    // Crear producto
    const product = await prisma.product.create({
      data: {
        userId: sellerId,
        categoryId,
        brand: item.brand,
        model: item.model,
        variant: item.variant,
        condition: item.condition,
        purchaseDate: getRandomDate(365),
        purchasePrice: item.purchasePrice,
        warrantyEndDate,
        photos: item.photos,
        accessories: item.accessories,
      },
    });

    // Crear listing
    const daysAgo = getRandomInt(1, 60);
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Views correlacionados con antigüedad (más antiguo = más vistas)
    const baseViews = Math.floor(daysAgo * getRandomInt(3, 12));
    const viewCount = item.verified ? baseViews + getRandomInt(50, 200) : baseViews;
    const favoriteCount = Math.floor(viewCount * (getRandomInt(5, 20) / 100));

    await prisma.listing.create({
      data: {
        productId: product.id,
        sellerId,
        categoryId,
        title: item.title,
        description: item.description,
        price: item.price,
        location: loc.city,
        latitude: loc.lat,
        longitude: loc.lng,
        shippingEnabled: getRandomInt(0, 10) > 2, // 80% con envío
        shippingCost: getRandomInt(0, 10) > 5 ? 0 : getRandomInt(5, 25),
        verificationLevel: item.verified
          ? (item.warranty ? VerificationLevel.LEVEL_2 : VerificationLevel.LEVEL_1)
          : VerificationLevel.LEVEL_0,
        hasVerifiedPurchase: item.verified,
        hasValidWarranty: item.warranty,
        hasVerifiedAccessories: item.verified && getRandomInt(0, 10) > 3,
        hasVerifiedIdentifier: item.verified && getRandomInt(0, 10) > 5,
        status: ListingStatus.PUBLISHED,
        photos: item.photos,
        isBoosted: getRandomInt(0, 10) > 8, // 20% destacados
        viewCount,
        favoriteCount,
        publishedAt,
      },
    });

    listingCount++;
    console.log(`  🏷️ [${listingCount}] ${item.title.substring(0, 50)}...`);
  }

  console.log(`\n🎉 Created ${listingCount} marketplace listings!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
