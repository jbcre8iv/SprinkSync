/**
 * SprinkSync - usePolling Hook
 *
 * Custom hook for automatic data polling/refresh.
 * Useful for keeping zone status up-to-date in real-time.
 */

import { useEffect, useRef } from 'react';

/**
 * Execute a callback function at regular intervals
 * @param {Function} callback - Function to call on each interval
 * @param {number} interval - Interval in milliseconds (default 5000 = 5 seconds)
 * @param {boolean} enabled - Whether polling is enabled (default true)
 */
export const usePolling = (callback, interval = 5000, enabled = true) => {
  const savedCallback = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current();
    };

    // Call immediately on mount
    tick();

    // Then set up interval
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
};

export default usePolling;
