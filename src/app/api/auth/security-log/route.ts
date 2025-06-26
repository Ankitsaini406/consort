import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/utils/serverAuth';
import { SecurityEventType, SecurityLogEntry } from '@/utils/securityLogger';
import { sanitizeEmail, isValidEmail } from '@/utils/inputSanitizer';

// Rate limiting for logging endpoint
const logAttempts = new Map<string, number[]>();
const MAX_LOG_ATTEMPTS = 10; // Max 10 log attempts per minute per IP
const LOG_WINDOW = 60 * 1000; // 1 minute window

interface SecurityLogRequest {
    eventType: SecurityEventType;
    email: string;
    details?: {
        errorCode?: string;
        attemptCount?: number;
        lockDuration?: number;
        reason?: string;
    };
}

/**
 * Server-side security logging with dynamic Firebase Admin imports
 */
async function logSecurityEventServer(entry: SecurityLogEntry): Promise<void> {
    try {
        console.log('[SECURITY-LOG-API] Starting server-side logging for:', entry.eventType);
        
        // Check environment variables
        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.error('[SECURITY-LOG-API] Missing Firebase Admin SDK environment variables');
            throw new Error('Firebase Admin SDK not configured');
        }
        
        // Dynamic imports to avoid client-side bundling
        const { initializeApp, getApps, cert } = await import('firebase-admin/app');
        
        if (getApps().length === 0) {
            console.log('[SECURITY-LOG-API] Initializing Firebase Admin SDK...');
            initializeApp({
                credential: cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
                }),
            });
            console.log('[SECURITY-LOG-API] Firebase Admin SDK initialized successfully');
        }
        
        const { getFirestore } = await import('firebase-admin/firestore');
        const adminDb = getFirestore();
        
        // Sanitize the entry data and remove undefined values
        const sanitizedEntry: any = {
            eventType: entry.eventType,
            email: entry.email,
            ipAddress: entry.ipAddress || 'unknown',
            timestamp: entry.timestamp,
            source: 'server'
        };

        // Only add userAgent if it exists
        if (entry.userAgent) {
            sanitizedEntry.userAgent = entry.userAgent.substring(0, 200);
        }

        // Only add details if they exist and have actual values
        if (entry.details) {
            const details: any = {};
            
            if (entry.details.errorCode) {
                details.errorCode = entry.details.errorCode.replace(/[<>]/g, '');
            }
            if (typeof entry.details.attemptCount === 'number') {
                details.attemptCount = entry.details.attemptCount;
            }
            if (typeof entry.details.lockDuration === 'number') {
                details.lockDuration = entry.details.lockDuration;
            }
            if (entry.details.reason) {
                details.reason = entry.details.reason.substring(0, 100);
            }
            
            // Only add details field if it has actual content
            if (Object.keys(details).length > 0) {
                sanitizedEntry.details = details;
            }
        }

        console.log('[SECURITY-LOG-API] Attempting to write to Firestore...');
        await adminDb.collection('security_logs').add(sanitizedEntry);
        console.log(`[SECURITY-LOGGER] Server logged event: ${entry.eventType} for ${entry.email}`);
    } catch (error) {
        console.error('[SECURITY-LOGGER] Failed to log security event on server:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);
    const now = Date.now();
    
    try {
        // Rate limiting per IP
        const attempts = logAttempts.get(ip) || [];
        const recentAttempts = attempts.filter(time => now - time < LOG_WINDOW);
        
        if (recentAttempts.length >= MAX_LOG_ATTEMPTS) {
            console.warn(`[SECURITY-LOG-API] Rate limit exceeded for IP: ${ip}`);
            return NextResponse.json({ 
                error: 'Rate limit exceeded',
                message: 'Too many logging attempts'
            }, { status: 429 });
        }
        
        // Update rate limiting
        recentAttempts.push(now);
        logAttempts.set(ip, recentAttempts);
        
        // Parse and validate request
        const body: SecurityLogRequest = await request.json();
        
        // Validate event type
        const validEvents: SecurityEventType[] = [
            'login_success', 
            'login_failed', 
            'login_blocked', 
            'account_locked',
            'account_unlocked',
            'password_reset_requested',
            'suspicious_activity'
        ];
        
        if (!validEvents.includes(body.eventType)) {
            return NextResponse.json({
                error: 'Invalid event type'
            }, { status: 400 });
        }
        
        // Sanitize and validate email properly
        const sanitizedEmail = sanitizeEmail(body.email);
        if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
            console.warn(`[SECURITY-LOG-API] Invalid email format: ${body.email}`);
            return NextResponse.json({
                error: 'Invalid email format'
            }, { status: 400 });
        }
        
        // Get user agent safely
        const userAgent = request.headers.get('user-agent')?.substring(0, 200) || 'unknown';
        
        // Create sanitized log entry
        const logEntry = {
            eventType: body.eventType,
            email: sanitizedEmail,
            ipAddress: ip,
            userAgent,
            timestamp: new Date(),
            details: body.details ? {
                errorCode: body.details.errorCode?.replace(/[<>]/g, '').substring(0, 50) || null,
                attemptCount: typeof body.details.attemptCount === 'number' ? body.details.attemptCount : null,
                lockDuration: typeof body.details.lockDuration === 'number' ? body.details.lockDuration : null,
                reason: body.details.reason?.replace(/[<>]/g, '').substring(0, 100) || null
            } : null
        };
        
        // Log to Firestore (server-side)
        await logSecurityEventServer(logEntry as SecurityLogEntry);
        
        return NextResponse.json({ 
            success: true,
            message: 'Security event logged'
        });
        
    } catch (error) {
        console.error('[SECURITY-LOG-API] Error:', error);
        return NextResponse.json({
            error: 'Logging failed',
            message: 'Unable to process security log'
        }, { status: 500 });
    }
} 