# SprinkSync

**Smart watering, perfectly synced**

A smart sprinkler controller system that retrofits existing Rain Bird sprinkler systems with WiFi capabilities, use-case profiles, weather intelligence, and AI-powered insights.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-20.x-green)
![Platform](https://img.shields.io/badge/platform-Raspberry%20Pi%205-red)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Status](#-project-status)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Examples](#-api-examples)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🆕 Version 2.0 - Smart Irrigation

✅ **Use Case Profiles**
- 13 specialized profiles (Residential, Golf Course, Vineyard, Greenhouse, etc.)
- Optimized watering strategies per use case
- Easy system configuration matching Rain Bird hardware (4/6/8/12 zones)

✅ **Weather Intelligence**
- OpenWeatherMap API integration
- Smart skip based on rainfall predictions
- 5-day forecast display
- Automatic watering adjustments

✅ **Analytics & Water Management**
- Track water usage and costs
- Calculate savings from smart features
- Historical usage trends
- Real-time cost analysis

✅ **AI-Powered Insights**
- Intelligent watering recommendations
- Efficiency optimization suggestions
- Weather-based adjustments
- Usage pattern analysis

### Core Functionality

✅ **Flexible Zone Control**
- Support for 4, 6, 8, or 12 zones
- Turn zones on/off instantly
- Custom run duration per activation
- Emergency stop all zones

✅ **Automated Scheduling**
- Unlimited schedules per zone
- Specific start times and durations
- Day-of-week selection
- Weather-aware execution

✅ **Activity History & Tracking**
- Complete activity log
- Total runtime per zone
- Last run timestamps
- Filter by zone, date, or trigger

✅ **Safety Features**
- All relays start in OFF state
- Maximum 60-minute runtime
- Maximum 2 zones concurrent
- Auto-shutoff on crash/power loss
- GPIO cleanup on shutdown

---

## 🚀 Quick Start

### Prerequisites

- **Hardware**: Raspberry Pi 5 (4GB RAM) with Raspbian OS
  - For development: Any computer with Node.js 20+
- **Software**: Node.js 20 LTS or higher
- **Hardware** (Production only): 4/6/8/12-channel 5V relay module, 24V AC transformer
- **Optional**: OpenWeatherMap API key for weather intelligence (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jbcre8iv/SprinkSync.git
   cd SprinkSync
   ```

2. **Install all dependencies** (one-time setup)
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend && npm install && cd ..

   # Install dashboard dependencies
   cd web-dashboard && npm install && cd ..
   ```

3. **Start SprinkSync** (streamlined - one command!)
   ```bash
   npm start
   ```

   This will automatically:
   - Kill any existing processes on ports 3000/5173
   - Start the backend server (port 3000)
   - Start the web dashboard (port 5173)
   - Provide live status updates

   **Press `Ctrl+C` to stop all services**

4. **Access the dashboard**
   Open your browser to: **http://localhost:5173**

   You'll be greeted with a welcome screen to configure your system!

### First-Time Configuration

When you first access the dashboard, select your irrigation controller size:
- **4-Zone System** - Small residential
- **6-Zone System** - Medium residential
- **8-Zone System** - Large residential / Small commercial
- **12-Zone System** - Commercial / Large property

Then customize your system with:
- **Use Case Profile** - Select from 13 specialized profiles
- **Location** - Enable weather intelligence
- **Water Rates** - Track costs and savings

### 🔄 Updating from v1.0 to v2.0

If you were running SprinkSync v1.0, follow these steps to upgrade:

1. **Stop all old processes:**
   ```bash
   # Kill backend (port 3000)
   lsof -ti:3000 | xargs kill -9

   # Kill dashboard (port 5173)
   lsof -ti:5173 | xargs kill -9
   ```

2. **Delete old database** (to use new configuration system):
   ```bash
   rm backend/database/sprinkSync.db
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

4. **Install new dependencies:**
   ```bash
   npm install
   ```

5. **Start fresh with streamlined startup:**
   ```bash
   npm start
   ```

6. **Configure your system** via the welcome screen at http://localhost:5173

---

## 📊 Project Status

### ✅ Phase 1: Backend Foundation (v1.0 - COMPLETE)

- [x] Express server setup
- [x] SQLite database initialization
- [x] Mock GPIO controller (development mode)
- [x] All API endpoints (zones, schedules, history, system)
- [x] Schedule execution engine with node-cron
- [x] Error handling and logging
- [x] Comprehensive testing

**Status**: All backend features complete and tested!

### ✅ Phase 2: Web Dashboard (v1.0 - COMPLETE)

- [x] Vite + React + TailwindCSS setup
- [x] Component library (ZoneCard, Modal, etc.)
- [x] Dashboard page (zone grid)
- [x] Schedules page
- [x] History page
- [x] Settings page
- [x] API client integration
- [x] Real-time updates

**Status**: Fully functional web dashboard!

### ✅ Phase 3: iOS App (v1.0 - COMPLETE)

- [x] React Native + Expo setup
- [x] Bottom tab navigation
- [x] Dashboard screen
- [x] Schedules screen (create/edit/delete)
- [x] History screen with stats
- [x] Settings screen
- [x] API client integration
- [x] Pull-to-refresh
- [x] Native iOS deployment

**Status**: Native iOS app running on physical iPhone!

### ✅ Phase 4: Smart Features (v2.0 - COMPLETE)

- [x] Use case profiles (13 specialized profiles)
- [x] Predefined zone configurations (4/6/8/12 zones)
- [x] Weather API integration (OpenWeatherMap)
- [x] Smart skip based on rainfall
- [x] Water cost tracking and analytics
- [x] AI-powered insights and recommendations
- [x] Weather widget for dashboard
- [x] Analytics widget with usage stats
- [x] Insights panel with recommendations
- [x] System configuration wizard
- [x] Streamlined startup scripts

**Status**: v2.0 Smart Irrigation features complete!

### 🔜 Phase 5: iOS App v2.0 Updates (In Progress)

- [ ] Update iOS app with use case profiles
- [ ] Add weather widget to mobile dashboard
- [ ] Add analytics screen
- [ ] Add insights screen
- [ ] System configuration in mobile app

### 🔜 Phase 6: Hardware Integration (Future)

- [ ] Raspberry Pi deployment
- [ ] Real GPIO testing
- [ ] Relay module connection
- [ ] 7-day reliability testing

---

## 📚 Documentation

- **[SPECIFICATION.md](SPECIFICATION.md)** - Complete technical specification
  - API endpoints with examples
  - Database schema
  - UI/UX wireframes
  - Hardware integration details
  - Development phases

- **[CursorRules](CursorRules)** - Development guidelines and project context

---

## 🛠 Tech Stack

### Backend (Current)
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: SQLite3
- **Scheduling**: node-cron
- **Hardware**: onoff (GPIO library for Raspberry Pi)
- **Logging**: Winston
- **Development**: nodemon

### Web Dashboard
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Routing**: React Router

### iOS App
- **Framework**: React Native 0.81
- **Platform**: Expo SDK 54
- **Navigation**: React Navigation (Bottom Tabs)
- **HTTP Client**: Axios

### Hardware
- **Controller**: Raspberry Pi 5 (4GB RAM)
- **Relay Module**: 8-channel 5V relay (opto-isolated)
- **Sprinkler System**: Rain Bird 24V AC valves

---

## 💻 Development

### Running in Development Mode

The backend uses **mock GPIO** by default, which means you can develop and test without Raspberry Pi hardware!

```bash
cd backend
npm run dev
```

Mock GPIO will log all GPIO operations to the console:
```
[MOCK GPIO] Pin 17 → 0 [ON (Valve OPEN)]
[MOCK GPIO] Pin 17 → 1 [OFF (Valve CLOSED)]
```

### Environment Variables

```bash
# Backend .env file
NODE_ENV=development        # development or production
PORT=3000                   # Server port
DATABASE_PATH=./database/sprinkSync.db
GPIO_MODE=mock             # mock (dev) or real (Pi)
LOG_LEVEL=debug            # debug, info, warn, error
APP_NAME=SprinkSync
```

### Testing the API

**Get all zones:**
```bash
curl http://localhost:3000/api/zones
```

**Start zone 1 for 15 minutes:**
```bash
curl -X POST http://localhost:3000/api/zones/1/start \
  -H "Content-Type: application/json" \
  -d '{"duration": 15}'
```

**Create a schedule:**
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "zone_id": 1,
    "start_time": "06:00",
    "duration": 15,
    "days": [1,3,5],
    "enabled": true
  }'
```

**Get system status:**
```bash
curl http://localhost:3000/api/system/status
```

### Project Structure

```
SprinkSync/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry point
│   │   ├── config/               # Database and constants
│   │   ├── controllers/          # Business logic
│   │   ├── hardware/             # GPIO control (real + mock)
│   │   ├── middleware/           # Express middleware
│   │   ├── routes/               # API routes
│   │   ├── services/             # Core services
│   │   └── utils/                # Helpers and validation
│   ├── database/                 # SQLite database
│   ├── logs/                     # Application logs
│   └── package.json
│
├── web-dashboard/                # React web dashboard
│   ├── src/
│   │   ├── App.jsx               # Main app component
│   │   ├── api/                  # API client
│   │   ├── components/           # Reusable components
│   │   └── pages/                # Page components
│   └── package.json
│
├── ios-app/                      # React Native iOS app
│   ├── App.js                    # Main app with navigation
│   ├── src/
│   │   ├── api/                  # API client
│   │   ├── screens/              # Screen components
│   │   └── components/           # Reusable components
│   └── package.json
│
├── SPECIFICATION.md
├── CursorRules
└── README.md
```

---

## 🚢 Deployment

### Deploying to Raspberry Pi 5

1. **Setup Raspberry Pi**
   ```bash
   # On Raspberry Pi
   sudo apt update && sudo apt upgrade
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs
   ```

2. **Clone and configure**
   ```bash
   git clone <your-repo-url>
   cd SprinkSync/backend
   npm install
   cp .env.example .env
   ```

3. **Update environment for production**
   ```bash
   # Edit .env
   NODE_ENV=production
   GPIO_MODE=real
   LOG_LEVEL=info
   ```

4. **Connect hardware**
   - Connect 8-channel relay module to GPIO pins
   - Connect relay outputs to sprinkler valve wires
   - See SPECIFICATION.md Section 5 for wiring details

5. **Run as service** (optional)
   ```bash
   # Install PM2
   sudo npm install -g pm2

   # Start SprinkSync
   pm2 start src/index.js --name sprinkSync

   # Configure autostart
   pm2 startup
   pm2 save
   ```

---

## 📡 API Examples

### Zones API

**Get all zones:**
```http
GET /api/zones
```

Response:
```json
[
  {
    "id": 1,
    "name": "Front Lawn",
    "gpio_pin": 17,
    "default_duration": 15,
    "total_runtime": 0,
    "last_run": null,
    "is_running": false,
    "remaining_time": 0
  }
]
```

**Start a zone:**
```http
POST /api/zones/1/start
Content-Type: application/json

{
  "duration": 15
}
```

**Stop a zone:**
```http
POST /api/zones/1/stop
```

**Emergency stop all zones:**
```http
POST /api/zones/stop-all
```

### Schedules API

**Create schedule:**
```http
POST /api/schedules
Content-Type: application/json

{
  "zone_id": 1,
  "start_time": "06:00",
  "duration": 15,
  "days": [1, 3, 5],
  "enabled": true
}
```

**Get all schedules:**
```http
GET /api/schedules
```

**Toggle schedule:**
```http
POST /api/schedules/1/toggle
```

### History API

**Get activity history:**
```http
GET /api/history?zone_id=1&limit=50
```

**Get statistics:**
```http
GET /api/history/stats?days=30
```

### System API

**Get system status:**
```http
GET /api/system/status
```

Response:
```json
{
  "app_name": "SprinkSync",
  "version": "1.0.0",
  "uptime": 3600,
  "gpio_mode": "mock",
  "active_zones": 1,
  "total_zones": 8,
  "scheduler_status": "running",
  "running_zones": [
    {
      "zone_id": 1,
      "elapsed": 5,
      "remaining": 10
    }
  ]
}
```

See [SPECIFICATION.md](SPECIFICATION.md) for complete API documentation.

---

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome!

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

Built as a learning project to add smart capabilities to an existing Rain Bird sprinkler system.

**Technologies used:**
- Node.js & Express for backend API
- SQLite for data persistence
- node-cron for scheduling
- Winston for logging
- React (coming soon) for web interface

---

**SprinkSync** - Making your sprinkler system smart, one zone at a time! 💧🌱
