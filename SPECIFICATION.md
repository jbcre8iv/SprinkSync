# SprinkSync - Technical Specification

**Version:** 1.0
**Last Updated:** October 19, 2025
**Tagline:** "Smart watering, perfectly synced"

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [API Specification](#2-api-specification)
3. [Database Schema](#3-database-schema)
4. [UI/UX Wireframes](#4-uiux-wireframes)
5. [Hardware Integration](#5-hardware-integration)
6. [Development Phases](#6-development-phases)
7. [Folder Structure](#7-folder-structure)
8. [Technical Details](#8-technical-details)

---

## 1. Project Overview

### 1.1 Purpose

**SprinkSync** is a smart sprinkler controller system that retrofits existing Rain Bird sprinkler systems with WiFi capabilities, enabling remote control, automated scheduling, and comprehensive activity tracking.

### 1.2 Core Features

#### Manual Zone Control
- Turn any of 8 zones on/off instantly
- Set custom run duration per activation
- View real-time zone status (running/idle)
- Emergency stop all zones

#### Automated Scheduling
- Create unlimited schedules per zone
- Set specific start times and durations
- Choose which days of the week to run
- Enable/disable schedules without deleting
- View next scheduled run for each zone

#### History & Tracking
- Complete activity log for all zones
- Track total runtime per zone
- See last run timestamp
- Filter history by zone, date range, or trigger type (manual/scheduled)
- Export history data

#### System Safety
- All relays start in OFF state
- Maximum 60-minute runtime per zone activation
- Maximum 2 zones running concurrently
- Auto-shutoff on crash or power loss
- GPIO cleanup on shutdown

### 1.3 User Persona

**Target User:** Homeowner with existing Rain Bird sprinkler system, comfortable with basic technology, wants automation without replacing entire system.

**Technical Level:** Self-taught programmer using AI assistance for development.

### 1.4 Success Criteria

- ✅ All 8 zones controllable via web interface
- ✅ Schedules execute reliably and on time
- ✅ System maintains uptime of 99%+
- ✅ Response time under 500ms for all API calls
- ✅ Code is maintainable and well-documented

---

## 2. API Specification

**Base URL:** `http://localhost:3000/api` (development)
**Production:** `http://<raspberry-pi-ip>:3000/api`

**Response Format:** All endpoints return JSON
**Error Format:**
```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-19T14:30:00.000Z"
}
```

### 2.1 Zones API

#### GET /api/zones
Get all zones with current status

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Front Lawn",
    "gpio_pin": 17,
    "default_duration": 15,
    "total_runtime": 3450,
    "last_run": "2025-10-18T06:00:00.000Z",
    "is_running": false,
    "remaining_time": 0
  },
  {
    "id": 2,
    "name": "Back Lawn",
    "gpio_pin": 27,
    "default_duration": 20,
    "total_runtime": 5200,
    "last_run": "2025-10-18T06:15:00.000Z",
    "is_running": true,
    "remaining_time": 12
  }
]
```

#### GET /api/zones/:id
Get single zone by ID

**Response 200:**
```json
{
  "id": 1,
  "name": "Front Lawn",
  "gpio_pin": 17,
  "default_duration": 15,
  "total_runtime": 3450,
  "last_run": "2025-10-18T06:00:00.000Z",
  "is_running": false,
  "remaining_time": 0
}
```

**Response 404:**
```json
{
  "error": "Zone not found",
  "code": "ZONE_NOT_FOUND"
}
```

#### PUT /api/zones/:id
Update zone details (name, default_duration)

**Request Body:**
```json
{
  "name": "Front Yard Lawn",
  "default_duration": 18
}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Front Yard Lawn",
  "gpio_pin": 17,
  "default_duration": 18,
  "total_runtime": 3450,
  "last_run": "2025-10-18T06:00:00.000Z",
  "is_running": false,
  "remaining_time": 0
}
```

#### POST /api/zones/:id/start
Start a zone for specified duration

**Request Body:**
```json
{
  "duration": 15
}
```

**Response 200:**
```json
{
  "message": "Zone 1 started",
  "zone_id": 1,
  "duration": 15,
  "will_stop_at": "2025-10-19T14:45:00.000Z"
}
```

**Response 400:**
```json
{
  "error": "Zone is already running",
  "code": "ZONE_ALREADY_RUNNING"
}
```

**Response 400:**
```json
{
  "error": "Maximum 2 zones can run concurrently",
  "code": "MAX_ZONES_RUNNING"
}
```

#### POST /api/zones/:id/stop
Stop a running zone

**Response 200:**
```json
{
  "message": "Zone 1 stopped",
  "zone_id": 1,
  "runtime": 8
}
```

**Response 400:**
```json
{
  "error": "Zone is not running",
  "code": "ZONE_NOT_RUNNING"
}
```

#### POST /api/zones/stop-all
Emergency stop all running zones

**Response 200:**
```json
{
  "message": "All zones stopped",
  "stopped_zones": [1, 3],
  "count": 2
}
```

### 2.2 Schedules API

#### GET /api/schedules
Get all schedules

**Query Parameters:**
- `zone_id` (optional): Filter by zone ID
- `enabled` (optional): Filter by enabled status (true/false)

**Response 200:**
```json
[
  {
    "id": 1,
    "zone_id": 1,
    "zone_name": "Front Lawn",
    "start_time": "06:00",
    "duration": 15,
    "days": [1, 3, 5],
    "enabled": true,
    "created_at": "2025-10-01T10:00:00.000Z",
    "next_run": "2025-10-21T06:00:00.000Z"
  },
  {
    "id": 2,
    "zone_id": 2,
    "zone_name": "Back Lawn",
    "start_time": "06:15",
    "duration": 20,
    "days": [1, 3, 5],
    "enabled": false,
    "created_at": "2025-10-01T10:05:00.000Z",
    "next_run": null
  }
]
```

#### GET /api/schedules/:id
Get single schedule by ID

**Response 200:**
```json
{
  "id": 1,
  "zone_id": 1,
  "zone_name": "Front Lawn",
  "start_time": "06:00",
  "duration": 15,
  "days": [1, 3, 5],
  "enabled": true,
  "created_at": "2025-10-01T10:00:00.000Z",
  "next_run": "2025-10-21T06:00:00.000Z"
}
```

#### POST /api/schedules
Create new schedule

**Request Body:**
```json
{
  "zone_id": 1,
  "start_time": "06:00",
  "duration": 15,
  "days": [1, 3, 5],
  "enabled": true
}
```

**Field Details:**
- `zone_id`: Zone ID (1-8)
- `start_time`: 24-hour format "HH:MM"
- `duration`: Minutes (1-60)
- `days`: Array of weekday numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
- `enabled`: Boolean

**Response 201:**
```json
{
  "id": 1,
  "zone_id": 1,
  "zone_name": "Front Lawn",
  "start_time": "06:00",
  "duration": 15,
  "days": [1, 3, 5],
  "enabled": true,
  "created_at": "2025-10-19T14:30:00.000Z",
  "next_run": "2025-10-21T06:00:00.000Z"
}
```

**Response 400:**
```json
{
  "error": "Invalid start_time format. Use HH:MM",
  "code": "INVALID_TIME_FORMAT"
}
```

#### PUT /api/schedules/:id
Update existing schedule

**Request Body:** (all fields optional)
```json
{
  "start_time": "06:30",
  "duration": 18,
  "days": [1, 2, 3, 4, 5],
  "enabled": false
}
```

**Response 200:**
```json
{
  "id": 1,
  "zone_id": 1,
  "zone_name": "Front Lawn",
  "start_time": "06:30",
  "duration": 18,
  "days": [1, 2, 3, 4, 5],
  "enabled": false,
  "created_at": "2025-10-01T10:00:00.000Z",
  "next_run": null
}
```

#### DELETE /api/schedules/:id
Delete schedule

**Response 200:**
```json
{
  "message": "Schedule deleted",
  "id": 1
}
```

#### POST /api/schedules/:id/toggle
Toggle schedule enabled/disabled

**Response 200:**
```json
{
  "id": 1,
  "enabled": false,
  "message": "Schedule disabled"
}
```

### 2.3 History API

#### GET /api/history
Get activity history

**Query Parameters:**
- `zone_id` (optional): Filter by zone ID
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `trigger` (optional): "manual" or "scheduled"
- `limit` (optional): Max records (default: 100)

**Response 200:**
```json
[
  {
    "id": 1,
    "zone_id": 1,
    "zone_name": "Front Lawn",
    "start_time": "2025-10-19T06:00:00.000Z",
    "end_time": "2025-10-19T06:15:00.000Z",
    "duration": 15,
    "trigger": "scheduled",
    "schedule_id": 1
  },
  {
    "id": 2,
    "zone_id": 2,
    "zone_name": "Back Lawn",
    "start_time": "2025-10-19T14:20:00.000Z",
    "end_time": "2025-10-19T14:30:00.000Z",
    "duration": 10,
    "trigger": "manual",
    "schedule_id": null
  }
]
```

#### GET /api/history/stats
Get summary statistics

**Query Parameters:**
- `zone_id` (optional): Filter by zone ID
- `days` (optional): Number of days to look back (default: 30)

**Response 200:**
```json
{
  "total_runs": 45,
  "total_runtime": 1250,
  "zones": [
    {
      "zone_id": 1,
      "zone_name": "Front Lawn",
      "runs": 15,
      "total_runtime": 450,
      "avg_runtime": 30,
      "last_run": "2025-10-19T06:00:00.000Z"
    },
    {
      "zone_id": 2,
      "zone_name": "Back Lawn",
      "runs": 12,
      "total_runtime": 400,
      "avg_runtime": 33,
      "last_run": "2025-10-19T06:15:00.000Z"
    }
  ]
}
```

### 2.4 System API

#### GET /api/system/status
Get overall system status

**Response 200:**
```json
{
  "app_name": "SprinkSync",
  "version": "1.0.0",
  "uptime": 86400,
  "gpio_mode": "mock",
  "active_zones": 2,
  "total_zones": 8,
  "database_status": "connected",
  "scheduler_status": "running",
  "memory_usage": {
    "used": 45.2,
    "total": 100,
    "percentage": 45.2
  },
  "running_zones": [
    {
      "zone_id": 1,
      "zone_name": "Front Lawn",
      "elapsed": 5,
      "remaining": 10
    }
  ]
}
```

#### GET /api/system/health
Health check endpoint

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T14:30:00.000Z"
}
```

#### POST /api/system/restart
Restart the application (requires authentication in production)

**Response 200:**
```json
{
  "message": "System restarting",
  "timestamp": "2025-10-19T14:30:00.000Z"
}
```

---

## 3. Database Schema

**Database:** SQLite3
**Location:** `./database/sprinkSync.db`

### 3.1 zones table

Stores information about each sprinkler zone.

```sql
CREATE TABLE zones (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  gpio_pin INTEGER NOT NULL UNIQUE,
  default_duration INTEGER NOT NULL DEFAULT 15,
  total_runtime INTEGER NOT NULL DEFAULT 0,
  last_run DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Zone number (1-8)
- `name`: User-defined zone name
- `gpio_pin`: Raspberry Pi GPIO pin number
- `default_duration`: Default run time in minutes
- `total_runtime`: Cumulative runtime in minutes
- `last_run`: Timestamp of most recent activation
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp

**Indexes:**
```sql
CREATE INDEX idx_zones_gpio_pin ON zones(gpio_pin);
```

**Initial Data:**
```sql
INSERT INTO zones (id, name, gpio_pin, default_duration) VALUES
  (1, 'Zone 1', 17, 15),
  (2, 'Zone 2', 27, 15),
  (3, 'Zone 3', 22, 15),
  (4, 'Zone 4', 23, 15),
  (5, 'Zone 5', 24, 15),
  (6, 'Zone 6', 25, 15),
  (7, 'Zone 7', 5, 15),
  (8, 'Zone 8', 6, 15);
```

### 3.2 schedules table

Stores automated watering schedules.

```sql
CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_id INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  days TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique schedule identifier
- `zone_id`: Associated zone (1-8)
- `start_time`: 24-hour time format "HH:MM"
- `duration`: Run time in minutes (1-60)
- `days`: JSON array of weekday numbers (e.g., "[1,3,5]" for Mon/Wed/Fri)
- `enabled`: Schedule active status (1=enabled, 0=disabled)
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp

**Indexes:**
```sql
CREATE INDEX idx_schedules_zone_id ON schedules(zone_id);
CREATE INDEX idx_schedules_enabled ON schedules(enabled);
```

**Constraints:**
- Duration must be between 1 and 60 minutes
- Days array must contain values 0-6 only
- start_time must be valid "HH:MM" format

### 3.3 history table

Logs all zone activations for tracking and analysis.

```sql
CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_id INTEGER NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration INTEGER,
  trigger TEXT NOT NULL,
  schedule_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL
);
```

**Fields:**
- `id`: Unique history record identifier
- `zone_id`: Zone that ran
- `start_time`: When zone started
- `end_time`: When zone stopped (NULL if still running)
- `duration`: Actual runtime in minutes
- `trigger`: How zone was activated ("manual" or "scheduled")
- `schedule_id`: Associated schedule ID (NULL for manual runs)
- `created_at`: Record creation timestamp

**Indexes:**
```sql
CREATE INDEX idx_history_zone_id ON history(zone_id);
CREATE INDEX idx_history_start_time ON history(start_time);
CREATE INDEX idx_history_trigger ON history(trigger);
```

### 3.4 Database Relationships

```
zones (1) ──< (many) schedules
zones (1) ──< (many) history
schedules (1) ──< (many) history
```

### 3.5 Database Initialization

The database is created automatically on first startup with:
1. All tables created with proper schema
2. Indexes added for performance
3. 8 default zones inserted
4. Foreign key constraints enabled

---

## 4. UI/UX Wireframes

### 4.1 Dashboard Page (Main View)

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰ SprinkSync                                    System: Online  │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  |  Schedules  |  History  |  Settings               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Quick Actions:  [Stop All Zones]                               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Zone 1       │  │ Zone 2       │  │ Zone 3       │         │
│  │ Front Lawn   │  │ Back Lawn    │  │ Garden Beds  │         │
│  │              │  │              │  │              │         │
│  │   RUNNING    │  │     IDLE     │  │     IDLE     │         │
│  │   12 min     │  │              │  │              │         │
│  │              │  │              │  │              │         │
│  │   [Stop]     │  │ [Start] [⚙]  │  │ [Start] [⚙]  │         │
│  │              │  │              │  │              │         │
│  │ Last: 6:00am │  │ Last: 6:15am │  │ Last: 6:30am │         │
│  │ Next: 6:00pm │  │ Next: 6:15pm │  │ Next: 6:30pm │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Zone 4       │  │ Zone 5       │  │ Zone 6       │         │
│  │ Side Yard    │  │ Flower Beds  │  │ Drip System  │         │
│  │              │  │              │  │              │         │
│  │     IDLE     │  │     IDLE     │  │     IDLE     │         │
│  │              │  │              │  │              │         │
│  │              │  │              │  │              │         │
│  │ [Start] [⚙]  │  │ [Start] [⚙]  │  │ [Start] [⚙]  │         │
│  │              │  │              │  │              │         │
│  │ Last: Never  │  │ Last: 6:45am │  │ Last: 7:00am │         │
│  │ Next: --     │  │ Next: 6:45pm │  │ Next: 7:00pm │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Zone 7       │  │ Zone 8       │                            │
│  │ Zone 7       │  │ Zone 8       │                            │
│  │              │  │              │                            │
│  │     IDLE     │  │     IDLE     │                            │
│  │              │  │              │                            │
│  │              │  │              │                            │
│  │ [Start] [⚙]  │  │ [Start] [⚙]  │                            │
│  │              │  │              │                            │
│  │ Last: Never  │  │ Last: Never  │                            │
│  │ Next: --     │  │ Next: --     │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Visual status for all 8 zones
- One-click start/stop controls
- Quick access to zone settings (⚙)
- Last run and next scheduled run displayed
- Emergency "Stop All Zones" button
- Color coding: Green=Running, Gray=Idle

### 4.2 Zone Start Modal

```
┌─────────────────────────────────────┐
│  Start Zone 1 - Front Lawn      [×] │
├─────────────────────────────────────┤
│                                     │
│  Run Duration (minutes):            │
│  ┌───────────────────────────────┐ │
│  │ 15                         ▼│ │ │
│  └───────────────────────────────┘ │
│  (Default: 15 min | Max: 60 min)    │
│                                     │
│  [Cancel]              [Start Zone] │
│                                     │
└─────────────────────────────────────┘
```

### 4.3 Zone Settings Modal

```
┌─────────────────────────────────────┐
│  Zone 1 Settings                 [×] │
├─────────────────────────────────────┤
│                                     │
│  Zone Name:                         │
│  ┌───────────────────────────────┐ │
│  │ Front Lawn                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  Default Duration (minutes):        │
│  ┌───────────────────────────────┐ │
│  │ 15                         ▼│ │ │
│  └───────────────────────────────┘ │
│                                     │
│  Total Runtime: 3,450 minutes       │
│  GPIO Pin: 17                       │
│                                     │
│  [Cancel]              [Save]       │
│                                     │
└─────────────────────────────────────┘
```

### 4.4 Schedules Page

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰ SprinkSync                                    System: Online  │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  |  Schedules  |  History  |  Settings               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [+ Create New Schedule]                                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ◯ Zone 1 - Front Lawn                           [Edit] [×] │  │
│  │   🕐 6:00 AM  |  ⏱ 15 min  |  📅 Mon Wed Fri              │  │
│  │   Next run: Tomorrow at 6:00 AM                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ⊗ Zone 2 - Back Lawn                            [Edit] [×] │  │
│  │   🕐 6:15 AM  |  ⏱ 20 min  |  📅 Mon Wed Fri              │  │
│  │   Disabled                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ◯ Zone 3 - Garden Beds                          [Edit] [×] │  │
│  │   🕐 6:30 AM  |  ⏱ 10 min  |  📅 Tue Thu Sat              │  │
│  │   Next run: Oct 22 at 6:30 AM                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- List all schedules across all zones
- Toggle enabled/disabled with visual indicator
- Quick edit and delete actions
- See next scheduled run
- Create new schedule button

### 4.5 Create/Edit Schedule Modal

```
┌─────────────────────────────────────┐
│  Create New Schedule             [×] │
├─────────────────────────────────────┤
│                                     │
│  Zone:                              │
│  ┌───────────────────────────────┐ │
│  │ Zone 1 - Front Lawn        ▼│ │ │
│  └───────────────────────────────┘ │
│                                     │
│  Start Time:                        │
│  ┌───────────────────────────────┐ │
│  │ 06:00                         │ │
│  └───────────────────────────────┘ │
│                                     │
│  Duration (minutes):                │
│  ┌───────────────────────────────┐ │
│  │ 15                         ▼│ │ │
│  └───────────────────────────────┘ │
│                                     │
│  Days of Week:                      │
│  [ ] Sun  [×] Mon  [×] Tue  [×] Wed │
│  [×] Thu  [×] Fri  [ ] Sat          │
│                                     │
│  [×] Enabled                        │
│                                     │
│  [Cancel]          [Create Schedule]│
│                                     │
└─────────────────────────────────────┘
```

### 4.6 History Page

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰ SprinkSync                                    System: Online  │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  |  Schedules  |  History  |  Settings               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Filters:  [All Zones ▼]  [Last 30 Days ▼]  [All Types ▼]      │
│                                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  📊 Summary (Last 30 Days)                                       │
│     Total Runs: 145  |  Total Runtime: 3,450 min (57.5 hrs)    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                   │
│  Oct 19, 2025                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🕐 2:20 PM  Zone 2 - Back Lawn                  [Manual]  │  │
│  │    Duration: 10 minutes                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🕐 6:15 AM  Zone 2 - Back Lawn               [Scheduled]  │  │
│  │    Duration: 20 minutes                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🕐 6:00 AM  Zone 1 - Front Lawn              [Scheduled]  │  │
│  │    Duration: 15 minutes                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Oct 18, 2025                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🕐 6:15 AM  Zone 2 - Back Lawn               [Scheduled]  │  │
│  │    Duration: 20 minutes                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [...more history entries...]                                    │
│                                                                   │
│  [Load More]                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Chronological activity log
- Filter by zone, date range, trigger type
- Summary statistics
- Visual distinction between manual and scheduled runs
- Infinite scroll or pagination

### 4.7 Settings Page

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰ SprinkSync                                    System: Online  │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  |  Schedules  |  History  |  Settings               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  System Information                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Version: 1.0.0                                                  │
│  Uptime: 24 hours 15 minutes                                     │
│  GPIO Mode: Mock (Development)                                   │
│  Database: Connected                                             │
│  Scheduler: Running                                              │
│                                                                   │
│  Safety Settings                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Maximum Runtime per Zone: 60 minutes                            │
│  Maximum Concurrent Zones: 2 zones                               │
│  Auto-shutoff on Crash: Enabled                                  │
│                                                                   │
│  Actions                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [Restart System]  [Export Database]  [View Logs]               │
│                                                                   │
│  About                                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  SprinkSync - Smart watering, perfectly synced                   │
│  Built for Raspberry Pi 5 with love ❤️                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.8 Color Scheme

**Primary Colors:**
- Primary Blue: `#3B82F6` (buttons, active states)
- Success Green: `#10B981` (running zones, success messages)
- Warning Orange: `#F59E0B` (warnings, alerts)
- Error Red: `#EF4444` (errors, stop buttons)

**Neutral Colors:**
- Dark Gray: `#1F2937` (text, headers)
- Medium Gray: `#6B7280` (secondary text)
- Light Gray: `#F3F4F6` (backgrounds, borders)
- White: `#FFFFFF` (cards, main background)

**Status Colors:**
- Running: Green `#10B981`
- Idle: Gray `#9CA3AF`
- Disabled: Light Gray `#D1D5DB`
- Error: Red `#EF4444`

### 4.9 Responsive Design

**Desktop (1024px+):**
- 3-column zone grid
- Full sidebar navigation
- All features visible

**Tablet (768px - 1023px):**
- 2-column zone grid
- Collapsible navigation
- Full functionality

**Mobile (< 768px):**
- 1-column zone grid
- Bottom navigation bar
- Touch-optimized controls
- Simplified modals

---

## 5. Hardware Integration

### 5.1 Bill of Materials

| Component | Specification | Quantity | Notes |
|-----------|--------------|----------|-------|
| Raspberry Pi 5 | 4GB RAM | 1 | Main controller |
| microSD Card | 32GB, Class 10 | 1 | OS and database storage |
| Power Supply | 5V 3A USB-C | 1 | Official Pi 5 power supply |
| 8-Channel Relay Module | 5V, opto-isolated | 1 | Controls 24V AC valves |
| Jumper Wires | Female-Female | 10 | GPIO to relay connections |
| 24V AC Transformer | Existing | 1 | From Rain Bird system |
| Enclosure | Weatherproof | 1 | Protect electronics |

### 5.2 Raspberry Pi 5 GPIO Pinout

```
Raspberry Pi 5 GPIO Header (40 pins)
     3V3  (1) (2)  5V
   GPIO2  (3) (4)  5V
   GPIO3  (5) (6)  GND
   GPIO4  (7) (8)  GPIO14
     GND  (9) (10) GPIO15
  GPIO17 (11) (12) GPIO18
  GPIO27 (13) (14) GND
  GPIO22 (15) (16) GPIO23
     3V3 (17) (18) GPIO24
  GPIO10 (19) (20) GND
   GPIO9 (21) (22) GPIO25
  GPIO11 (23) (24) GPIO8
     GND (25) (26) GPIO7
   GPIO0 (27) (28) GPIO1
   GPIO5 (29) (30) GND
   GPIO6 (31) (32) GPIO12
  GPIO13 (33) (34) GND
  GPIO19 (35) (36) GPIO16
  GPIO26 (37) (38) GPIO20
     GND (39) (40) GPIO21
```

### 5.3 GPIO Pin Mapping

| Zone | GPIO Pin | Physical Pin | Relay Channel |
|------|----------|--------------|---------------|
| 1    | 17       | 11           | CH1           |
| 2    | 27       | 13           | CH2           |
| 3    | 22       | 15           | CH3           |
| 4    | 23       | 16           | CH4           |
| 5    | 24       | 18           | CH5           |
| 6    | 25       | 22           | CH6           |
| 7    | 5        | 29           | CH7           |
| 8    | 6        | 31           | CH8           |

**Additional Connections:**
- GND: Physical pin 6, 9, 14, 20, 25, 30, 34, or 39 → Relay GND
- 5V: Physical pin 2 or 4 → Relay VCC

### 5.4 Relay Module Wiring

**Relay Module Specifications:**
- Type: 8-channel relay module
- Trigger: Active LOW (GPIO LOW = relay ON)
- Voltage: 5V DC (control side)
- Switching: 24V AC, 10A (load side)
- Isolation: Opto-isolated for safety

**Control Side (Raspberry Pi):**
```
Pi GPIO 17 → Relay IN1
Pi GPIO 27 → Relay IN2
Pi GPIO 22 → Relay IN3
Pi GPIO 23 → Relay IN4
Pi GPIO 24 → Relay IN5
Pi GPIO 25 → Relay IN6
Pi GPIO 5  → Relay IN7
Pi GPIO 6  → Relay IN8
Pi GND     → Relay GND
Pi 5V      → Relay VCC
```

**Load Side (Sprinkler Valves):**
```
24V AC Common → All relay COM terminals
Relay NO1 → Zone 1 valve wire
Relay NO2 → Zone 2 valve wire
Relay NO3 → Zone 3 valve wire
Relay NO4 → Zone 4 valve wire
Relay NO5 → Zone 5 valve wire
Relay NO6 → Zone 6 valve wire
Relay NO7 → Zone 7 valve wire
Relay NO8 → Zone 8 valve wire
```

### 5.5 GPIO Control Logic

**Initialization Sequence:**
1. Export GPIO pins
2. Set all pins to OUTPUT mode
3. Set all pins to HIGH (relays OFF)
4. Wait 100ms for relay stabilization

**Starting a Zone:**
1. Check maximum concurrent zones (≤2)
2. Check zone not already running
3. Set GPIO pin LOW (relay ON, valve opens)
4. Log start time
5. Set timeout for maximum duration
6. Create history record

**Stopping a Zone:**
1. Set GPIO pin HIGH (relay OFF, valve closes)
2. Log stop time
3. Calculate actual duration
4. Update zone total runtime
5. Complete history record
6. Clear timeout

**Shutdown Sequence:**
1. Stop all running zones
2. Set all GPIO pins HIGH (relays OFF)
3. Wait 100ms
4. Unexport all GPIO pins
5. Close database connection

### 5.6 Mock GPIO for Development

**Purpose:** Enable full development and testing without Raspberry Pi hardware.

**Implementation:**
```javascript
// mock-gpio.js simulates GPIO behavior
class MockGPIO {
  constructor(pin, direction) {
    this.pin = pin;
    this.direction = direction;
    this.value = 1; // Start HIGH (relay OFF)
  }

  writeSync(value) {
    this.value = value;
    console.log(`[MOCK GPIO] Pin ${this.pin} set to ${value}`);
  }

  readSync() {
    return this.value;
  }

  unexport() {
    console.log(`[MOCK GPIO] Pin ${this.pin} unexported`);
  }
}
```

**Switching Between Mock and Real:**
```javascript
// Determined by GPIO_MODE environment variable
const GPIO_MODE = process.env.GPIO_MODE || 'mock';

const Gpio = GPIO_MODE === 'real'
  ? require('onoff').Gpio
  : require('./mock-gpio');
```

### 5.7 Safety Features

#### Maximum Runtime Protection
- Every zone activation sets a timeout
- Timeout duration = requested duration (max 60 minutes)
- When timeout fires, zone automatically stops
- Prevents flooding from stuck relays or software bugs

#### Concurrent Zone Limiting
- Maximum 2 zones can run simultaneously
- Prevents electrical overload
- Prevents water pressure issues
- Checked before starting any zone

#### Crash Recovery
- Process handles SIGINT (Ctrl+C) and SIGTERM signals
- Signal handler stops all zones immediately
- Sets all GPIO pins HIGH (relays OFF)
- Unexports all GPIO pins
- Ensures valves close even on crash

#### Startup Safety
- All relays initialized to OFF state
- Database integrity check on startup
- GPIO availability check (real mode only)
- Scheduler initialization verification

#### Error Handling
- All GPIO operations wrapped in try/catch
- Database errors don't affect GPIO state
- Network errors don't affect running zones
- Comprehensive error logging

### 5.8 Installation on Raspberry Pi 5

**Operating System:**
- Raspberry Pi OS Lite (64-bit, Debian Bookworm)
- Headless configuration recommended
- SSH enabled for remote access

**Setup Steps:**
1. Flash microSD card with Raspberry Pi OS
2. Configure WiFi and SSH (via `raspi-config`)
3. Update system: `sudo apt update && sudo apt upgrade`
4. Install Node.js 20 LTS: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs`
5. Clone SprinkSync repository
6. Install dependencies: `npm install` (in backend folder)
7. Configure environment: Copy `.env.example` to `.env`, set `GPIO_MODE=real`
8. Connect relay module to GPIO pins
9. Test with one zone first
10. Configure systemd service for autostart

**Systemd Service:**
```ini
[Unit]
Description=SprinkSync Smart Sprinkler Controller
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/SprinkSync/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

## 6. Development Phases

### Phase 1: Backend Foundation (Current)

**Duration:** 1-2 weeks
**Goal:** Complete, functional backend API with mock GPIO

**Tasks:**
- [x] Project structure setup
- [ ] Express server configuration
- [ ] SQLite database schema and initialization
- [ ] Mock GPIO controller
- [ ] Zone management API endpoints
- [ ] Schedule management API endpoints
- [ ] History logging API endpoints
- [ ] System status API endpoints
- [ ] Cron-based scheduler implementation
- [ ] Error handling and logging
- [ ] API testing with Postman/curl

**Deliverables:**
- Fully functional REST API
- Mock GPIO for development
- Database with sample data
- Comprehensive error handling
- API documentation

**Success Criteria:**
- All API endpoints return correct responses
- Schedules execute on time (tested with mock)
- Safety features work (max runtime, concurrent limits)
- Startup/shutdown processes are clean
- No memory leaks in 24-hour test

### Phase 2: Web Dashboard (Next)

**Duration:** 2-3 weeks
**Goal:** Responsive React web interface

**Tasks:**
- [ ] Vite + React + TailwindCSS setup
- [ ] Component library (ZoneCard, Modal, etc.)
- [ ] Dashboard page (zone grid)
- [ ] Schedules page
- [ ] History page
- [ ] Settings page
- [ ] API client integration
- [ ] Real-time zone status updates
- [ ] Responsive design testing
- [ ] Cross-browser testing

**Deliverables:**
- Complete web dashboard
- All CRUD operations functional
- Real-time updates
- Mobile-responsive design
- Production build optimization

**Success Criteria:**
- All UI wireframes implemented
- API integration works flawlessly
- Responsive on mobile/tablet/desktop
- Page load time < 2 seconds
- No console errors

### Phase 3: Hardware Integration & Testing (Final)

**Duration:** 1 week
**Goal:** Deploy to Raspberry Pi with real GPIO

**Tasks:**
- [ ] Raspberry Pi OS setup
- [ ] Node.js installation on Pi
- [ ] Backend deployment to Pi
- [ ] Frontend build and deployment
- [ ] Switch GPIO_MODE to 'real'
- [ ] Physical relay module connection
- [ ] Single zone testing
- [ ] Multi-zone testing
- [ ] Schedule automation testing
- [ ] 7-day reliability testing
- [ ] Performance optimization

**Deliverables:**
- Fully operational system on Raspberry Pi
- All 8 zones controllable
- Schedules running automatically
- System stable for 7+ days
- Documentation complete

**Success Criteria:**
- All zones activate correctly
- No false triggers or failures
- System uptime > 99%
- Schedules accurate to ±1 minute
- Safe shutdown on power loss

### Phase 4: Enhancements (Future)

**Optional features for later:**
- Weather API integration (skip watering on rain)
- Mobile app (React Native)
- User authentication
- Multi-user support
- Water usage tracking
- Email/push notifications
- Voice control (Alexa/Google Home)
- Zone grouping
- Seasonal schedule adjustment

---

## 7. Folder Structure

### 7.1 Complete Project Structure

```
SprinkSync/
├── README.md
├── SPECIFICATION.md
├── CursorRules
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   ├── .env.example
│   │
│   ├── database/
│   │   └── sprinkSync.db          # SQLite database (auto-created)
│   │
│   ├── logs/
│   │   ├── app.log                # Application logs
│   │   ├── error.log              # Error logs
│   │   └── gpio.log               # GPIO activity logs
│   │
│   ├── src/
│   │   ├── index.js               # Application entry point
│   │   │
│   │   ├── config/
│   │   │   ├── database.js        # Database connection and initialization
│   │   │   └── constants.js       # App-wide constants
│   │   │
│   │   ├── controllers/
│   │   │   ├── zones.js           # Zone business logic
│   │   │   ├── schedules.js       # Schedule management logic
│   │   │   ├── history.js         # History query logic
│   │   │   └── system.js          # System status and control
│   │   │
│   │   ├── hardware/
│   │   │   ├── gpio.js            # Real GPIO controller (Pi only)
│   │   │   └── mock-gpio.js       # Mock GPIO for development
│   │   │
│   │   ├── middleware/
│   │   │   ├── error-handler.js   # Global error handling middleware
│   │   │   └── request-logger.js  # HTTP request logging
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js           # Main router
│   │   │   ├── zones.js           # Zone routes
│   │   │   ├── schedules.js       # Schedule routes
│   │   │   ├── history.js         # History routes
│   │   │   └── system.js          # System routes
│   │   │
│   │   ├── services/
│   │   │   ├── scheduler.js       # Cron job manager
│   │   │   ├── zone-manager.js    # Zone state management
│   │   │   └── logger.js          # Logging service (Winston)
│   │   │
│   │   └── utils/
│   │       ├── validation.js      # Input validation helpers
│   │       └── helpers.js         # General utility functions
│   │
│   └── tests/                      # Future: Unit and integration tests
│       ├── zones.test.js
│       ├── schedules.test.js
│       └── gpio.test.js
│
├── web-dashboard/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── main.jsx               # Vite entry point
│   │   ├── App.jsx                # Root component
│   │   ├── index.css              # Tailwind imports
│   │   │
│   │   ├── api/
│   │   │   └── client.js          # Axios API client
│   │   │
│   │   ├── components/
│   │   │   ├── ZoneCard.jsx       # Individual zone display
│   │   │   ├── ZoneStartModal.jsx # Zone start dialog
│   │   │   ├── ZoneSettingsModal.jsx # Zone settings dialog
│   │   │   ├── ScheduleCard.jsx   # Schedule list item
│   │   │   ├── ScheduleModal.jsx  # Create/edit schedule dialog
│   │   │   ├── HistoryItem.jsx    # History list item
│   │   │   ├── Modal.jsx          # Reusable modal wrapper
│   │   │   ├── Button.jsx         # Reusable button
│   │   │   └── LoadingSpinner.jsx # Loading indicator
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Main dashboard view
│   │   │   ├── Schedules.jsx      # Schedule management
│   │   │   ├── History.jsx        # Activity history
│   │   │   └── Settings.jsx       # System settings
│   │   │
│   │   ├── hooks/
│   │   │   ├── useZones.js        # Custom hook for zone data
│   │   │   ├── useSchedules.js    # Custom hook for schedule data
│   │   │   └── usePolling.js      # Custom hook for polling
│   │   │
│   │   └── utils/
│   │       ├── formatters.js      # Date/time formatting
│   │       └── constants.js       # Frontend constants
│   │
│   └── dist/                       # Production build output
│
└── docs/
    ├── API.md                      # API endpoint reference
    ├── DEPLOYMENT.md               # Raspberry Pi deployment guide
    └── TROUBLESHOOTING.md          # Common issues and fixes
```

### 7.2 Key Files Explained

**Backend Files:**

- `src/index.js`: Main Express app, middleware setup, route mounting, server startup
- `src/config/database.js`: SQLite connection, schema initialization, database queries
- `src/hardware/gpio.js`: Real GPIO control using `onoff` library (Pi only)
- `src/hardware/mock-gpio.js`: Simulated GPIO for development without Pi
- `src/services/scheduler.js`: Cron job manager, schedule execution logic
- `src/services/zone-manager.js`: Tracks zone states, enforces safety rules
- `src/controllers/*.js`: Business logic for API endpoints
- `src/routes/*.js`: Express route definitions
- `.env`: Environment configuration (not in git)

**Frontend Files:**

- `src/main.jsx`: Vite entry point, React app mounting
- `src/App.jsx`: Root component, routing setup
- `src/api/client.js`: Axios instance with base URL and interceptors
- `src/pages/*.jsx`: Full page components
- `src/components/*.jsx`: Reusable UI components
- `src/hooks/*.js`: Custom React hooks for data fetching

---

## 8. Technical Details

### 8.1 Technology Stack

**Backend:**
- **Node.js 20 LTS**: JavaScript runtime
- **Express.js 4.x**: Web framework
- **SQLite3**: Embedded database
- **node-cron**: Schedule execution
- **onoff**: GPIO control library (Pi only)
- **winston**: Logging framework
- **dotenv**: Environment variable management

**Frontend:**
- **React 18**: UI framework
- **Vite 5**: Build tool and dev server
- **TailwindCSS 3**: Utility-first CSS framework
- **Axios**: HTTP client
- **React Router**: Client-side routing

**Development Tools:**
- **nodemon**: Backend hot reloading
- **Postman**: API testing
- **Git**: Version control

### 8.2 Database Design Considerations

**Why SQLite?**
- Embedded, no separate server process
- Perfect for single-device applications
- Low memory footprint
- Zero configuration
- Reliable and fast for our use case

**Schema Design:**
- Normalized structure (zones, schedules, history)
- Foreign keys enforce referential integrity
- Indexes on frequently queried columns
- Timestamps for auditing

**Data Integrity:**
- Parameterized queries prevent SQL injection
- Foreign key constraints prevent orphaned records
- Transactions for multi-step operations
- Regular backups recommended

### 8.3 API Design Principles

**RESTful conventions:**
- Resources: zones, schedules, history, system
- HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
- Status codes: 200 (success), 201 (created), 400 (bad request), 404 (not found), 500 (server error)

**Consistent response format:**
- Success: JSON object or array
- Error: JSON object with `error`, `code`, and `timestamp` fields
- All timestamps in ISO 8601 format

**Validation:**
- Input validation before processing
- Descriptive error messages
- Range checks (duration 1-60, zone_id 1-8, etc.)

### 8.4 Scheduling Implementation

**node-cron syntax:**
```javascript
// Cron format: * * * * * *
//              │ │ │ │ │ │
//              │ │ │ │ │ └─ Day of week (0-6, Sunday=0)
//              │ │ │ │ └─── Month (1-12)
//              │ │ │ └───── Day of month (1-31)
//              │ │ └─────── Hour (0-23)
//              │ └───────── Minute (0-59)
//              └─────────── Second (0-59) - often omitted

// Example: Run at 6:00 AM every Monday (day 1)
'0 6 * * 1'
```

**Scheduler service responsibilities:**
- Load all enabled schedules from database
- Create cron jobs for each schedule
- Execute zone start when cron fires
- Handle schedule creation/update/deletion dynamically
- Log all schedule executions

**Dynamic schedule updates:**
- When schedule is created: Add new cron job
- When schedule is updated: Remove old cron job, add new one
- When schedule is deleted: Remove cron job
- When schedule is toggled: Start or stop cron job

### 8.5 State Management

**Zone states tracked in memory:**
- `isRunning`: Boolean indicating if zone is active
- `startTime`: Timestamp when zone started
- `duration`: Requested duration in minutes
- `timeout`: Node.js timeout ID for auto-stop

**Why in-memory state?**
- GPIO state must be immediately accessible
- Faster than database queries
- Survives short crashes (auto-recovery)
- Database stores historical data only

**State synchronization:**
- On startup: Load zones from database, set all to stopped
- On zone start: Update memory state, create history record
- On zone stop: Update memory state, update history record, update zone total_runtime

### 8.6 Error Handling Strategy

**Levels of error handling:**

1. **Input validation**: Catch bad requests early
2. **Try/catch blocks**: Wrap all async operations
3. **Middleware**: Global error handler for unhandled errors
4. **Process handlers**: SIGINT, SIGTERM for graceful shutdown

**Error logging:**
- All errors logged to file with stack traces
- Different log levels: ERROR, WARN, INFO, DEBUG
- Console output in development
- File-only logging in production

**User-facing errors:**
- Never expose internal errors to API consumers
- Return generic error messages
- Include error codes for debugging
- Log detailed errors server-side

### 8.7 Security Considerations

**Current implementation (Phase 1):**
- No authentication (single user, local network)
- Input validation prevents injection attacks
- Parameterized SQL queries prevent SQL injection
- Rate limiting not implemented (trusted environment)

**Future enhancements:**
- JWT-based authentication
- User roles (admin, viewer)
- HTTPS for encrypted communication
- API rate limiting
- CSRF protection
- Security headers (helmet.js)

### 8.8 Performance Optimization

**Backend:**
- Database indexes on frequently queried columns
- Connection pooling (not needed for SQLite)
- Efficient cron job management (only active schedules)
- Minimal memory footprint for zone state tracking

**Frontend:**
- Code splitting with React.lazy
- Production build minification
- Static asset caching
- Debounced API calls
- Polling interval optimization (5-10 seconds)

**Network:**
- Gzip compression for API responses
- Minimize payload sizes
- Use conditional requests (ETag, Last-Modified)

### 8.9 Testing Strategy

**Phase 1 Testing (Current):**
- Manual API testing with Postman/curl
- Mock GPIO for development
- Test all endpoints with valid/invalid inputs
- Test safety features (max runtime, concurrent limits)
- Test schedule execution accuracy

**Phase 2 Testing:**
- Component rendering tests
- User interaction tests
- API integration tests
- Cross-browser compatibility

**Phase 3 Testing:**
- Hardware integration tests with real GPIO
- Single zone tests
- Multi-zone tests
- 7-day reliability test
- Stress tests (rapid on/off cycles)

**Future Testing:**
- Automated unit tests (Jest)
- Integration tests (Supertest)
- End-to-end tests (Playwright)
- Load testing (Artillery)

### 8.10 Deployment Configuration

**Development environment:**
```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database/sprinkSync.db
GPIO_MODE=mock
LOG_LEVEL=debug
APP_NAME=SprinkSync
```

**Production environment (Raspberry Pi):**
```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/home/pi/SprinkSync/backend/database/sprinkSync.db
GPIO_MODE=real
LOG_LEVEL=info
APP_NAME=SprinkSync
```

**Environment variable usage:**
- `NODE_ENV`: Controls logging verbosity, error detail
- `PORT`: HTTP server port
- `DATABASE_PATH`: SQLite database file location
- `GPIO_MODE`: Switch between real and mock GPIO
- `LOG_LEVEL`: Minimum log level to record
- `APP_NAME`: Used in logs and API responses

### 8.11 Backup and Recovery

**Database backups:**
- Manual: Copy `database/sprinkSync.db` file
- Automated: Daily cron job to copy database
- Cloud sync: Optional upload to Dropbox/Google Drive

**Configuration backups:**
- Git repository for code
- `.env` file backup (exclude from git)
- Document hardware wiring setup

**Disaster recovery:**
1. Reinstall Raspberry Pi OS
2. Install Node.js
3. Clone repository
4. Restore database from backup
5. Configure `.env` file
6. Test with mock GPIO first
7. Reconnect hardware

### 8.12 Monitoring and Logging

**Log files:**
- `logs/app.log`: General application logs
- `logs/error.log`: Error-only logs
- `logs/gpio.log`: GPIO activity (zone starts/stops)

**Log rotation:**
- Implement log rotation to prevent disk filling
- Keep last 7 days of logs
- Archive old logs monthly

**Monitoring metrics:**
- System uptime
- Zone activation count
- Schedule execution accuracy
- API response times
- Memory usage
- Database size

**Alerts (future):**
- Email notification on system crash
- Alert if schedule doesn't execute
- Warning if database size exceeds threshold
- Notification on GPIO errors

---

## 9. Appendix

### 9.1 GPIO Reference

**onoff library usage:**
```javascript
const Gpio = require('onoff').Gpio;

// Initialize GPIO pin
const relay = new Gpio(17, 'out');

// Turn relay ON (valve opens) - Active LOW
relay.writeSync(0);

// Turn relay OFF (valve closes)
relay.writeSync(1);

// Read current state
const state = relay.readSync();

// Clean up
relay.unexport();
```

### 9.2 Useful Commands

**Backend development:**
```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start with nodemon (hot reload)
npm start               # Start production server
```

**Frontend development:**
```bash
cd web-dashboard
npm install              # Install dependencies
npm run dev             # Start Vite dev server
npm run build           # Production build
npm run preview         # Preview production build
```

**Database management:**
```bash
sqlite3 database/sprinkSync.db
.schema                 # Show all tables
.tables                 # List tables
SELECT * FROM zones;    # Query zones
.exit                   # Exit SQLite
```

**Raspberry Pi deployment:**
```bash
# On development machine
git push origin main

# On Raspberry Pi
cd ~/SprinkSync
git pull origin main
cd backend
npm install
pm2 restart sprinkSync
```

### 9.3 Troubleshooting

**Problem: GPIO permission denied (real mode)**
```bash
# Add user to gpio group
sudo usermod -a -G gpio $USER
# Reboot
sudo reboot
```

**Problem: Database locked error**
- Ensure only one backend instance running
- Check for zombie processes: `ps aux | grep node`
- Kill zombie: `kill -9 <PID>`

**Problem: Zone doesn't stop automatically**
- Check logs for timeout errors
- Verify max runtime setting
- Test zone stop endpoint manually
- Check GPIO cleanup on shutdown

**Problem: Schedule doesn't execute**
- Verify schedule is enabled
- Check schedule days include today
- Verify scheduler service is running
- Check system time is correct: `date`
- Review scheduler logs

### 9.4 Glossary

- **GPIO**: General Purpose Input/Output pins on Raspberry Pi
- **Relay**: Electrically operated switch that controls high-voltage circuits
- **Zone**: Individual sprinkler circuit/area
- **Valve**: Solenoid valve that opens/closes water flow
- **Schedule**: Automated recurring watering task
- **Cron**: Time-based job scheduler
- **Mock GPIO**: Simulated GPIO for development without hardware
- **REST API**: Representational State Transfer Application Programming Interface
- **SQLite**: Lightweight embedded SQL database

---

**Document End**

For questions or clarifications, refer to the CursorRules file or open an issue in the repository.
