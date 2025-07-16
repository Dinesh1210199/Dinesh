import { useState, useEffect } from "react";
import { localStorage } from "@/lib/local-storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.load<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.save(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(
    localStorage.getLastSyncTime()
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Simulate auto-sync when coming back online
      setTimeout(() => {
        localStorage.syncData();
        setLastSyncTime(localStorage.getLastSyncTime());
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const manualSync = () => {
    localStorage.syncData();
    setLastSyncTime(localStorage.getLastSyncTime());
  };

  return {
    isOnline,
    lastSyncTime,
    manualSync
  };
}
