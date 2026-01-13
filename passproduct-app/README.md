# PassProduct 🎫

> Tu wallet de productos + marketplace premium

PassProduct es una aplicación que te permite:
- 📦 **Guardar** tus productos con ticket, garantía y fotos
- 📈 **Conocer** el valor de reventa actualizado
- 🛒 **Vender** con confianza en un marketplace verificado

## 🚀 Quick Start

### Prerrequisitos

- Node.js 20+
- Docker (para PostgreSQL)
- Cuenta de [Clerk](https://clerk.com) (autenticación)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd passproduct-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus claves de Clerk

# 4. Iniciar base de datos
npm run docker:up

# 5. Generar cliente Prisma y ejecutar migraciones
npm run db:generate
npm run db:push

# 6. (Opcional) Seed de datos iniciales
npm run db:seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
passproduct-app/
├── prisma/                # Schema y migraciones de BD
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/              # App Router de Next.js
│   │   ├── (auth)/       # Páginas de autenticación
│   │   ├── (dashboard)/  # Páginas protegidas
│   │   └── page.tsx      # Landing page
│   ├── components/
│   │   ├── layout/       # Header, Sidebar, Shell
│   │   ├── marketplace/  # Componentes de marketplace
│   │   ├── ui/           # Componentes base (Button, Card, etc.)
│   │   └── wallet/       # Componentes de wallet
│   ├── lib/
│   │   ├── mock-data.ts  # Datos mock para MVP
│   │   ├── prisma.ts     # Cliente Prisma
│   │   └── utils.ts      # Utilidades (formatters, helpers)
│   ├── store/            # Estado global (Zustand)
│   └── types/            # Tipos TypeScript
├── docker-compose.yml    # PostgreSQL local
├── SPEC.md              # Especificación técnica completa
└── README.md
```

## 🎨 Design System

El proyecto usa el sistema de diseño **"Quiet Luxury Tech"**:

- **Dark mode** por defecto (fondos ink, no #000 puro)
- **Acento champagne/gold** (#D4AF37) usado con moderación
- **Jade** (#10B981) para verificaciones y éxito
- **Tipografía Inter** con pesos 400/500/600
- **Sistema 8pt** con padding generoso
- **Radius 12-16px** y sombras sutiles
- **Microinteracciones** suaves (180-220ms)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run start         # Iniciar build de producción
npm run lint          # Linting

# Base de datos
npm run docker:up     # Iniciar PostgreSQL
npm run docker:down   # Parar PostgreSQL
npm run db:generate   # Generar cliente Prisma
npm run db:push       # Push schema a BD
npm run db:migrate    # Crear migración
npm run db:seed       # Seed de datos
npm run db:studio     # Abrir Prisma Studio
npm run db:reset      # Reset BD (cuidado!)
```

## 🔐 Configuración de Clerk

1. Crea una cuenta en [Clerk](https://dashboard.clerk.com)
2. Crea una nueva aplicación
3. Copia las claves al archivo `.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

4. (Opcional) Configura OAuth providers (Google, Apple)

## 🗄️ Base de Datos

El proyecto usa PostgreSQL con Prisma ORM.

### Entidades principales:

- **User**: Usuarios sincronizados con Clerk
- **Category**: Categorías de productos (electrónica)
- **Product**: Productos en el wallet del usuario
- **Listing**: Anuncios en el marketplace
- **Conversation/Message**: Chat comprador-vendedor
- **Order**: Pedidos con estados de escrow
- **Dispute**: Sistema de disputas

### Diagrama simplificado:

```
User
  └── Product[] (wallet)
        └── Listing (opcional, para vender)
              └── Conversation[]
                    └── Message[]
              └── Order
                    └── Dispute (opcional)
```

## 🛡️ Sistema de Verificación

| Nivel | Requisitos | Badge |
|-------|-----------|-------|
| 0 | Fotos + estado | - |
| 1 | + Ticket/factura | "Compra verificada" |
| 2 | + IMEI/Serial | "ID verificado" |

Los identificadores (IMEI/Serial) se almacenan hasheados (SHA-256) por seguridad.

## 💰 Modelo de Fees (MVP)

- **Comisión marketplace**: 7% del precio
- **Protección comprador**: 2% (máx 25€)
- **Boost/destacar**: 1.99-6.99€ (futuro)

## 📚 Documentación

Ver [SPEC.md](./SPEC.md) para la especificación técnica completa:
- Flujos de usuario
- Estados de pedido
- Contratos de API
- Decisiones técnicas

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📄 Licencia

MIT - ver [LICENSE](./LICENSE) para detalles

---

Hecho con ❤️ usando Next.js, Prisma, Clerk y Tailwind CSS
