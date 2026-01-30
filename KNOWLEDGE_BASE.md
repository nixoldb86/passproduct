# 📚 PassProduct - Base de Conocimiento del Proyecto

> Documento de contexto completo para continuar el desarrollo desde otro IDE/IA

## 🎯 Resumen Ejecutivo

**PassProduct** es una plataforma "wallet-first" que permite a usuarios registrar productos con factura y revenderlos en un marketplace premium donde solo se publican productos con factura verificada.

### Tesis del Negocio
La segunda mano tiene fricción por miedo a estafa, falsificaciones y "sin garantía". PassProduct convierte la factura en el "pasaporte" del producto y estándar de confianza del mercado.

---

## 🏗️ Arquitectura Técnica

### Stack Principal

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Next.js | 16.1.1 |
| **UI Framework** | React | 19 |
| **Lenguaje** | TypeScript | - |
| **Estilos** | Tailwind CSS | - |
| **Animaciones** | Framer Motion | - |
| **Iconos** | Lucide React | - |
| **Auth** | Clerk | - |
| **Base de Datos** | PostgreSQL | - |
| **ORM** | Prisma | 5.22.0 |
| **Pagos** | Stripe | - |
| **IA** | OpenAI GPT-4o | - |
| **Estado Global** | Zustand | - |
| **Fechas** | date-fns | - |

### Estructura de Directorios

```
passproduct-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Rutas protegidas
│   │   │   ├── wallet/        # Wallet de productos
│   │   │   ├── marketplace/   # Marketplace
│   │   │   ├── chat/          # Mensajería
│   │   │   ├── checkout/      # Proceso de compra
│   │   │   ├── sell/          # Publicar producto
│   │   │   ├── orders/        # Pedidos
│   │   │   └── settings/      # Ajustes
│   │   ├── api/               # API Routes
│   │   │   ├── db/            # CRUD endpoints
│   │   │   ├── checkout/      # Stripe integration
│   │   │   ├── verify/        # Verificación teléfono
│   │   │   ├── market-prices/ # Análisis Wallapop
│   │   │   └── extract-product-info/ # IA extracción
│   │   ├── pricing/           # Página pricing (pública)
│   │   ├── why-it-works/      # Página explicativa (pública)
│   │   └── page.tsx           # Home (pública)
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── wallet/            # Componentes wallet
│   │   ├── marketplace/       # Componentes marketplace
│   │   └── layout/            # Header, Sidebar, etc.
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── stripe.ts          # Configuración Stripe
│   │   ├── utils.ts           # Utilidades
│   │   ├── mock-data.ts       # Datos mock (desarrollo)
│   │   └── market-logger.ts   # Logger análisis mercado
│   ├── store/                 # Zustand stores
│   │   └── index.ts           # Todos los stores
│   ├── hooks/                 # Custom hooks
│   │   └── useMarketPrices.ts # Hook análisis precios
│   └── types/                 # TypeScript types
│       └── index.ts
├── prisma/
│   └── schema.prisma          # Schema de base de datos
└── public/                    # Assets estáticos
```

---

## 🗄️ Base de Datos (Prisma Schema)

### Modelos Principales

#### User
- Autenticación via Clerk (`clerkId`)
- Verificaciones: `isIdentityVerified`, `phoneVerified`, `isEmailVerified`
- Privacidad: `showLastSeen`, `showReadReceipts`
- Teléfono: `phone`, `phoneVerificationCode`, `phoneVerificationExpiry`

#### Product
- Información del producto: `brand`, `model`, `variant`, `condition`
- Compra: `purchaseDate`, `purchasePrice`, `purchaseStore`
- Documentación: `proofOfPurchaseUrl` (factura)
- Garantía: `warrantyEndDate`
- Seguro adicional: `hasAdditionalInsurance`, `additionalInsuranceEndDate`, `additionalInsuranceProvider`
- Identificadores: `imeiHash`, `serialHash` (hasheados)
- Valoración: `estimatedValue`, `marketPrices` (JSON: `{minimo, ideal, rapido, lastUpdated}`)

#### Listing
- Estado: `PUBLISHED`, `SOLD`, `DRAFT`, `ARCHIVED`
- Precio: `price`, `shippingCost`, `shippingEnabled`
- Verificaciones: `hasVerifiedPurchase`, `hasValidWarranty`, `hasVerifiedIdentifier`
- Ubicación: `location`, `latitude`, `longitude`

#### Order
- Estado: `CREATED`, `PAID`, `ESCROW_HOLD`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `DISPUTED`
- Stripe: `stripePaymentIntentId`, `stripePaymentStatus`
- Protección: `protectionCode` (código único para unboxing video)
- Dirección: `shippingAddress` (JSON)
- Fees: `feeMarketplace` (5%), `feeProtection` (2%, max €25)

#### Conversation
- Soft delete: `deletedByBuyer`, `deletedBySeller`
- Relación con `Listing` y participantes (`buyer`, `seller`)

#### Message
- `readAt` para read receipts
- `isOwn` calculado en frontend

#### Notification
- Tipos: `new_listing`, `price_drop`, `new_follower`, `order_update`, `message`, `system`
- `isRead`, `readAt`
- `actionUrl` para navegación

#### Follow
- Relación many-to-many entre usuarios

---

## 🔐 Autenticación y Verificación

### Clerk Integration
- Autenticación completa (Google, email/password)
- Middleware en `src/middleware.ts` protege rutas excepto públicas
- Rutas públicas: `/`, `/pricing`, `/why-it-works`, `/sign-in`, `/sign-up`

### Verificación de Teléfono (Custom)
- **NO usa Clerk** (requiere re-autenticación)
- Sistema propio con BD Prisma
- Código hardcodeado `0000` para desarrollo
- APIs:
  - `POST /api/verify/phone` - Enviar código
  - `POST /api/verify/phone/confirm` - Verificar código
  - `GET /api/verify/phone/status` - Estado verificación

### Verificaciones del Producto
1. **Ticket verificado**: `proofOfPurchaseUrl` existe
2. **Garantía activa**: `warrantyEndDate > hoy`
3. **Identidad verificada**: `user.isIdentityVerified`
4. **Email verificado**: `user.primaryEmailAddress?.verification?.status === "verified"`
5. **Teléfono verificado**: `user.phoneVerified === true`

---

## 💳 Integración Stripe

### Configuración
- Variables: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Archivo: `src/lib/stripe.ts`
- Inicialización lazy (solo si existe la key)

### Flujo de Checkout
1. Usuario hace click en "Comprar ahora"
2. **Validaciones obligatorias**:
   - Teléfono verificado (`phoneVerified === true`)
   - Dirección completa (si `shippingEnabled`)
3. `POST /api/checkout/create-intent`:
   - Crea `PaymentIntent` en Stripe
   - Calcula fees (marketplace 5%, protección 2%)
   - Genera `protectionCode` único
   - Crea `Order` en BD con status `CREATED`
4. Frontend muestra `PaymentElement` de Stripe
5. Usuario completa pago
6. `POST /api/checkout/confirm` actualiza `Order.status` a `PAID`

### Fees
- **Marketplace**: 5% del precio del producto
- **Protección comprador**: 2% del precio (máx. €25) - opcional
- **Envío**: Coste del vendedor

### Protección Comprador
- Código único generado: `PP-XXXXXX` (6 caracteres alfanuméricos)
- Vendedor debe incluir código en el paquete
- Comprador graba video unboxing mostrando código
- Si hay disputa, se valida el video

---

## 🤖 IA y Extracción de Productos

### OpenAI GPT-4o
- Extracción de datos de facturas (imagen o PDF)
- Endpoint: `POST /api/extract-product-info`
- Input: `image` (base64) o `text` (PDF)
- Output: `brand`, `model`, `variant`, `category`, `price`, `date`, `store`

### Búsqueda Web (Serper.dev / Tavily)
- Se usa cuando la IA no puede identificar el producto
- Si hay códigos de referencia (SKU, EAN)
- Variables: `SERPER_API_KEY` o `TAVILY_API_KEY`
- Serper.dev: Gratis hasta 2,500/mes
- Tavily: Alternativa

### Análisis de Precios de Mercado
- Endpoint: `POST /api/market-prices`
- Scraping de Wallapop con headers rotativos
- Filtrado con IA (GPT-4o-mini) para relevancia
- Detección de outliers (IQR + precio compra)
- Calcula 3 precios:
  - `minimo`: Math.min(...precios) - "Serás el más barato"
  - `ideal`: promedio(...precios) - "Precio promedio"
  - `rapido`: ideal × 0.9 - "Para vender más rápido"
- Logging estructurado en `logs/market-analysis/`
- Límite: 1 análisis cada 24 horas por producto

---

## 📱 Funcionalidades Principales

### Wallet de Productos
- Registro con factura (imagen o PDF)
- Extracción automática de datos con IA
- Análisis de mercado automático al crear
- Verificación de garantía y seguro adicional
- Valor estimado con actualización manual (24h cooldown)

### Marketplace
- Solo productos con factura verificada
- Filtros: categoría, precio, ubicación, envío
- Vistas: grid, lista, mapa
- Perfil de vendedor con productos activos/vendidos
- Sistema de seguimiento (follow/unfollow)

### Chat
- Conversaciones por listing
- Read receipts (doble check gris/verde)
- Estado "En línea" (respeta `showLastSeen`)
- Soft delete (solo para el usuario que borra)
- Notificaciones en tiempo real (polling cada 5s)

### Checkout
- Verificación de teléfono obligatoria (inline)
- Autocompletado de direcciones (Nominatim - gratis)
- Protección comprador opcional
- Integración Stripe completa

### Notificaciones
- Tipos: nuevo listing, mensaje, follower, order update
- Campanita en header con badge de no leídas
- Polling cada 5 segundos
- Dropdown con "Ver todas" / "Mostrar menos"

---

## 🎨 UI/UX

### Componentes Base (shadcn/ui)
- `Button`, `Card`, `Input`, `Select`, `Modal`, `Badge`, `Switch`, `DropdownMenu`, `AlertDialog`, `Tooltip`
- Custom: `AddressAutocomplete`, `NotificationBell`

### Estilos
- Tailwind CSS con variables CSS personalizadas
- Tema claro/oscuro (sistema)
- Animaciones: `framer-motion` para transiciones
- Animación "breathing" para "Calculando valor..."

### Responsive
- Mobile-first
- Hamburger menu en móvil
- Chat colapsable en móvil
- View modes (grid/list/map) accesibles en móvil

---

## 🔧 Configuración y Variables de Entorno

### `.env.local` (requeridas)

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL="postgresql://user:pass@localhost:5434/passproduct"

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Búsqueda Web (opcional)
SERPER_API_KEY=
# O
TAVILY_API_KEY=
```

### Comandos Útiles

```bash
# Desarrollo
npm run dev

# Base de datos
npx prisma studio          # UI para BD
npx prisma db push         # Sincronizar schema
npx prisma generate        # Regenerar cliente

# Build
npm run build
npm start
```

---

## 🐛 Problemas Conocidos y Soluciones

### 1. Error "Column does not exist" en Order
**Solución**: Ejecutar `npx prisma db push --accept-data-loss`

### 2. Botón "Continuar al pago" deshabilitado
**Causas**:
- Teléfono no verificado → Verificar con código `0000`
- Dirección incompleta (si shipping habilitado) → Completar todos los campos

### 3. Notificaciones no aparecen
**Solución**: Verificar que Prisma Client esté regenerado después de añadir modelo `Notification`

### 4. Market prices no se calculan
**Causas**:
- Límite 24h → Esperar o cambiar `lastUpdated` en BD
- Error en scraping Wallapop → Revisar logs en `logs/market-analysis/`

### 5. Error "Failed to fetch" en notificaciones
**Solución**: Ya silenciado en código, no afecta funcionalidad

---

## 📊 Modelo de Negocio

### Freemium Wallet
- **Gratis**: Hasta 5 productos
- **Premium**: Productos ilimitados (futuro)

### Marketplace
- **Publicar**: Gratis
- **Comisión venta**: 5% del precio
- **Protección comprador**: 2% (opcional, máx. €25)

### Chat
- **Gratis**: Ilimitado (cambió de modelo original)

---

## 🚀 Próximos Pasos / TODOs

1. **SMS Provider**: Reemplazar código hardcodeado `0000` con proveedor real
2. **Webhooks Stripe**: Implementar para actualizar estados de pedidos
3. **Video Unboxing**: UI para subir y validar videos
4. **Notificaciones Push**: Implementar para mejor UX
5. **Tests**: Añadir tests unitarios e integración
6. **Optimización**: Lazy loading de imágenes, code splitting
7. **Internacionalización**: Multi-idioma (actualmente solo ES)

---

## 📝 Convenciones de Código

### Naming
- Componentes: PascalCase (`ProductCard.tsx`)
- Hooks: camelCase con prefijo `use` (`useMarketPrices.ts`)
- Stores: camelCase con prefijo `use` (`useWalletStore`)
- APIs: kebab-case (`create-intent/route.ts`)

### Estilos
- Tailwind utility classes
- Variables CSS para colores temáticos
- `cn()` utility para merge de clases

### Estado
- Zustand para estado global
- `useState` para estado local
- `useEffect` para side effects

### Errores
- Try/catch en todas las llamadas async
- Logging con `console.log` / `console.error`
- Mensajes de error user-friendly

---

## 🔗 URLs Importantes

- **Repositorio**: https://github.com/nixoldb86/passproduct.git
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Prisma Studio**: `npx prisma studio` → http://localhost:5555

---

## 📞 Contacto y Soporte

- **Email del proyecto**: nixoldb@gmail.com
- **Desarrollador principal**: alvaro.olmedo.mir@gmail.com

---

**Última actualización**: 2026-01-21
**Versión del documento**: 1.0
