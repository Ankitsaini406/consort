/**
 * CLIENT-SIDE Security Logger
 * 
 * This file is safe for client-side use and contains no Firebase Admin SDK imports.
 * For server-side logging, use securityLoggerServer.ts
 */

/**
 * Security event types for logging
 */
export type SecurityEventType = 
    | 'login_success'
    | 'login_failed'
    | 'login_blocked'
    | 'account_locked'
    | 'account_unlocked'
    | 'password_reset_requested'
    | 'password_reset_failed'
    | 'password_reset_blocked'
    | 'password_reset_locked'
    | 'suspicious_activity';

export interface SecurityLogEntry {
    eventType: SecurityEventType;
    email: string;
    ipAddress: string;
    userAgent?: string;
    timestamp: Date;
    details?: {
        errorCode?: string;
        attemptCount?: number;
        lockDuration?: number;
        reason?: string;
    };
}

/**
 * Client-side security logging (via secure server API)
 * This is the ONLY function that should be used on the client-side
 */
export async function logSecurityEvent(entry: SecurityLogEntry): Promise<void> {
    try {
        // Use server-side API for secure logging
        const response = await fetch('/api/auth/security-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventType: entry.eventType,
                email: entry.email,
                details: entry.details
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Logging failed');
        }

        console.log(`[SECURITY-LOGGER] Logged event: ${entry.eventType} for ${entry.email}`);
    } catch (error) {
        console.error('[SECURITY-LOGGER] Failed to log security event:', error);
        // Don't throw error to prevent breaking login flow
    }
}

/**
 * Get client IP address from browser (using Cloudflare or other headers)
 */
export async function getClientIPAddress(): Promise<string> {
    try {
        // Try to get IP from a simple API call that returns headers
        const response = await fetch('/api/auth/get-ip', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.ip || 'unknown';
        }
    } catch (error) {
        console.warn('[SECURITY-LOGGER] Could not get client IP:', error);
    }
    
    return 'unknown';
}

// Note: Server-side functions like cleanupOldLogs are now in securityLoggerServer.ts 