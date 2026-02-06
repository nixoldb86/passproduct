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

// Más productos para completar 100 anuncios
const extraProducts = [
  // === MÁS SMARTPHONES ===
  {
    category: "smartphones",
    brand: "Apple",
    model: "iPhone 13 Pro",
    variant: "256GB Grafito",
    condition: ProductCondition.GOOD,
    purchasePrice: 1159,
    price: 480,
    title: "iPhone 13 Pro 256GB Grafito - Buen precio",
    description: "iPhone 13 Pro en buen estado general. Pantalla ProMotion 120Hz. Triple cámara profesional. Batería al 84%. Pequeños arañazos en marco de acero (normales del uso). Funciona perfecto.",
    photos: ["https://images.unsplash.com/photo-1632661674596-df8be59a4f21?w=800&q=80"],
    accessories: { cargador: true },
    warranty: false,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Samsung",
    model: "Galaxy Z Fold 5",
    variant: "512GB Crema",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1899,
    price: 1400,
    title: "Galaxy Z Fold 5 512GB - El futuro plegable",
    description: "Samsung Galaxy Z Fold 5 en estado impecable. Pantalla plegable 7.6\" sin marcas. Multitarea real con 3 apps. S Pen compatible (no incluido). Usado con fundas siempre. Factura Samsung.",
    photos: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80"],
    accessories: { funda: true, cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Samsung",
    model: "Galaxy Z Flip 5",
    variant: "256GB Lavanda",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1099,
    price: 700,
    title: "Galaxy Z Flip 5 Lavanda - Compacto y elegante",
    description: "Samsung Z Flip 5 precioso color lavanda. Pantalla externa grande para notificaciones. Se pliega y cabe en cualquier bolsillo. Batería correcta. Pliegue sin marcas visibles.",
    photos: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80"],
    accessories: { cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Nothing",
    model: "Phone 2",
    variant: "256GB Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 699,
    price: 480,
    title: "Nothing Phone 2 - Diseño único con Glyph",
    description: "Nothing Phone 2 con interfaz Glyph LED trasera única. Pantalla OLED 120Hz. Snapdragon 8+ Gen 1. Android puro sin bloatware. Comprado hace 3 meses. Estado perfecto.",
    photos: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"],
    accessories: { cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "smartphones",
    brand: "Motorola",
    model: "Edge 40 Pro",
    variant: "256GB Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 899,
    price: 450,
    title: "Motorola Edge 40 Pro - Curvas elegantes",
    description: "Motorola Edge 40 Pro con pantalla curva 165Hz. Snapdragon 8 Gen 2. Carga inalámbrica 15W. Cámara 50MP con OIS. Android limpio. Muy buen estado con funda incluida.",
    photos: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80"],
    accessories: { funda: true, cargador: true },
    warranty: false,
    verified: false,
  },

  // === MÁS LAPTOPS ===
  {
    category: "laptops",
    brand: "Apple",
    model: "MacBook Pro 16\"",
    variant: "M3 Max 36GB 1TB",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 4299,
    price: 3600,
    title: "MacBook Pro 16 M3 Max - Workstation portátil",
    description: "MacBook Pro 16\" con el chip M3 Max de 14 núcleos CPU y 30 GPU. 36GB RAM unificada, 1TB SSD. Para producción de vídeo 8K, desarrollo y 3D. Ciclos de batería: 18. Perfecto estado.",
    photos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"],
    accessories: { cargador_140w: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "laptops",
    brand: "Razer",
    model: "Blade 15",
    variant: "RTX 4080 32GB",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 2999,
    price: 2100,
    title: "Razer Blade 15 RTX 4080 - Gaming sin compromisos",
    description: "Razer Blade 15 con RTX 4080 y pantalla QHD 240Hz. El portátil gaming más premium. 32GB RAM, 1TB SSD. Diseño unibody aluminio. Teclado RGB por tecla. Muy buen estado.",
    photos: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"],
    accessories: { cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "laptops",
    brand: "Microsoft",
    model: "Surface Laptop 5",
    variant: "i7 16GB 512GB",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 1599,
    price: 1050,
    title: "Surface Laptop 5 - Elegancia Microsoft",
    description: "Microsoft Surface Laptop 5 con pantalla táctil PixelSense 13.5\". Intel i7 Evo, 16GB RAM. Teclado Alcantara precioso. Windows 11 nativo. Batería 18 horas. Como nuevo.",
    photos: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"],
    accessories: { cargador: true, caja: true },
    warranty: true,
    verified: true,
  },
  {
    category: "laptops",
    brand: "ASUS",
    model: "ZenBook 14 OLED",
    variant: "i7 16GB 512GB",
    condition: ProductCondition.GOOD,
    purchasePrice: 1199,
    price: 650,
    title: "ASUS ZenBook 14 OLED - Pantalla de cine",
    description: "ASUS ZenBook 14 con pantalla OLED 2.8K 90Hz. Colores DCI-P3 perfectos para edición. Intel i7-1360P. Solo 1.39kg. Buen estado general con pequeña marca en tapa (ver fotos).",
    photos: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80"],
    accessories: { cargador: true },
    warranty: false,
    verified: false,
  },

  // === MÁS AUDIO ===
  {
    category: "audio",
    brand: "Bang & Olufsen",
    model: "Beoplay H95",
    variant: "Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 799,
    price: 520,
    title: "B&O Beoplay H95 - Lujo danés para tus oídos",
    description: "Bang & Olufsen Beoplay H95 en muy buen estado. Los auriculares más premium del mercado. Aluminio y piel de cordero. ANC adaptativo. 38 horas de batería. Estuche rígido original.",
    photos: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    accessories: { estuche: true, cable: true, adaptador_avion: true },
    warranty: false,
    verified: true,
  },
  {
    category: "audio",
    brand: "Marshall",
    model: "Emberton II",
    variant: "Negro/Latón",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 169,
    price: 120,
    title: "Marshall Emberton II - Rock portátil",
    description: "Altavoz Marshall Emberton II con el sonido característico de la marca. 30 horas de batería. IP67 resistente al agua. Diseño icónico negro con detalles dorados. Prácticamente nuevo.",
    photos: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"],
    accessories: { cable_usb: true },
    warranty: true,
    verified: true,
  },
  {
    category: "audio",
    brand: "Denon",
    model: "Home 350",
    variant: "Negro",
    condition: ProductCondition.GOOD,
    purchasePrice: 699,
    price: 350,
    title: "Denon Home 350 - Hi-Fi inalámbrico",
    description: "Denon Home 350, altavoz Hi-Fi multiroom. 6 drivers para sonido estéreo real. HEOS, AirPlay 2, Alexa integrada. Spotify Connect. Sonido de alta fidelidad. Funciona perfecto.",
    photos: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80"],
    accessories: { cable_alimentacion: true },
    warranty: false,
    verified: false,
  },

  // === MÁS TABLETS ===
  {
    category: "tablets",
    brand: "Apple",
    model: "iPad Pro 11\"",
    variant: "M4 256GB WiFi+Cell",
    condition: ProductCondition.NEW,
    purchasePrice: 1229,
    price: 1100,
    title: "iPad Pro 11 M4 Cellular NUEVO - Precintado",
    description: "iPad Pro 11\" con el nuevo chip M4. Modelo WiFi + Cellular. Pantalla Ultra Retina XDR OLED. Nuevo y precintado. Regalo de empresa. Face ID, USB-C Thunderbolt. Garantía Apple completa.",
    photos: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80"],
    accessories: { caja_sellada: true },
    warranty: true,
    verified: true,
  },
  {
    category: "tablets",
    brand: "Apple",
    model: "iPad mini 6",
    variant: "256GB WiFi Púrpura",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 749,
    price: 450,
    title: "iPad mini 6 Púrpura - La tablet de bolsillo",
    description: "iPad mini 6 en precioso color púrpura. Pantalla 8.3\" Liquid Retina. Chip A15 Bionic potente. USB-C. Touch ID. Perfecto para leer, jugar o como segunda pantalla. Muy buen estado.",
    photos: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80"],
    accessories: { funda: true, cargador: true },
    warranty: false,
    verified: true,
  },

  // === MÁS CONSOLAS ===
  {
    category: "consoles",
    brand: "Sony",
    model: "PlayStation 5 Slim",
    variant: "1TB Disco",
    condition: ProductCondition.NEW,
    purchasePrice: 549,
    price: 480,
    title: "PS5 Slim NUEVA precintada - Navidad adelantada",
    description: "PlayStation 5 Slim versión disco, nueva y precintada. Modelo 2024 más compacto. 1TB SSD. Regalo adelantado que no necesito. Factura de tienda para garantía Sony. Envío asegurado.",
    photos: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80"],
    accessories: { caja_sellada: true },
    warranty: true,
    verified: true,
  },
  {
    category: "consoles",
    brand: "Microsoft",
    model: "Xbox Series S",
    variant: "1TB Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 349,
    price: 250,
    title: "Xbox Series S 1TB negra - Compacta y potente",
    description: "Xbox Series S versión de 1TB en negro. La consola más compacta de nueva generación. 1440p 120fps. Game Pass listo. Usada 2 meses, prácticamente nueva. Incluye mando y cables.",
    photos: ["https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80"],
    accessories: { mando: true, cable_hdmi: true },
    warranty: true,
    verified: true,
  },

  // === MÁS CÁMARAS ===
  {
    category: "cameras",
    brand: "Nikon",
    model: "Z8",
    variant: "Cuerpo",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 4099,
    price: 3400,
    title: "Nikon Z8 - Mini Z9 sin compromisos",
    description: "Nikon Z8 solo cuerpo. 45.7MP full frame con el procesador del Z9. 8K 60p interno. Autofocus 3D tracking. Obturador electrónico sin blackout. Solo 8.000 disparos. Estado impecable.",
    photos: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80"],
    accessories: { bateria_extra: true, cargador: true },
    warranty: true,
    verified: true,
  },
  {
    category: "cameras",
    brand: "Sony",
    model: "FX30",
    variant: "Cuerpo Cinema",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1999,
    price: 1500,
    title: "Sony FX30 - Cine en sensor APS-C",
    description: "Sony FX30 cámara de cine. Sensor APS-C con S-Cinetone. 4K 120fps 10-bit interno. Montura E para objetivos Sony. Ventilador activo para grabar sin límites. XLR handle incluido.",
    photos: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80"],
    accessories: { xlr_handle: true, bateria: true },
    warranty: true,
    verified: true,
  },
  {
    category: "cameras",
    brand: "GoPro",
    model: "Hero 12 Black",
    variant: "Creator Edition",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 579,
    price: 420,
    title: "GoPro Hero 12 Creator Edition - Todo incluido",
    description: "GoPro Hero 12 Black con kit Creator Edition. Incluye Volta (batería + trípode), módulo de luz y Media Mod con micrófono. 5.3K 60fps, HyperSmooth 6.0. Perfecta para vlogs y acción.",
    photos: ["https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80"],
    accessories: { volta: true, media_mod: true, luz: true },
    warranty: true,
    verified: true,
  },

  // === MÁS WEARABLES ===
  {
    category: "wearables",
    brand: "Whoop",
    model: "Whoop 4.0",
    variant: "Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 229,
    price: 100,
    title: "Whoop 4.0 + año suscripción - Atletas serios",
    description: "Whoop 4.0 en muy buen estado. El wearable preferido por atletas profesionales. Monitorización 24/7 de recuperación, sueño y strain. Incluye 12 meses de suscripción transferible.",
    photos: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80"],
    accessories: { correas_2: true, cargador: true },
    warranty: false,
    verified: true,
  },
  {
    category: "wearables",
    brand: "Oura",
    model: "Oura Ring Gen 3",
    variant: "Heritage Plata T9",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 349,
    price: 250,
    title: "Oura Ring Gen 3 Plata T9 - Salud discreta",
    description: "Anillo Oura Ring Gen 3 modelo Heritage en plata titanio. Talla 9 (US). Monitorización de sueño, actividad, estrés y temperatura. Batería 7 días. Apenas usado 2 meses.",
    photos: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
    accessories: { cargador: true, kit_tallas: true },
    warranty: true,
    verified: true,
  },

  // === MÁS TV ===
  {
    category: "tv",
    brand: "LG",
    model: "OLED G3",
    variant: "65\" Gallery",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 2499,
    price: 1800,
    title: "LG OLED G3 65\" - La TV para colgar",
    description: "LG OLED65G3 con panel MLA de máximo brillo. Diseño Gallery Edition ultra delgado para pared (soporte flush incluido). Procesador Alpha 9 Gen 6. WebOS 23. Garantía burn-in 5 años.",
    photos: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80"],
    accessories: { soporte_pared: true, mando_magic: true },
    warranty: true,
    verified: true,
  },
  {
    category: "tv",
    brand: "Samsung",
    model: "The Frame 2024",
    variant: "55\" Negro",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1499,
    price: 950,
    title: "Samsung The Frame 55\" - Arte en tu salón",
    description: "Samsung The Frame 2024 que se camufla como un cuadro. Modo Arte con miles de obras. Marco personalizable (no incluido). QLED 4K. Matte Display anti-reflejos. Muy buen estado.",
    photos: ["https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80"],
    accessories: { mando: true, cable_one_connect: true },
    warranty: false,
    verified: true,
  },

  // === MÁS MOVILIDAD ===
  {
    category: "ebikes",
    brand: "Specialized",
    model: "Turbo Vado SL 4.0",
    variant: "Talla M",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 3800,
    price: 2200,
    title: "Specialized Vado SL - E-bike ligera premium",
    description: "Specialized Turbo Vado SL 4.0 Step-Through. La e-bike más ligera del mercado (15kg). Motor SL 1.1 silencioso. Autonomía 130km con range extender (incluido). Talla M. 1.200 km.",
    photos: ["https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80"],
    accessories: { range_extender: true, cargador: true, luces: true },
    warranty: true,
    verified: true,
  },
  {
    category: "scooters",
    brand: "NIU",
    model: "KQi3 Pro",
    variant: "Blanco",
    condition: ProductCondition.GOOD,
    purchasePrice: 599,
    price: 350,
    title: "NIU KQi3 Pro blanco - Diseño premium",
    description: "Patinete NIU KQi3 Pro en buen estado. Motor 350W, 25km/h. Autonomía 50km. Frenos regenerativos. App con GPS. Algunas marcas de uso normales. Funciona perfectamente.",
    photos: ["https://images.unsplash.com/photo-1604868189265-219ba7ffc5f5?w=800&q=80"],
    accessories: { cargador: true },
    warranty: false,
    verified: false,
  },

  // === MÁS DRONES ===
  {
    category: "drones",
    brand: "DJI",
    model: "Mavic 3 Pro",
    variant: "Fly More Combo",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 2449,
    price: 1900,
    title: "DJI Mavic 3 Pro Combo - Triple cámara profesional",
    description: "DJI Mavic 3 Pro con triple cámara (24mm Hasselblad + 70mm + 166mm). Sensor 4/3 20MP. 43 min de vuelo. O3+ transmisión 15km. Kit Fly More con 3 baterías y estuche. 30 vuelos.",
    photos: ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80"],
    accessories: { baterias_3: true, mando_rc_pro: true, estuche: true },
    warranty: true,
    verified: true,
  },

  // === HOGAR Y DECORACIÓN ===
  {
    category: "furniture",
    brand: "Secretlab",
    model: "Titan Evo 2022",
    variant: "Talla R Negro",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 509,
    price: 350,
    title: "Secretlab Titan Evo - La silla gamer premium",
    description: "Secretlab Titan Evo 2022 Series talla R (para 170-190cm). Tapizado SoftWeave Plus negro. Soporte lumbar magnético L-ADAPT. Reposabrazos 4D CloudSwap. Comprada hace 4 meses, casi nueva.",
    photos: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80"],
    accessories: { reposacabezas: true, cojin_lumbar: true },
    warranty: true,
    verified: true,
  },
  {
    category: "appliances-small",
    brand: "Dyson",
    model: "V15 Detect",
    variant: "Absolute",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 749,
    price: 480,
    title: "Dyson V15 Detect Absolute - Láser y ciencia",
    description: "Aspiradora Dyson V15 Detect con láser para ver el polvo. Pantalla LCD con partículas en tiempo real. Kit Absolute completo. Muy buen estado, batería 60 min. La mejor del mercado.",
    photos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    accessories: { accesorios_completos: true, soporte_pared: true },
    warranty: true,
    verified: true,
  },
  {
    category: "appliances-small",
    brand: "Thermomix",
    model: "TM6",
    variant: "Blanco",
    condition: ProductCondition.GOOD,
    purchasePrice: 1359,
    price: 800,
    title: "Thermomix TM6 - Robot de cocina todo en uno",
    description: "Thermomix TM6 con pantalla táctil y WiFi. Acceso a Cookidoo con miles de recetas guiadas. Buen estado general de uso. Funciona perfecto. Incluye varoma y accesorios originales.",
    photos: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80"],
    accessories: { varoma: true, cestillo: true, libro_recetas: true },
    warranty: false,
    verified: true,
  },
  {
    category: "appliances-small",
    brand: "De'Longhi",
    model: "Magnifica Evo",
    variant: "Silver",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 499,
    price: 320,
    title: "De'Longhi Magnifica Evo - Café de barista",
    description: "Cafetera superautomática De'Longhi Magnifica Evo. Molinillo integrado. 7 bebidas con leche (espumador LatteCrema). Pantalla táctil intuitiva. Muy buen estado, bien cuidada.",
    photos: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"],
    accessories: { filtro_agua: true },
    warranty: false,
    verified: false,
  },

  // === DEPORTE ===
  {
    category: "bikes",
    brand: "Canyon",
    model: "Aeroad CF SL 8",
    variant: "Talla M",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 3499,
    price: 2200,
    title: "Canyon Aeroad CF SL 8 - Bici aero carbono",
    description: "Canyon Aeroad CF SL 8 talla M. Bicicleta de carretera aerodinámica en carbono. Shimano Ultegra Di2 12v. Ruedas DT Swiss ARC 1600. Potenciómetro incluido. 4.500 km muy cuidados.",
    photos: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"],
    accessories: { potenciometro: true, pedales: true },
    warranty: false,
    verified: true,
  },
  {
    category: "bikes",
    brand: "Orbea",
    model: "Occam M30",
    variant: "Talla L",
    condition: ProductCondition.GOOD,
    purchasePrice: 3299,
    price: 1800,
    title: "Orbea Occam M30 - Trail bike versátil",
    description: "Orbea Occam M30 talla L. MTB trail de carbono 140mm. SRAM GX Eagle 12v. Ruedas 29\". Fox 36 y Float X. Bici versátil para todo tipo de senderos. Marcas normales de uso en cuadro.",
    photos: ["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80"],
    accessories: { pedales: true },
    warranty: false,
    verified: true,
  },
  {
    category: "outdoor",
    brand: "Garmin",
    model: "inReach Mini 2",
    variant: "Naranja",
    condition: ProductCondition.LIKE_NEW,
    purchasePrice: 399,
    price: 300,
    title: "Garmin inReach Mini 2 - SOS satelital",
    description: "Comunicador satelital Garmin inReach Mini 2 en color naranja. Mensajería bidireccional por satélite. SOS interactivo 24/7. GPS de alta sensibilidad. Imprescindible para montaña seria.",
    photos: ["https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"],
    accessories: { mosqueton: true, cable: true },
    warranty: true,
    verified: true,
  },

  // === CALZADO Y MODA ===
  {
    category: "footwear",
    brand: "Nike",
    model: "Air Jordan 1 Retro High OG",
    variant: "Chicago T43",
    condition: ProductCondition.NEW,
    purchasePrice: 180,
    price: 350,
    title: "Jordan 1 Chicago T43 - Clásico legendario",
    description: "Nike Air Jordan 1 Retro High OG colorway Chicago. Talla 43 EU / 9.5 US. Nuevas con etiquetas, nunca usadas. La zapatilla más icónica de la historia. Con caja original.",
    photos: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80"],
    accessories: { caja: true, cordones_extra: true },
    warranty: false,
    verified: true,
  },
  {
    category: "footwear",
    brand: "Adidas",
    model: "Ultraboost 23",
    variant: "Negro T42",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 180,
    price: 85,
    title: "Adidas Ultraboost 23 negras - Running premium",
    description: "Adidas Ultraboost 23 en negro. Talla 42 EU. Las zapatillas de running más cómodas. Boost máximo en mediasuela. Usadas 3 meses para gym. Muy buen estado, suela intacta.",
    photos: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"],
    accessories: { caja: true },
    warranty: false,
    verified: false,
  },

  // === BAGS/BOLSOS ===
  {
    category: "bags",
    brand: "Louis Vuitton",
    model: "Keepall 45",
    variant: "Monogram",
    condition: ProductCondition.VERY_GOOD,
    purchasePrice: 1750,
    price: 1200,
    title: "LV Keepall 45 Monogram - Bolsa de viaje icónica",
    description: "Louis Vuitton Keepall 45 en lona Monogram. El bolso de viaje más reconocible. Muy buen estado, pátina bonita en piel. Cremallera perfecta. Incluye candado y llaves. Comprado en LV París.",
    photos: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"],
    accessories: { candado: true, llaves: true, dust_bag: true },
    warranty: false,
    verified: true,
  },
];

function getRandomLocation() {
  return locations[Math.floor(Math.random() * locations.length)];
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🛒 Adding extra marketplace listings to reach 100...\n");

  // 1. Obtener categorías
  const existingCategories = await prisma.category.findMany();
  const categoryMap: { [slug: string]: string } = {};
  existingCategories.forEach(c => { categoryMap[c.slug] = c.id; });

  // 2. Obtener usuarios existentes (vendedores ya creados)
  const existingSellers = await prisma.user.findMany({
    where: { email: { contains: "@secondwallet.demo" } },
    select: { id: true }
  });

  if (existingSellers.length === 0) {
    console.error("❌ No hay vendedores. Ejecuta primero seed-marketplace.ts");
    process.exit(1);
  }

  const sellerIds = existingSellers.map(s => s.id);
  console.log(`✅ Found ${sellerIds.length} sellers\n`);

  // 3. Crear productos y listings extra
  let listingCount = 0;

  for (const item of extraProducts) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.warn(`⚠️ Category not found: ${item.category}`);
      continue;
    }

    const sellerIdx = listingCount % sellerIds.length;
    const sellerId = sellerIds[sellerIdx];
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
        purchaseDate: new Date(Date.now() - getRandomInt(30, 365) * 24 * 60 * 60 * 1000),
        purchasePrice: item.purchasePrice,
        warrantyEndDate,
        photos: item.photos,
        accessories: item.accessories,
      },
    });

    // Crear listing
    const daysAgo = getRandomInt(1, 45);
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const baseViews = Math.floor(daysAgo * getRandomInt(5, 15));
    const viewCount = item.verified ? baseViews + getRandomInt(30, 150) : baseViews;
    const favoriteCount = Math.floor(viewCount * (getRandomInt(8, 22) / 100));

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
        shippingEnabled: getRandomInt(0, 10) > 2,
        shippingCost: getRandomInt(0, 10) > 5 ? 0 : getRandomInt(5, 20),
        verificationLevel: item.verified
          ? (item.warranty ? VerificationLevel.LEVEL_2 : VerificationLevel.LEVEL_1)
          : VerificationLevel.LEVEL_0,
        hasVerifiedPurchase: item.verified,
        hasValidWarranty: item.warranty,
        hasVerifiedAccessories: item.verified && getRandomInt(0, 10) > 3,
        hasVerifiedIdentifier: item.verified && getRandomInt(0, 10) > 5,
        status: ListingStatus.PUBLISHED,
        photos: item.photos,
        isBoosted: getRandomInt(0, 10) > 8,
        viewCount,
        favoriteCount,
        publishedAt,
      },
    });

    listingCount++;
    console.log(`  🏷️ [${listingCount}] ${item.title.substring(0, 50)}...`);
  }

  // 4. Contar total de listings
  const totalListings = await prisma.listing.count({
    where: { status: ListingStatus.PUBLISHED }
  });

  console.log(`\n🎉 Added ${listingCount} extra listings!`);
  console.log(`📊 Total marketplace listings: ${totalListings}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
