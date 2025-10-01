import { Redis } from '@upstash/redis';

// Cache configuration
const CACHE_TTL = {
  products: 300, // 5 minutes
  categories: 3600, // 1 hour
  featured: 600, // 10 minutes
  user: 300, // 5 minutes
  default: 60 // 1 minute
};

class CacheManager {
  constructor() {
    this.redis = null;
    this.isEnabled = false;
    this.memoryCache = new Map();
    this.initRedis();
  }

  initRedis() {
    // Only initialize Redis if credentials are provided
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        this.isEnabled = true;
        console.log('✅ Redis cache initialized');
      } catch (error) {
        console.warn('⚠️ Redis initialization failed, using in-memory cache:', error.message);
        this.isEnabled = false;
      }
    } else {
      // Use in-memory cache as fallback
      console.log('ℹ️ Redis not configured, using in-memory cache');
    }
  }

  async get(key) {
    try {
      if (this.isEnabled && this.redis) {
        const data = await this.redis.get(key);
        if (data) {
          return typeof data === 'string' ? JSON.parse(data) : data;
        }
      } else {
        // Fallback to memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
    }
    return null;
  }

  async set(key, data, ttl = CACHE_TTL.default) {
    try {
      if (this.isEnabled && this.redis) {
        await this.redis.setex(
          key,
          ttl,
          typeof data === 'object' ? JSON.stringify(data) : data
        );
      } else {
        // Fallback to memory cache with size limit
        if (this.memoryCache.size > 100) {
          // Remove oldest entries if cache is too large
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        this.memoryCache.set(key, {
          data,
          expiry: Date.now() + (ttl * 1000)
        });
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key) {
    try {
      if (this.isEnabled && this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async deletePattern(pattern) {
    try {
      if (this.isEnabled && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map(key => this.redis.del(key)));
        }
      } else {
        // For memory cache, delete keys matching pattern
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  // Cache key generators
  keys = {
    products: (params = {}) => {
      const { page = 1, limit = 12, category, search, sortBy, sortOrder, minPrice, maxPrice } = params;
      return `products:${page}:${limit}:${category || 'all'}:${search || ''}:${sortBy || ''}:${sortOrder || ''}:${minPrice || ''}:${maxPrice || ''}`;
    },
    product: (id) => `product:${id}`,
    categories: () => 'categories:all',
    featured: (limit = 4) => `featured:${limit}`,
    cart: (userId) => `cart:${userId}`,
    user: (userId) => `user:${userId}`,
    store: (storeId) => `store:${storeId}`,
    reviews: (productId) => `reviews:${productId}`,
  };

  // Invalidation helpers
  async invalidateProduct(productId) {
    await this.delete(this.keys.product(productId));
    await this.deletePattern('products:*');
    await this.deletePattern('featured:*');
  }

  async invalidateCart(userId) {
    await this.delete(this.keys.cart(userId));
  }

  async invalidateUser(userId) {
    await this.delete(this.keys.user(userId));
    await this.delete(this.keys.cart(userId));
  }

  async invalidateStore(storeId) {
    await this.delete(this.keys.store(storeId));
    await this.deletePattern('products:*'); // Products may be affected
  }

  async invalidateReviews(productId) {
    await this.delete(this.keys.reviews(productId));
    await this.delete(this.keys.product(productId)); // Product rating may change
  }

  // Clear all cache (use with caution)
  async flush() {
    try {
      if (this.isEnabled && this.redis) {
        await this.redis.flushall();
      } else {
        this.memoryCache.clear();
      }
      console.log('✅ Cache flushed');
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }
}

// Export singleton instance
const cache = new CacheManager();
export default cache;
export { CACHE_TTL };