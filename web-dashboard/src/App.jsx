/**
 * SprinkSync - Main App Component
 *
 * Root component with navigation and routing.
 */

import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import History from './pages/History';
import Settings from './pages/Settings';
import { getDevModeStatus } from './api/client';

function App() {
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // Check dev mode status on mount
    const checkDevMode = async () => {
      try {
        const data = await getDevModeStatus();
        setDevMode(data.dev_mode || false);
      } catch (error) {
        console.error('Failed to fetch dev mode status:', error);
      }
    };
    checkDevMode();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">SprinkSync</h1>
                <span className="text-sm text-gray-500 hidden sm:block">
                  Smart watering, perfectly synced
                </span>
                {devMode && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                    🛠️ Dev Mode
                  </span>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex gap-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/schedules"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  Schedules
                </NavLink>
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  History
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  Settings
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
