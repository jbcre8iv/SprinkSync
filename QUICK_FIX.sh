#!/bin/bash

# SprinkSync v2.0 Quick Fix Script
# This script resets everything and starts fresh

echo "============================================================"
echo "🔧 SprinkSync v2.0 - Quick Fix"
echo "============================================================"
echo ""

# Step 1: Kill all node processes
echo "1️⃣ Killing all node processes..."
pkill -9 node
sleep 2
echo "✅ Done"
echo ""

# Step 2: Navigate to project root
cd "$(dirname "$0")"
echo "📂 Working directory: $(pwd)"
echo ""

# Step 3: Delete old database
echo "2️⃣ Deleting old database..."
if [ -f "backend/database/sprinkSync.db" ]; then
    rm backend/database/sprinkSync.db
    echo "✅ Old database deleted"
else
    echo "ℹ️  No database file found (this is fine)"
fi
echo ""

# Step 4: Start services
echo "3️⃣ Starting SprinkSync..."
echo ""
npm start
