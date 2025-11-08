#!/bin/bash
# Auto deployment health check

echo "🔍 Checking Railway deployment health..."
echo ""

# Stats Backend API
echo "📊 Stats Backend API:"
STATS_RESPONSE=$(curl -s https://stats-production-e4d8.up.railway.app/api/stats)
if echo "$STATS_RESPONSE" | grep -q "onlineUsers"; then
  ONLINE=$(echo "$STATS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('onlineUsers', 'N/A'))")
  echo "   ✅ API working - Online users: $ONLINE"
else
  echo "   ❌ API error: $STATS_RESPONSE"
fi
echo ""

# Widget
echo "🌐 Normal Widget:"
WIDGET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://chat.simplechat.bot/js/simple-chat.min.js)
if [ "$WIDGET_STATUS" = "200" ]; then
  echo "   ✅ Widget serving (HTTP $WIDGET_STATUS)"
else
  echo "   ❌ Widget error (HTTP $WIDGET_STATUS)"
fi
echo ""

# Widget Premium
echo "💎 Premium Widget:"
PREMIUM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://p-chat.simplechat.bot/js/simple-chat-premium.min.js)
if [ "$PREMIUM_STATUS" = "200" ]; then
  echo "   ✅ Premium widget serving (HTTP $PREMIUM_STATUS)"
else
  echo "   ❌ Premium widget error (HTTP $PREMIUM_STATUS)"
fi
echo ""

# Dashboard
echo "📈 Dashboard:"
DASH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://dashboard-production-a3a5.up.railway.app)
if [ "$DASH_STATUS" = "200" ]; then
  echo "   ✅ Dashboard serving (HTTP $DASH_STATUS)"
else
  echo "   ❌ Dashboard error (HTTP $DASH_STATUS)"
fi
echo ""

echo "✅ Health check complete"
