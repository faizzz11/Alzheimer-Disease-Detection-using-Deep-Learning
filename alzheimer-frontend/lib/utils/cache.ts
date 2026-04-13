const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24;

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return cached.data as T;
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}
