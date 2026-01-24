# Plan: Protección JS con CloudFlare Pro + Super Bot Fight Mode

## Resumen

- **Coste:** $20/mes (CloudFlare Pro)
- **Protección:** Detección automática de bots (Puppeteer, Selenium, curl, etc.)
- **Sin límites** de tráfico

## Arquitectura Final

```
                    ┌─────────────────────────────────────────┐
                    │         CLOUDFLARE PRO ($20/mes)        │
                    │                                         │
Usuario Safari ────►│  Super Bot Fight Mode                   │
                    │  ├─ ML Detection (billions of requests) │
                    │  ├─ JS Detection (headless browsers)    │
                    │  ├─ TLS Fingerprinting                  │
                    │  └─ ¿Bot detectado?                     │
                    │       │                                 │
                    │      NO ──► CloudFront ──► S3 privado ──► JS (ofuscado)
                    │      SÍ ──► Challenge/Block             │
                    │                                         │
Usuario Chrome ────►│  (WASM carga directo, JS nunca pedido)  │
                    │       └──► CloudFront ──► S3 público ──► WASM
                    │                                         │
Scraper ───────────►│  Super Bot Fight Mode                   │
                    │       └──► BLOCKED (headless detected)  │
                    └─────────────────────────────────────────┘
```

## Capas de Protección

| Capa | Qué hace | Quién lo hace |
|------|----------|---------------|
| 1. Super Bot Fight Mode | Detecta bots automáticamente | CloudFlare |
| 2. Bucket privado | JS no accesible públicamente | AWS S3 + CloudFlare Worker |
| 3. Ofuscación JS | Código ilegible si se obtiene | javascript-obfuscator |
| 4. WASM | Código binario para navegadores modernos | Flutter |
| 5. PoW + reCAPTCHA | Protección existente | Ya implementado |

## Detección de Bots (Super Bot Fight Mode)

| Herramienta | Detectado | Método |
|-------------|-----------|--------|
| Puppeteer | ✅ | JS Detection (headless) |
| Selenium | ✅ | JS Detection (headless) |
| Playwright | ✅ | JS Detection (headless) |
| curl/wget | ✅ | TLS fingerprint + no JS |
| Python requests | ✅ | TLS fingerprint + no JS |
| Postman | ✅ | TLS fingerprint |
| Safari real | ✅ Permitido | Pasa todas las checks |

---

## Cambios Requeridos

### 1. CDK - Bucket S3 Privado

**Archivo:** `infra/lib/stacks/frontend-flutter-stack.ts`

```typescript
// Añadir después del bucket público existente:

// Bucket privado para JS (solo accesible via CloudFlare)
this.privateBucket = new s3.Bucket(this, 'FlutterJsPrivateBucket', {
  bucketName: `pricofy-flutter-js-private-${environment}`,
  publicReadAccess: false,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
  encryption: s3.BucketEncryption.S3_MANAGED,
});

// Política: solo acceso con header secreto (CloudFlare Worker)
this.privateBucket.addToResourcePolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    principals: [new iam.AnyPrincipal()],
    actions: ['s3:GetObject'],
    resources: [this.privateBucket.arnForObjects('*')],
    conditions: {
      StringEquals: {
        'aws:Referer': ssm.StringParameter.valueForStringParameter(
          this, `/pricofy/${environment}/cloudflare-js-token`
        ),
      },
    },
  })
);

// Outputs
new cdk.CfnOutput(this, 'PrivateBucketName', {
  value: this.privateBucket.bucketName,
  exportName: `PricofyFlutterPrivateBucket-${environment}`,
});

new cdk.CfnOutput(this, 'PrivateBucketUrl', {
  value: `https://${this.privateBucket.bucketName}.s3.${this.region}.amazonaws.com`,
});
```

**Añadir propiedad a la clase:**
```typescript
public readonly privateBucket: s3.Bucket;
```

### 2. SSM Parameter - Token Secreto

```bash
# Generar token aleatorio y guardarlo en SSM
aws ssm put-parameter \
  --name /pricofy/dev/cloudflare-js-token \
  --type SecureString \
  --value "$(openssl rand -base64 32)" \
  --profile pricofy-dev

# Para prod
aws ssm put-parameter \
  --name /pricofy/prod/cloudflare-js-token \
  --type SecureString \
  --value "$(openssl rand -base64 32)" \
  --profile pricofy-prod
```

### 3. CloudFlare Worker

**Archivo:** `frontend/cloudflare/worker.js`

```javascript
// CloudFlare Worker: Proxy para JS desde S3 privado
// Super Bot Fight Mode ya filtra bots ANTES de llegar aquí

const CONFIG = {
  // Leer de CloudFlare Worker secrets (configurar en dashboard)
  S3_JS_URL: 'https://pricofy-flutter-js-private-dev.s3.eu-west-1.amazonaws.com/main.dart.js',
  S3_SECRET_TOKEN: '', // Se configura como secret en CloudFlare
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Solo interceptar main.dart.js
    if (url.pathname === '/main.dart.js') {
      try {
        // Fetch JS desde S3 privado con token secreto
        const response = await fetch(env.S3_JS_URL || CONFIG.S3_JS_URL, {
          headers: {
            'Referer': env.S3_SECRET_TOKEN || CONFIG.S3_SECRET_TOKEN,
          },
        });

        if (!response.ok) {
          throw new Error(`S3 error: ${response.status}`);
        }

        return new Response(await response.text(), {
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        return new Response('Error loading JavaScript', { status: 500 });
      }
    }

    // Resto de requests: pasar a origin (CloudFront)
    return fetch(request);
  },
};
```

### 4. Makefile - Build con Ofuscación

**Archivo:** `frontend/Makefile`

**Modificar target `build`** (después del flutter build):

```makefile
# ELIMINAR estas líneas:
# echo "$(YELLOW)Removing JavaScript fallback from build config...$(NC)"; \
# sed -i.bak 's/,{"compileTarget":"dart2js"...//g' build/web/flutter_bootstrap.js; \

# AÑADIR en su lugar:
echo "$(YELLOW)Obfuscating JavaScript fallback...$(NC)"; \
if [ -f build/web/main.dart.js ]; then \
  npx javascript-obfuscator build/web/main.dart.js \
    --output build/web/main.dart.js \
    --compact true \
    --control-flow-flattening true \
    --control-flow-flattening-threshold 0.75 \
    --dead-code-injection true \
    --dead-code-injection-threshold 0.4 \
    --string-array true \
    --string-array-encoding 'base64' \
    --string-array-threshold 0.75 \
    --self-defending true \
    --disable-console-output true; \
  echo "$(GREEN)✓ JavaScript obfuscated$(NC)"; \
fi
```

**Modificar target `sync`:**

```makefile
sync: ## Sync build to S3 (public + private) and invalidate CloudFront
	@echo "$(BLUE)Deploying to $(ENV)...$(NC)"
	@BUCKET_PUBLIC=$$(AWS_PROFILE=$(AWS_PROFILE) aws cloudformation describe-stacks \
		--stack-name Pricofy-Infra-Frontend \
		--query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
		--output text 2>/dev/null); \
	BUCKET_PRIVATE=$$(AWS_PROFILE=$(AWS_PROFILE) aws cloudformation describe-stacks \
		--stack-name Pricofy-Infra-Frontend \
		--query 'Stacks[0].Outputs[?OutputKey==`PrivateBucketName`].OutputValue' \
		--output text 2>/dev/null); \
	if [ -z "$$BUCKET_PUBLIC" ]; then \
		echo "$(RED)ERROR: Could not retrieve bucket name$(NC)"; \
		exit 1; \
	fi; \
	echo "   Public bucket:  $$BUCKET_PUBLIC"; \
	echo "   Private bucket: $$BUCKET_PRIVATE"; \
	\
	echo "$(YELLOW)1. Uploading JS to PRIVATE bucket...$(NC)"; \
	if [ -f build/web/main.dart.js ] && [ -n "$$BUCKET_PRIVATE" ]; then \
		AWS_PROFILE=$(AWS_PROFILE) aws s3 cp build/web/main.dart.js \
			s3://$$BUCKET_PRIVATE/main.dart.js \
			--content-type "application/javascript"; \
		echo "$(GREEN)   ✓ JS uploaded to private bucket$(NC)"; \
	fi; \
	\
	echo "$(YELLOW)2. Uploading assets to PUBLIC bucket (without JS)...$(NC)"; \
	rm -f build/web/main.dart.js; \
	AWS_PROFILE=$(AWS_PROFILE) aws s3 sync build/web/ s3://$$BUCKET_PUBLIC/ \
		--delete --region $(AWS_REGION) \
		--exclude "*.wasm" --exclude "*.mjs"; \
	AWS_PROFILE=$(AWS_PROFILE) aws s3 sync build/web/ s3://$$BUCKET_PUBLIC/ \
		--region $(AWS_REGION) \
		--exclude "*" --include "*.wasm" \
		--content-type "application/wasm" --metadata-directive REPLACE; \
	AWS_PROFILE=$(AWS_PROFILE) aws s3 sync build/web/ s3://$$BUCKET_PUBLIC/ \
		--region $(AWS_REGION) \
		--exclude "*" --include "*.mjs" \
		--content-type "application/javascript" --metadata-directive REPLACE; \
	\
	echo "$(YELLOW)3. Invalidating CloudFront...$(NC)"; \
	# ... resto del código de invalidación existente ...
```

### 5. package.json - Añadir javascript-obfuscator

```bash
cd frontend
npm init -y  # Si no existe package.json
npm install --save-dev javascript-obfuscator
```

---

## Pasos de Implementación (en orden)

### Fase 1: AWS (30 min)

1. **Crear SSM parameter con token:**
   ```bash
   aws ssm put-parameter \
     --name /pricofy/dev/cloudflare-js-token \
     --type SecureString \
     --value "$(openssl rand -base64 32)" \
     --profile pricofy-dev
   ```

2. **Modificar CDK stack** (frontend-flutter-stack.ts):
   - Añadir bucket privado
   - Añadir outputs

3. **Deploy CDK:**
   ```bash
   cd infra && make deploy-dev
   ```

### Fase 2: CloudFlare Setup (45 min)

1. **Crear cuenta CloudFlare** (si no existe)
   - https://dash.cloudflare.com/sign-up

2. **Añadir dominio:**
   - Dashboard → Add site → `pricofy.com`
   - Seleccionar plan **Pro ($20/mes)**

3. **Cambiar nameservers** en registrador:
   - CloudFlare te dará 2 nameservers
   - Actualizar en tu registrador de dominio

4. **Configurar DNS:**
   ```
   Tipo: CNAME
   Nombre: dev
   Destino: [tu-cloudfront-distribution].cloudfront.net
   Proxy: ON (nube naranja)
   ```

5. **SSL/TLS:**
   - SSL/TLS → Overview → **Full (strict)**

6. **Activar Super Bot Fight Mode:**
   - Security → Bots → Configure Super Bot Fight Mode
   - Definitely automated: **Block**
   - Verified bots: **Allow**
   - Static resource protection: **ON**
   - JavaScript Detections: **ON**

### Fase 3: CloudFlare Worker (20 min)

1. **Crear Worker:**
   - Workers & Pages → Create application → Create Worker
   - Nombre: `pricofy-js-proxy`

2. **Pegar código** del worker (ver sección 3 arriba)

3. **Configurar secrets:**
   - Settings → Variables → Environment Variables
   - `S3_JS_URL`: `https://pricofy-flutter-js-private-dev.s3.eu-west-1.amazonaws.com/main.dart.js`
   - `S3_SECRET_TOKEN`: (copiar del SSM parameter)

4. **Configurar ruta:**
   - Triggers → Add route
   - Route: `dev.pricofy.com/main.dart.js`
   - Zone: `pricofy.com`

### Fase 4: Frontend (20 min)

1. **Instalar javascript-obfuscator:**
   ```bash
   cd frontend
   npm init -y
   npm install --save-dev javascript-obfuscator
   ```

2. **Modificar Makefile:**
   - Target `build`: añadir ofuscación
   - Target `sync`: subir JS a bucket privado

3. **Crear carpeta cloudflare:**
   ```bash
   mkdir -p frontend/cloudflare
   # Copiar worker.js
   ```

### Fase 5: Deploy y Test (15 min)

1. **Deploy:**
   ```bash
   cd frontend && make deploy ENV=dev
   ```

2. **Tests:**
   ```bash
   # Safari/iOS - debe funcionar
   # Chrome - debe funcionar (WASM)

   # curl - debe fallar (bot detected o 403)
   curl https://dev.pricofy.com/main.dart.js

   # Puppeteer - debe fallar
   node -e "
   const puppeteer = require('puppeteer');
   (async () => {
     const browser = await puppeteer.launch();
     const page = await browser.newPage();
     const res = await page.goto('https://dev.pricofy.com/main.dart.js');
     console.log('Status:', res.status());
     await browser.close();
   })();
   "
   ```

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `infra/lib/stacks/frontend-flutter-stack.ts` | Modificar | Añadir bucket privado |
| `frontend/cloudflare/worker.js` | Crear | Proxy para JS |
| `frontend/Makefile` | Modificar | Ofuscación + sync a bucket privado |
| `frontend/package.json` | Crear | Para javascript-obfuscator |

---

## Costes

| Componente | Coste |
|------------|-------|
| CloudFlare Pro | $20/mes |
| S3 bucket privado (~5MB) | ~$0.001/mes |
| CloudFlare Workers (100K/día free) | $0 |
| **Total** | **~$20/mes** |

---

## Rollback

Si algo falla:

1. **Rápido:** Desactivar proxy en CloudFlare DNS (nube gris)
2. **Completo:** Revertir Makefile para subir JS a bucket público
