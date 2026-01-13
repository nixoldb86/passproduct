# PassProduct - Especificación Técnica del MVP

## 1. Visión General

**PassProduct** es una aplicación "wallet + marketplace" que permite a los usuarios:
1. Guardar sus productos (con ticket, garantía, fotos, IMEI/serial)
2. Conocer el valor de reventa estimado
3. Vender con confianza en un marketplace interno verificado

### Wedge Inicial
- **Categoría**: Electrónica de consumo (smartphones, tablets, portátiles, consolas, audio, wearables)
- **Arquitectura**: Preparada para multi-categoría con atributos dinámicos

---

## 2. Flujo de Usuario End-to-End

### 2.1 Onboarding
```
1. Usuario llega a la landing (/)
2. Click "Crear mi wallet gratis"
3. Registro vía Clerk (email/Google/Apple)
4. Redirección a /wallet (dashboard)
```

### 2.2 Wallet Flow
```
1. Ver lista de productos en wallet
2. Añadir producto:
   - Paso 1: Categoría + Marca + Modelo + Variante
   - Paso 2: Fotos + Estado + Accesorios
   - Paso 3: Fecha compra + Precio + Ticket + Garantía
3. Ver detalle de producto:
   - Valor estimado actual
   - 3 precios recomendados (Rápido/Justo/Máximo)
   - Badges de verificación
   - CTA "Vender en PassProduct"
```

### 2.3 Marketplace Flow (Comprador)
```
1. Explorar feed de listings (/marketplace)
2. Filtrar por categoría, precio, verificación
3. Ver detalle de listing:
   - Galería de fotos
   - Badges de verificación
   - Precio + fees de protección
   - Info del vendedor
4. Comprar:
   - "Comprar ahora" → Checkout
   - "Hacer oferta" → Chat con vendedor
```

### 2.4 Venta Flow (Vendedor)
```
1. Desde wallet, click "Vender en PassProduct"
2. Crear anuncio en 4 pasos:
   - Paso 1: Seleccionar producto (pre-rellenado desde wallet)
   - Paso 2: Fotos + estado + verificaciones heredadas
   - Paso 3: Precio (recomendaciones + envío)
   - Paso 4: Preview final + Publicar
3. Gestionar conversaciones
4. Aceptar ofertas / completar ventas
```

### 2.5 Order Flow
```
Estado del pedido (timeline):
CREATED → PAID → ESCROW_HOLD → SHIPPED → DELIVERED → ACCEPTED → RELEASED

1. Comprador paga
2. Pago se retiene en escrow
3. Vendedor envía y añade tracking
4. Comprador recibe
5. Comprador acepta (o abre disputa)
6. Pago se libera al vendedor
```

---

## 3. Estados de Order

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `CREATED` | Pedido creado, pendiente de pago | Pagar |
| `PAID` | Pago recibido | - |
| `ESCROW_HOLD` | Pago retenido | Vendedor: Marcar enviado |
| `SHIPPED` | Producto enviado | - |
| `HANDED_OVER` | Entregado en mano | - |
| `DELIVERED` | Confirmada entrega | Comprador: Aceptar / Disputar |
| `ACCEPTED` | Comprador acepta | - |
| `RELEASED` | Pago liberado al vendedor | - |
| `DISPUTED` | En disputa | Evidencias, resolución |
| `REFUNDED` | Reembolsado al comprador | - |

---

## 4. Sistema de Disputas

### 4.1 Razones
- `NOT_RECEIVED`: No ha llegado el producto
- `NOT_AS_DESCRIBED`: No coincide con el anuncio
- `NOT_WORKING`: El producto no funciona

### 4.2 Proceso
```
1. Comprador abre disputa (3 días desde entrega)
2. Selecciona razón
3. Describe el problema
4. Sube evidencias (fotos/videos)
5. Estado: OPENED → UNDER_REVIEW
6. Resolución (admin o automática):
   - RELEASE: Liberar pago al vendedor
   - REFUND: Reembolsar al comprador
   - RETURN: Devolución del producto
```

---

## 5. Sistema de Verificación

### 5.1 Niveles
| Nivel | Requisitos | Badge |
|-------|-----------|-------|
| LEVEL_0 | Fotos + estado | - |
| LEVEL_1 | + Ticket/prueba de compra | "Compra verificada" |
| LEVEL_2 | + IMEI/Serial (hasheado) | "ID verificado" |

### 5.2 Badges
- ✓ **Compra verificada**: Tiene proof_of_purchase_url validado
- ✓ **Garantía hasta DD/MM/AAAA**: warranty_end_date > hoy
- ✓ **Accesorios verificados**: Lista de accesorios comprobada
- ✓ **ID verificado**: IMEI/Serial hasheado y validado

### 5.3 Seguridad de Identificadores
- NUNCA almacenar IMEI/Serial en claro
- Solo guardar: hash SHA-256 + últimos 4 dígitos para display
- El hash permite verificar sin exponer el número completo

---

## 6. Contratos de API

### 6.1 Products (Wallet)

```typescript
// GET /api/products
// Lista productos del usuario autenticado
Response: {
  products: Product[]
  total: number
}

// GET /api/products/:id
// Detalle de producto
Response: Product

// POST /api/products
// Crear producto
Body: {
  categoryId: string
  brand: string
  model: string
  variant?: string
  condition: ProductCondition
  purchaseDate?: string
  purchasePrice?: number
  purchaseStore?: string
  proofOfPurchaseUrl?: string
  warrantyEndDate?: string
  photos: string[]
  accessories?: Record<string, boolean>
  imei?: string  // Se hashea antes de guardar
  serial?: string  // Se hashea antes de guardar
}
Response: Product

// PATCH /api/products/:id
// Actualizar producto
Body: Partial<CreateProductBody>
Response: Product

// DELETE /api/products/:id
// Eliminar producto
Response: { success: true }
```

### 6.2 Listings (Marketplace)

```typescript
// GET /api/listings
// Lista listings públicos con filtros
Query: {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  hasVerifiedPurchase?: boolean
  shippingEnabled?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc'
  page?: number
  limit?: number
}
Response: {
  listings: Listing[]
  total: number
  page: number
  totalPages: number
}

// GET /api/listings/:id
// Detalle de listing
Response: Listing

// POST /api/listings
// Crear listing (desde wallet o standalone)
Body: {
  productId?: string  // Si viene de wallet
  categoryId: string
  title: string
  description: string
  price: number
  location?: string
  shippingEnabled: boolean
  shippingCost?: number
  photos: string[]
}
Response: Listing

// PATCH /api/listings/:id
// Actualizar listing
Body: Partial<CreateListingBody>
Response: Listing

// POST /api/listings/:id/publish
// Publicar listing
Response: Listing

// DELETE /api/listings/:id
// Eliminar/cancelar listing
Response: { success: true }
```

### 6.3 Conversations & Messages

```typescript
// GET /api/conversations
// Lista conversaciones del usuario
Response: {
  conversations: Conversation[]
}

// GET /api/conversations/:id
// Detalle con mensajes
Response: Conversation

// POST /api/conversations
// Iniciar conversación (comprador)
Body: {
  listingId: string
  message: string
}
Response: Conversation

// POST /api/conversations/:id/messages
// Enviar mensaje
Body: {
  text: string
  isOffer?: boolean
  offerAmount?: number
}
Response: Message

// POST /api/conversations/:id/offer
// Hacer/responder oferta
Body: {
  amount?: number  // Nueva oferta
  accept?: boolean  // Respuesta a oferta
}
Response: Conversation
```

### 6.4 Orders

```typescript
// GET /api/orders
// Lista pedidos del usuario (como comprador y vendedor)
Response: {
  buying: Order[]
  selling: Order[]
}

// GET /api/orders/:id
// Detalle de pedido
Response: Order

// POST /api/orders
// Crear pedido (desde listing aceptado)
Body: {
  listingId: string
  acceptedOfferId?: string  // Si viene de oferta negociada
}
Response: Order

// POST /api/orders/:id/pay
// Simular pago
Response: Order

// POST /api/orders/:id/ship
// Marcar como enviado (vendedor)
Body: {
  trackingNumber: string
  carrier: string
}
Response: Order

// POST /api/orders/:id/deliver
// Confirmar entrega (transportista/sistema)
Response: Order

// POST /api/orders/:id/accept
// Aceptar recepción (comprador)
Response: Order

// POST /api/orders/:id/dispute
// Abrir disputa (comprador)
Body: {
  reason: DisputeReason
  description: string
  evidenceUrls: string[]
}
Response: Dispute
```

### 6.5 Disputes

```typescript
// GET /api/disputes/:id
// Detalle de disputa
Response: Dispute

// POST /api/disputes/:id/evidence
// Añadir evidencia
Body: {
  url: string
  description?: string
}
Response: Dispute

// POST /api/disputes/:id/resolve (admin)
// Resolver disputa
Body: {
  outcome: DisputeOutcome
  adminNotes?: string
}
Response: Dispute
```

---

## 7. Cálculo de Precios y Fees

### 7.1 Estimación de Valor
```typescript
// Heurística inicial (MVP)
estimatedValue = purchasePrice * (1 - depreciation)

// Depreciación por categoría (ejemplo):
// - Smartphones: 15-20% primer año, 10% años siguientes
// - Tablets: 12-15% primer año
// - Consolas: 10% primer año (retienen más valor)
// - Audio: 15% primer año
```

### 7.2 Precios Recomendados
```typescript
priceRecommendations = {
  fast: estimatedValue * 0.85,  // Venta rápida (-15%)
  fair: estimatedValue * 0.95,  // Equilibrio (-5%)
  max: estimatedValue * 1.05,   // Premium (+5%)
}
```

### 7.3 Fees de Transacción
```typescript
// Comisión marketplace: 7%
feeMarketplace = price * 0.07

// Protección comprador: 2% con cap de 25€
feeProtection = min(price * 0.02, 25)

// Total comprador
totalBuyer = price + shippingCost + feeProtection

// Payout vendedor
sellerPayout = price - feeMarketplace
```

---

## 8. Modelo de Datos (Prisma)

Ver archivo `prisma/schema.prisma` para el schema completo.

### Entidades Principales:
- **User**: Usuarios (sincronizados con Clerk)
- **Category**: Categorías de productos (jerárquicas)
- **Product**: Productos en wallet del usuario
- **Listing**: Anuncios en marketplace
- **Conversation/Message**: Chat entre comprador/vendedor
- **Order**: Pedidos/transacciones
- **Dispute**: Disputas de órdenes
- **Alert**: Alertas de precio/garantía

---

## 9. Decisiones Técnicas y Supuestos

### 9.1 Stack Tecnológico
- **Frontend**: Next.js 14 (App Router) + React 18
- **Estilos**: Tailwind CSS + Design tokens custom
- **State Management**: Zustand
- **Auth**: Clerk
- **Database**: PostgreSQL (Docker local)
- **ORM**: Prisma
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

### 9.2 Supuestos del MVP
1. **Pagos**: Mock en MVP. Arquitectura preparada para Stripe/PayPal
2. **Envíos**: Mock. Tracking manual sin integración con transportistas
3. **Valoración**: Heurística simple. Preparado para ML/scraping futuro
4. **OCR de tickets**: No implementado en MVP. Preparado para futuro
5. **Verificación de identidad**: Confianza en Clerk. Sin KYC adicional
6. **Rate limiting**: Básico en MVP (disputas por usuario)

### 9.3 Arquitectura Multi-Categoría
- Categorías con `attributeSchema` JSON para atributos dinámicos
- Políticas de verificación configurables por categoría
- Feature flags por categoría (requiresTicket, requiresSerial, minPhotos)

---

## 10. Design System "Quiet Luxury Tech"

### 10.1 Colores
```css
--background: #0C0C0E;      /* Ink base */
--surface-1: #18181C;       /* Cards */
--surface-2: #1F1F24;       /* Elevated */
--foreground: #FAFAFA;      /* Text primary */
--foreground-muted: #A1A1AA; /* Text secondary */
--accent: #D4AF37;          /* Champagne gold */
--jade: #10B981;            /* Verification/success */
```

### 10.2 Tipografía
- Font: Inter
- Títulos: 600 weight
- Body: 400 weight
- Precios: tabular-nums

### 10.3 Espaciado
- Sistema 8pt
- Padding generoso
- Radius: 12-16px
- Sombras sutiles

### 10.4 Microinteracciones
- Transiciones: 180-220ms ease-out
- Skeleton loading sutil
- Staggered animations en listas

---

## 11. Próximos Pasos (Post-MVP)

1. **Pagos reales**: Integración Stripe
2. **Notificaciones push**: FCM/APNs
3. **OCR de tickets**: Extracción automática de datos
4. **Valoración inteligente**: ML + scraping de precios
5. **Verificación avanzada**: Video llamada para high-value
6. **App móvil**: React Native o Flutter
7. **Internacionalización**: Más países/idiomas
8. **Analytics**: Mixpanel/Amplitude
9. **Programa de referidos**
10. **Suscripción premium**: Límites extendidos, analytics, prioridad

---

## 12. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar base de datos
docker-compose up -d

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Seed de datos
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Linting
npm run lint
```

---

**Última actualización**: Enero 2026
**Versión**: MVP 1.0
