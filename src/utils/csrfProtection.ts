import { NextRequest } from 'next/server';
import crypto from 'crypto';

export interface CSRFHealthStatus {
    healthy: boolean;
    tokenGenerationWorking: boolean;
    secretConfigured: boolean;
    lastHealthCheck: Date;
    errors: string[];
}

let healthCache: CSRFHealthStatus | null = null;
let lastHealthCheck = 0;
const HEALTH_CACHE_TTL = 60000; // 1 minute

/**
 * Get CSRF system health status
 */
export function getCSRFHealthStatus(): CSRFHealthStatus {
    const now = Date.now();
    
    // Return cached result if still valid
    if (healthCache && (now - lastHealthCheck) < HEALTH_CACHE_TTL) {
        return healthCache;
    }
    
    const errors: string[] = [];
    let tokenGenerationWorking = false;
    let secretConfigured = false;
    
    try {
        // Check if CSRF secret is configured
        secretConfigured = !!process.env.CSRF_SECRET && process.env.CSRF_SECRET.length >= 32;
        if (!secretConfigured) {
            errors.push('CSRF_SECRET not configured or too short (minimum 32 characters required)');
        }
        
        // Test token generation
        try {
            const testToken = generateCSRFToken();
            tokenGenerationWorking = testToken.length > 0;
            if (!tokenGenerationWorking) {
                errors.push('CSRF token generation failed');
            }
        } catch (error) {
            errors.push(`CSRF token generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
    } catch (error) {
        errors.push(`CSRF health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    healthCache = {
        healthy: errors.length === 0,
        tokenGenerationWorking,
        secretConfigured,
        lastHealthCheck: new Date(),
        errors
    };
    
    lastHealthCheck = now;
    return healthCache;
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
    try {
        const secret = process.env.CSRF_SECRET || 'default-dev-secret-change-in-production';
        const timestamp = Date.now().toString();
        const randomBytes = crypto.randomBytes(16).toString('hex');
        
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${timestamp}-${randomBytes}`);
        const signature = hmac.digest('hex');
        
        return Buffer.from(`${timestamp}-${randomBytes}-${signature}`).toString('base64');
    } catch (error) {
        console.error('[CSRF] Token generation failed:', error);
        throw new Error('Failed to generate CSRF token');
    }
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
    try {
        if (!token) return false;
        
        const secret = process.env.CSRF_SECRET || 'default-dev-secret-change-in-production';
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const parts = decoded.split('-');
        
        if (parts.length !== 3) return false;
        
        const [timestamp, randomBytes, signature] = parts;
        
        // Check if token is not too old (24 hours)
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - tokenTime > maxAge) {
            console.warn('[CSRF] Token expired');
            return false;
        }
        
        // Verify signature
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${timestamp}-${randomBytes}`);
        const expectedSignature = hmac.digest('hex');
        
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
        
    } catch (error) {
        console.error('[CSRF] Token validation failed:', error);
        return false;
    }
}

/**
 * Middleware to check CSRF token on POST requests
 */
export function requireCSRFToken(request: NextRequest): boolean {
    // Skip CSRF in development if explicitly disabled
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CSRF_IN_DEV === 'true') {
        return true;
    }
    
    // Only check CSRF on state-changing methods
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        return true;
    }
    
    const csrfToken = request.headers.get('X-CSRF-Token') || 
                     request.headers.get('x-csrf-token');
    
    if (!csrfToken) {
        console.warn('[CSRF] Missing CSRF token in request');
        return false;
    }
    
    return validateCSRFToken(csrfToken);
}

/**
 * Get CSRF token for client-side use
 */
export function getCSRFToken(): string {
    return generateCSRFToken();
} 