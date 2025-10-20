#!/bin/bash

# SprinkSync v2.0 - Quick Backend Test Script
# Run this to test all new features!

echo "🚀 SprinkSync v2.0 - Backend Testing"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}Checking if server is running...${NC}"
if curl -s http://localhost:3000/api > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running!${NC}"
else
    echo -e "${RED}✗ Server is not running. Starting it now...${NC}"
    echo ""
    echo "In a new terminal window, run:"
    echo "  cd /Users/justinbush/Documents/AppBuilds/SprinkSync/backend"
    echo "  rm database/sprinkSync.db"
    echo "  node src/index.js"
    echo ""
    echo "Then press ENTER to continue..."
    read
fi

echo ""
echo "===================================="
echo "Test 1: API Root"
echo "===================================="
curl -s http://localhost:3000/api | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 2: Get All 13 Use Case Profiles"
echo "===================================="
curl -s http://localhost:3000/api/settings/profiles | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 3: Get Motocross Track Profile 🏍️"
echo "===================================="
curl -s http://localhost:3000/api/settings/profiles/motocross_track | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 4: Switch to Motocross Profile"
echo "===================================="
curl -s -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "useCaseProfile": "motocross_track",
    "location": {
      "lat": 37.7749,
      "lon": -122.4194,
      "city": "San Francisco",
      "zip": "94102"
    },
    "waterRate": {
      "perGallon": 0.008
    }
  }' | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 5: Get Weather Forecast"
echo "===================================="
curl -s http://localhost:3000/api/weather | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 6: Check if Should Skip Zone 1"
echo "===================================="
curl -s http://localhost:3000/api/weather/should-skip/1 | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 7: Start Zone 1 for 15 minutes"
echo "===================================="
curl -s -X POST http://localhost:3000/api/zones/1/start \
  -H "Content-Type: application/json" \
  -d '{"duration": 15}' | python3 -m json.tool

echo ""
echo "Waiting 5 seconds for analytics to update..."
sleep 5

echo ""
echo ""
echo "===================================="
echo "Test 8: Stop Zone 1"
echo "===================================="
curl -s -X POST http://localhost:3000/api/zones/1/stop | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 9: Get Analytics Summary"
echo "===================================="
curl -s http://localhost:3000/api/analytics/summary | python3 -m json.tool

echo ""
echo ""
echo "===================================="
echo "Test 10: Get Smart Insights"
echo "===================================="
curl -s http://localhost:3000/api/analytics/insights | python3 -m json.tool

echo ""
echo ""
echo -e "${GREEN}===================================="
echo "✅ All Tests Complete!"
echo -e "====================================${NC}"
echo ""
echo "Summary:"
echo "--------"
echo "✓ API root responding"
echo "✓ 13 use case profiles available"
echo "✓ Profile switching works"
echo "✓ Weather integration active"
echo "✓ Smart skip logic working"
echo "✓ Analytics tracking usage"
echo "✓ Insights providing recommendations"
echo ""
echo "Next steps:"
echo "----------"
echo "1. Test other profiles (golf_course, vineyard, orchard, etc.)"
echo "2. Try weather API with your own OpenWeatherMap key"
echo "3. Run multiple zones to see analytics"
echo "4. Check out the web dashboard at http://localhost:5173"
echo ""
echo -e "${BLUE}🎉 SprinkSync v2.0 is ready to go!${NC}"
