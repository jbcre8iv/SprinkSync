# SprinkSync v2.0 - Troubleshooting Guide

## Current Issue: Backend Won't Start

The backend is hanging on startup due to database or process conflicts.

## Quick Fix Steps

### 1. Kill All Node Processes

Open Terminal and run:
```bash
# Kill all node processes
pkill -9 node

# Verify they're gone
ps aux | grep node
```

### 2. Clean the Database

```bash
# Navigate to SprinkSync directory
cd /Users/justinbush/Documents/AppBuilds/SprinkSync

# Remove old database (if it exists)
rm -f backend/database/sprinkSync.db
```

### 3. Start Fresh

```bash
# From SprinkSync root directory
npm start
```

If `npm start` fails again, try manual startup:

```bash
# Terminal 1 - Backend
cd backend
node src/index.js

# Terminal 2 - Dashboard (in a new terminal window)
cd web-dashboard
npm run dev
```

## Expected Output

### Backend Should Show:
```
🔌 Using MOCK GPIO (Development mode)
🚀 Starting SprinkSync...
✅ Connected to SQLite database
✅ Zones table ready
✅ Schedules table ready
✅ History table ready
✅ System settings table ready
✅ Weather cache table ready
✅ Zone profiles table ready
✅ Analytics table ready
📝 No zones configured. Use /api/zones/initialize to set up your system.
✅ SprinkSync is running!

   API Server: http://localhost:3000
```

### Dashboard Should Show:
```
VITE v7.1.10  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Testing the System

Once both are running:

1. Open http://localhost:5173 in your browser
2. You should see a **Welcome Screen** asking you to configure your system
3. Select a zone configuration (4, 6, 8, or 12 zones)
4. Click "Initialize System"
5. You should see your zones appear!

## If Problems Persist

### Check Port Conflicts

```bash
# Check what's on port 3000 (backend)
lsof -i:3000

# Check what's on port 5173 (dashboard)
lsof -i:5173

# If something is there, kill it
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Verify File Structure

```bash
cd /Users/justinbush/Documents/AppBuilds/SprinkSync

# Check critical files exist
ls -la backend/src/config/zoneConfigs.js
ls -la backend/src/config/database.js
ls -la web-dashboard/src/components/SystemConfigModal.jsx
ls -la scripts/start.js
ls -la package.json
```

All these files should exist. If any are missing, there's a problem.

### Check Node Modules

```bash
# Root dependencies
ls -la node_modules/concurrently

# Backend dependencies
ls -la backend/node_modules/express

# Dashboard dependencies
ls -la web-dashboard/node_modules/vite
```

If any are missing, reinstall:

```bash
# Root
npm install

# Backend
cd backend && npm install && cd ..

# Dashboard
cd web-dashboard && npm install && cd ..
```

## Known Issues

### Issue: "Cannot apply unknown utility class bg-gray-50"

This was a Tailwind v4 conflict. Should be fixed after running:
```bash
cd web-dashboard
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Issue: Backend hangs with no output

This is usually caused by:
1. Old node processes still running → Solution: `pkill -9 node`
2. Database file lock → Solution: `rm backend/database/sprinkSync.db`
3. Port 3000 in use → Solution: `lsof -ti:3000 | xargs kill -9`

### Issue: 404 on dashboard

Dashboard didn't compile due to Tailwind error. See "Cannot apply unknown utility class" above.

## Alternative: Manual Backend Test

To see if backend works without the start script:

```bash
cd /Users/justinbush/Documents/AppBuilds/SprinkSync/backend

# Make sure no database exists
rm -f database/sprinkSync.db

# Run backend directly
node src/index.js
```

Watch for:
- Does it print "🚀 Starting SprinkSync..."?
- Does it create tables?
- Does it print "✅ SprinkSync is running!"?
- Is it listening on port 3000?

If it hangs silently, there's a code issue that needs debugging.

## Getting Help

If none of this works, the issue might be:
1. A syntax error in one of the new files
2. A missing dependency
3. A Node.js version incompatibility

Check Node version:
```bash
node --version  # Should be 20.x or higher
npm --version   # Should be 10.x or higher
```

## What's New in v2.0

Once working, you'll have:
- 13 use case profiles
- Weather intelligence
- Water cost tracking
- AI-powered insights
- Predefined zone configurations (4/6/8/12 zones)
- Beautiful new dashboard widgets
- Streamlined startup with `npm start`

## Next Steps After Fixing

1. Configure your system via the welcome screen
2. Add your use case profile in Settings
3. Add your location for weather intelligence
4. Create watering schedules
5. Explore the new analytics and insights features!
