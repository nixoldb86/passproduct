# Makefile for pricofy-front-flutter
# Flutter Web Application Build & Deploy

.PHONY: help install clean analyze format test build deploy deploy-quick sync invalidate setup dev dev-release run ios-dev android-dev run-all

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Environment Configuration
ENV ?= dev
AWS_REGION := eu-west-1

# AWS Profiles
AWS_PROFILE_DEV = pricofy-dev
AWS_PROFILE_PROD = pricofy-prod

# Calculate AWS_PROFILE based on ENV
ifeq ($(ENV),prod)
  AWS_PROFILE = $(AWS_PROFILE_PROD)
else
  AWS_PROFILE = $(AWS_PROFILE_DEV)
endif

# Main Commands:
#   make dev          - Run locally with CORS disabled (hot reload enabled)
#   make build        - Clean + build for ENV (default: dev)
#   make deploy       - Clean + build + deploy to ENV (default: dev)
#   make test         - Run unit tests
#   make analyze      - Run static analysis

help: ## Show this help message
	@echo "$(BLUE)pricofy-front-flutter Makefile$(NC)"
	@echo "$(YELLOW)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# === Setup & Installation ===

setup: ## Initial setup (install Flutter dependencies)
	@echo "$(BLUE)Setting up project...$(NC)"
	flutter pub get
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install: setup ## Alias for setup

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	flutter clean
	rm -rf build/
	@echo "$(GREEN)✓ Clean complete$(NC)"

# === Code Quality ===

analyze: ## Run static analysis
	@echo "$(BLUE)Running static analysis...$(NC)"
	flutter analyze

format: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	dart format lib/ test/ --line-length 80

format-check: ## Check code formatting
	@echo "$(BLUE)Checking code format...$(NC)"
	dart format lib/ test/ --line-length 80 --output=none --set-exit-if-changed

lint: analyze ## Alias for analyze

# === Testing ===

test: ## Run unit tests
	@echo "$(BLUE)Running unit tests...$(NC)"
	flutter test

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	flutter test --coverage
	@echo "$(GREEN)✓ Coverage report: coverage/lcov.info$(NC)"

# === Development ===

dev: ## Run in Chrome with CORS disabled and hot reload (reads config from SSM)
	@echo "$(BLUE)Starting development server...$(NC)"
	@echo "$(YELLOW)Reading configuration from SSM Parameter Store...$(NC)"
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/frontend/api-url --query 'Parameter.Value' --output text > /tmp/pricofy_api_url.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/frontend/api-url not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/pow-secret --with-decryption --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_pow_secret.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/pow-secret not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/promo/recaptcha-site-key --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_recaptcha.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/promo/recaptcha-site-key not found$(NC)" && exit 1)
	@# Feature flags (with defaults if not found - first deploy may not have them yet)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/feature-flags/landing-only --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_ff_landing.txt 2>/dev/null || echo "false" > /tmp/pricofy_ff_landing.txt
	@echo "$(GREEN)✅ Configuration loaded from SSM$(NC)"
	@echo "$(YELLOW)Starting Flutter web server on port 8080...$(NC)"
	@echo ""
	@echo "$(YELLOW)Hot reload: Press 'r', Hot restart: Press 'R', Quit: Press 'q'$(NC)"
	@echo "$(YELLOW)>>> Once you see 'is being served at', open: http://localhost:8080$(NC)"
	@echo ""
	@flutter run -d web-server --web-port=8080 --web-hostname=localhost \
		--dart-define=ENVIRONMENT=$(ENV) \
		--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
		--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
		--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt) \
		--dart-define=FEATURE_LANDING_ONLY=$$(cat /tmp/pricofy_ff_landing.txt)
	@rm -f /tmp/pricofy_api_url.txt /tmp/pricofy_pow_secret.txt /tmp/pricofy_recaptcha.txt /tmp/pricofy_ff_landing.txt

run: dev ## Alias for dev

dev-release: ## Build producción (WASM+JS) y servir en local para probar Safari/WebKit
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)  BUILD RELEASE LOCAL (WASM + JS fallback)$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(YELLOW)Reading configuration from SSM Parameter Store...$(NC)"
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/frontend/api-url --query 'Parameter.Value' --output text > /tmp/pricofy_api_url.txt 2>/dev/null || (echo "$(RED)ERROR: SSM parameter not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/pow-secret --with-decryption --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_pow_secret.txt 2>/dev/null || (echo "$(RED)ERROR: SSM parameter not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/promo/recaptcha-site-key --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_recaptcha.txt 2>/dev/null || (echo "$(RED)ERROR: SSM parameter not found$(NC)" && exit 1)
	@echo "$(GREEN)✅ SSM config loaded$(NC)"
	@echo "$(YELLOW)Building WASM + JS fallback...$(NC)"
	@flutter build web --release \
		--wasm \
		--no-source-maps \
		--pwa-strategy none \
		--dart-define=ENVIRONMENT=$(ENV) \
		--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
		--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
		--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt)
	@rm -f /tmp/pricofy_api_url.txt /tmp/pricofy_pow_secret.txt /tmp/pricofy_recaptcha.txt
	@echo "$(YELLOW)🗑️  Removing Service Worker (not needed)...$(NC)"; \
	rm -f build/web/flutter_service_worker.js; \
	echo "$(GREEN)✓ Service Worker removed$(NC)"
	@echo "$(YELLOW)🔐 Minificando HTML...$(NC)"; \
	npx html-minifier-terser build/web/index.html \
		--collapse-whitespace \
		--remove-comments \
		--minify-js true \
		--minify-css true \
		-o build/web/index.html; \
	echo "$(GREEN)✓ HTML minificado$(NC)"
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Build listo. Sirviendo en http://localhost:8080$(NC)"
	@echo "$(GREEN)  Abre Safari para probar JS fallback$(NC)"
	@echo "$(GREEN)  Ctrl+C para parar$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@python3 -m http.server 8080 -d build/web

chrome: ## Open Chrome with CORS disabled (for development)
	@echo "$(YELLOW)Launching Chrome with CORS disabled...$(NC)"
	@/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
		--user-data-dir="/tmp/pricofy-chrome-dev" \
		--disable-web-security \
		--disable-site-isolation-trials \
		--disable-features=BlockInsecurePrivateNetworkRequests \
		--no-first-run \
		--no-default-browser-check \
		"http://localhost:8080" \
		> /dev/null 2>&1 &
	@echo "$(GREEN)✓ Chrome opened at http://localhost:8080$(NC)"

dev-stop: ## Stop development server (kills Flutter and Chrome dev instances)
	@echo "$(YELLOW)Stopping development server...$(NC)"
	@pkill -f "flutter.*web-port=8080" 2>/dev/null || true
	@pkill -f "chrome.*pricofy-chrome-dev" 2>/dev/null || true
	@rm -f /tmp/pricofy_api_url.txt /tmp/pricofy_pow_secret.txt /tmp/pricofy_recaptcha.txt
	@echo "$(GREEN)✓ Development server stopped$(NC)"

# === Quick Local Testing ===

quick-test: ## Quick comprehensive test (analyze + test + build web)
	@echo "$(BLUE)Running quick test suite...$(NC)"
	@chmod +x ./scripts/test-all-platforms.sh
	@./scripts/test-all-platforms.sh


quick-test-all: ## Quick test: web + android + ios (requires emulators)
	@echo "$(BLUE)Quick test on all platforms...$(NC)"
	@echo "$(YELLOW)1. Testing web build...$(NC)"
	@flutter build web --debug --no-tree-shake-icons
	@echo "$(YELLOW)2. Testing Android build...$(NC)"
	@flutter build apk --debug
	@echo "$(YELLOW)3. Checking iOS build...$(NC)"
	@flutter build ios --debug --no-codesign
	@echo "$(GREEN)✓ All platforms build successfully!$(NC)"

devices: ## Show all available devices
	@echo "$(BLUE)Available devices:$(NC)"
	@flutter devices
	@echo ""
	@echo "$(BLUE)Android emulators:$(NC)"
	@flutter emulators | grep -v "No emulators" || echo "$(YELLOW)No Android emulators found$(NC)"
	@echo ""
	@echo "$(BLUE)iOS simulators:$(NC)"
	@xcrun simctl list devices available | grep -E "iPhone|iPad" | head -5 || echo "$(YELLOW)No iOS simulators found$(NC)"

# === Build ===

build-html: ## Build web app with HTML renderer
	@echo "$(BLUE)Building web app with HTML renderer...$(NC)"
	flutter build web --release --web-renderer html
	@echo "$(GREEN)✓ Build complete: build/web/$(NC)"

build-size: build ## Build and show output size
	@echo "$(BLUE)Analyzing build size...$(NC)"
	@du -sh build/web/
	@echo "$(YELLOW)Top 10 largest files:$(NC)"
	@find build/web -type f -exec ls -lh {} \; | sort -k5 -hr | head -10

# === Deployment ===

# === Utilities ===

doctor: ## Run Flutter doctor
	@echo "$(BLUE)Running Flutter doctor...$(NC)"
	flutter doctor -v

upgrade: ## Upgrade Flutter dependencies
	@echo "$(BLUE)Upgrading dependencies...$(NC)"
	flutter pub upgrade
	@echo "$(GREEN)✓ Dependencies upgraded$(NC)"

outdated: ## Check for outdated dependencies
	@echo "$(BLUE)Checking for outdated packages...$(NC)"
	flutter pub outdated

logs: ## Show recent build logs
	@echo "$(BLUE)Recent build logs:$(NC)"
	@if [ -f build_output.log ]; then \
		tail -50 build_output.log; \
	else \
		echo "$(YELLOW)No build logs found$(NC)"; \
	fi

info: ## Show project info
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "  Name:           pricofy-front-flutter"
	@echo "  Framework:      Flutter"
	@echo "  Platform:       Web (iOS/Android ready)"
	@echo "  AWS Region:     $(AWS_REGION)"
	@echo "  Environment:    $(ENV)"
	@echo ""
	@flutter --version | head -1

# === Android Build ===

android-check: ## Check Android setup and emulators
	@echo "$(BLUE)Checking Android setup...$(NC)"
	@flutter doctor --android-licenses || true
	@flutter devices
	@adb devices

android-build: ## Build Android APK (debug)
	@echo "$(BLUE)Building Android APK (debug)...$(NC)"
	flutter build apk --debug
	@echo "$(GREEN)✓ APK built: build/app/outputs/flutter-apk/app-debug.apk$(NC)"

android-build-release: ## Build Android APK (release)
	@echo "$(BLUE)Building Android APK (release)...$(NC)"
	flutter build apk --release
	@echo "$(GREEN)✓ APK built: build/app/outputs/flutter-apk/app-release.apk$(NC)"

android-build-bundle: ## Build Android App Bundle (release)
	@echo "$(BLUE)Building Android App Bundle (release)...$(NC)"
	flutter build appbundle --release
	@echo "$(GREEN)✓ AAB built: build/app/outputs/bundle/release/app-release.aab$(NC)"

android-install: ## Install debug APK on connected device/emulator
	@echo "$(BLUE)Installing debug APK...$(NC)"
	flutter install
	@echo "$(GREEN)✓ App installed$(NC)"

android-run: ## Run app on Android emulator/device
	@echo "$(BLUE)Running app on Android...$(NC)"
	@echo "$(YELLOW)Hot reload: Press 'r', Quit: Press 'q'$(NC)"
	flutter run -d android

android-run-release: ## Run app on Android in release mode
	@echo "$(BLUE)Running app on Android (release)...$(NC)"
	flutter run -d android --release

android-emulators: ## List available Android emulators
	@echo "$(BLUE)Available Android emulators:$(NC)"
	@flutter emulators
	@echo ""
	@echo "$(YELLOW)To start an emulator: flutter emulators --launch <emulator_id>$(NC)"

android-emulator-start: ## Start first available Android emulator
	@echo "$(BLUE)Starting Android emulator...$(NC)"
	@ANDROID_SDK=$${ANDROID_HOME:-$$HOME/Library/Android/sdk}; \
	EMULATOR_BIN="$$ANDROID_SDK/emulator/emulator"; \
	if [ ! -f "$$EMULATOR_BIN" ]; then \
		echo "$(RED)Android emulator not found at $$EMULATOR_BIN$(NC)"; \
		exit 1; \
	fi; \
	AVD_NAME=$$($$EMULATOR_BIN -list-avds | head -1); \
	if [ -z "$$AVD_NAME" ]; then \
		echo "$(RED)No AVDs found. Create one with Android Studio$(NC)"; \
		exit 1; \
	fi; \
	echo "$(YELLOW)Launching AVD: $$AVD_NAME$(NC)"; \
	$$EMULATOR_BIN -avd $$AVD_NAME -no-snapshot-load > /dev/null 2>&1 & \
	echo "$(YELLOW)Waiting for emulator to boot...$(NC)"; \
	sleep 15; \
	$$ANDROID_SDK/platform-tools/adb wait-for-device; \
	echo "$(GREEN)✓ Emulator started: $$AVD_NAME$(NC)"

android-devices: ## Show connected Android devices
	@echo "$(BLUE)Connected Android devices:$(NC)"
	@adb devices -l
	@echo ""
	@flutter devices | grep android || echo "$(YELLOW)No Android devices found$(NC)"

android-clean: ## Clean Android build
	@echo "$(YELLOW)Cleaning Android build...$(NC)"
	cd android && ./gradlew clean
	@echo "$(GREEN)✓ Android clean complete$(NC)"

android-size: android-build-release ## Analyze APK size
	@echo "$(BLUE)Analyzing APK size...$(NC)"
	@ls -lh build/app/outputs/flutter-apk/app-release.apk
	@du -sh build/app/outputs/flutter-apk/app-release.apk

# === iOS Build ===

ios-check: ## Check iOS setup and simulators
	@echo "$(BLUE)Checking iOS setup...$(NC)"
	@xcodebuild -version || (echo "$(RED)Xcode not installed$(NC)"; exit 1)
	@flutter doctor --android-licenses || true
	@xcrun simctl list devices available

ios-pods: ## Install CocoaPods dependencies
	@echo "$(BLUE)Installing CocoaPods...$(NC)"
	cd ios && pod install
	@echo "$(GREEN)✓ Pods installed$(NC)"

ios-pods-update: ## Update CocoaPods dependencies
	@echo "$(BLUE)Updating CocoaPods...$(NC)"
	cd ios && pod update
	@echo "$(GREEN)✓ Pods updated$(NC)"

ios-build: ## Build iOS app (debug)
	@echo "$(BLUE)Building iOS app (debug)...$(NC)"
	flutter build ios --debug --no-codesign
	@echo "$(GREEN)✓ iOS app built$(NC)"

ios-build-release: ## Build iOS app (release - requires signing)
	@echo "$(BLUE)Building iOS app (release)...$(NC)"
	@echo "$(YELLOW)Note: Requires valid provisioning profile and certificate$(NC)"
	flutter build ios --release
	@echo "$(GREEN)✓ iOS app built: build/ios/iphoneos/Runner.app$(NC)"

ios-archive: ## Create iOS archive for App Store
	@echo "$(BLUE)Creating iOS archive...$(NC)"
	@echo "$(YELLOW)Note: Requires valid App Store provisioning profile$(NC)"
	flutter build ipa --release
	@echo "$(GREEN)✓ IPA built: build/ios/ipa/pricofy_front_flutter.ipa$(NC)"

ios-simulators: ## List available iOS simulators
	@echo "$(BLUE)Available iOS simulators:$(NC)"
	@xcrun simctl list devices available | grep -E "iPhone|iPad"
	@echo ""
	@echo "$(YELLOW)To boot a simulator: open -a Simulator$(NC)"

ios-simulator-start: ## Start iOS simulator (latest iPhone)
	@echo "$(BLUE)Starting iOS simulator...$(NC)"
	@DEVICE_ID=$$(xcrun simctl list devices available | grep "iPhone" | grep -v "Booted" | head -1 | grep -o -E "[A-F0-9-]{36}"); \
	if [ ! -z "$$DEVICE_ID" ]; then \
		xcrun simctl boot $$DEVICE_ID 2>/dev/null || true; \
		open -a Simulator --args -CurrentDeviceUDID $$DEVICE_ID; \
		echo "$(GREEN)✓ Simulator started: $$DEVICE_ID$(NC)"; \
	else \
		echo "$(YELLOW)No available iPhone found or already booted$(NC)"; \
	fi

ios-devices: ## Show connected iOS devices and simulators
	@echo "$(BLUE)Connected iOS devices:$(NC)"
	@flutter devices | grep -E "ios|iphone|ipad" || echo "$(YELLOW)No iOS devices found$(NC)"
	@echo ""
	@echo "$(BLUE)Available simulators:$(NC)"
	@xcrun simctl list devices available | grep -E "iPhone|iPad" | head -5

ios-run: ## Run app on iOS simulator (without SSM config - use ios-dev for full config)
	@echo "$(BLUE)Running app on iOS simulator...$(NC)"
	@echo "$(YELLOW)Hot reload: Press 'r', Quit: Press 'q'$(NC)"
	flutter run -d ios

ios-dev: ## Run iOS app with config from SSM (dev environment)
	@echo "$(BLUE)Starting iOS app with dev configuration...$(NC)"
	@echo "$(YELLOW)Reading configuration from SSM Parameter Store...$(NC)"
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/frontend/api-url --query 'Parameter.Value' --output text > /tmp/pricofy_api_url.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/frontend/api-url not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/pow-secret --with-decryption --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_pow_secret.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/pow-secret not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/promo/recaptcha-site-key --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_recaptcha.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/promo/recaptcha-site-key not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/feature-flags/landing-only --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_ff_landing.txt 2>/dev/null || echo "false" > /tmp/pricofy_ff_landing.txt
	@echo "$(GREEN)✅ Configuration loaded from SSM$(NC)"
	@echo "$(YELLOW)Hot reload: Press 'r', Quit: Press 'q'$(NC)"
	@# Find first available iOS simulator
	@IOS_DEVICE=$$(flutter devices | grep "ios.*simulator" | head -1 | awk -F'•' '{print $$2}' | xargs); \
	if [ -z "$$IOS_DEVICE" ]; then \
		echo "$(RED)No iOS simulator found. Start one with: make ios-simulator-start$(NC)"; \
		exit 1; \
	fi; \
	flutter run -d $$IOS_DEVICE \
		--dart-define=ENVIRONMENT=$(ENV) \
		--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
		--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
		--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt) \
		--dart-define=FEATURE_LANDING_ONLY=$$(cat /tmp/pricofy_ff_landing.txt)
	@rm -f /tmp/pricofy_api_url.txt /tmp/pricofy_pow_secret.txt /tmp/pricofy_recaptcha.txt /tmp/pricofy_ff_landing.txt

android-dev: ## Run Android app with config from SSM (dev environment)
	@echo "$(BLUE)Starting Android app with dev configuration...$(NC)"
	@echo "$(YELLOW)Reading configuration from SSM Parameter Store...$(NC)"
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/frontend/api-url --query 'Parameter.Value' --output text > /tmp/pricofy_api_url.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/frontend/api-url not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/pow-secret --with-decryption --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_pow_secret.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/pow-secret not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/promo/recaptcha-site-key --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_recaptcha.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/promo/recaptcha-site-key not found$(NC)" && exit 1)
	@AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/feature-flags/landing-only --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_ff_landing.txt 2>/dev/null || echo "false" > /tmp/pricofy_ff_landing.txt
	@echo "$(GREEN)✅ Configuration loaded from SSM$(NC)"
	@echo "$(YELLOW)Hot reload: Press 'r', Quit: Press 'q'$(NC)"
	@# Find first available Android device/emulator
	@ANDROID_DEVICE=$$(flutter devices | grep "android" | head -1 | awk -F'•' '{print $$2}' | xargs); \
	if [ -z "$$ANDROID_DEVICE" ]; then \
		echo "$(RED)No Android device found. Start an emulator with: make android-emulator-start$(NC)"; \
		exit 1; \
	fi; \
	flutter run -d $$ANDROID_DEVICE \
		--dart-define=ENVIRONMENT=$(ENV) \
		--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
		--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
		--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt) \
		--dart-define=FEATURE_LANDING_ONLY=$$(cat /tmp/pricofy_ff_landing.txt)
	@rm -f /tmp/pricofy_api_url.txt /tmp/pricofy_pow_secret.txt /tmp/pricofy_recaptcha.txt /tmp/pricofy_ff_landing.txt

run-all: ## Start both iOS simulator and Android emulator, then run app on both
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)  LAUNCHING APP ON iOS + ANDROID$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@export LANG=en_US.UTF-8 && \
	echo "$(YELLOW)Step 1: Reading configuration from SSM...$(NC)" && \
	AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/frontend/api-url --query 'Parameter.Value' --output text > /tmp/pricofy_api_url.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/frontend/api-url not found$(NC)" && exit 1) && \
	AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/pow-secret --with-decryption --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_pow_secret.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/pow-secret not found$(NC)" && exit 1) && \
	AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/promo/recaptcha-site-key --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_recaptcha.txt 2>/dev/null || (echo "$(RED)ERROR: /pricofy/$(ENV)/promo/recaptcha-site-key not found$(NC)" && exit 1) && \
	AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/feature-flags/landing-only --query 'Parameter.Value' --output text --region $(AWS_REGION) > /tmp/pricofy_ff_landing.txt 2>/dev/null || echo "false" > /tmp/pricofy_ff_landing.txt && \
	echo "$(GREEN)✅ SSM configuration loaded$(NC)" && \
	echo "" && \
	echo "$(YELLOW)Step 2: Starting iOS simulator...$(NC)" && \
	open -a Simulator && \
	sleep 3 && \
	DEVICE_ID=$$(xcrun simctl list devices available | grep "iPhone" | tail -1 | grep -o -E "[A-F0-9-]{36}") && \
	if [ ! -z "$$DEVICE_ID" ]; then xcrun simctl boot $$DEVICE_ID 2>/dev/null || true; fi && \
	echo "$(GREEN)✓ iOS simulator starting$(NC)" && \
	echo "" && \
	echo "$(YELLOW)Step 3: Starting Android emulator...$(NC)" && \
	ANDROID_SDK=$${ANDROID_HOME:-$$HOME/Library/Android/sdk} && \
	EMULATOR_BIN="$$ANDROID_SDK/emulator/emulator" && \
	AVD_NAME=$$($$EMULATOR_BIN -list-avds | head -1) && \
	if [ -z "$$AVD_NAME" ]; then \
		echo "$(YELLOW)No Android AVDs found, skipping...$(NC)"; \
	else \
		$$EMULATOR_BIN -avd $$AVD_NAME -no-snapshot-load > /dev/null 2>&1 & \
		echo "$(GREEN)✓ Android emulator starting: $$AVD_NAME$(NC)"; \
	fi && \
	echo "" && \
	echo "$(YELLOW)Step 4: Waiting for devices to be ready (25s)...$(NC)" && \
	sleep 25 && \
	$$ANDROID_SDK/platform-tools/adb wait-for-device 2>/dev/null || true && \
	echo "" && \
	echo "$(YELLOW)Step 5: Finding iOS and Android devices...$(NC)" && \
	IOS_DEVICE=$$(flutter devices | grep "ios.*simulator" | head -1 | awk -F'•' '{print $$2}' | xargs) && \
	ANDROID_DEVICE=$$(flutter devices | grep "android" | head -1 | awk -F'•' '{print $$2}' | xargs) && \
	if [ -z "$$IOS_DEVICE" ] && [ -z "$$ANDROID_DEVICE" ]; then \
		echo "$(RED)No iOS or Android devices found$(NC)"; \
		exit 1; \
	fi && \
	if [ -n "$$IOS_DEVICE" ] && [ -n "$$ANDROID_DEVICE" ]; then \
		echo "$(GREEN)Found: iOS ($$IOS_DEVICE) + Android ($$ANDROID_DEVICE)$(NC)" && \
		echo "$(YELLOW)Launching on both devices...$(NC)" && \
		flutter run -d $$IOS_DEVICE \
			--dart-define=ENVIRONMENT=$(ENV) \
			--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
			--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
			--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt) \
			--dart-define=FEATURE_LANDING_ONLY=$$(cat /tmp/pricofy_ff_landing.txt) & \
		sleep 10 && \
		flutter run -d $$ANDROID_DEVICE \
			--dart-define=ENVIRONMENT=$(ENV) \
			--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
			--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
			--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt) \
			--dart-define=FEATURE_LANDING_ONLY=$$(cat /tmp/pricofy_ff_landing.txt); \
	elif [ -n "$$IOS_DEVICE" ]; then \
		echo "$(GREEN)Found: iOS ($$IOS_DEVICE)$(NC)" && \
		flutter run -d $$IOS_DEVICE \
			--dart-define=ENVIRONMENT=$(ENV) \
			--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
			--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
			--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt) \
			--dart-define=FEATURE_LANDING_ONLY=$$(cat /tmp/pricofy_ff_landing.txt); \
	else \
		echo "$(GREEN)Found: Android ($$ANDROID_DEVICE)$(NC)" && \
		flutter run -d $$ANDROID_DEVICE \
			--dart-define=ENVIRONMENT=$(ENV) \
			--dart-define=API_BASE_URL=$$(cat /tmp/pricofy_api_url.txt) \
			--dart-define=POW_SECRET=$$(cat /tmp/pricofy_pow_secret.txt) \
			--dart-define=RECAPTCHA_SITE_KEY=$$(cat /tmp/pricofy_recaptcha.txt) \
			--dart-define=FEATURE_LANDING_ONLY=$$(cat /tmp/pricofy_ff_landing.txt); \
	fi && \
	rm -f /tmp/pricofy_api_url.txt /tmp/pricofy_pow_secret.txt /tmp/pricofy_recaptcha.txt /tmp/pricofy_ff_landing.txt

ios-run-device: ## Run app on connected iOS device
	@echo "$(BLUE)Running app on connected iOS device...$(NC)"
	@echo "$(YELLOW)Note: Device must be connected and trusted$(NC)"
	flutter run -d iphone

ios-run-release: ## Run app on iOS in release mode
	@echo "$(BLUE)Running app on iOS (release)...$(NC)"
	flutter run -d ios --release

ios-clean: ## Clean iOS build and derived data
	@echo "$(YELLOW)Cleaning iOS build...$(NC)"
	cd ios && xcodebuild clean
	rm -rf ios/Pods ios/Podfile.lock
	@echo "$(GREEN)✓ iOS clean complete$(NC)"

ios-size: ios-build-release ## Analyze iOS app size
	@echo "$(BLUE)Analyzing iOS app size...$(NC)"
	@ls -lh build/ios/iphoneos/Runner.app/Runner
	@du -sh build/ios/iphoneos/Runner.app

# === Desktop Builds (macOS, Windows, Linux) ===

desktop-check: ## Check desktop setup and available platforms
	@echo "$(BLUE)Checking desktop setup...$(NC)"
	@flutter doctor -v
	@echo ""
	@echo "$(BLUE)Available desktop devices:$(NC)"
	@flutter devices | grep -E "macos|windows|linux" || echo "$(YELLOW)No desktop platforms detected$(NC)"

## macOS Desktop

macos-check: ## Check macOS desktop setup
	@echo "$(BLUE)Checking macOS setup...$(NC)"
	@flutter config --enable-macos-desktop
	@flutter devices | grep macos || echo "$(YELLOW)macOS not available$(NC)"

macos-run: ## Run app on macOS desktop
	@echo "$(BLUE)Running app on macOS...$(NC)"
	@echo "$(YELLOW)Hot reload: Press 'r', Quit: Press 'q'$(NC)"
	flutter run -d macos

macos-run-release: ## Run app on macOS in release mode
	@echo "$(BLUE)Running app on macOS (release)...$(NC)"
	flutter run -d macos --release

macos-build: ## Build macOS app (debug)
	@echo "$(BLUE)Building macOS app (debug)...$(NC)"
	flutter build macos --debug
	@echo "$(GREEN)✓ macOS app built: build/macos/Build/Products/Debug/pricofy_front_flutter.app$(NC)"

macos-build-release: ## Build macOS app (release)
	@echo "$(BLUE)Building macOS app (release)...$(NC)"
	flutter build macos --release
	@echo "$(GREEN)✓ macOS app built: build/macos/Build/Products/Release/pricofy_front_flutter.app$(NC)"
	@echo "$(YELLOW)To install: open build/macos/Build/Products/Release/pricofy_front_flutter.app$(NC)"

macos-clean: ## Clean macOS build
	@echo "$(YELLOW)Cleaning macOS build...$(NC)"
	rm -rf build/macos
	@echo "$(GREEN)✓ macOS clean complete$(NC)"

macos-size: macos-build-release ## Analyze macOS app size
	@echo "$(BLUE)Analyzing macOS app size...$(NC)"
	@du -sh build/macos/Build/Products/Release/pricofy_front_flutter.app

## Windows Desktop

windows-check: ## Check Windows desktop setup
	@echo "$(BLUE)Checking Windows setup...$(NC)"
	@echo "$(YELLOW)Note: Windows build requires a Windows machine with Visual Studio 2019+$(NC)"
	@flutter config --enable-windows-desktop
	@flutter devices | grep windows || echo "$(YELLOW)Windows not available on this platform$(NC)"

windows-run: ## Run app on Windows desktop
	@echo "$(BLUE)Running app on Windows...$(NC)"
	@echo "$(YELLOW)Note: Only works on Windows OS$(NC)"
	flutter run -d windows

windows-build: ## Build Windows app (release)
	@echo "$(BLUE)Building Windows app (release)...$(NC)"
	@echo "$(YELLOW)Note: Requires Windows OS with Visual Studio 2019+$(NC)"
	flutter build windows --release
	@echo "$(GREEN)✓ Windows app built: build/windows/x64/runner/Release/$(NC)"

windows-clean: ## Clean Windows build
	@echo "$(YELLOW)Cleaning Windows build...$(NC)"
	rm -rf build/windows
	@echo "$(GREEN)✓ Windows clean complete$(NC)"

windows-size: ## Analyze Windows app size
	@echo "$(BLUE)Analyzing Windows app size...$(NC)"
	@du -sh build/windows/x64/runner/Release/ 2>/dev/null || echo "$(YELLOW)No Windows build found$(NC)"

## Linux Desktop

linux-check: ## Check Linux desktop setup
	@echo "$(BLUE)Checking Linux setup...$(NC)"
	@echo "$(YELLOW)Note: Linux build requires Linux OS with: clang, cmake, ninja-build, pkg-config, libgtk-3-dev$(NC)"
	@flutter config --enable-linux-desktop
	@flutter devices | grep linux || echo "$(YELLOW)Linux not available on this platform$(NC)"

linux-run: ## Run app on Linux desktop
	@echo "$(BLUE)Running app on Linux...$(NC)"
	@echo "$(YELLOW)Note: Only works on Linux OS$(NC)"
	flutter run -d linux

linux-build: ## Build Linux app (release)
	@echo "$(BLUE)Building Linux app (release)...$(NC)"
	@echo "$(YELLOW)Note: Requires Linux OS with build dependencies$(NC)"
	flutter build linux --release
	@echo "$(GREEN)✓ Linux app built: build/linux/x64/release/bundle/$(NC)"

linux-clean: ## Clean Linux build
	@echo "$(YELLOW)Cleaning Linux build...$(NC)"
	rm -rf build/linux
	@echo "$(GREEN)✓ Linux clean complete$(NC)"

linux-size: ## Analyze Linux app size
	@echo "$(BLUE)Analyzing Linux app size...$(NC)"
	@du -sh build/linux/x64/release/bundle/ 2>/dev/null || echo "$(YELLOW)No Linux build found$(NC)"

# === Pre-commit hooks ===

pre-commit: format-check analyze test ## Run all pre-commit checks
	@echo "$(GREEN)✓ All pre-commit checks passed$(NC)"


# === Infrastructure (requires pricofy-infra repo) ===

infra-deploy: ## Deploy CDK stack (from pricofy-infra repo)
	@echo "$(BLUE)Deploying infrastructure...$(NC)"
	@if [ ! -d "../pricofy-infra" ]; then \
		echo "$(RED)Error: pricofy-infra repo not found$(NC)"; exit 1; \
	fi
	cd ../pricofy-infra && npx cdk deploy Pricofy-Frontend-Flutter --require-approval never
	@echo "$(GREEN)✓ Infrastructure deployed$(NC)"

infra-destroy: ## Destroy CDK stack
	@echo "$(YELLOW)WARNING: This will destroy the infrastructure!$(NC)"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		cd ../pricofy-infra && npx cdk destroy Pricofy-Frontend-Flutter --force; \
		echo "$(GREEN)✓ Infrastructure destroyed$(NC)"; \
	else \
		echo "$(YELLOW)Aborted$(NC)"; \
	fi

# ========================================
# Environment-based Build & Deploy (reads from SSM)
# ========================================
#
# Usage:
#   make build          → Build for DEV (default)
#   make build ENV=prod → Build for PROD
#   make deploy         → Deploy to DEV (default)
#   make deploy ENV=prod → Deploy to PROD
#
# ========================================

build: ## Clean + build dual WASM+JS - reads config from SSM
	@echo "$(BLUE)Building Flutter web for $(ENV)...$(NC)"
	@echo "$(YELLOW)Cleaning previous build (flutter clean)...$(NC)"
	@flutter clean
	@echo "$(YELLOW)Reading configuration from SSM Parameter Store...$(NC)"
	@API_URL=$$(AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/frontend/api-url --query 'Parameter.Value' --output text 2>/dev/null || echo ''); \
	if [ -z "$$API_URL" ]; then \
		echo "$(RED)ERROR: /pricofy/$(ENV)/api/url not found in SSM$(NC)"; \
		echo "$(YELLOW)Deploy API infrastructure first$(NC)"; \
		exit 1; \
	fi; \
	echo "$(YELLOW)Reading PoW anti-scraping secrets from SSM...$(NC)"; \
	POW_SECRET=$$(AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/pow-secret --with-decryption --query 'Parameter.Value' --output text --region $(AWS_REGION) 2>/dev/null || echo ''); \
	if [ -z "$$POW_SECRET" ]; then \
		echo "$(RED)ERROR: /pricofy/$(ENV)/pow-secret not found in SSM$(NC)"; \
		echo "$(YELLOW)Run: aws ssm put-parameter --name /pricofy/$(ENV)/pow-secret --type SecureString --value \$$(openssl rand -base64 48)$(NC)"; \
		exit 1; \
	fi; \
	RECAPTCHA_SITE_KEY=$$(AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/promo/recaptcha-site-key --query 'Parameter.Value' --output text --region $(AWS_REGION) 2>/dev/null || echo ''); \
	if [ -z "$$RECAPTCHA_SITE_KEY" ]; then \
		echo "$(RED)ERROR: /pricofy/$(ENV)/promo/recaptcha-site-key not found in SSM$(NC)"; \
		exit 1; \
	fi; \
	echo "$(YELLOW)Reading Google Analytics ID from SSM (optional)...$(NC)"; \
	GA_MEASUREMENT_ID=$$(AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/analytics/measurement-id --query 'Parameter.Value' --output text --region $(AWS_REGION) 2>/dev/null || echo ''); \
	echo "$(YELLOW)Reading feature flags from SSM...$(NC)"; \
	FEATURE_LANDING_ONLY=$$(AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/feature-flags/landing-only --query 'Parameter.Value' --output text --region $(AWS_REGION) 2>/dev/null || echo 'false'); \
	echo "$(YELLOW)Reading image proxy URL from SSM...$(NC)"; \
	IMAGE_PROXY_URL=$$(AWS_PROFILE=$(AWS_PROFILE) aws ssm get-parameter --name /pricofy/$(ENV)/frontend/image-proxy-url --query 'Parameter.Value' --output text --region $(AWS_REGION) 2>/dev/null || echo ''); \
	if [ -z "$$IMAGE_PROXY_URL" ]; then \
		echo "$(RED)ERROR: /pricofy/$(ENV)/frontend/image-proxy-url not found in SSM$(NC)"; \
		echo "$(YELLOW)Deploy image-proxy-service first: cd image-proxy-service && make deploy ENV=$(ENV)$(NC)"; \
		exit 1; \
	fi; \
	echo "$(GREEN)✅ Configuration loaded from SSM:$(NC)"; \
	echo "   API_URL: $$API_URL"; \
	echo "   POW_SECRET: $$(echo $$POW_SECRET | cut -c1-8)*** (compiled into WASM/JS)"; \
	echo "   RECAPTCHA: $$(echo $$RECAPTCHA_SITE_KEY | cut -c1-20)..."; \
	if [ -n "$$GA_MEASUREMENT_ID" ]; then echo "   GA_MEASUREMENT_ID: $$GA_MEASUREMENT_ID"; else echo "   GA_MEASUREMENT_ID: (not configured - GA disabled)"; fi; \
	echo "   FEATURE_LANDING_ONLY: $$FEATURE_LANDING_ONLY"; \
	echo "   IMAGE_PROXY_URL: $$IMAGE_PROXY_URL"; \
	echo ""; \
	echo "$(YELLOW)Replacing placeholders in index.html...$(NC)"; \
	cp web/index.html web/index.html.backup; \
	sed -e "s|__RECAPTCHA_SITE_KEY__|$$RECAPTCHA_SITE_KEY|g" -e "s|__GA_MEASUREMENT_ID__|$$GA_MEASUREMENT_ID|g" web/index.html.backup > web/index.html; \
	echo "$(YELLOW)🔒 Building DUAL: WASM (primary) + JS fallback (Safari/WebKit)$(NC)"; \
	flutter build web --release \
		--wasm \
		--no-source-maps \
		--pwa-strategy none \
		--dart-define=ENVIRONMENT=$(ENV) \
		--dart-define=API_BASE_URL=$$API_URL \
		--dart-define=POW_SECRET=$$POW_SECRET \
		--dart-define=RECAPTCHA_SITE_KEY=$$RECAPTCHA_SITE_KEY \
		--dart-define=FEATURE_LANDING_ONLY=$$FEATURE_LANDING_ONLY \
		--dart-define=IMAGE_PROXY_URL=$$IMAGE_PROXY_URL; \
	echo "$(YELLOW)Restoring original index.html...$(NC)"; \
	mv web/index.html.backup web/index.html; \
	echo ""; \
	echo "$(YELLOW)🗑️  Removing Service Worker (not needed)...$(NC)"; \
	rm -f build/web/flutter_service_worker.js; \
	echo "$(GREEN)✓ Service Worker removed$(NC)"; \
	echo "$(YELLOW)🔐 Minificando HTML...$(NC)"; \
	npx html-minifier-terser build/web/index.html \
		--collapse-whitespace \
		--remove-comments \
		--minify-js true \
		--minify-css true \
		-o build/web/index.html; \
	echo "$(GREEN)✓ HTML minificado$(NC)"; \
	rm -f build/web/index.html.backup; \
	echo ""; \
	echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"; \
	echo "$(GREEN)✓ Build completo:$(NC)"; \
	echo "$(GREEN)  • WASM: binario protegido (Chrome, Firefox, Edge)$(NC)"; \
	echo "$(GREEN)  • JS fallback: minificado (Safari, WebKit)$(NC)"; \
	echo "$(GREEN)  • HTML: minificado$(NC)"; \
	echo "$(GREEN)  • PoW anti-scraping: compilado en ambos$(NC)"; \
	echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"

deploy: ## Full deployment: clean → build → sync → invalidate (all automatic)
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)  DEPLOYING FLUTTER FRONTEND TO $(ENV)$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@$(MAKE) build ENV=$(ENV)
	@$(MAKE) sync ENV=$(ENV)
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  ✓ DEPLOYMENT COMPLETE!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"

deploy-quick: deploy ## Alias for deploy (same thing now)

sync: ## Sync build to S3 and invalidate CloudFront
	@echo "$(BLUE)Deploying to $(ENV)...$(NC)"
	@BUCKET_NAME=$$(AWS_PROFILE=$(AWS_PROFILE) aws cloudformation describe-stacks --stack-name Pricofy-Infra-Frontend --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text 2>/dev/null); \
	if [ -z "$$BUCKET_NAME" ]; then \
		echo "$(RED)ERROR: Could not retrieve bucket name from CloudFormation$(NC)"; \
		echo "$(YELLOW)Deploy frontend infrastructure first: cd infra && cdk deploy Pricofy-Infra-Frontend --context environment=$(ENV)$(NC)"; \
		exit 1; \
	fi; \
	echo "   Bucket: $$BUCKET_NAME"; \
	echo "$(YELLOW)Uploading WASM + JS fallback with correct Content-Types...$(NC)"; \
	AWS_PROFILE=$(AWS_PROFILE) aws s3 sync build/web/ s3://$$BUCKET_NAME/ --delete --region $(AWS_REGION) \
		--exclude "*.wasm" \
		--exclude "*.mjs"; \
	AWS_PROFILE=$(AWS_PROFILE) aws s3 sync build/web/ s3://$$BUCKET_NAME/ --region $(AWS_REGION) \
		--exclude "*" \
		--include "*.wasm" \
		--content-type "application/wasm" \
		--metadata-directive REPLACE; \
	AWS_PROFILE=$(AWS_PROFILE) aws s3 sync build/web/ s3://$$BUCKET_NAME/ --region $(AWS_REGION) \
		--exclude "*" \
		--include "*.mjs" \
		--content-type "application/javascript" \
		--metadata-directive REPLACE; \
	echo "$(GREEN)✓ Deployment complete (WASM primary + JS fallback)$(NC)"; \
	echo "$(YELLOW)Invalidating CloudFront cache...$(NC)"; \
	DISTRIBUTION_ID=$$(AWS_PROFILE=$(AWS_PROFILE) aws cloudformation describe-stacks --stack-name Pricofy-Infra-Frontend --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text 2>/dev/null); \
	if [ -z "$$DISTRIBUTION_ID" ]; then \
		echo "$(RED)ERROR: Could not retrieve distribution ID$(NC)"; \
		exit 1; \
	fi; \
	echo "   Distribution: $$DISTRIBUTION_ID"; \
	AWS_PROFILE=$(AWS_PROFILE) aws cloudfront create-invalidation --distribution-id $$DISTRIBUTION_ID --paths "/*" --region $(AWS_REGION) > /dev/null; \
	echo "$(GREEN)CloudFront cache invalidated$(NC)"; \
	echo ""; \
	echo "$(GREEN)✓ Deployment complete!$(NC)"; \
	WEBSITE_URL=$$(AWS_PROFILE=$(AWS_PROFILE) aws cloudformation describe-stacks --stack-name Pricofy-Infra-Frontend --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text 2>/dev/null); \
	if [ -n "$$WEBSITE_URL" ]; then \
		echo "$(BLUE)URL: $$WEBSITE_URL$(NC)"; \
	fi