
"use client";

import { useState, useEffect, useRef } from 'react';

interface UseIdleTimeoutProps {
  onIdle: () => void;
  idleTime?: number; // in minutes
}

export const useIdleTimeout = ({ onIdle, idleTime = 30 }: UseIdleTimeoutProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const idleTimeout = idleTime * 60 * 1000; // convert minutes to milliseconds

  const startTimer = () => {
    timeoutId.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, idleTimeout);
  };

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    setIsIdle(false);
    startTimer();
  };

  const handleUserActivity = () => {
    resetTimer();
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];

    // Initial timer start
    startTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleTime, onIdle]);

  return isIdle;
};
