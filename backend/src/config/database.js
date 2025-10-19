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
          zone_id INTEGER NOT NULL,
          start_time TEXT NOT NULL,
          duration INTEGER NOT NULL,
          days TEXT NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
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

      // Insert default zone data if zones table is empty
      db.get('SELECT COUNT(*) as count FROM zones', [], (err, row) => {
        if (err) {
          console.error('❌ Error checking zones:', err.message);
          return reject(err);
        }

        if (row.count === 0) {
          console.log('📝 Inserting default zone data...');

          const stmt = db.prepare(`
            INSERT INTO zones (id, name, gpio_pin, default_duration)
            VALUES (?, ?, ?, ?)
          `);

          // Insert all 8 zones
          for (let i = 1; i <= 8; i++) {
            stmt.run(i, `${DEFAULTS.ZONE_NAME_PREFIX} ${i}`, GPIO_PINS[i], DEFAULTS.ZONE_DURATION);
          }

          stmt.finalize((err) => {
            if (err) {
              console.error('❌ Error inserting default zones:', err.message);
              return reject(err);
            }
            console.log('✅ Default zones created (1-8)');
            resolve();
          });
        } else {
          console.log(`✅ Database initialized (${row.count} zones found)`);
          resolve();
        }
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
