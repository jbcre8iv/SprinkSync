/**
 * SprinkSync - Database Configuration
 *
 * Handles SQLite database connection, schema initialization,
 * and provides database query helpers.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { GPIO_PINS, DEFAULTS } = require('./constants');

// Database file path from environment or default
const DB_PATH = process.env.DATABASE_PATH || './database/sprinkSync.db';

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log(`✅ Connected to SQLite database at ${DB_PATH}`);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database schema
 * Creates all tables and indexes if they don't exist
 */
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create zones table
      db.run(`
        CREATE TABLE IF NOT EXISTS zones (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          gpio_pin INTEGER NOT NULL UNIQUE,
          default_duration INTEGER NOT NULL DEFAULT 15,
          total_runtime INTEGER NOT NULL DEFAULT 0,
          last_run DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating zones table:', err.message);
          return reject(err);
        }
        console.log('✅ Zones table ready');
      });

      // Create index on gpio_pin
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_zones_gpio_pin ON zones(gpio_pin)
      `);

      // Create schedules table
      db.run(`
        CREATE TABLE IF NOT EXISTS schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          zone_id INTEGER,
          group_id INTEGER,
          start_time TEXT NOT NULL,
          duration INTEGER NOT NULL,
          days TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
          FOREIGN KEY (group_id) REFERENCES zone_groups(id) ON DELETE CASCADE,
          CHECK ((zone_id IS NOT NULL AND group_id IS NULL) OR (zone_id IS NULL AND group_id IS NOT NULL))
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating schedules table:', err.message);
          return reject(err);
        }
        console.log('✅ Schedules table ready');
      });

      // Create indexes for schedules
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_schedules_zone_id ON schedules(zone_id)
      `);
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_schedules_group_id ON schedules(group_id)
      `);
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_schedules_enabled ON schedules(enabled)
      `);

      // Create history table
      db.run(`
        CREATE TABLE IF NOT EXISTS history (
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
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating history table:', err.message);
          return reject(err);
        }
        console.log('✅ History table ready');
      });

      // Create indexes for history
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_history_zone_id ON history(zone_id)
      `);
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_history_start_time ON history(start_time)
      `);
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_history_trigger ON history(trigger)
      `);

      // Create system_settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          use_case_profile TEXT NOT NULL DEFAULT 'residential_lawn',
          location_lat REAL,
          location_lon REAL,
          location_zip TEXT,
          location_city TEXT,
          water_rate_per_gallon REAL DEFAULT 0.01,
          currency TEXT DEFAULT 'USD',
          weather_enabled INTEGER DEFAULT 1,
          weather_api_key TEXT,
          smart_skip_enabled INTEGER DEFAULT 1,
          rain_threshold REAL DEFAULT 0.25,
          max_concurrent_zones INTEGER DEFAULT 2,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating system_settings table:', err.message);
          return reject(err);
        }
        console.log('✅ System settings table ready');
      });

      // Create weather_cache table
      db.run(`
        CREATE TABLE IF NOT EXISTS weather_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          forecast_date DATE NOT NULL,
          temp_high REAL,
          temp_low REAL,
          precipitation REAL,
          precipitation_prob INTEGER,
          humidity INTEGER,
          wind_speed REAL,
          conditions TEXT,
          et_rate REAL,
          fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating weather_cache table:', err.message);
          return reject(err);
        }
        console.log('✅ Weather cache table ready');
      });

      // Create index on forecast_date
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_weather_forecast_date ON weather_cache(forecast_date)
      `);

      // Create zone_profiles table (for zone-specific settings)
      db.run(`
        CREATE TABLE IF NOT EXISTS zone_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          zone_id INTEGER NOT NULL,
          crop_type TEXT,
          soil_type TEXT,
          sun_exposure TEXT,
          moisture_target INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating zone_profiles table:', err.message);
          return reject(err);
        }
        console.log('✅ Zone profiles table ready');
      });

      // Create analytics table (for tracking water usage and costs)
      db.run(`
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date DATE NOT NULL,
          zone_id INTEGER,
          total_runtime INTEGER NOT NULL DEFAULT 0,
          total_gallons REAL NOT NULL DEFAULT 0,
          total_cost REAL NOT NULL DEFAULT 0,
          manual_runs INTEGER DEFAULT 0,
          scheduled_runs INTEGER DEFAULT 0,
          weather_skips INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating analytics table:', err.message);
          return reject(err);
        }
        console.log('✅ Analytics table ready');
      });

      // Create indexes for analytics
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date)
      `);
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_analytics_zone_id ON analytics(zone_id)
      `);

      // Create zone_groups table
      db.run(`
        CREATE TABLE IF NOT EXISTS zone_groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          default_duration INTEGER NOT NULL DEFAULT 15,
          color TEXT DEFAULT '#3B82F6',
          icon TEXT DEFAULT '🌱',
          custom_image TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating zone_groups table:', err.message);
          return reject(err);
        }
        console.log('✅ Zone groups table ready');
      });

      // Create zone_group_members table (join table)
      db.run(`
        CREATE TABLE IF NOT EXISTS zone_group_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id INTEGER NOT NULL,
          zone_id INTEGER NOT NULL,
          sequence_order INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (group_id) REFERENCES zone_groups(id) ON DELETE CASCADE,
          FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
          UNIQUE(group_id, zone_id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating zone_group_members table:', err.message);
          return reject(err);
        }
        console.log('✅ Zone group members table ready');
      });

      // Create indexes for zone groups
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON zone_group_members(group_id)
      `);
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_group_members_zone_id ON zone_group_members(zone_id)
      `);

      // Insert default system settings if not exists
      db.run(`
        INSERT OR IGNORE INTO system_settings (id, use_case_profile)
        VALUES (1, 'residential_lawn')
      `, (err) => {
        if (err) {
          console.error('❌ Error creating default settings:', err.message);
          return reject(err);
        }

        // Check zone count
        db.get('SELECT COUNT(*) as count FROM zones', [], (err, row) => {
          if (err) {
            console.error('❌ Error checking zones:', err.message);
            return reject(err);
          }

          if (row.count === 0) {
            console.log('📝 No zones configured. Use /api/zones/initialize to set up your system.');
          } else {
            console.log(`✅ Database initialized (${row.count} zones found)`);
          }
          resolve();
        });
      });
    });
  });
};

/**
 * Helper function to run a query and return a promise
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Promise resolving to query result
 */
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

/**
 * Helper function to get a single row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Promise resolving to single row
 */
const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Helper function to get multiple rows
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Promise resolving to array of rows
 */
const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Close database connection
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
        reject(err);
      } else {
        console.log('✅ Database connection closed');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getOne,
  getAll,
  closeDatabase
};
