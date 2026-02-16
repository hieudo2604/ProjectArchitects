import { useState, useEffect } from "react";

export default function useDarkMode(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // fail silently if localStorage is unavailable
    }
  }, [key, value]);

  return [value, setValue];
}
