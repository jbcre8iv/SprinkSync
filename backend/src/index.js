/**
 * SprinkSync - Main Application Entry Point
 *
 * Initializes and starts the Express server with all services.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import configuration and services
const { initializeDatabase, closeDatabase } = require('./config/database');
const { initializeGPIO, setupSignalHandlers, cleanupGPIO } = require('./hardware/gpio');
const { initializeZoneManager } = require('./services/zone-manager');
const { initializeScheduler, stopScheduler } = require('./services/scheduler');
const logger = require('./services/logger');

// Import middleware
const requestLogger = require('./middleware/request-logger');
const errorHandler = require('./middleware/error-handler');

// Import routes
const apiRoutes = require('./routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies
app.use(requestLogger); // Log all requests

// Mount API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SprinkSync - Smart watering, perfectly synced',
    version: '1.0.0',
    api: '/api',
    status: 'online'
  });
});

// Error handler (must be last)
app.use(errorHandler);

/**
 * Initialize all services and start the server
 */
const startServer = async () => {
  try {
    console.log('\n🚀 Starting SprinkSync...\n');

    // 1. Initialize database
    logger.info('Initializing database...');
    await initializeDatabase();

    // 2. Initialize GPIO
    logger.info('Initializing GPIO...');
    await initializeGPIO();

    // 3. Setup signal handlers for graceful shutdown
    setupSignalHandlers();

    // 4. Initialize zone manager
    logger.info('Initializing zone manager...');
    initializeZoneManager();

    // 5. Initialize scheduler
    logger.info('Initializing scheduler...');
    await initializeScheduler();

    // 6. Start Express server
    app.listen(PORT, () => {
      console.log('\n✅ SprinkSync is running!\n');
      console.log(`   API Server: http://localhost:${PORT}`);
      console.log(`   API Docs:   http://localhost:${PORT}/api`);
      console.log(`   GPIO Mode:  ${process.env.GPIO_MODE || 'mock'}`);
      console.log(`   Log Level:  ${process.env.LOG_LEVEL || 'info'}`);
      console.log('\n   Press Ctrl+C to stop\n');

      logger.info(`SprinkSync started successfully on port ${PORT}`);
    });

  } catch (error) {
    console.error('\n❌ Failed to start SprinkSync:', error.message);
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async () => {
  console.log('\n\n🛑 Shutting down SprinkSync...\n');

  try {
    // Stop scheduler
    logger.info('Stopping scheduler...');
    stopScheduler();

    // Cleanup GPIO
    logger.info('Cleaning up GPIO...');
    await cleanupGPIO();

    // Close database
    logger.info('Closing database...');
    await closeDatabase();

    console.log('✅ Shutdown complete\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  console.error('❌ Uncaught exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', new Error(reason));
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();
