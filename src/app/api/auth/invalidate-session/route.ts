import { NextRequest } from 'next/server';
import { requireAuthWithRateLimit, AuthenticatedUser, SessionStore, TokenRevocation } from '@/utils/serverAuth';
import { AUTH_COOKIE_CONFIG } from '@/utils/authUtils';

/**
 * Enhanced server-side session invalidation with token revocation
 * Forces logout by clearing server-side session markers and revoking tokens
 */
async function handleSessionInvalidation(request: NextRequest, user: AuthenticatedUser): Promise<Response> {
    try {
        console.log(`[SESSION-INVALIDATE] Session invalidation requested by: ${user.email}`);

        // NEW: Revoke the user's token to prevent reuse
        await TokenRevocation.revokeToken(user.uid);

        // NEW: Revoke all sessions for this user
        const revokedSessionCount = await SessionStore.revokeUserSessions(user.uid);

        const response = new Response(
            JSON.stringify({
                success: true,
                message: 'Session invalidated successfully',
                timestamp: new Date().toISOString(),
                revokedSessions: revokedSessionCount
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

        // Clear the authentication cookie with HttpOnly flag
        response.headers.set(
            'Set-Cookie', 
            AUTH_COOKIE_CONFIG.getExpiredHttpOnlyCookieString(AUTH_COOKIE_CONFIG.FIREBASE_TOKEN)
        );

        console.log(`[SESSION-INVALIDATE] Session invalidated for user: ${user.email}, revoked ${revokedSessionCount} sessions`);
        return response;

    } catch (error) {
        console.error('[SESSION-INVALIDATE] Error:', error);
        return new Response(
            JSON.stringify({
                error: 'Session invalidation failed',
                message: 'Unable to invalidate session. Please try logging out and back in.'
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Export the protected route handler with rate limiting (admin action type)
export const POST = requireAuthWithRateLimit(handleSessionInvalidation, 'adminAction'); 