# CLAUDE.md

Guide for Claude Code when working in this repository. Contains project context, code patterns, and conventions to follow.

## Project Overview

**Pricofy Frontend** is a cross-platform Flutter application (Web primary, iOS, Android, Desktop) for second-hand product price evaluation.

### What the App Does

1. **Sell Mode**: User uploads photos/data of a product -> system searches platforms (Wallapop, Milanuncios, Vinted, BackMarket) -> AI analyzes and provides recommended price
2. **Buy Mode**: User searches for a product -> system shows best offers from all platforms

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Flutter 3.24+, Dart 3.5+ |
| State | Provider (ChangeNotifier) |
| Navigation | go_router |
| HTTP | Dio with interceptors |
| Auth | AWS Amplify/Cognito (magic link) |
| Payments | Stripe |
| i18n | ARB files (6 languages) |

---

## Commands

```bash
# Development
make setup              # Install dependencies
make dev                # Run web with Chrome (CORS disabled)
make analyze            # Static analysis
make format             # Format (80 chars)
make test               # Tests

# Build and Deploy
make build ENV=dev      # Development build
make build ENV=prod     # Production build
make deploy ENV=prod    # Deploy to S3 + CloudFront

# Regenerate code
flutter gen-l10n                    # Translations
flutter pub run build_runner build  # Mocks/JSON
```

---

## Nomenclature

| Term | Meaning | Where Used |
|------|---------|------------|
| **Request** | User request to evaluate a product | `core/models/request.dart`, `app/widgets/requests/` |
| **Search** | Search in marketplace (Wallapop, etc.) | `app/widgets/search/`, SearchProvider |

---

## Route Architecture (ShellRoutes)

The app uses ShellRoutes to separate layouts by section:

| Section | Layout | Routes | Description |
|---------|--------|--------|-------------|
| **Public** | `PublicLayout` | `/`, `/pricing`, `/caracteristicas`, `/contacto` | Landing pages with navbar + footer |
| **App** | `AppLayout` | `/app/*` | Main app (anonymous users can search, actions require login) |
| **Admin** | `AdminLayout` | `/admin/*` | Admin panel (requires admin) |
| **Auth** | No shell | `/login`, `/forgot-password` | Standalone pages |
| **Beta** | No shell | `/landing` | Beta landing (CDK redirect) |

### Main Routes

```dart
// Public routes
AppRoutes.home        // /
AppRoutes.pricing     // /pricing
AppRoutes.features    // /caracteristicas
AppRoutes.contact     // /contacto

// App (some require login)
AppRoutes.app         // /app (main page)
AppRoutes.newRequest  // /app/new (new request)
AppRoutes.profile     // /app/profile
AppRoutes.request(id) // /app/request/:id

// Admin
AppRoutes.admin       // /admin
```

---

## Folder Structure

```
lib/
├── main.dart                    # Entry point + MultiProvider
│
├── config/                      # GLOBAL CONFIGURATION
│   ├── app_config.dart          # Runtime config from SSM
│   ├── api_config.dart          # BFF URLs and endpoints
│   ├── assets.dart              # Asset paths (logos, images)
│   ├── feature_flags.dart       # Feature flags (SSM → build-time)
│   ├── routes.dart              # GoRouter with ShellRoutes
│   ├── theme.dart               # AppTheme (colors, typography)
│   └── stripe_config.dart       # Subscription plans
│
├── layouts/                     # SHELLS (layouts for ShellRoutes)
│   ├── public_layout.dart       # Navbar + Footer (public pages)
│   ├── app_layout.dart          # Sidebar + Header (app)
│   ├── admin_layout.dart        # Admin shell
│   └── components/
│       ├── navbar.dart          # Navbar component
│       ├── footer.dart          # Footer component
│       ├── sidebar.dart         # Sidebar for AppLayout
│       ├── bottom_nav.dart      # Mobile bottom nav
│       ├── auth_navbar.dart     # Login/logout buttons for navbar
│       └── language_selector.dart # Language selector
│
├── core/                        # TECHNICAL INFRASTRUCTURE (NO UI)
│   ├── api/                     # HTTP Client
│   │   ├── bff_api_client.dart  # Main Dio client
│   │   ├── bff_session_manager.dart
│   │   ├── api_exception.dart
│   │   └── interceptors/
│   │
│   ├── models/                  # Shared data models
│   │   ├── request.dart         # Evaluation request
│   │   ├── user.dart            # User
│   │   ├── search_result.dart   # Search result
│   │   └── ...
│   │
│   ├── providers/               # Global state
│   │   ├── auth_provider.dart   # Authentication
│   │   ├── language_provider.dart  # UI language (fallback: English)
│   │   ├── location_provider.dart  # User location (GPS/IP detection)
│   │   ├── search_provider.dart
│   │   └── ...
│   │
│   ├── services/                # Business logic
│   │   ├── location_service.dart
│   │   ├── geocoding_service.dart
│   │   └── ...
│   │
│   ├── utils/                   # Utilities
│   │   ├── validators.dart
│   │   ├── responsive.dart
│   │   └── ...
│   │
│   └── extensions/
│       └── l10n_extension.dart
│
├── features/                    # MODULES BY FUNCTIONALITY
│   │
│   ├── public/                  # Public pages (uses PublicLayout)
│   │   ├── pages/
│   │   │   ├── home_page.dart
│   │   │   ├── pricing_page.dart
│   │   │   ├── features_page.dart
│   │   │   └── contact_page.dart
│   │   └── sections/            # Reusable landing sections
│   │
│   ├── app/                     # MAIN APP (uses AppLayout)
│   │   ├── pages/               # /app/* pages
│   │   │   ├── app_page.dart           # /app (main page)
│   │   │   ├── new_request_page.dart   # /app/new
│   │   │   ├── request_detail_page.dart # /app/request/:id
│   │   │   └── profile_page.dart       # /app/profile
│   │   │
│   │   ├── widgets/             # App-specific widgets
│   │   │   ├── search/          # Search widgets
│   │   │   │   ├── search_results_view.dart
│   │   │   │   └── search_controls.dart
│   │   │   ├── requests/        # Request widgets
│   │   │   │   ├── request_card.dart
│   │   │   │   └── request_history_section.dart
│   │   │   ├── profile/         # Profile widgets
│   │   │   │   ├── wallet_tab.dart
│   │   │   │   └── subscription_tab.dart
│   │   │   └── request_detail/  # Detail widgets
│   │   │       ├── buyers_grid.dart
│   │   │       └── filters_section.dart
│   │   │
│   │   └── models/              # App-specific models
│   │       └── evaluation_detail.dart
│   │
│   ├── auth/                    # Authentication (no shell)
│   │   └── screens/
│   │       ├── login_screen.dart
│   │       └── forgot_password_screen.dart
│   │
│   ├── admin/                   # Admin panel (uses AdminLayout)
│   │   └── screens/
│   │       └── admin_dashboard_screen.dart
│   │
│   └── beta_landing/            # Beta waitlist (standalone)
│       ├── screens/
│       └── widgets/
│
├── shared/                      # REUSABLE UI COMPONENTS
│   └── components/
│       ├── badges/              # PlatformBadge
│       ├── banners/             # GuestBanner
│       ├── buttons/             # CustomButton
│       ├── chips/               # MetaChip, CountChip, RemovableChip
│       ├── containers/          # GradientContainer
│       ├── feedback/            # EmptyState, ErrorState
│       ├── images/              # NetworkImageWidget
│       ├── inputs/              # CustomInput
│       └── loading/             # LoadingIndicator, SearchProgressIndicator
│
└── l10n/                        # INTERNATIONALIZATION
```

---

## Where to Put New Code

| Code Type | Location | Example |
|-----------|----------|---------|
| **New /app page** | `features/app/pages/` | `settings_page.dart` |
| **App-specific widget** | `features/app/widgets/{section}/` | `app/widgets/search/filter_chip.dart` |
| **Reusable UI widget** | `shared/components/{type}/` | `shared/components/buttons/icon_button.dart` |
| **Public page** | `features/public/pages/` | `about_page.dart` |
| **Shared model** | `core/models/` | `payment.dart` |
| **Feature model** | `features/{feature}/models/` | `app/models/filter_state.dart` |
| **Global provider** | `core/providers/` | `theme_provider.dart` |
| **Infrastructure service** | `core/services/` | `analytics_service.dart` |
| **Utility** | `core/utils/` | `formatters.dart` |
| **Layout component** | `layouts/components/` | `breadcrumbs.dart` |

### Simple Rule

- **Is it reusable visual UI?** → `shared/components/`
- **Is it infrastructure/logic?** → `core/`
- **Is it feature-specific?** → `features/{feature}/`
- **Is it a layout shell?** → `layouts/`

---

## Code Patterns

### State Management with Provider

```dart
// Read once (non-reactive)
final api = context.read<BffApiClient>();
final auth = context.read<AuthProvider>();

// Reactive read (rebuilds widget)
final searchState = context.watch<SearchProvider>();
final isLoading = context.select<SearchProvider, bool>((p) => p.isLoading);

// NEVER create instances manually
// BAD:  final api = BffApiClient();
// GOOD: final api = context.read<BffApiClient>();
```

### Navigation with GoRouter

```dart
// Use AppRoutes constants (lib/config/routes.dart)
context.go(AppRoutes.app);           // /app
context.go(AppRoutes.newRequest);    // /app/new
context.go(AppRoutes.request(id));   // /app/request/:id
context.go(AppRoutes.profile);       // /app/profile

// Public routes
context.go(AppRoutes.home);          // /
context.go(AppRoutes.pricing);       // /pricing

// NEVER hardcode paths
// BAD:  context.go('/dashboard');
// GOOD: context.go(AppRoutes.app);
```

### Internationalization

```dart
// Use context.l10n extension
Text(context.l10n.welcomeMessage)
Text(context.l10n.errorNotFound)

// NEVER use inline ternaries for translations
// BAD:  Text(isSpanish ? 'Hola' : 'Hello')
// GOOD: Text(context.l10n.greeting)
```

### Adding New Translations

1. Edit `lib/l10n/app_en.arb` (main source):
```json
{
  "newKey": "English text",
  "@newKey": {
    "description": "Description for translators"
  }
}
```

2. Add to `app_es.arb` and other languages

3. Regenerate: `flutter gen-l10n`

4. Use: `context.l10n.newKey`

### API Client

```dart
// Get client
final api = context.read<BffApiClient>();

// Calls (handle exceptions)
try {
  final results = await api.search(query: 'iphone');
} on ApiException catch (e) {
  // e.code = 'UNAUTHORIZED', 'RATE_LIMITED', etc.
  final userMessage = translateErrorCode(context.l10n, e.code);
  showSnackBar(userMessage);
}
```

### Reusable Components

```dart
// Platform badge (Wallapop, Vinted, etc)
PlatformBadge(platform: 'wallapop')

// Chips
MetaChip(icon: Icons.location, label: 'Madrid')
CountChip(count: 42, label: 'results')
RemovableChip(label: 'iPhone', onRemove: () => removeFilter())

// States
EmptyState(
  icon: Icons.search_off,
  title: context.l10n.noResults,
  description: context.l10n.tryDifferentSearch,
)

ErrorState(
  message: context.l10n.errorOccurred,
  onRetry: () => _reload(),
)
```

---

## Colors and Theme

Defined in `lib/config/theme.dart`:

```dart
// Primary (teal/cyan)
AppTheme.primary50   // Lightest
AppTheme.primary600  // Main
AppTheme.primary900  // Darkest

// Grays
AppTheme.gray50 - gray900

// Per platform
AppTheme.platformColor('wallapop')  // Orange
AppTheme.platformColor('vinted')    // Green
AppTheme.platformColor('milanuncios')  // Blue
AppTheme.platformColor('backmarket')   // Dark blue

// Radius
AppTheme.radiusSm   // 4
AppTheme.radiusMd   // 8
AppTheme.radiusLg   // 12
AppTheme.radiusXl   // 16
```

---

## Responsive

Breakpoints in `lib/core/utils/responsive.dart`:

```dart
// Check
if (Responsive.isMobile(context)) { ... }
if (Responsive.isTablet(context)) { ... }
if (Responsive.isDesktop(context)) { ... }

// Values
// Mobile: < 640px
// Tablet: 640px - 1024px
// Desktop: >= 1024px
// Widescreen: >= 1280px
```

---

## Feature Flags

Feature flags are read from SSM at build time via `--dart-define`. Located in `lib/config/feature_flags.dart`.

### Available Flags

| Flag | Environment Variable | Description |
|------|---------------------|-------------|
| `landingOnly` | `FEATURE_LANDING_ONLY` | When `true`, login redirects to /landing |

### Usage

```dart
import 'package:pricofy/config/feature_flags.dart';

// Check if login is enabled
if (FeatureFlags.loginEnabled) {
  // Normal login available
}

// Get appropriate login route (respects landingOnly flag)
context.go(FeatureFlags.loginRoute);  // Returns /login or /landing
```

### How It Works

1. **CDK creates SSM parameter** on deploy (`/pricofy/{env}/feature-flags/landing-only`)
2. **Makefile reads SSM** at build time
3. **Flutter build** receives via `--dart-define=FEATURE_LANDING_ONLY=true`
4. **FeatureFlags class** reads via `String.fromEnvironment`

### Widgets Using FeatureFlags

Widgets that navigate to login should use `FeatureFlags.loginRoute`:

```dart
// CORRECT - respects feature flag
context.go(FeatureFlags.loginRoute);

// WRONG - ignores feature flag
context.go(AppRoutes.login);
```

Files already updated:
- `layouts/components/auth_navbar.dart`
- `core/widgets/guest_mode_banner.dart`
- `core/widgets/registration_modal.dart`
- `features/public/sections/hero_section.dart`
- `features/public/sections/cta_section.dart`
- `features/public/sections/global_solution_section.dart`
- `features/app/pages/app_page.dart`

---

## Authentication

### Login Flow (Magic Link)

```dart
final auth = context.read<AuthProvider>();

// 1. Init login
await auth.initLogin(email);

// 2. Send code
await auth.sendCode(email);

// 3. Verify code (returns tokens)
final tokens = await auth.verifyCode(email, code);

// 4. Login with tokens
await auth.loginWithTokens(tokens);
```

### Auth States

```dart
final auth = context.watch<AuthProvider>();

auth.isAuthenticated  // true if session exists
auth.isAdmin          // true if admin
auth.user             // Current user or null
auth.isLoading        // Loading
```

### Protected Routes

In `routes.dart`, some routes require authentication:

```dart
// Public routes (anyone can access)
/              # Home
/app           # App (anonymous can search)

// Protected routes (redirect to login if not authenticated)
/app/new       # New request
/app/profile   # Profile
/app/request/:id  # Request detail
/admin/*       # Admin panel (requires isAdmin)
```

Redirect is handled globally in `createRouter()`:
```dart
if (!isAuthenticated && isGoingToProtectedApp) {
  return '${AppRoutes.login}?redirect=${Uri.encodeComponent(location)}';
}
```

---

## Location Detection

### LocationProvider

Detects user location **lazily on first search** (not at app load). Location is NOT persisted - re-detects on reload to support VPN/travel.

```dart
// Read location data
final location = context.read<LocationProvider>();

location.countryCode      // ISO 3166-1 alpha-2 (e.g., "ES", "FR")
location.coords           // Coordinates(lat, lon) or null
location.gpsForSearch     // Map<String, double>? for API calls
location.hasPreciseLocation  // True if postal code centroid
location.source           // LocationSource enum
location.status           // LocationStatus enum (unknown, detecting, detected, error)
```

### Lazy Detection Flow

**Important:** Location is NOT detected at app load. Detection triggers when user performs first search.

```
User clicks "Search"
   ↓
1. SearchProvider calls ensureLocationDetected()
   ↓
2. LocationProvider shows GPS permission popup (if not cached by browser)
   ↓ Allow              ↓ Deny/Error
3a. GPS coords       3b. IP-only detection
   ↓                    ↓
4. Calls BFF POST /detect/location (with GPS if available)
   ↓
5. BFF calls location-service → returns postal code centroid
   ↓
6. Stored in memory (UserLocation model)
   ↓
7. Search continues with detected location
   ↓
8. Subsequent searches use cached location (no GPS popup)
```

### Why Lazy Detection?

1. **Better UX:** Don't ask for GPS permission before user wants to search
2. **Session timing:** BFF session token must exist before calling /detect/location
3. **Privacy:** Only request location when actually needed

### Location Sources

| Source | Description |
|--------|-------------|
| `postalCentroid` | Precise coords from postal code (ES, FR, DE, IT, PT) |
| `capitalFallback` | Country capital coords (unsupported countries) |
| `ipApproximate` | Approximate coords from MaxMind IP |
| `fallback` | Madrid defaults (all detection failed) |

### UserLocation Model

```dart
class UserLocation {
  final String countryCode;     // Always present
  final Coordinates? coords;    // May be null
  final String? postalCode;
  final String? municipality;
  final LocationSource source;

  bool get hasPreciseCoords => source == LocationSource.postalCentroid;
  bool get isFullySupported => source == LocationSource.postalCentroid;
}
```

---

## Environment Variables

Injected at build time from AWS SSM:

| Variable | SSM Parameter | Description |
|----------|---------------|-------------|
| `API_BASE_URL` | `/pricofy/{env}/api-gateway-url` | BFF URL |
| `ENVIRONMENT` | (hardcoded) | `dev` or `prod` |
| `RECAPTCHA_SITE_KEY` | `/pricofy/{env}/promo/recaptcha-site-key` | reCAPTCHA v3 site key |
| `GA_MEASUREMENT_ID` | `/pricofy/{env}/analytics/measurement-id` | Google Analytics GA4 ID (optional) |
| `POW_SECRET` | `/pricofy/{env}/pow-secret` | Proof-of-Work secret |
| `FEATURE_LANDING_ONLY` | `/pricofy/{env}/feature-flags/landing-only` | Pre-launch mode flag |

Access in code:

```dart
final apiUrl = AppConfig.apiBaseUrl;
final env = AppConfig.environment;
```

---

## Google Analytics

GA4 is conditionally loaded based on SSM configuration:

| Environment | SSM Parameter | GA Status |
|-------------|---------------|-----------|
| **dev** | Not set | GA disabled |
| **prod** | `G-J3F1YMR3JN` | GA enabled |

### How It Works

1. **Makefile** reads `/pricofy/{env}/analytics/measurement-id` from SSM at build time
2. If parameter exists: ID is injected into `index.html` via sed replacement
3. If parameter missing/empty: placeholder `__GA_MEASUREMENT_ID__` remains
4. **Runtime JS check**: Only loads GA script if ID starts with `G-`

### Configuration

```bash
# Enable GA in prod
AWS_PROFILE=pricofy-prod aws ssm put-parameter \
  --name "/pricofy/prod/analytics/measurement-id" \
  --value "G-YOUR_GA4_ID" \
  --type String

# Disable GA (delete parameter or leave empty)
AWS_PROFILE=pricofy-prod aws ssm delete-parameter \
  --name "/pricofy/prod/analytics/measurement-id"
```

### Verification

After deploy, check `index.html` in browser DevTools:
- **GA enabled**: Search for `googletagmanager.com` and your `G-` ID
- **GA disabled**: No gtag script should load

---

## Testing

```bash
# Run tests
make test

# Regenerate mocks (after changing interfaces)
flutter pub run build_runner build --delete-conflicting-outputs

# Specific test
flutter test test/validators_test.dart
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case | `search_result_card.dart` |
| Classes | PascalCase | `SearchResultCard` |
| Variables | camelCase | `searchResults` |
| Constants | camelCase | `maxResults` |
| Providers | PascalCase + Provider | `AuthProvider` |
| Pages | PascalCase + Page | `AppPage`, `ProfilePage` |
| Widgets | PascalCase | `SearchControlsBar` |

---

## Client-Side Filtering Architecture

All filtering, sorting, and pagination happens CLIENT-SIDE. The backend returns all results, and the frontend processes them locally for instant UX.

### FilterEngine and SortEngine

Located in `lib/core/filters/`:

```dart
// Filter types (each implements ResultFilter)
PriceRangeFilter(min: 100, max: 500)
DistanceFilter(maxDistance: 50)
PlatformFilter.fromList(['wallapop', 'milanuncios'])
CountryFilter.fromList(['ES', 'FR'])
TextSearchFilter(query: 'iPhone')

// Apply filters
final filterEngine = FilterEngine();
filterEngine.setFilter(PriceRangeFilter(min: 100));
filterEngine.setFilter(PlatformFilter.fromList(['wallapop']));
final filtered = filterEngine.apply(allResults); // Instant, no API call

// Apply sorting
final sortEngine = SortEngine();
sortEngine.setSingleCriterion(PriceComparator(), SortOrder.asc);
final sorted = sortEngine.apply(filtered);
```

### Adding a New Filter

1. Create a new class implementing `ResultFilter` in `core/filters/result_filter.dart`:
```dart
class MyNewFilter implements ResultFilter {
  @override String get id => 'myfilter';
  @override String get displayName => 'My Filter';
  @override bool get isActive => /* has constraints */;
  @override bool matches(SearchResult result) => /* match logic */;
}
```

2. Add to `SearchFilters` model if needed for UI state
3. Add to `FilterEngine.applyFromSearchFilters()` if converting from SearchFilters
4. Add unit tests in `test/core/filters/filter_engine_test.dart`

### Adding a New Sort Criterion

1. Create a new class implementing `ResultComparator` in `core/filters/result_comparator.dart`:
```dart
class MyComparator implements ResultComparator {
  @override String get id => 'myfield';
  @override String get displayName => 'My Field';
  @override SortField get sortField => SortField.myfield;
  @override int compare(SearchResult a, SearchResult b) => /* compare logic */;
}
```

2. Add to `SortField` enum if needed
3. Update `getComparatorForField()` factory
4. Add unit tests in `test/core/filters/sort_engine_test.dart`

### SearchProvider Flow

```
1. User submits search
   └── SearchProvider.startSearch() → API call → get searchId
       └── Response includes scraperTasks[] with status=pending
       └── Frontend can show "Searching in Wallapop, Vinted..." immediately

2. Polling for results (incremental by scraper)
   └── _pollForResults() → getStatus() → detect completed scrapers
       └── scraperTasks[i].status changes: pending → scraping → completed
       └── _loadResultsFromScrapers(['wallapop']) → getResults(scrapers: [...])
           └── Results added to _allResults

3. Default display order (round-robin interleaving)
   └── filteredResults getter → _interleaveByPlatform()
       └── Results mixed by platform+country (e.g., vinted-ES, vinted-FR, wallapop-ES)
       └── Ensures balanced distribution instead of blocks by scraper arrival order

4. User changes filter (instant, no API)
   └── applyFilters() → _filterEngine updated → notifyListeners()
       └── filteredResults getter recomputes instantly (round-robin reapplied)

5. User changes sort (instant, no API)
   └── setSortCriteria() → _sortEngine updated → notifyListeners()
       └── Explicit sort (price, date, distance) replaces round-robin

6. User loads more (virtual pagination)
   └── loadMoreResults() → _displayLimit += 20 → notifyListeners()
```

### Round-Robin Interleaving (Default Order)

When no explicit sort is selected, results are interleaved by `platform-country` to ensure a balanced mix from all sources:

```dart
// Example: 3 sources with different result counts
// vinted-ES: [V1, V2, V3, V4, V5]
// vinted-FR: [F1, F2, F3]
// wallapop-ES: [W1, W2, W3, W4]

// Result after round-robin:
// [V1, F1, W1, V2, F2, W2, V3, F3, W3, V4, W4, V5]
```

**Key points:**
- Groups by `platform-country` (e.g., `vinted-ES`, `vinted-FR`), not just platform
- Recalculates automatically when new scraper results arrive
- When user selects explicit sort (price/date/distance), round-robin is replaced
- Implemented in `SearchProvider._interleaveByPlatform()`

---

## Scraper Task Tracking (Event-Driven Architecture)

The backend uses an event-driven SQS architecture. The frontend receives per-scraper status tracking through `scraperTasks[]`.

### ScraperTaskTracking Model

Located in `lib/core/models/search_progress.dart`:

```dart
enum ScraperTaskStatus {
  pending,     // Task created, waiting to be processed
  scraping,    // Scraper is actively fetching results
  aggregating, // Results being deduplicated
  enriching,   // AI analyzing results (advanced mode)
  translating, // Translating results
  persisting,  // Saving to database
  completed,   // Task finished successfully
  failed,      // Task encountered an error
  expired,     // Task TTL exceeded
}

class ScraperTaskTracking {
  final String scraper;        // e.g., "wallapop"
  final String country;        // e.g., "ES"
  final List<String> variants; // AI-generated search variants
  final ScraperTaskStatus status;
  final String? statusDetail;  // Human-readable progress
  final bool fromCache;        // True if results came from cache
  final int resultCount;       // Number of results found
  final String? error;         // Error message if failed
}
```

### Completion Detection

The `SearchProgress.isComplete` getter calculates completion from individual scraper tasks:

```dart
/// True if search is complete (all scrapers have finished)
bool get isComplete {
  // Event-driven mode: calculate from scraperTasks
  if (scraperTasks.isNotEmpty) {
    return scraperTasks.every((t) => t.status.isTerminal);
  }
  // Legacy mode: use global status from backend
  return status == 'completed' || status == 'done';
}
```

**Terminal states:** `completed`, `failed`, `expired`

### Displaying Per-Scraper Progress

```dart
// Show individual scraper status
for (final task in progress.scraperTasks) {
  print('${task.displayName}: ${task.status.name}');
  // Example: "Wallapop ES: scraping"

  if (task.fromCache) {
    print('  (from cache)');
  }
  if (task.error != null) {
    print('  Error: ${task.error}');
  }
}

// Progress indicators
final completed = progress.scraperTasks
    .where((t) => t.status == ScraperTaskStatus.completed).length;
final total = progress.scraperTasks.length;
print('Progress: $completed/$total scrapers');
```

### Cache Handling

Results may come from cache for instant response:

```dart
// Check if specific scraper used cache
final wallapop = progress.scraperTasks
    .firstWhere((t) => t.scraper == 'wallapop');
if (wallapop.fromCache) {
  // Results were served from cache (no network delay)
  // Status transitions instantly: pending → completed
}
```

### Error Handling

```dart
// Show scraper-specific errors
for (final task in progress.scraperTasks.where((t) => t.status == ScraperTaskStatus.failed)) {
  showError('${task.displayName} failed: ${task.error ?? "Unknown error"}');
}

// Check if entire search failed
if (progress.hasFailed) {
  // All scrapers failed - no results
}
```

---

## Platform Attestation (Native Apps)

Native iOS/Android apps use Platform Attestation instead of reCAPTCHA for bot protection.

### How It Works

| Platform | Session Creation | Protected Endpoints |
|----------|-----------------|---------------------|
| **Web** | PoW challenge + TLS fingerprint | reCAPTCHA required |
| **iOS** | PoW + DeviceCheck token | Skip reCAPTCHA |
| **Android** | PoW + Play Integrity token | Skip reCAPTCHA |

### Session Token Types

The BFF creates JWT session tokens with a `platform` field:

```
Web:    { ..., platform: 'web', tlsHash: 'abc...' }
Native: { ..., platform: 'native', platformProofHash: 'xyz...' }
```

Security gate checks this field to determine reCAPTCHA requirement.

### Key Files

| File | Purpose |
|------|---------|
| `core/services/platform_attestation_service.dart` | Generates DeviceCheck/Play Integrity tokens |
| `core/services/pow_service.dart` | PoW solver, adds platform proof for native |
| `core/api/bff_session_manager.dart` | Session management, sends platform proof to BFF |
| `ios/Runner/PlatformAttestationHandler.swift` | iOS DeviceCheck native code |
| `android/.../PlatformAttestationHandler.kt` | Android Play Integrity native code |

### Local Development (Mock Tokens)

In debug mode, simulators/emulators generate mock tokens:

```dart
// iOS simulator → DEV_DEVICE_TOKEN_<hash>
// Android emulator → DEV_PLAY_INTEGRITY_<hash>
```

BFF accepts these in `ENVIRONMENT=dev` without Apple/Google validation.

### Production Requirements

| Platform | Requirement |
|----------|-------------|
| iOS | App registered in Apple Developer Program, DeviceCheck capability |
| Android | App registered in Google Play Console, Play Integrity API enabled |

### Testing

```bash
# Web (no changes)
make dev

# iOS Simulator (mock tokens)
make ios-dev ENV=dev
# Check logs: "[Puzzle] ✅ Platform proof generated"

# Android Emulator (mock tokens)
make android-dev ENV=dev
# Check logs: "[Puzzle] ✅ Platform proof generated"
```

### Android Requirements (Stripe compatibility)

Android requires specific configuration for Stripe:

1. **MainActivity** must extend `FlutterFragmentActivity` (not `FlutterActivity`)
2. **Themes** must use `Theme.MaterialComponents` parent

These are already configured in:
- `android/app/src/main/kotlin/.../MainActivity.kt`
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/res/values-night/styles.xml`

---

## Important Rules

1. **NEVER create providers manually** - always `context.read<T>()`
2. **NEVER hardcode routes** - use `AppRoutes.xxx`
3. **NEVER hardcode strings** - use `context.l10n.xxx`
4. **Document files** with header comment
5. **Use shared components** before creating new ones
6. **Handle errors** with try/catch on API calls
7. **Consistent naming**: Request (user request), Search (marketplace search)
8. **Separate core from UI**: core/ = infrastructure, shared/ = reusable UI
9. **Client-side filtering**: Never call API for filter/sort changes, use FilterEngine/SortEngine
