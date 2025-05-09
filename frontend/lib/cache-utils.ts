// Simple in-memory cache for API responses
const cache: Record<string, { data: any; timestamp: number }> = {};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export function getCachedData<T>(key: string): T | null {
  const cached = cache[key];
  
  if (!cached) return null;
  
  // Check if cache has expired
  if (Date.now() - cached.timestamp > CACHE_EXPIRATION) {
    delete cache[key];
    return null;
  }
  
  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
}

export function clearCache(keyPrefix?: string): void {
  if (keyPrefix) {
    Object.keys(cache).forEach(key => {
      if (key.startsWith(keyPrefix)) {
        delete cache[key];
      }
    });
  } else {
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  }
}
