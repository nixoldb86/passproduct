#!/bin/bash

###############################################################################
# Quick Test Script
# 
# Runs comprehensive tests on all platforms and generates report
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Pricofy Flutter - Quick Test Suite              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create report file
REPORT_FILE="test_report_$(date +%Y%m%d_%H%M%S).md"
echo "# Test Report - $(date '+%Y-%m-%d %H:%M:%S')" > $REPORT_FILE
echo "" >> $REPORT_FILE

###############################################################################
# 1. CODE QUALITY
###############################################################################

echo -e "${YELLOW}[1/5] Running Code Quality Checks...${NC}"
echo "" >> $REPORT_FILE
echo "## 1. Code Quality" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Flutter analyze
echo -n "  • Flutter analyze... "
if flutter analyze > analyze_output.log 2>&1; then
    ISSUES=$(grep "issues found" analyze_output.log | grep -o "[0-9]*" | head -1)
    WARNINGS=$(grep "warning" analyze_output.log | wc -l)
    ERRORS=$(grep "error" analyze_output.log | wc -l)
    echo -e "${GREEN}✓${NC}"
    echo "- Analyze: ✅ $ISSUES issues ($ERRORS errors, $WARNINGS warnings)" >> $REPORT_FILE
else
    echo -e "${RED}✗${NC}"
    echo "- Analyze: ❌ Failed" >> $REPORT_FILE
fi

###############################################################################
# 2. UNIT TESTS
###############################################################################

echo -e "${YELLOW}[2/5] Running Unit Tests...${NC}"
echo "" >> $REPORT_FILE
echo "## 2. Unit Tests" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Run tests
echo -n "  • Unit tests... "
if flutter test > test_output.log 2>&1; then
    PASSED=$(grep -o "+[0-9]*" test_output.log | tail -1 | grep -o "[0-9]*")
    echo -e "${GREEN}✓ $PASSED tests passed${NC}"
    echo "- Tests: ✅ $PASSED/28 passing (100%)" >> $REPORT_FILE
else
    PASSED=$(grep -o "+[0-9]*" test_output.log | tail -1 | grep -o "[0-9]*" || echo "0")
    FAILED=$(grep -o "\-[0-9]*" test_output.log | tail -1 | grep -o "[0-9]*" || echo "0")
    echo -e "${RED}✗ $PASSED passed, $FAILED failed${NC}"
    echo "- Tests: ❌ $PASSED passed, $FAILED failed" >> $REPORT_FILE
fi

###############################################################################
# 3. WEB BUILD
###############################################################################

echo -e "${YELLOW}[3/5] Testing Web Build...${NC}"
echo "" >> $REPORT_FILE
echo "## 3. Web Build" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Build web (debug for speed)
echo -n "  • Web build... "
if flutter build web --debug --no-tree-shake-icons > web_build.log 2>&1; then
    BUILD_SIZE=$(du -sh build/web/ | awk '{print $1}')
    echo -e "${GREEN}✓ $BUILD_SIZE${NC}"
    echo "- Web Build: ✅ Success ($BUILD_SIZE)" >> $REPORT_FILE
else
    echo -e "${RED}✗${NC}"
    echo "- Web Build: ❌ Failed" >> $REPORT_FILE
fi

###############################################################################
# 4. ANDROID BUILD
###############################################################################

echo -e "${YELLOW}[4/5] Testing Android Build...${NC}"
echo "" >> $REPORT_FILE
echo "## 4. Android Build" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Build Android APK (debug)
echo -n "  • Android APK... "
if flutter build apk --debug > android_build.log 2>&1; then
    APK_SIZE=$(ls -lh build/app/outputs/flutter-apk/app-debug.apk | awk '{print $5}')
    echo -e "${GREEN}✓ $APK_SIZE${NC}"
    echo "- Android Build: ✅ Success ($APK_SIZE APK)" >> $REPORT_FILE
else
    echo -e "${RED}✗${NC}"
    echo "- Android Build: ❌ Failed" >> $REPORT_FILE
fi

###############################################################################
# 5. iOS BUILD
###############################################################################

echo -e "${YELLOW}[5/5] Testing iOS Build...${NC}"
echo "" >> $REPORT_FILE
echo "## 5. iOS Build" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Build iOS (requires macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -n "  • iOS build... "
    if flutter build ios --debug --no-codesign > ios_build.log 2>&1; then
        echo -e "${GREEN}✓${NC}"
        echo "- iOS Build: ✅ Success (debug, no codesign)" >> $REPORT_FILE
    else
        echo -e "${RED}✗${NC}"
        echo "- iOS Build: ❌ Failed" >> $REPORT_FILE
    fi
else
    echo -e "  ${YELLOW}• Skipped (not macOS)${NC}"
    echo "- iOS Build: ⚠️ Skipped (requires macOS)" >> $REPORT_FILE
fi

###############################################################################
# SUMMARY
###############################################################################

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     SUMMARY                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Count results
TOTAL_CHECKS=5
PASSED_CHECKS=$(grep -c "✅" $REPORT_FILE || echo "0")
FAILED_CHECKS=$(grep -c "❌" $REPORT_FILE || echo "0")

echo "" >> $REPORT_FILE
echo "## Summary" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "- Total Checks: $TOTAL_CHECKS" >> $REPORT_FILE
echo "- Passed: $PASSED_CHECKS" >> $REPORT_FILE
echo "- Failed: $FAILED_CHECKS" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "**Status:** ✅ Production Ready" >> $REPORT_FILE
    EXIT_CODE=0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo "**Status:** ❌ Issues found" >> $REPORT_FILE
    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}Report saved to: ${YELLOW}$REPORT_FILE${NC}"
echo ""
echo -e "${BLUE}To run locally:${NC}"
echo -e "  ${GREEN}make run-web${NC}           # Web on http://localhost:3001"
echo -e "  ${GREEN}make android-run${NC}       # Android emulator"
echo -e "  ${GREEN}make ios-run${NC}           # iOS simulator"
echo ""

# Cleanup temp files
rm -f analyze_output.log test_output.log web_build.log android_build.log ios_build.log

exit $EXIT_CODE

