#!/bin/bash

# SprinkSync Development Startup Script
# Starts both backend and iOS app in development mode

set -e  # Exit on error

echo "🚀 Starting SprinkSync Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    echo "Please run this script from the SprinkSync root directory"
    exit 1
fi

# Check if ios-app directory exists
if [ ! -d "ios-app" ]; then
    echo -e "${RED}❌ iOS app directory not found!${NC}"
    echo "Please run this script from the SprinkSync root directory"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo -e "${BLUE}📡 Local IP Address: ${GREEN}${LOCAL_IP}${NC}"
echo ""

# Kill any existing processes on required ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend server
echo ""
echo -e "${BLUE}▶️  Starting Backend Server...${NC}"
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/system/status > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        exit 1
    fi
done

# Start iOS Metro bundler
echo ""
echo -e "${BLUE}▶️  Starting Metro Bundler...${NC}"
cd ios-app
npm start > ../logs/metro.log 2>&1 &
METRO_PID=$!
cd ..
echo -e "${GREEN}✅ Metro Bundler started (PID: $METRO_PID)${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ SprinkSync Development Environment Ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Services:${NC}"
echo -e "   Backend API:    http://localhost:3000"
echo -e "   Backend API:    http://${LOCAL_IP}:3000 (for physical device)"
echo -e "   Metro Bundler:  http://localhost:8081"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Backend:  tail -f logs/backend.log"
echo -e "   Metro:    tail -f logs/metro.log"
echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo "   1. For Simulator: npx expo run:ios (from ios-app directory)"
echo "   2. For Device:    Open Xcode and run on your device"
echo ""
echo -e "${BLUE}🛑 To Stop:${NC}"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $METRO_PID"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Keep script running and handle Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $METRO_PID 2>/dev/null; exit" INT

# Wait for user to stop
wait
