# SprinkSync Development Guide

## Overview

This guide covers the enhanced development environment setup and best practices for working with SprinkSync.

## Recent Improvements ✨

### 1. Environment Auto-Detection
- **File**: `ios-app/src/config/environment.js`
- **Features**:
  - Automatically detects iOS Simulator vs Physical Device
  - Configures correct API endpoints (localhost for simulator, local IP for device)
  - Separates development and production configurations
  - Environment-aware timeout and retry settings

### 2. Enhanced API Client
- **File**: `ios-app/src/api/client.js`
- **Features**:
  - **Automatic Retry Logic**: Failed requests retry up to 3 times with delays
  - **Health Check Endpoint**: Verify backend connectivity before making requests
  - **Smart Error Detection**: Distinguishes between network errors and server errors
  - **Environment Integration**: Uses auto-detected configuration

### 3. Unified Development Script
- **File**: `./dev-start.sh`
- **Features**:
  - Starts both backend and Metro bundler with one command
  - Auto-detects your local IP address
  - Waits for backend to be ready before proceeding
  - Creates log files for debugging
  - Handles graceful shutdown with Ctrl+C

### 4. Error Boundary Component
- **File**: `ios-app/src/components/ErrorBoundary.js`
- **Features**:
  - Catches React component errors before they crash the app
  - Shows user-friendly error message instead of red screen
  - Displays detailed error info in development mode
  - Provides "Try Again" button to recover

## Quick Start

### Using the Development Script (Recommended)

```bash
cd /Users/justinbush/Documents/AppBuilds/SprinkSync
./dev-start.sh
```

This single command will:
1. Clean up any existing processes on ports 3000 and 8081
2. Start the backend API server
3. Wait for backend to be healthy
4. Start the Metro bundler
5. Display your local IP and service URLs

### Manual Start

If you prefer to start services individually:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Metro Bundler:**
```bash
cd ios-app
npm start
```

**Terminal 3 - Run App:**
```bash
cd ios-app
# For simulator:
npx expo run:ios

# For physical device:
# Open Xcode and run from there
```

## Environment Configuration

### Update Local IP (when your network changes)

Edit `ios-app/src/config/environment.js`:

```javascript
const LOCAL_IP = '172.16.224.75'; // Update this line
```

Or better yet, the app auto-detects simulator vs device, so you only need to update this when your computer's IP changes.

### Environment Variables

The environment config automatically provides:

```javascript
{
  baseURL: 'http://localhost:3000/api',  // or http://172.16.224.75:3000/api
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  environment: 'development',
  isSimulator: true/false,
  isDevelopment: true
}
```

## API Client Usage

### Health Check

```javascript
import { checkHealth } from '../api/client';

const { healthy, data, error } = await checkHealth();
if (!healthy) {
  console.warn('Backend is not reachable:', error);
}
```

### Automatic Retries

All API calls now automatically retry on network failures:

```javascript
// This will retry up to 3 times if it fails
const zones = await getAllZones();
```

## Error Boundaries

Wrap your screens/components with ErrorBoundary:

```javascript
import ErrorBoundary from '../components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## Testing on Physical Devices

### Prerequisites
1. iPhone connected via USB
2. iPhone and Mac on same WiFi network
3. Developer mode enabled on iPhone (iOS 16+)
4. Trust this computer on iPhone

### Steps
1. Run the dev script: `./dev-start.sh`
2. Note your local IP address (displayed in terminal)
3. Open Xcode: `open ios-app/ios/SprinkSync.xcworkspace`
4. Select your iPhone as the target device
5. Click Run (▶️) or press Cmd+R

### Troubleshooting

**"No script URL provided" Error:**
- Ensure Metro bundler is running (`./dev-start.sh` handles this)
- Shake iPhone → tap "Reload"

**"TurboModuleManager" Error:**
- This is a timing issue during initial launch
- Simply shake iPhone → tap "Reload JS"
- The error won't reoccur after first successful load

**Network Errors:**
- Verify iPhone and Mac are on same WiFi network
- Check firewall isn't blocking port 3000 or 8081
- Verify local IP in `environment.js` matches your Mac's IP

## Logs and Debugging

### View Logs

```bash
# Backend logs
tail -f logs/backend.log

# Metro bundler logs
tail -f logs/metro.log
```

### Console Logs

The app now logs useful debugging info:

```
🔧 Environment Config: {
  environment: 'development',
  baseURL: 'http://172.16.224.75:3000/api',
  isSimulator: false,
  isDevelopment: true,
  platform: 'ios'
}

✅ Backend health check passed
🔄 Retrying request... (2 attempts left)
```

## Best Practices

### 1. Always Use the Dev Script
Instead of manually starting services, use `./dev-start.sh` to ensure everything is configured correctly.

### 2. Check Backend Health
Before making critical requests, check if backend is reachable:

```javascript
const health = await checkHealth();
if (health.healthy) {
  // Proceed with API calls
}
```

### 3. Wrap Components in Error Boundaries
Prevent full app crashes by wrapping major screen components in `<ErrorBoundary>`.

### 4. Monitor Logs
Keep terminal windows open to monitor backend and Metro logs for issues.

### 5. Clean Restart
If things get weird:
```bash
# Kill all processes
lsof -ti:3000 | xargs kill -9
lsof -ti:8081 | xargs kill -9

# Restart everything
./dev-start.sh
```

## Production Deployment (Future)

When ready for production:

1. Update `environment.js` with production API URL
2. Build production bundle:
   ```bash
   cd ios-app
   eas build --platform ios
   ```
3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

## Additional Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Backend API Docs**: http://localhost:3000/api

## Support

If you encounter issues not covered here:
1. Check logs in `logs/` directory
2. Review environment configuration
3. Verify network connectivity
4. Restart development environment

---

**Last Updated**: October 2025
