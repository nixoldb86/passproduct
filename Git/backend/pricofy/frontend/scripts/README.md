# Scripts Directory

Helper scripts for local development and testing.

---

## 📁 Available Scripts

### `dev-chrome.sh`

**Purpose:** Launch Chrome with CORS disabled for local development

**Usage:**
```bash
./scripts/dev-chrome.sh

# Or via Makefile:
make dev-chrome
```

**What it does:**
- Launches a **NEW Chrome instance** with CORS disabled
- Uses separate user data directory (`/tmp/chrome-pricofy-dev-{timestamp}`)
- Your **normal Chrome windows stay untouched**
- Opens `http://localhost:3000` automatically

**Security:**
- ✅ Only affects this dev instance
- ✅ Production backend stays secure (no localhost in CORS)
- ✅ Easy to close when done (just close that window)

**When to use:**
- Local development with Flutter app
- Testing API calls without CORS blocking
- Development iterations with hot reload

---

### `test-all-platforms.sh`

**Purpose:** Comprehensive test suite for all platforms

**Usage:**
```bash
./scripts/test-all-platforms.sh

# Or via Makefile:
make quick-test
```

**What it does:**
1. Runs `flutter analyze` (code quality)
2. Runs `flutter test` (unit/widget/integration tests)
3. Builds web (debug mode)
4. Builds Android APK (debug mode)
5. Builds iOS (debug mode, if on macOS)
6. Generates test report

**Output:**
- Console summary of results
- Test report in `test_report_YYYYMMDD_HHMMSS.md`

---

## 🔧 Development Workflow

### Standard Workflow (Recommended)

```bash
# Terminal 1: Start Flutter server
make run-web
# This automatically launches dev Chrome + Flutter server

# Develop normally with hot reload
# Press 'r' in terminal to reload
# Press 'q' to quit

# When done: Close dev Chrome window
```

### Manual Control

If you want more control:

```bash
# Terminal 1: Launch dev Chrome first
make dev-chrome

# Terminal 2: Start Flutter
cd /Users/cnebrera/Projects/Personal/pricofy/pricofy-front-flutter
flutter run -d chrome --web-port=3000

# Develop
# ...

# Close dev Chrome window when done
```

---

## 🔒 Security Notes

**Why not add localhost to production CORS?**

Adding `http://localhost:*` to production API Gateway CORS would be a **critical security hole**:

- ❌ Anyone who clones the repo could make requests to production
- ❌ No way to revoke access (it's localhost, no API key check)
- ❌ Potential for abuse, fake data, DDoS from local machines
- ❌ Violates security principle of least privilege

**Our solution:**
- ✅ Production CORS only allows CloudFront domains
- ✅ Dev Chrome bypasses CORS locally (only for you)
- ✅ Backend stays secure
- ✅ You can develop without friction

---

## 📋 Troubleshooting

### "Chrome won't launch"

**Solution:**
```bash
# Make sure script is executable
chmod +x ./scripts/dev-chrome.sh

# Try running directly
./scripts/dev-chrome.sh
```

### "Still getting CORS errors"

**Solution:**
```bash
# Make sure you're using the dev Chrome window (look for yellow banner)
# If banner says "unsupported command-line flag" → CORS is disabled ✓

# If no banner → wrong Chrome window, run script again:
make dev-chrome
```

### "Want to close dev Chrome only"

**Solution:**
```bash
# Just close the Chrome window with the yellow banner
# Your normal Chrome windows stay open
```

---

## 🎯 Quick Commands

```bash
# Most common
make run-web          # Launch everything (dev Chrome + Flutter)
make dev-chrome       # Launch dev Chrome only
make quick-test       # Run all tests

# See all commands
make help
```

---

**Last Updated:** 2025-11-12  
**Location:** `pricofy-front-flutter/scripts/`

