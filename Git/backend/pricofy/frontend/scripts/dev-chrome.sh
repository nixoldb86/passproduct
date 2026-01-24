#!/bin/bash

###############################################################################
# Chrome Dev - NUNCA cierra tus Chrome existentes
###############################################################################

# Perfil ÚNICO para este Chrome (NO toca tus otros Chrome)
CHROME_DEV_DIR="/tmp/pricofy-chrome-dev"

# Lanzar Chrome SEPARADO (tus Chrome quedan intactos)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --user-data-dir="$CHROME_DEV_DIR" \
  --disable-web-security \
  --disable-site-isolation-trials \
  --no-first-run \
  --no-default-browser-check \
  "http://localhost:3000" \
  > /dev/null 2>&1 &

echo ""
echo "✅ Chrome dev instance launched"
echo ""
echo "📱 Opening: http://localhost:3000"
echo ""
echo "⚠️  You'll see a banner: 'unsupported command-line flag' - THAT'S NORMAL"
echo "   It means CORS is disabled for this window"
echo ""
echo "🔧 When done testing:"
echo "   • Just close that Chrome window"
echo "   • Your normal Chrome stays untouched"
echo ""
echo "🎯 Ready to test without CORS issues!"
echo ""

