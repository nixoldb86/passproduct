# Configuración de Base de Datos

## Estado Actual
La aplicación está configurada para usar **Supabase** como base de datos.

---

## Volver a usar PostgreSQL Local (Docker)

### 1. Modificar `.env`

```bash
# Database - Local Docker
DATABASE_URL="postgresql://secondwallet:secondwallet_secret_2024@localhost:5434/secondwallet?schema=public"
DIRECT_URL="postgresql://secondwallet:secondwallet_secret_2024@localhost:5434/secondwallet?schema=public"
```

### 2. Modificar `.env.local`

```bash
# Database - Local Docker
DATABASE_URL="postgresql://secondwallet:secondwallet_secret_2024@localhost:5434/secondwallet"
DIRECT_URL="postgresql://secondwallet:secondwallet_secret_2024@localhost:5434/secondwallet"
```

### 3. Levantar Docker

```bash
docker-compose up -d
```

### 4. Sincronizar schema y datos

```bash
npx prisma generate
npx prisma db push
npx prisma db seed  # Si necesitas datos de prueba
```

---

## Usar Supabase (Configuración actual)

### Variables de entorno

```bash
# Database - Supabase
# Pooled connection (para la app - PgBouncer)
DATABASE_URL="postgresql://postgres.hegdbpfpbuywkwljmgoe:wawrox-Dyjvi7-raqnis@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Session pooler (para migraciones Prisma)
DIRECT_URL="postgresql://postgres.hegdbpfpbuywkwljmgoe:wawrox-Dyjvi7-raqnis@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
```

---

## Configuración Futura: Local + Vercel

Para cuando despliegues en Vercel, la configuración será:

| Entorno | Base de Datos |
|---------|---------------|
| `npm run dev` (local) | Docker PostgreSQL (localhost:5434) |
| Vercel (producción) | Supabase |

### Implementación

1. **En local**: Usar archivo `.env.local` con URLs de Docker
2. **En Vercel**: Configurar variables de entorno en el dashboard de Vercel con URLs de Supabase

Next.js automáticamente usa `.env.local` en desarrollo y las variables de Vercel en producción.

---

## Conexiones de referencia

### Docker Local
- **Host**: localhost
- **Puerto**: 5434
- **Usuario**: secondwallet
- **Password**: secondwallet_secret_2024
- **Database**: secondwallet

### Supabase
- **Project ID**: hegdbpfpbuywkwljmgoe
- **Región**: eu-west-1
- **Puerto pooled**: 6543 (Transaction mode)
- **Puerto session**: 5432 (Session mode)

---

## Comandos útiles

```bash
# Ver estado de Docker
docker ps

# Levantar PostgreSQL local
docker-compose up -d

# Parar PostgreSQL local
docker-compose down

# Abrir Prisma Studio
npx prisma studio

# Regenerar cliente Prisma
npx prisma generate

# Sincronizar schema con BD
npx prisma db push

# Ejecutar seed
npx prisma db seed
```
