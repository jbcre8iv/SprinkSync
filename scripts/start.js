#!/usr/bin/env node

/**
 * SprinkSync - Development Startup Script
 *
 * Automatically starts backend and dashboard with a single command.
 * Handles port conflicts, health checks, and provides status updates.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

const PORTS = {
  backend: 3000,
  dashboard: 5173
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (color, prefix, message) => {
  console.log(`${color}${prefix}${COLORS.reset} ${message}`);
};

/**
 * Kill processes on a specific port
 */
const killPort = (port) => {
  try {
    const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`);
      log(COLORS.yellow, '⚠️', `Killed existing process on port ${port}`);
      // Wait a moment for port to be released
      execSync('sleep 1');
    }
  } catch (error) {
    // No process on port, or already killed
  }
};

/**
 * Check if backend is healthy
 */
const checkBackendHealth = async (maxAttempts = 30) => {
  const http = require('http');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/api/system/status', (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject();
          }
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};

/**
 * Start a process
 */
const startProcess = (name, command, args, cwd, color) => {
  const proc = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      log(color, `[${name}]`, line);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      log(COLORS.red, `[${name}]`, line);
    });
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(COLORS.red, '❌', `${name} exited with code ${code}`);
      process.exit(1);
    }
  });

  return proc;
};

/**
 * Main startup sequence
 */
const main = async () => {
  console.log('\n' + '='.repeat(60));
  log(COLORS.cyan, '🚀', 'SprinkSync Development Environment');
  console.log('='.repeat(60) + '\n');

  // Step 1: Clean up ports
  log(COLORS.blue, '1️⃣', 'Checking for existing processes...');
  killPort(PORTS.backend);
  killPort(PORTS.dashboard);
  log(COLORS.green, '✅', 'Ports are clear\n');

  // Step 2: Start backend
  log(COLORS.blue, '2️⃣', 'Starting backend server...');
  const backendPath = path.join(__dirname, '../backend');
  const backendProc = startProcess(
    'Backend',
    'node',
    ['src/index.js'],
    backendPath,
    COLORS.green
  );

  // Wait for backend to be healthy
  log(COLORS.yellow, '⏳', 'Waiting for backend to be ready...');
  const backendReady = await checkBackendHealth();

  if (!backendReady) {
    log(COLORS.red, '❌', 'Backend failed to start within 30 seconds');
    backendProc.kill();
    process.exit(1);
  }

  log(COLORS.green, '✅', 'Backend is running on http://localhost:3000\n');

  // Step 3: Start dashboard
  log(COLORS.blue, '3️⃣', 'Starting web dashboard...');
  const dashboardPath = path.join(__dirname, '../web-dashboard');
  const dashboardProc = startProcess(
    'Dashboard',
    'npm',
    ['run', 'dev'],
    dashboardPath,
    COLORS.cyan
  );

  // Give dashboard a moment to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  log(COLORS.green, '✅', 'Dashboard is running on http://localhost:5173\n');

  // Step 4: Summary
  console.log('='.repeat(60));
  log(COLORS.green, '✅', 'SprinkSync is running!');
  console.log('='.repeat(60));
  console.log(`
  ${COLORS.cyan}Backend:${COLORS.reset}    http://localhost:3000
  ${COLORS.cyan}Dashboard:${COLORS.reset}  http://localhost:5173

  ${COLORS.yellow}Press Ctrl+C to stop all services${COLORS.reset}
  `);

  // Handle shutdown
  const shutdown = () => {
    log(COLORS.yellow, '\n⚠️', 'Shutting down...');
    backendProc.kill();
    dashboardProc.kill();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

// Run
main().catch(error => {
  log(COLORS.red, '❌', `Fatal error: ${error.message}`);
  process.exit(1);
});
