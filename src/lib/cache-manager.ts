// Implementation of the caching strategy feature mentioned in documentation
import { createHash } from 'crypto';
import { ModelRequest } from './models';

export interface CachedResponse {
  modelId: string;
  response: any; // The actual response data
  createdAt: Date;
  expiresAt: Date;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

export interface CacheOptions {
  ttl: number; // Time-to-live in milliseconds
  keyStrategy: 'exact' | 'semantic';
  ignoreTemperature?: boolean;
  ignoreTopP?: boolean;
  cachingEnabled?: boolean;
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 3600000, // 1 hour default TTL
  keyStrategy: 'exact',
  ignoreTemperature: false,
  ignoreTopP: false,
  cachingEnabled: true,
};

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CachedResponse> = new Map();
  private defaultOptions: CacheOptions = DEFAULT_CACHE_OPTIONS;

  private constructor() {
    // Set up a cleanup interval to remove expired items
    setInterval(() => this.cleanupExpiredItems(), 300000); // Clean up every 5 minutes
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Set global default cache options
   */
  public setDefaultOptions(options: Partial<CacheOptions>): void {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options,
    };
  }

  /**
   * Get a cached response if available
   */
  public getCachedResponse(request: ModelRequest, options?: Partial<CacheOptions>): CachedResponse | null {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // If caching is disabled, return null immediately
    if (!mergedOptions.cachingEnabled) {
      return null;
    }
    
    const cacheKey = this.generateCacheKey(request, mergedOptions);
    const cachedItem = this.cache.get(cacheKey);
    
    // Check if item exists and is not expired
    if (cachedItem && cachedItem.expiresAt > new Date()) {
      return cachedItem;
    }
    
    // If expired, remove from cache
    if (cachedItem) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Store a response in the cache
   */
  public setCachedResponse(
    request: ModelRequest, 
    response: any, 
    tokenUsage: { input: number; output: number; total: number },
    options?: Partial<CacheOptions>
  ): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // If caching is disabled, don't store anything
    if (!mergedOptions.cachingEnabled) {
      return;
    }
    
    const cacheKey = this.generateCacheKey(request, mergedOptions);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + mergedOptions.ttl);
    
    this.cache.set(cacheKey, {
      modelId: request.model,
      response,
      createdAt: now,
      expiresAt,
      tokenUsage,
    });
  }

  /**
   * Invalidate specific cache entries based on a partial request match
   */
  public invalidateCache(partialRequest?: Partial<ModelRequest>): number {
    if (!partialRequest) {
      // Clear the entire cache if no filter provided
      const count = this.cache.size;
      this.cache.clear();
      return count;
    }
    
    // Otherwise, find and delete entries that match the partial request
    let invalidatedCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      let shouldInvalidate = false;
      
      // Check model match if specified
      if (partialRequest.model && value.modelId === partialRequest.model) {
        shouldInvalidate = true;
      }
      
      // More sophisticated matching could be implemented here
      
      if (shouldInvalidate) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    
    return invalidatedCount;
  }

  /**
   * Generate a cache key based on the request
   */
  private generateCacheKey(request: ModelRequest, options: CacheOptions): string {
    // Create a normalized copy of the request for consistent key generation
    const normalizedRequest: any = { ...request };
    
    // Remove properties that shouldn't affect caching
    delete normalizedRequest.stream;
    
    // Optionally ignore temperature and top_p if configured
    if (options.ignoreTemperature) {
      delete normalizedRequest.temperature;
    }
    
    if (options.ignoreTopP) {
      delete normalizedRequest.top_p;
    }
    
    // Sort the messages array to ensure consistent ordering
    if (normalizedRequest.messages) {
      normalizedRequest.messages = [...normalizedRequest.messages].sort((a, b) => {
        if (a.role !== b.role) {
          return a.role.localeCompare(b.role);
        }
        return JSON.stringify(a).localeCompare(JSON.stringify(b));
      });
    }
    
    // For semantic keying, we would implement a more sophisticated normalization
    // that focuses on meaning rather than exact text
    if (options.keyStrategy === 'semantic') {
      // In a real implementation, this would use embeddings or other semantic techniques
      // For now, we'll just use a simpler normalization
      
      // For messages, focus on user content only
      if (normalizedRequest.messages) {
        normalizedRequest.messages = normalizedRequest.messages
          .filter(m => m.role === 'user')
          .map(m => ({
            role: m.role,
            content: typeof m.content === 'string' 
              ? m.content.toLowerCase().trim()
              : m.content,
          }));
      }
    }
    
    // Generate a hash of the normalized request
    return createHash('sha256')
      .update(JSON.stringify(normalizedRequest))
      .digest('hex');
  }

  /**
   * Remove expired items from the cache
   */
  private cleanupExpiredItems(): void {
    const now = new Date();
    let expiredCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    // In a real implementation, we might log this information
    if (expiredCount > 0) {
      console.log(`Removed ${expiredCount} expired items from cache`);
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    const now = new Date();
    const totalItems = this.cache.size;
    
    let expiredItems = 0;
    let totalSize = 0;
    const modelBreakdown: Record<string, number> = {};
    
    for (const [_, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        expiredItems++;
      }
      
      // Roughly estimate size based on JSON stringify
      const itemSize = JSON.stringify(value.response).length;
      totalSize += itemSize;
      
      // Count by model
      modelBreakdown[value.modelId] = (modelBreakdown[value.modelId] || 0) + 1;
    }
    
    return {
      totalItems,
      activeItems: totalItems - expiredItems,
      expiredItems,
      approximateSizeBytes: totalSize,
      modelBreakdown,
    };
  }
}

export default CacheManager.getInstance();
