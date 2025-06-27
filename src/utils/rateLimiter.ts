import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis is properly configured
const isRedisConfigured = () => {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
};

// Initialize Redis client only if configured
const redis = isRedisConfigured() ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
}) : null;

// Backup in-memory rate limiting for when Redis is unavailable
class BackupRateLimiter {
  private static store = new Map<string, { count: number; resetTime: number; violations: number; expiresAt: number }>();

  // Rate limit configurations (matching Redis limits but simplified)
  private static limits = {
    formSubmission: { max: 15, windowMs: 60000 }, // 15 per minute (increased for file-heavy forms)
    authentication: { max: 3, windowMs: 300000 }, // 3 per 5 minutes
    authenticationFailed: { max: 2, windowMs: 900000 }, // 2 per 15 minutes
    fileUpload: { max: 15, windowMs: 60000 }, // 15 per minute (increased for simultaneous uploads)
    adminAction: { max: 20, windowMs: 60000 }, // 20 per minute (increased for admin operations)
    strict: { max: 2, windowMs: 60000 }, // 2 per minute
  };

  static check(identifier: string, limitType: RateLimitType): { success: boolean; limit: number; remaining: number; reset: Date } {
    const now = Date.now();
    const config = this.limits[limitType] || this.limits.formSubmission;
    const key = `${limitType}_${identifier}`;
    const gracePeriod = 300000; // 5 minutes grace period for cleanup
    
    let record = this.store.get(key);
    
    // Simplified cleanup: Clean per-key on access (replaces global interval)
    if (record && now > record.expiresAt) {
      this.store.delete(key);
      record = undefined; // Treat as new record
    }

    // Initialize or reset if window expired
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + config.windowMs,
        violations: record?.violations || 0,
        expiresAt: now + config.windowMs + gracePeriod // TTL enforcement
      };
      this.store.set(key, record);
    }

    // Check if limit exceeded
    if (record.count >= config.max) {
      // Track violations for progressive penalties
      record.violations++;
      
      // Apply progressive penalties for repeat offenders
      if (record.violations >= 3) {
        // Extend reset time for repeat violators (double the window)
        const extendedWindow = config.windowMs * 2;
        record.resetTime = Math.max(record.resetTime, now + extendedWindow);
        record.expiresAt = record.resetTime + gracePeriod; // Update TTL
      }
      
      return {
        success: false,
        limit: config.max,
        remaining: 0,
        reset: new Date(record.resetTime)
      };
    }

    // Increment count and allow request
    record.count++;
    this.store.set(key, record);

    return {
      success: true,
      limit: config.max,
      remaining: config.max - record.count,
      reset: new Date(record.resetTime)
    };
  }

  static getStats(): { totalEntries: number; activeEntries: number } {
    const now = Date.now();
    let activeEntries = 0;
    
    // Clean expired entries during stats collection
    for (const [key, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(key);
      } else if (now <= record.resetTime) {
        activeEntries++;
      }
    }
    
    return {
      totalEntries: this.store.size,
      activeEntries
    };
  }

  static clear(identifier: string, limitType: RateLimitType): boolean {
    const key = `${limitType}_${identifier}`;
    return this.store.delete(key);
  }

  static clearAll(): void {
    this.store.clear();
  }
}

// Rate limiting configurations for different form types
const rateLimitConfigs = isRedisConfigured() ? {
  // General form submission - 15 submissions per minute (increased for file-heavy forms)
  formSubmission: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(15, "1 m"),
    analytics: true,
    prefix: "form_submission",
  }),
  
  // Authentication attempts - VERY strict to prevent brute force
  authentication: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(3, "5 m"), // Only 3 attempts per 5 minutes
    analytics: true,
    prefix: "auth_attempt",
  }),
  
  // Failed authentication - Even stricter after failures
  authenticationFailed: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(4, "15 m"), // Only 4 attempt per 15 minutes after failure
    analytics: true,
    prefix: "auth_failed",
  }),
  
  // File upload - 15 uploads per minute (increased for simultaneous uploads)
  fileUpload: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(15, "1 m"),
    analytics: true,
    prefix: "file_upload",
  }),
  
  // Admin actions - 20 actions per minute (increased for admin operations)
  adminAction: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "admin_action",
  }),
  
  // Strict rate limiting for suspicious activity - 2 per minute
  strict: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(1.5, "1 m"),
    analytics: true,
    prefix: "strict_limit",
  }),
} : null;

export type RateLimitType = 'formSubmission' | 'fileUpload' | 'adminAction' | 'strict' | 'authentication' | 'authenticationFailed';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  error?: string;
}

/**
 * Rate limiting utility class
 */
export class RateLimiter {
  /**
   * Check rate limit for a specific identifier and limit type
   */
  static async checkLimit(
    identifier: string,
    limitType: RateLimitType = 'formSubmission'
  ): Promise<RateLimitResult> {
    // Try Redis first if configured
    if (isRedisConfigured() && rateLimitConfigs) {
      try {
        const ratelimit = rateLimitConfigs[limitType];
        const result = await ratelimit.limit(identifier);
        
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: new Date(result.reset),
        };
      } catch (error) {
        console.warn('Redis rate limiting failed, falling back to backup system:', error);
        // Fall through to backup system
      }
    }

    // Use backup in-memory rate limiting
    console.log(`[SECURITY] Using backup rate limiting for ${limitType} (identifier: ${identifier})`);
    const result = BackupRateLimiter.check(identifier, limitType);
    
    if (!result.success) {
      console.warn(`[SECURITY] Backup rate limit exceeded for ${identifier} (${limitType})`);
    }
    
    return {
      ...result,
      error: isRedisConfigured() ? 'Redis unavailable - using backup rate limiting' : 'Using backup rate limiting - Redis not configured'
    };
  }

  /**
   * Get client identifier from request (IP address, user ID, etc.)
   */
  static getClientIdentifier(request?: Request): string {
    if (typeof window !== 'undefined') {
      // Client-side: use a combination of factors
      return `client_${this.generateClientFingerprint()}`;
    }
    
    if (request) {
      // Server-side: use IP address
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      return `ip_${ip}`;
    }
    
    return 'unknown_client';
  }

  /**
   * Generate a client fingerprint for browser-based identification
   */
  private static generateClientFingerprint(): string {
    if (typeof window === 'undefined') return 'server';
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Rate limiting fingerprint', 2, 2);
      }
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
      ].join('|');
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(36);
    } catch (error) {
      console.warn('Failed to generate client fingerprint:', error);
      return 'fallback_' + Math.random().toString(36).substring(2, 15);
    }
  }

  /**
   * Check if rate limiting is properly configured
   */
  static isConfigured(): boolean {
    return isRedisConfigured();
  }

  /**
   * Get backup rate limiting statistics
   */
  static getBackupStats(): { totalEntries: number; activeEntries: number } {
    return BackupRateLimiter.getStats();
  }

  /**
   * Clear rate limit for a specific identifier and limit type (development only)
   */
  static async clearLimit(
    identifier: string,
    limitType: RateLimitType = 'formSubmission'
  ): Promise<boolean> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[SECURITY] clearLimit only available in development mode');
      return false;
    }

    // Try Redis first if configured
    if (isRedisConfigured() && redis) {
      try {
        const key = `${limitType}_${identifier}`;
        await redis.del(key);
        console.log(`[DEV] Cleared Redis rate limit for ${key}`);
        return true;
      } catch (error) {
        console.warn('Failed to clear Redis rate limit, clearing backup:', error);
      }
    }

    // Clear from backup system
    const cleared = BackupRateLimiter.clear(identifier, limitType);
    if (cleared) {
      console.log(`[DEV] Cleared backup rate limit for ${limitType}_${identifier}`);
    }
    return cleared;
  }

  /**
   * Clear all rate limits (development only)
   */
  static async clearAllLimits(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[SECURITY] clearAllLimits only available in development mode');
      return;
    }

    // Clear Redis if configured
    if (isRedisConfigured() && redis) {
      try {
        // This is a simplified approach - in production you'd want more selective clearing
        await redis.flushdb();
        console.log('[DEV] Cleared all Redis rate limits');
      } catch (error) {
        console.warn('Failed to clear Redis rate limits:', error);
      }
    }

    // Clear backup system
    BackupRateLimiter.clearAll();
    console.log('[DEV] Cleared all backup rate limits');
  }

  /**
   * Get rate limit status for display to user
   */
  static formatRateLimitMessage(result: RateLimitResult): string {
    const resetTime = result.reset.toLocaleTimeString();
    
    if (result.success) {
      return `${result.remaining}/${result.limit} requests remaining. Reset at ${resetTime}`;
    }
    
    return `Rate limit exceeded: ${result.remaining}/${result.limit}. Try again after reset at ${resetTime}`;
  }
}

/**
 * Rate limiting middleware for form submissions
 */
export async function withRateLimit<T>(
  identifier: string,
  limitType: RateLimitType,
  operation: () => Promise<T>
): Promise<T> {
  const rateLimitResult = await RateLimiter.checkLimit(identifier, limitType);
  
  if (!rateLimitResult.success) {
    const message = RateLimiter.formatRateLimitMessage(rateLimitResult);
    throw new Error(`Rate limit exceeded: ${message}`);
  }
  
  // Log rate limit status for monitoring
  console.log(`[SECURITY] Rate limit check passed for ${identifier}: ${rateLimitResult.remaining}/${rateLimitResult.limit} remaining`);
  
  // Execute the operation - if it fails, let the error propagate
  return await operation();
}

/**
 * Enhanced rate limiting with progressive penalties
 */
class ProgressiveRateLimiter {
  /**
   * Apply progressive rate limiting based on violation history
   */
  static async checkWithProgression(
    identifier: string,
    baseType: RateLimitType = 'formSubmission'
  ): Promise<RateLimitResult> {
    // If Redis is not configured, fall back to basic rate limiting
    if (!isRedisConfigured() || !redis) {
      return RateLimiter.checkLimit(identifier, baseType);
    }

    try {
      // Check violation history
      const violationKey = `violations_${identifier}`;
      const violations = await redis.get(violationKey) as number || 0;
      
      let limitType: RateLimitType = baseType;
      
      // Apply stricter limits based on violation history
      if (violations >= 3) {
        limitType = 'strict';
      }
      
      const result = await RateLimiter.checkLimit(identifier, limitType);
      
      // Track violations
      if (!result.success) {
        await redis.incr(violationKey);
        await redis.expire(violationKey, 3600); // Reset violations after 1 hour
      }
      
      return result;
    } catch (error) {
      console.warn('Progressive rate limiting failed, falling back to basic:', error);
      return RateLimiter.checkLimit(identifier, baseType);
    }
  }
} 