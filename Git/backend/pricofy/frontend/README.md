# Pricofy Frontend

Cross-platform **Pricofy** frontend, a price evaluation platform for second-hand products that uses AI to analyze the market.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies](#technologies)
- [Requirements](#requirements)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Internationalization (i18n)](#internationalization-i18n)
- [Shared Components](#shared-components)
- [Build and Deploy](#build-and-deploy)
- [Testing](#testing)
- [Supported Platforms](#supported-platforms)
- [Troubleshooting](#troubleshooting)

---

## Project Description

Pricofy helps users:

- **Sell**: Upload photos/data of a product and receive a recommended price analysis based on real market listings (Wallapop, Milanuncios, Vinted, BackMarket).
- **Buy**: Search for a product and find the best available offers across multiple second-hand platforms.

The frontend communicates with a BFF (Backend For Frontend) that orchestrates scrapers, AI services, and PDF report generation.

## Features

| Feature | Description |
|---------|-------------|
| **Global Search** | Search products on Wallapop, Milanuncios, Vinted, BackMarket simultaneously |
| **Round-Robin Results** | Results interleaved by platform+country for balanced display across all sources |
| **Advanced Filters** | Filter by price, platform, country, distance (instant, client-side) |
| **Multi-Criteria Sort** | Sort by price, date, distance; round-robin when no sort selected |
| **Price Evaluation** | Minimum, ideal, and quick price based on AI |
| **Dashboard** | View evaluation and search history |
| **User Profile** | Wallet, subscriptions, invoices |
| **Admin Panel** | Manage requests, contacts, users |
| **Multi-language** | ES, EN, FR, PT, DE, IT |
| **Authentication** | Magic link via Cognito (passwordless) |

## Technologies

- **Flutter 3.24+** / **Dart 3.5+**
- **Provider** - State management
- **go_router** - Declarative navigation
- **Dio** - HTTP client with interceptors
- **AWS Amplify** - Cognito authentication
- **Stripe** - Payments and subscriptions

## Requirements

- Flutter SDK 3.24 or higher
- Dart SDK 3.5 or higher
- AWS CLI configured with `pricofy-dev` and `pricofy-prod` profiles
- Chrome (for web development)

```bash
# Verify installation
flutter doctor
```

## Installation

```bash
# Clone and install dependencies
git clone <repo>
cd frontend
make setup
```

## Development

```bash
# Run on web (Chrome with CORS disabled)
make dev

# Run on Android
make android-run

# Run on iOS
make ios-run

# Run on macOS
make macos-run
```

> **CORS Note**: The API doesn't allow localhost. `make dev` launches Chrome with CORS disabled in a separate profile.

### Useful Commands

```bash
make analyze          # Static analysis
make format           # Format code (80 chars)
make test             # Run tests
flutter pub get       # Update dependencies
flutter gen-l10n      # Regenerate translations
flutter pub run build_runner build  # Regenerate mocks/json
```

## Project Structure

```
lib/
├── main.dart                 # Entry point, MultiProvider setup
│
├── config/                   # Global configuration
│   ├── app_config.dart       # Runtime config from SSM
│   ├── api_config.dart       # BFF URLs and endpoints
│   ├── assets.dart           # Asset paths
│   ├── routes.dart           # GoRouter with ShellRoutes
│   ├── theme.dart            # AppTheme (colors, typography)
│   └── stripe_config.dart    # Stripe plans
│
├── layouts/                  # Shells for ShellRoutes
│   ├── public_layout.dart    # Navbar + Footer (public pages)
│   ├── app_layout.dart       # Sidebar + Header (app)
│   ├── admin_layout.dart     # Admin shell
│   └── components/           # Layout components
│       ├── navbar.dart
│       ├── footer.dart
│       ├── sidebar.dart
│       ├── bottom_nav.dart
│       ├── auth_navbar.dart
│       └── language_selector.dart
│
├── core/                     # Technical infrastructure (no UI)
│   ├── api/                  # HTTP Client
│   │   ├── bff_api_client.dart
│   │   ├── bff_session_manager.dart
│   │   └── interceptors/
│   ├── models/               # Shared data models
│   ├── providers/            # Global state (ChangeNotifier)
│   ├── services/             # Business logic
│   ├── extensions/           # Extension methods
│   └── utils/                # Utilities
│
├── features/                 # Modules by functionality
│   ├── public/               # Public pages (/, /pricing, etc)
│   │   ├── pages/            # HomePage, PricingPage, FeaturesPage
│   │   └── sections/         # Hero, Features, CTA, etc.
│   ├── app/                  # Main app (/app/*)
│   │   ├── pages/            # AppPage, ProfilePage, RequestDetailPage
│   │   ├── widgets/          # search/, requests/, profile/, request_detail/
│   │   └── models/
│   ├── auth/                 # Authentication (no shell)
│   │   └── screens/
│   ├── admin/                # Admin panel (/admin/*)
│   │   └── screens/
│   └── beta_landing/         # Waitlist (/landing)
│       ├── screens/
│       └── widgets/
│
├── shared/                   # Reusable UI components
│   └── components/
│       ├── badges/           # PlatformBadge
│       ├── banners/          # GuestBanner
│       ├── buttons/          # CustomButton
│       ├── chips/            # MetaChip, CountChip, RemovableChip
│       ├── containers/       # GradientContainer
│       ├── feedback/         # EmptyState, ErrorState
│       ├── images/           # NetworkImageWidget
│       ├── inputs/           # CustomInput
│       └── loading/          # LoadingIndicator
│
└── l10n/                     # Internationalization (6 languages)
```

### Feature Folder Convention

Each feature follows this structure:
```
feature_name/
├── pages/        # Pages (PascalCase + Page)
├── widgets/      # Feature widgets
├── models/       # Feature-specific models
└── sections/     # Reusable sections (public/ only)
```

## Internationalization (i18n)

### Structure

- Strings are in `.arb` files in `lib/l10n/`
- `flutter gen-l10n` auto-generates Dart classes
- 6 supported languages: ES, EN, FR, PT, DE, IT

### How to Add Translations

1. Add string to `app_en.arb`:
```json
{
  "welcomeMessage": "Welcome to Pricofy",
  "@welcomeMessage": {
    "description": "Welcome message on home page"
  }
}
```

2. Add translation to `app_es.arb` (and others):
```json
{
  "welcomeMessage": "Bienvenido a Pricofy"
}
```

3. Regenerate: `flutter gen-l10n`

4. Use in code:
```dart
// In any widget with BuildContext
Text(context.l10n.welcomeMessage)
```

### Change Language

`LanguageProvider` manages the language:
```dart
// Read current language
final lang = context.read<LanguageProvider>().language;

// Change language
context.read<LanguageProvider>().setLanguage(AppLanguage.es);
```

## Shared Components

### Layouts (ShellRoutes)

| Layout | Routes | Description |
|--------|--------|-------------|
| `PublicLayout` | `/`, `/pricing`, `/caracteristicas`, `/contacto` | Navbar + Footer |
| `AppLayout` | `/app/*` | Sidebar + Header (desktop), Bottom nav (mobile) |
| `AdminLayout` | `/admin/*` | Admin panel |

### Chips

```dart
// Platform chip with color
PlatformBadge(platform: 'wallapop')

// Counter chip
CountChip(count: 42, label: 'results')

// Removable chip
RemovableChip(label: 'Filter', onRemove: () {})

// Metadata chip
MetaChip(icon: Icons.location, label: 'Madrid')
```

### UI States

```dart
// Empty state
EmptyState(
  icon: Icons.search,
  title: 'No results',
  description: 'Try a different search',
)

// Error state
ErrorState(
  message: 'Something went wrong',
  onRetry: () => _reload(),
)
```

## Build and Deploy

### Environment Variables

Injected from AWS SSM Parameter Store at build time:

| Variable | SSM Path | Description |
|----------|----------|-------------|
| `API_BASE_URL` | `/pricofy/{env}/api-gateway-url` | BFF API endpoint |
| `RECAPTCHA_SITE_KEY` | `/pricofy/{env}/promo/recaptcha-site-key` | reCAPTCHA v3 site key |
| `GA_MEASUREMENT_ID` | `/pricofy/{env}/analytics/measurement-id` | Google Analytics GA4 ID (optional) |
| `POW_SECRET` | `/pricofy/{env}/pow-secret` | Proof-of-Work secret for session |
| `FEATURE_LANDING_ONLY` | `/pricofy/{env}/feature-flags/landing-only` | Pre-launch mode flag |

### Google Analytics

GA4 is **conditionally loaded** based on SSM configuration:

| Environment | Configuration | Result |
|-------------|---------------|--------|
| **dev** | No SSM parameter | GA disabled |
| **prod** | `G-J3F1YMR3JN` in SSM | GA enabled |

**To enable/disable GA:**
```bash
# Enable GA in prod
AWS_PROFILE=pricofy-prod aws ssm put-parameter \
  --name "/pricofy/prod/analytics/measurement-id" \
  --value "G-YOUR_GA4_ID" \
  --type String

# Disable GA (remove parameter)
AWS_PROFILE=pricofy-prod aws ssm delete-parameter \
  --name "/pricofy/prod/analytics/measurement-id"
```

After changing, redeploy with `make deploy ENV=prod`.

### Feature Flags

Feature flags control behavior at build time. Managed via SSM and read by Makefile.

| Flag | Effect |
|------|--------|
| `FEATURE_LANDING_ONLY=true` | Login/signup buttons redirect to /landing instead of /login |
| `FEATURE_LANDING_ONLY=false` | Normal login behavior |

**Usage in code:**
```dart
import 'package:pricofy/config/feature_flags.dart';

// Check if login is enabled
if (FeatureFlags.loginEnabled) {
  // Show login form
}

// Navigate to appropriate route
context.go(FeatureFlags.loginRoute);  // /login or /landing
```

**Configuration:**
- Dev: `landingOnly: false` (login works)
- Prod (pre-launch): `landingOnly: true` (redirects to landing)

**To enable login in prod:** Change SSM parameter to `false` and redeploy frontend.

### Commands

```bash
# Development build
make build ENV=dev

# Production build
make build ENV=prod

# Deploy (build + S3 + CloudFront invalidation)
make deploy ENV=dev
make deploy ENV=prod
```

## Testing

```bash
# All tests
make test

# Specific test
flutter test test/validators_test.dart

# With coverage
make test-coverage
```

### Mocks

Mocks are generated with Mockito and `build_runner`:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| Web | Production | CloudFront CDN, main target |
| Android | Ready | Min SDK 23 (Android 6.0) |
| iOS | Ready | Min iOS 12.0 |
| macOS | Ready | Desktop support |
| Windows | Experimental | Requires testing |
| Linux | Experimental | Requires testing |

## Troubleshooting

### CORS errors on localhost

Use `make dev` which runs Chrome with CORS disabled.

### Build fails

```bash
flutter clean
flutter pub get
make build ENV=dev
```

### Outdated mocks

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Translations not appearing

```bash
flutter gen-l10n
flutter clean
flutter pub get
```

---

See [CLAUDE.md](CLAUDE.md) for detailed development guide.
