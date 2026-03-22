"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  initialTime: number;
  onFinish?: () => void;
}

export function useTimer({ initialTime, onFinish }: UseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onFinish?.();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onFinish]);

  const toggle = useCallback(() => setIsActive((prev) => !prev), []);
  
  const reset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(initialTime);
  }, [initialTime]);

  const formatTime = useCallback(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [timeLeft]);

  return {
    timeLeft,
    isActive,
    toggle,
    reset,
    formatTime,
    setIsActive
  };
}
