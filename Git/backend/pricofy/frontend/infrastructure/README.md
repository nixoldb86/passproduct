# Infrastructure Setup for Flutter Frontend

Este directorio contiene el código de infraestructura AWS CDK para desplegar el frontend Flutter.

## 📋 Instrucciones de Setup

### 1. Copiar Stack a pricofy-infra

```bash
# Desde el directorio raíz de pricofy
cp pricofy-front-flutter/infrastructure/frontend-flutter-stack.ts pricofy-infra/lib/
```

### 2. Actualizar bin/infra.ts

Añade estas líneas en `pricofy-infra/bin/infra.ts`:

```typescript
// Import the new stack
import { FrontendFlutterStack } from '../lib/frontend-flutter-stack';

// Add to app initialization (después de los otros stacks)
new FrontendFlutterStack(app, 'Pricofy-Frontend-Flutter', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-1',
  },
});
```

### 3. Deploy con CDK

```bash
cd pricofy-infra

# Bootstrap (solo primera vez si no está hecho)
npx cdk bootstrap

# Deploy el nuevo stack
npx cdk deploy Pricofy-Frontend-Flutter --require-approval never
```

### 4. Obtener Outputs

Después del deploy, verás outputs como:

```
Outputs:
Pricofy-Frontend-Flutter.BucketName = pricofy-frontend-flutter
Pricofy-Frontend-Flutter.DistributionId = E1234ABCD5678
Pricofy-Frontend-Flutter.WebsiteURL = https://d1234abcd5678.cloudfront.net
```

### 5. Actualizar Makefile

Actualiza el `CLOUDFRONT_DIST_ID` en `pricofy-front-flutter/Makefile`:

```makefile
CLOUDFRONT_DIST_ID := E1234ABCD5678  # El ID que salió del deploy
```

### 6. Deploy Manual (primera vez)

```bash
cd pricofy-front-flutter

# Build
make build

# Deploy to S3
make deploy-s3

# Invalidate CloudFront
make invalidate
```

### 7. Deploy Automático (GitHub Actions)

El workflow `.github/workflows/deploy.yml` ya está configurado. Se ejecutará automáticamente en:
- Push a `main`
- Manual trigger desde GitHub UI

---

## 🏗️ Recursos Creados

El stack crea:

1. **S3 Bucket**
   - Nombre: `pricofy-frontend-flutter`
   - Encryption: S3-managed
   - Versioning: Disabled
   - Public Access: Blocked (solo CloudFront)

2. **CloudFront Distribution**
   - Origin: S3 bucket (via OAI)
   - HTTPS Only (redirect HTTP → HTTPS)
   - HTTP/2 + HTTP/3 enabled
   - Compression enabled
   - SPA routing (404/403 → index.html)
   - Cache Policy: CACHING_OPTIMIZED
   - Price Class: US, Canada, Europe

3. **Origin Access Identity (OAI)**
   - CloudFront → S3 secure access

---

## 💰 Costo Estimado

- **S3 Storage:** ~$0.023/GB/mes
  - Frontend (~100MB) = **$0.002/mes**
- **CloudFront:** $0/mes (Free Tier: 1TB transfer)
- **Total:** **~$0.002/mes**

---

## 🔧 Comandos Útiles

```bash
# Ver todos los stacks
cd pricofy-infra
npx cdk list

# Ver cambios antes de deploy
npx cdk diff Pricofy-Frontend-Flutter

# Deploy stack
npx cdk deploy Pricofy-Frontend-Flutter

# Ver outputs
aws cloudformation describe-stacks \
  --stack-name Pricofy-Frontend-Flutter \
  --query 'Stacks[0].Outputs'

# Destruir stack (⚠️ cuidado)
npx cdk destroy Pricofy-Frontend-Flutter
```

---

## 🚀 URLs de Producción

Después del deploy:

- **Next.js (actual):** https://dix4kmgtq1bvp.cloudfront.net
- **Flutter (nuevo):** https://[DIST_ID].cloudfront.net

---

## 📝 Notas

- El stack usa `RemovalPolicy.RETAIN` para el bucket S3, así que si destruyes el stack, el bucket NO se eliminará automáticamente.
- CloudFront puede tardar 10-15 minutos en propagar cambios globalmente.
- La primera invalidación del día es gratis, las siguientes cuestan $0.005 cada 1000 paths.

---

## 🔗 Referencias

- [AWS CDK S3 Bucket](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.Bucket.html)
- [AWS CDK CloudFront](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.Distribution.html)
- [Flutter Web Deployment](https://docs.flutter.dev/deployment/web)

