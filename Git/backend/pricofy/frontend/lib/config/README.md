# Environment Configuration

## Overview

This directory contains environment-specific configuration that is loaded at build time using Flutter's `--dart-define` feature.

## Files

- `environment.dart` - Runtime configuration with `String.fromEnvironment`

## Local Development

Use `--dart-define` when running:

```bash
flutter run \
  --dart-define=API_BASE_URL=https://api-dev.pricofy.com/ \
  --dart-define=POW_SECRET=your-pow-secret \
  --dart-define=RECAPTCHA_SITE_KEY=your-site-key \
  --dart-define=ENVIRONMENT=dev
```

## Production Build

For production builds, **always** use `--dart-define` to inject values:

```bash
flutter build web --release --wasm \
  --dart-define=API_BASE_URL=$API_GATEWAY_URL \
  --dart-define=POW_SECRET=$POW_SECRET \
  --dart-define=RECAPTCHA_SITE_KEY=$RECAPTCHA_SITE_KEY \
  --dart-define=ENVIRONMENT=prod
```

## CI/CD (GitHub Actions)

The GitHub Actions workflow automatically loads values from AWS SSM Parameter Store and injects them during build.

## Required Variables

| Variable | Description | Security |
|----------|-------------|----------|
| `API_BASE_URL` | BFF API base URL | Public |
| `POW_SECRET` | PoW secret (compiled into WASM) | Compiled (not transmitted) |
| `RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key | Public |
| `ENVIRONMENT` | Environment name (`dev` or `prod`) | Public |

## Security Model

- **POW_SECRET**: Compiled into WASM binary at build time. Used locally by the client to solve Proof-of-Work challenges. **Never transmitted over the network.**
- **Session Token**: Result of successful PoW verification. Temporary (10 min), transmitted in `X-Session-Token` header.
- **reCAPTCHA**: Public site key, validated server-side.
