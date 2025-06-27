import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/utils/serverAuth';
import { RateLimiter, RateLimitType } from '@/utils/rateLimiter';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Authentication Rate Limiting Endpoint
 * 
 * This endpoint uses the existing mature rate limiting system to prevent
 * brute force attacks on authentication endpoints.
 * 
 * Supported types:
 * - authentication: 3 attempts per 5 minutes
 * - authenticationFailed: 2 attempts per 15 minutes (after failure)
 */
export async function POST(request: NextRequest) {
    try {
        const { email, type, failed } = await request.json();
        
        if (!email || !type) {
            return NextResponse.json({ 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        // Validate rate limit type
        const validTypes: RateLimitType[] = ['authentication', 'authenticationFailed'];
        if (!validTypes.includes(type as RateLimitType)) {
            return NextResponse.json({ 
                error: 'Invalid rate limit type' 
            }, { status: 400 });
        }

        const ip = getClientIP(request);
        
        // Create composite identifier using both IP and email for better security
        // This prevents both IP-based and email-based brute force attacks
        const identifier = `${ip}_${email.toLowerCase()}`;
        
        // If this is a failed attempt report, just record it without checking limit
        if (failed) {
            console.log(`[AUTH-RATE-LIMIT] Recording failed attempt for ${email} from ${ip}`);
            
            // Check against the failed authentication rate limit
            const rateLimitResult = await RateLimiter.checkLimit(identifier, 'authenticationFailed');
            
            if (!rateLimitResult.success) {
                return NextResponse.json({
                    error: 'Rate limit exceeded',
                    message: 'Too many failed login attempts. Account temporarily restricted.',
                    retryAfter: Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000),
                    limit: rateLimitResult.limit,
                    remaining: rateLimitResult.remaining,
                    reset: rateLimitResult.reset
                }, { 
                    status: 429,
                    headers: {
                        'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
                    }
                });
            }
            
            return NextResponse.json({ 
                success: true,
                message: 'Failed attempt recorded',
                remaining: rateLimitResult.remaining,
                limit: rateLimitResult.limit
            });
        }

        // For regular authentication attempts, check the rate limit
        const rateLimitResult = await RateLimiter.checkLimit(identifier, type as RateLimitType);
        
        if (!rateLimitResult.success) {
            console.warn(`[AUTH-RATE-LIMIT] Rate limit exceeded for ${email} from ${ip}`);
            
            return NextResponse.json({
                error: 'Rate limit exceeded',
                message: RateLimiter.formatRateLimitMessage(rateLimitResult),
                retryAfter: Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000),
                limit: rateLimitResult.limit,
                remaining: rateLimitResult.remaining,
                reset: rateLimitResult.reset
            }, { 
                status: 429,
                headers: {
                    'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
                }
            });
        }

        console.log(`[AUTH-RATE-LIMIT] Authentication attempt allowed for ${email} from ${ip} (${rateLimitResult.remaining}/${rateLimitResult.limit} remaining)`);
        
        return NextResponse.json({
            success: true,
            message: 'Rate limit check passed',
            remaining: rateLimitResult.remaining,
            limit: rateLimitResult.limit,
            reset: rateLimitResult.reset
        });

    } catch (error) {
        console.error('[AUTH-RATE-LIMIT] Error checking rate limit:', error);
        
        return NextResponse.json({
            error: 'Internal server error',
            message: 'Unable to process rate limit check'
        }, { status: 500 });
    }
} 