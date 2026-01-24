# Changelog - Pricofy Flutter Frontend

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added (Session 1 - 2025-11-10)

#### Project Setup
- Created Flutter project with proper organization (com.pricofy)
- Configured `pubspec.yaml` with 15+ production dependencies
- Set up directory structure: `lib/{config,core,features,shared}`
- Configured `.gitignore` for Flutter/Dart
- Added `README.md` with comprehensive project documentation
- Added `PROGRESS_REPORT.md` with detailed status

#### Design System
- Implemented `AppTheme` with brand colors (#667eea, #764ba2)
- Configured Google Fonts (Poppins, weights 300-700)
- Created spacing system (4,8,12,16,24,32,48,64)
- Defined border radius values (4,8,12,16,24)
- Implemented shadow system (lg, xl)
- Added gradient configurations (primary, hero)

#### Custom Widgets
- `PrimaryButton`: Gradient button with hover effects and box shadows
- `SecondaryButton`: Outlined button with border and hover states
- `CustomInput`: Styled text field with validation support
- `LoadingIndicator`: Circular progress indicator with sizes
- `GradientContainer`: Flexible gradient backgrounds

#### Core API
- `ApiClient`: Dio-based HTTP client with interceptors
- X-Api-Key authentication on all requests
- JWT token management for Cognito
- Pretty logger for debugging
- Comprehensive error handling with Spanish messages
- All 13 API methods implemented:
  - `submitEvaluation` (multipart)
  - `submitContact`
  - `detectCountry`
  - `getEvaluation`
  - `getAllSolicitudes` (admin)
  - `getAllContactos` (admin)
  - `getAllUsers` (admin)
  - `deleteUser` (admin)
  - `updateUserProfile` (admin)
  - `updateUserGroup` (admin)
  - `getMyEvaluations` (user)
  - `getProfile` (user)
  - `updateProfile` (user)

#### Models
- `Solicitud`: Product evaluation request model
- `Contacto`: Contact form submission model
- `User`: Cognito user model with groups
- All models use Equatable for value equality
- Complete JSON serialization/deserialization

####  State Management (Provider)
- `AuthProvider`: AWS Amplify/Cognito authentication
  - Social login (Google, Apple, Facebook)
  - Magic link flow (email code)
  - Admin SRP auth (email + password)
  - Auto session refresh
  - isAdmin computed property
- `LanguageProvider`: ES/EN language management
  - SharedPreferences persistence
  - Instant switching
  - Context extensions
- `FormProvider`: Product form modal state
  - Open/close management
  - Initial action (vender/comprar)

#### Validation & Utils
- `validators.dart`: Ultra-robust email validation
  - 200+ disposable email domains blocked
  - RFC 5322 regex validation
  - Suspicious pattern detection
  - Random domain filtering
- `constants.dart`: App-wide constants
  - 52 European countries
  - 12 product types
  - 5 product conditions
  - 3 urgency levels
  - Photo constraints (max 6, 5MB)
- `responsive.dart`: Responsive design utilities
  - Breakpoints (mobile, tablet, desktop, widescreen)
  - Platform detection (web, mobile, Android, iOS, desktop)
  - Context extensions
  - ResponsiveBuilder widget

#### Internationalization (i18n)
- Complete ES/EN translations migrated from Next.js
- `app_localizations_es.dart`: 200+ Spanish strings
- `app_localizations_en.dart`: 200+ English strings
- All sections covered:
  - Navbar, Hero, Use Cases
  - Features, Pricing, CTA
  - Footer, Contact, Form
  - Errors, Validation messages
- Type-safe access via AppLocalizations class

#### Layouts
- `AppScaffold`: Main layout with Navbar and Footer
- `Navbar`: Responsive navigation bar
  - Fixed positioning
  - Logo (clickable to home)
  - Navigation links (Features, Pricing, Contact)
  - Language selector dropdown
  - Auth dropdown (Profile, Dashboard, Admin, Logout)
  - Hamburger menu for mobile
- `Footer`: 4-column footer layout
  - Brand section with gradient title
  - Product links
  - Company links
  - Legal links
  - Dynamic copyright year
  - Responsive stacking on mobile

#### Shared Widgets
- `LanguageSelector`: Dropdown with flags (🇪🇸/🇬🇧)
- `AuthNavbar`: Context-aware auth buttons/dropdown
  - Login/Signup when not authenticated
  - Profile dropdown when authenticated
  - Admin link for admin users
  - Logout with confirmation

#### Configuration
- `app_config.dart`: Environment configuration
  - API Gateway URL
  - API Key
  - Cognito User Pool ID/Client ID
  - OAuth configuration
  - Amplify JSON config string
- `theme.dart`: Complete Material Theme
  - ColorScheme configuration
  - TextTheme with Poppins
  - InputDecorationTheme
  - Button themes
  - Card theme
- `routes.dart`: GoRouter configuration
  - 10 routes defined
  - Protected route logic
  - Admin route protection
  - Redirect logic based on auth state

#### Screen Stubs
Created placeholder screens for all routes:
- `HomeScreen`
- `FeaturesScreen`
- `PricingScreen`
- `ContactScreen`
- `LoginScreen`
- `SignupScreen`
- `AdminLoginScreen`
- `DashboardScreen`
- `ProfileScreen`
- `AdminDashboardScreen`

#### Main App
- `main.dart`: App entry point
  - Amplify configuration on startup
  - MultiProvider setup (Auth, Language, Form, API)
  - MaterialApp.router with GoRouter
  - Theme configuration

### Fixed
- Resolved `AuthProvider` naming conflict with Amplify (using import prefixes)
- Fixed doc comment format warnings

### Technical Decisions
- **Provider over Riverpod**: Chosen for maturity and simplicity
- **GoRouter over Navigator 2.0**: Declarative routing
- **Dio over HTTP**: Better interceptor support and logging
- **Material 3**: Better web and mobile support
- **CanvasKit renderer**: Better web performance
- **Import prefixes**: `app.AuthProvider` to avoid Amplify conflicts

### Metrics
- **Files created**: 36 Dart files
- **Lines of code**: ~3,500+
- **Translations**: 200+ strings (ES + EN)
- **API methods**: 13 endpoints
- **Models**: 3 domain models
- **Providers**: 3 state providers
- **Custom widgets**: 8 widgets
- **Layouts**: 3 layout components
- **Routes**: 10 defined routes
- **TODOs completed**: 4/11 (36%)

## [0.1.0] - Planned

### To Do
- [ ] Complete public pages (Home, Features, Pricing, Contact)
- [ ] Implement auth screens (Login, Signup, Admin Login)
- [ ] Build ProductForm with photo picker and validation
- [ ] Create Dashboard and Profile screens with API integration
- [ ] Implement Admin Panel with 3 tabs and CRUD operations
- [ ] Add widget and integration tests
- [ ] Configure Android (permissions, deep links)
- [ ] Configure iOS (permissions, deep links)
- [ ] Build and deploy web to S3 + CloudFront
- [ ] Test on real devices (Android/iOS)

## Notes

- reCAPTCHA removed for mobile (web-only feature)
- Lambda Function URLs disabled (API Gateway only)
- All code follows SOLID principles and clean architecture
- Comprehensive documentation in English
- Full type safety with strict mode

