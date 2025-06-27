import { NextRequest, NextResponse } from "next/server";
import { extractUserFromToken, getClientIP } from "@/utils/firebaseAuthServer";
import { RateLimiter } from '@/utils/rateLimiter';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Apply rate limiting for authentication requests
        const ip = getClientIP(req);
        const rateLimitResult = await RateLimiter.checkLimit(ip, 'authentication');
        
        if (!rateLimitResult.success) {
            return NextResponse.json({ 
                user: null,
                error: 'Rate limit exceeded',
                message: 'Too many authentication requests. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000)
            }, { 
                status: 429,
                headers: {
                    'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
                }
            });
        }

        // Use Firebase authentication
        const userInfo = await extractUserFromToken(req);
        if (!userInfo) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Return user in expected format
        const user = {
            id: userInfo.userId,
            role: userInfo.role,
            email: userInfo.email,
            name: userInfo.email?.split('@')[0] || 'User'
        };

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error in auth API:", error);
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
