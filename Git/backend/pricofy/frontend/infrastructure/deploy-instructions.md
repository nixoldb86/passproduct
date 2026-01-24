# 🚀 Instrucciones de Deployment - Paso a Paso

## Resumen Ejecutivo

Necesitas hacer 3 cosas:

1. ✅ **Añadir CDK Stack a pricofy-infra** (crea S3 + CloudFront)
2. ✅ **Primer deploy manual** (build + upload S3)
3. ✅ **GitHub Actions automático** (ya está configurado)

---

## Paso 1: Setup Infraestructura (CDK)

### 1.1 Copiar Stack a pricofy-infra

```bash
# Desde tu directorio pricofy/
cp pricofy-front-flutter/infrastructure/frontend-flutter-stack.ts pricofy-infra/lib/
```

### 1.2 Editar pricofy-infra/bin/infra.ts

Añade al final del archivo (antes del `app.synth()`):

```typescript
import { FrontendFlutterStack } from '../lib/frontend-flutter-stack';

// ... código existente ...

// Nueva línea: Flutter Frontend Stack
new FrontendFlutterStack(app, 'Pricofy-Frontend-Flutter', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-1',
  },
});

app.synth();
```

### 1.3 Deploy CDK Stack

```bash
cd pricofy-infra

# Install dependencies (si no lo has hecho)
npm install

# Deploy
npx cdk deploy Pricofy-Frontend-Flutter --require-approval never
```

**Tiempo:** ~5-7 minutos

**Output esperado:**

```
✅  Pricofy-Frontend-Flutter

Outputs:
Pricofy-Frontend-Flutter.BucketName = pricofy-frontend-flutter
Pricofy-Frontend-Flutter.DistributionId = E1A2B3C4D5E6F
Pricofy-Frontend-Flutter.WebsiteURL = https://d1a2b3c4d5e6f.cloudfront.net

Stack ARN:
arn:aws:cloudformation:eu-west-1:815539057310:stack/Pricofy-Frontend-Flutter/...
```

### 1.4 Guardar Distribution ID

**IMPORTANTE:** Guarda el `DistributionId` (ejemplo: `E1A2B3C4D5E6F`)

Edita `pricofy-front-flutter/Makefile` línea 18:

```makefile
CLOUDFRONT_DIST_ID := E1A2B3C4D5E6F  # <-- Pon tu Distribution ID aquí
```

---

## Paso 2: Primer Deploy Manual

### 2.1 Build Flutter Web

```bash
cd pricofy-front-flutter

# Build producción
make build
```

**Tiempo:** ~3-5 minutos

**Output esperado:**

```
Building web app for production...
✓ Build complete: build/web/
```

### 2.2 Deploy a S3

```bash
make deploy-s3
```

**Output esperado:**

```
Deploying to S3...
upload: build/web/index.html to s3://pricofy-frontend-flutter/index.html
upload: build/web/flutter.js to s3://pricofy-frontend-flutter/flutter.js
...
✓ Deployed to s3://pricofy-frontend-flutter
```

### 2.3 Invalidar CloudFront

```bash
make invalidate
```

**Output esperado:**

```
Invalidating CloudFront cache...
{
  "Location": "...",
  "Invalidation": {
    "Id": "I2EXAMPLE",
    "Status": "InProgress",
    ...
  }
}
✓ Cache invalidated
```

### 2.4 Verificar Deploy

Abre en tu navegador:

```
https://[TU_DISTRIBUTION_ID].cloudfront.net
```

Ejemplo: `https://d1a2b3c4d5e6f.cloudfront.net`

**Nota:** CloudFront puede tardar 2-3 minutos en propagar. Si ves error 403/404, espera un poco.

---

## Paso 3: GitHub Actions (Automático)

### 3.1 Crear Repositorio GitHub

```bash
cd pricofy-front-flutter

# Init git (si no lo has hecho)
git init
git branch -M main

# Add remote
git remote add origin https://github.com/cnebrera/pricofy-front-flutter.git

# First commit
git add .
git commit -m "Initial commit: Flutter web frontend"
git push -u origin main
```

### 3.2 GitHub Actions Ya Está Configurado ✅

El archivo `.github/workflows/deploy.yml` ya existe y se ejecutará automáticamente en:
- Push a `main`
- Manual trigger desde GitHub UI

### 3.3 Verificar Permisos AWS

El workflow usa el role:
```
arn:aws:iam::815539057310:role/GitHubActionsDeployRole
```

**Verificar que el role tiene permisos para:**
- `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` en `pricofy-frontend-flutter`
- `cloudfront:CreateInvalidation` en la nueva distribution

Si necesitas añadir permisos, edita el role en AWS IAM.

---

## Resumen de URLs

| Frontend | URL | Status |
|----------|-----|--------|
| **Next.js (actual)** | https://dix4kmgtq1bvp.cloudfront.net | ✅ Producción |
| **Flutter (nuevo)** | https://[TU_DIST_ID].cloudfront.net | ✅ Testing |

---

## Comandos Rápidos (Make)

```bash
# Ver todos los comandos disponibles
make help

# Build + Deploy + Invalidate (todo en uno)
make deploy

# Solo deploy a S3
make deploy-s3

# Solo invalidar cache
make invalidate

# Ver info del proyecto
make info

# Verificar AWS setup
make deploy-check

# Ver logs de build
make logs
```

---

## Troubleshooting

### Error: "Bucket does not exist"

```bash
# Verificar que el stack CDK se desplegó correctamente
aws cloudformation describe-stacks --stack-name Pricofy-Frontend-Flutter
```

### Error: "AccessDenied" en S3

```bash
# Verificar AWS credentials
aws sts get-caller-identity

# Verificar permisos en el bucket
aws s3 ls s3://pricofy-frontend-flutter/
```

### Error: "Distribution not found"

```bash
# Listar distributions
aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Origins.Items[0].DomainName,'pricofy-frontend-flutter')].{Id:Id,Domain:DomainName}"

# Actualizar CLOUDFRONT_DIST_ID en Makefile
```

### CloudFront muestra "403 Forbidden"

**Causa:** CloudFront está propagando (normal las primeras veces)

**Solución:** Espera 3-5 minutos y refresca.

### GitHub Actions falla en "Configure AWS Credentials"

**Causa:** Role OIDC no configurado o sin permisos

**Solución:**
1. Verificar que el repo está en GitHub como `cnebrera/pricofy-front-flutter`
2. Verificar que el role `GitHubActionsDeployRole` existe
3. Verificar trust policy del role incluye GitHub OIDC

---

## Next Steps

Después del deploy exitoso:

1. ✅ Testear Flutter web en la nueva URL
2. ✅ Comparar performance con Next.js
3. ✅ Validar todas las funcionalidades
4. ✅ Cuando esté listo, swap al bucket original o mantener ambos

---

## 💡 Pro Tips

- Usa `make deploy` para build + deploy + invalidate en un comando
- Configura `CLOUDFRONT_DIST_ID` en Makefile para evitar buscarlo cada vez
- GitHub Actions se ejecuta automáticamente en cada push a main
- Primera invalidación diaria es gratis, las siguientes cuestan $0.005 por 1000 paths
- CloudFront propaga en ~10-15 min globalmente, pero en Europa es más rápido (~2-3 min)

---

¿Dudas? Revisa `infrastructure/README.md` para más detalles técnicos.

