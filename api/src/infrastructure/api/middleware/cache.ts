import { Request, Response, NextFunction } from "express";
import { logger } from "@/shared/utils/logger";

interface CacheEntry {
  data: any;
  timestamp: number;
}

/**
 * Simple in-memory cache for API responses
 */
class InMemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  /**
   * Generate cache key from request URL and query params
   */
  private getCacheKey(req: Request): string {
    const url = req.originalUrl || req.url;
    return url;
  }

  /**
   * Get cached response if valid
   */
  get(req: Request, ttl: number): any | null {
    const key = this.getCacheKey(req);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      // Expired
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store response in cache
   */
  set(req: Request, data: any): void {
    const key = this.getCacheKey(req);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 60000; // 60 seconds - max TTL we expect

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }

    if (this.cache.size > 0) {
      logger.debug(`Cache cleanup complete. Entries: ${this.cache.size}`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      entries: this.cache.size,
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Singleton instance
const cache = new InMemoryCache();

/**
 * Cache middleware factory
 * @param ttl Time to live in milliseconds
 */
export function cacheMiddleware(ttl: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check cache
    const cachedData = cache.get(req, ttl);
    if (cachedData) {
      logger.debug(`Cache HIT: ${req.originalUrl || req.url}`);
      return res.json(cachedData);
    }

    // Cache miss - intercept response
    logger.debug(`Cache MISS: ${req.originalUrl || req.url}`);

    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Store in cache before sending
      cache.set(req, data);
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache manually (useful for testing or admin endpoints)
 */
export function clearCache(): void {
  cache.clear();
  logger.info('Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}

// Export for cleanup on shutdown
export { cache };
