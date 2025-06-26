import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedUser, SessionStore, TokenRevocation } from '@/utils/serverAuth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

async function handleSessionHealthCheck(request: NextRequest, user: AuthenticatedUser): Promise<Response> {
    try {
        // Only allow admin users to check session health
        if (user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get session and token statistics
        const sessionStats = {
            activeSessions: await SessionStore.getActiveSessionCount(),
            revokedTokens: await TokenRevocation.getRevokedTokenCount(),
            timestamp: new Date().toISOString(),
            serverUptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };

        // Cleanup expired sessions before reporting
        const cleanedSessions = await SessionStore.cleanupExpiredSessions();
        if (cleanedSessions > 0) {
            sessionStats.activeSessions = await SessionStore.getActiveSessionCount();
        }

        return NextResponse.json({
            success: true,
            sessionHealth: {
                status: 'healthy',
                ...sessionStats,
                cleanedExpiredSessions: cleanedSessions
            }
        });

    } catch (error) {
        console.error('[SESSION-HEALTH] Error:', error);
        return NextResponse.json({
            error: 'Session health check failed',
            message: (error as Error).message
        }, { status: 500 });
    }
}

// Export the protected route handler
export const GET = requireAuth(handleSessionHealthCheck); 