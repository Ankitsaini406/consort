import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from '@/utils/serverAuth';
import { AUTH_COOKIE_CONFIG } from '@/utils/authUtils';
import { RateLimiter } from '@/app/admin/forms/utils/rateLimiter';

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        
        // Apply rate limiting to logout requests to prevent abuse
        const rateLimitResult = await RateLimiter.checkLimit(ip, 'authentication');
        
        if (!rateLimitResult.success) {
            return NextResponse.json({ 
                success: false,
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000)
            }, { 
                status: 429,
                headers: {
                    'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
                }
            });
        }
        
        console.log(`[AUTH] Logout request from IP: ${ip}`);
        
        // For Firebase client-side authentication, the actual sign-out happens on the client
        // Server-side logout is mainly for cleanup and logging
        
        const response = NextResponse.json({ 
            success: true, 
            message: "Logged out successfully",
            timestamp: new Date().toISOString()
        });
        
        // Clear the auth cookie with HttpOnly flag for enhanced security
        response.cookies.set(AUTH_COOKIE_CONFIG.FIREBASE_TOKEN, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // Expire immediately
            path: '/',
        });

        console.log(`[AUTH] User logged out successfully from IP: ${ip}`);
        return response;
    } catch (error) {
        console.error("[AUTH] Logout error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Logout failed",
            error: (error as Error).message 
        }, { status: 500 });
    }
}
