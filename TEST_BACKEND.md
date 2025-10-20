# SprinkSync Backend Testing Guide

## 🧪 Complete Backend Test Suite

This guide will help you test all the new features we added to SprinkSync v2.0!

---

## Step 1: Start the Backend

```bash
cd /Users/justinbush/Documents/AppBuilds/SprinkSync/backend

# Delete old database to test fresh schema
rm database/sprinkSync.db

# Start server
node src/index.js
```

**Expected Output:**
```
✅ Connected to SQLite database
✅ Zones table ready
✅ Schedules table ready
✅ History table ready
✅ System settings table ready
✅ Weather cache table ready
✅ Zone profiles table ready
✅ Analytics table ready
✅ Default zones created (1-8)
✅ Default system settings created
🚀 SprinkSync server running on port 3000
```

If you see errors, check the output carefully and let me know!

---

## Step 2: Test API Root

```bash
curl http://localhost:3000/api
```

**Expected Response:**
```json
{
  "message": "SprinkSync API",
  "version": "2.0.0",
  "endpoints": {
    "zones": "/api/zones",
    "schedules": "/api/schedules",
    "history": "/api/history",
    "system": "/api/system",
    "settings": "/api/settings",
    "weather": "/api/weather",
    "analytics": "/api/analytics"
  },
  "features": {
    "useCaseProfiles": true,
    "weatherIntegration": true,
    "smartScheduling": true,
    "costTracking": true,
    "analytics": true
  }
}
```

---

## Step 3: Test Settings API

### Get System Settings
```bash
curl http://localhost:3000/api/settings
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "useCaseProfile": "residential_lawn",
    "profileInfo": {
      "id": "residential_lawn",
      "name": "Residential Lawn",
      "icon": "🏡",
      "description": "Healthy green grass for home lawns"
    },
    "location": {
      "lat": null,
      "lon": null,
      "zip": null,
      "city": null
    },
    "waterRate": {
      "perGallon": 0.01,
      "currency": "USD"
    },
    "weather": {
      "enabled": true,
      "apiKey": null,
      "smartSkipEnabled": true,
      "rainThreshold": 0.25
    }
  }
}
```

### Get All Use Case Profiles
```bash
curl http://localhost:3000/api/settings/profiles
```

**Expected Response:** List of all 13 profiles!
```json
{
  "success": true,
  "profiles": [
    {
      "id": "residential_lawn",
      "name": "Residential Lawn",
      "icon": "🏡",
      "description": "Healthy green grass for home lawns"
    },
    {
      "id": "motocross_track",
      "name": "Motocross/Dirt Track",
      "icon": "🏍️",
      "description": "Surface moisture for dust control and traction"
    },
    {
      "id": "golf_course",
      "name": "Golf Course",
      "icon": "⛳",
      "description": "Professional turf management for greens, fairways, and rough"
    },
    {
      "id": "vineyard",
      "name": "Vineyard/Winery",
      "icon": "🍇",
      "description": "Precision drip irrigation for wine grapes"
    },
    ... and 9 more!
  ]
}
```

### Get Specific Profile Details (Motocross Track!)
```bash
curl http://localhost:3000/api/settings/profiles/motocross_track
```

**Expected Response:** Full motocross profile with all details!
```json
{
  "success": true,
  "profile": {
    "id": "motocross_track",
    "name": "Motocross/Dirt Track",
    "icon": "🏍️",
    "description": "Surface moisture for dust control and traction",
    "strategy": {
      "frequency": "light_frequent",
      "preferredTimes": ["06:00", "14:00", "18:00"],
      "durationMultiplier": 0.5,
      "minDaysBetween": 0
    },
    "weather": {
      "skipOnRain": false,
      "waterBeforeRain": true,
      "rainThreshold": 0.5,
      "increaseInWind": true,
      "windThreshold": 15
    },
    "recommendations": [
      "Water 30-60 minutes before riders arrive",
      "Light watering to maintain surface moisture (not saturation)",
      "Increase watering frequency on windy days for dust control",
      "Consider watering before rain to help compact track",
      ...
    ]
  }
}
```

### Update Settings to Motocross Profile
```bash
curl -X PUT http://localhost:3000/api/settings \
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
  }'
```

**Expected:** Settings updated with motocross profile!

---

## Step 4: Test Weather API

### Get Weather Forecast
```bash
curl http://localhost:3000/api/weather
```

**Expected Response (if location not set):**
```json
{
  "success": true,
  "enabled": true,
  "configured": false,
  "message": "Location not configured"
}
```

**After setting location:**
```json
{
  "success": true,
  "enabled": true,
  "configured": true,
  "current": {
    "temp": 72.5,
    "humidity": 65,
    "windSpeed": 8.2,
    "conditions": "Clear",
    ...
  },
  "forecast": [
    {
      "date": "2025-10-20",
      "tempHigh": 75,
      "tempLow": 58,
      "precipitation": 0,
      "precipProb": 10,
      "conditions": "Clear"
    },
    ...
  ],
  "fromCache": false
}
```

### Check if Should Skip Watering (Zone 1)
```bash
curl http://localhost:3000/api/weather/should-skip/1
```

**Expected Response:**
```json
{
  "success": true,
  "zoneId": 1,
  "skip": false,
  "reason": "Weather conditions favorable"
}
```

Or if rain is forecast:
```json
{
  "success": true,
  "zoneId": 1,
  "skip": true,
  "reason": "Rain forecast: 0.5\" (80% chance)"
}
```

---

## Step 5: Test Analytics API

### Water a Zone (to generate analytics data)
```bash
# Start zone 1 for 15 minutes
curl -X POST http://localhost:3000/api/zones/1/start \
  -H "Content-Type: application/json" \
  -d '{"duration": 15}'

# Wait 1 minute, then stop it
curl -X POST http://localhost:3000/api/zones/1/stop
```

### Get Analytics Summary
```bash
curl http://localhost:3000/api/analytics/summary?days=30
```

**Expected Response:**
```json
{
  "success": true,
  "period": "30 days",
  "overall": {
    "totalRuntime": 15,
    "totalGallons": 22,
    "totalCost": 0.22,
    "manualRuns": 1,
    "scheduledRuns": 0,
    "weatherSkips": 0,
    "activeDays": 1
  },
  "daily": {
    "avgRuntime": 15,
    "avgGallons": 22,
    "avgCost": 0.22
  },
  "savings": {
    "weatherSkipsSavedGallons": 0,
    "weatherSkipsSavedCost": 0,
    "vsTraditionalGallons": 2898,
    "vsTraditionalCost": 28.98,
    "vsTraditionalPercent": 99
  },
  "perZone": [
    {
      "zone_id": 1,
      "zone_name": "Zone 1",
      "total_runtime": 15,
      "total_gallons": 22,
      "total_cost": 0.22
    },
    ...
  ],
  "currency": "USD"
}
```

### Get Insights
```bash
curl http://localhost:3000/api/analytics/insights?days=30
```

**Expected Response:**
```json
{
  "success": true,
  "days": 30,
  "insights": [
    {
      "type": "success",
      "category": "savings",
      "title": "Smart Savings!",
      "message": "You've saved $28.98 (99%) vs traditional timer",
      "priority": 1
    },
    {
      "type": "info",
      "category": "automation",
      "title": "Consider Scheduling",
      "message": "Most of your watering is manual. Set up schedules to save time and optimize watering.",
      "priority": 3
    }
  ]
}
```

### Get Chart Data
```bash
# Get gallons chart
curl http://localhost:3000/api/analytics/chart?days=30&metric=gallons

# Get cost chart
curl http://localhost:3000/api/analytics/chart?days=30&metric=cost

# Get runtime chart
curl http://localhost:3000/api/analytics/chart?days=30&metric=runtime
```

---

## Step 6: Test All 13 Profiles

Test switching between different profiles:

```bash
# Golf Course
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"useCaseProfile": "golf_course"}'

# Vineyard
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"useCaseProfile": "vineyard"}'

# Dust Control
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"useCaseProfile": "dust_control"}'

# Get details for each
curl http://localhost:3000/api/settings/profiles/golf_course
curl http://localhost:3000/api/settings/profiles/vineyard
curl http://localhost:3000/api/settings/profiles/orchard
curl http://localhost:3000/api/settings/profiles/dust_control
curl http://localhost:3000/api/settings/profiles/park_athletic
curl http://localhost:3000/api/settings/profiles/nursery_commercial
curl http://localhost:3000/api/settings/profiles/hobby_farm
```

---

## Step 7: Integration Test (Full Flow)

Test the complete smart watering flow:

```bash
# 1. Set to motocross profile with location
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "useCaseProfile": "motocross_track",
    "location": {
      "lat": 37.7749,
      "lon": -122.4194,
      "city": "San Francisco"
    },
    "waterRate": {
      "perGallon": 0.008
    },
    "weather": {
      "enabled": true,
      "smartSkipEnabled": true
    }
  }'

# 2. Get weather forecast
curl http://localhost:3000/api/weather

# 3. Check if should skip watering
curl http://localhost:3000/api/weather/should-skip/1

# 4. Start watering zone 1
curl -X POST http://localhost:3000/api/zones/1/start \
  -H "Content-Type: application/json" \
  -d '{"duration": 10}'

# 5. Check analytics after 1 minute
sleep 60
curl http://localhost:3000/api/analytics/summary

# 6. Stop zone
curl -X POST http://localhost:3000/api/zones/1/stop

# 7. Get insights
curl http://localhost:3000/api/analytics/insights
```

---

## ✅ Success Criteria

Your backend is working correctly if:

1. ✅ Server starts without errors
2. ✅ All 4 new database tables are created
3. ✅ All 13 profiles are returned by `/api/settings/profiles`
4. ✅ You can switch between profiles with PUT `/api/settings`
5. ✅ Weather API returns forecast (after setting location)
6. ✅ Analytics tracks water usage and calculates costs
7. ✅ Insights API provides recommendations

---

## 🐛 Troubleshooting

### Database Errors
If you see database errors, delete the old database:
```bash
rm database/sprinkSync.db
```
Then restart the server.

### Weather API Errors
The weather API needs:
- Location (lat/lon) to be set
- OpenWeatherMap API key (or use demo mode)

To add your own API key:
```bash
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "weather": {
      "apiKey": "your_openweathermap_api_key_here"
    }
  }'
```

Get a free API key at: https://openweathermap.org/api

### Module Not Found
If you see "Cannot find module" errors, make sure all dependencies are installed:
```bash
cd backend
npm install
```

---

## 📝 What to Report Back

After running these tests, let me know:

1. **Did the server start successfully?** (Check for all ✅ messages)
2. **Any errors in the console?** (Copy the error message)
3. **Which API endpoints worked?** (Settings, Weather, Analytics)
4. **Did you see all 13 profiles?** (residential_lawn, motocross_track, golf_course, vineyard, etc.)
5. **Did analytics track your water usage?** (gallons, cost, savings)

---

🎉 **Once these tests pass, we'll have a fully functional backend with 13 amazing use case profiles!**
