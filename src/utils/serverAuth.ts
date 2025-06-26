import { NextRequest } from 'next/server';
import { AUTH_COOKIE_CONFIG } from './authUtils';
import { RateLimiter } from "@/utils/rateLimiter";
import { getAdminFirestore, isAdminAvailable } from '@/firebase/firebaseAdmin';

// Server-side session store for enhanced security
interface SessionData {
    uid: string;
    email: string;
    expiry: number;
    createdAt: number;
    lastActivity: number;
}

// Firebase Collections for persistent storage
const SESSIONS_COLLECTION = 'auth_sessions';
const REVOKED_TOKENS_COLLECTION = 'revoked_tokens';

// Session management functions with Firestore backend
export const SessionStore = {
    // Create a new session
    createSession: async (uid: string, email: string, durationMs: number = 3600000): Promise<string> => {
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
        const now = Date.now();
        
        const sessionData: SessionData = {
            uid,
            email,
            expiry: now + durationMs,
            createdAt: now,
            lastActivity: now
        };

        try {
            if (isAdminAvailable()) {
                const db = getAdminFirestore();
                await db.collection(SESSIONS_COLLECTION).doc(sessionId).set(sessionData);
                console.log(`[SESSION-STORE] Created Firestore session ${sessionId} for user ${email}`);
            } else {
                // Fallback to memory storage for development
                console.warn(`[SESSION-STORE] Firebase unavailable, using memory storage for session ${sessionId}`);
            }
        } catch (error) {
            console.error(`[SESSION-STORE] Error creating session ${sessionId}:`, error);
            throw new Error('Failed to create session');
        }
        
        return sessionId;
    },
    
    // Validate and refresh session
    validateSession: async (sessionId: string): Promise<SessionData | null> => {
        try {
            if (!isAdminAvailable()) {
                console.warn('[SESSION-STORE] Firebase unavailable for session validation');
                return null;
            }

            const db = getAdminFirestore();
            const sessionDoc = await db.collection(SESSIONS_COLLECTION).doc(sessionId).get();
            
            if (!sessionDoc.exists) {
                return null;
            }
            
            const session = sessionDoc.data() as SessionData;
            const now = Date.now();
            
            if (now > session.expiry) {
                // Delete expired session
                await db.collection(SESSIONS_COLLECTION).doc(sessionId).delete();
                console.log(`[SESSION-STORE] Expired session ${sessionId} removed from Firestore`);
                return null;
            }
            
            // Update last activity
            session.lastActivity = now;
            await db.collection(SESSIONS_COLLECTION).doc(sessionId).update({ lastActivity: now });
            
            return session;
        } catch (error) {
            console.error(`[SESSION-STORE] Error validating session ${sessionId}:`, error);
            return null;
        }
    },
    
    // Revoke a specific session
    revokeSession: async (sessionId: string): Promise<boolean> => {
        try {
            if (!isAdminAvailable()) {
                console.warn('[SESSION-STORE] Firebase unavailable for session revocation');
                return false;
            }

            const db = getAdminFirestore();
            const sessionDoc = await db.collection(SESSIONS_COLLECTION).doc(sessionId).get();
            
            if (sessionDoc.exists) {
                await db.collection(SESSIONS_COLLECTION).doc(sessionId).delete();
                console.log(`[SESSION-STORE] Revoked session ${sessionId} from Firestore`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`[SESSION-STORE] Error revoking session ${sessionId}:`, error);
            return false;
        }
    },
    
    // Revoke all sessions for a user
    revokeUserSessions: async (uid: string): Promise<number> => {
        try {
            if (!isAdminAvailable()) {
                console.warn('[SESSION-STORE] Firebase unavailable for user session revocation');
                return 0;
            }

            const db = getAdminFirestore();
            const userSessions = await db.collection(SESSIONS_COLLECTION).where('uid', '==', uid).get();
            
            let revokedCount = 0;
            const batch = db.batch();
            
            userSessions.forEach((doc: any) => {
                batch.delete(doc.ref);
                revokedCount++;
            });
            
            if (revokedCount > 0) {
                await batch.commit();
                console.log(`[SESSION-STORE] Revoked ${revokedCount} Firestore sessions for user ${uid}`);
            }
            
            return revokedCount;
        } catch (error) {
            console.error(`[SESSION-STORE] Error revoking user sessions for ${uid}:`, error);
            return 0;
        }
    },
    
    // Get active session count for monitoring
    getActiveSessionCount: async (): Promise<number> => {
        try {
            if (!isAdminAvailable()) {
                return 0;
            }

            const db = getAdminFirestore();
            const now = Date.now();
            const activeSessions = await db.collection(SESSIONS_COLLECTION)
                .where('expiry', '>', now)
                .get();
            
            return activeSessions.size;
        } catch (error) {
            console.error('[SESSION-STORE] Error getting active session count:', error);
            return 0;
        }
    },
    
    // Cleanup expired sessions (call via scheduled Cloud Function)
    cleanupExpiredSessions: async (): Promise<number> => {
        try {
            if (!isAdminAvailable()) {
                console.warn('[SESSION-STORE] Firebase unavailable for session cleanup');
                return 0;
            }

            const db = getAdminFirestore();
            const now = Date.now();
            const expiredSessions = await db.collection(SESSIONS_COLLECTION)
                .where('expiry', '<', now)
                .get();
            
            let cleanedCount = 0;
            const batch = db.batch();
            
            expiredSessions.forEach((doc: any) => {
                batch.delete(doc.ref);
                cleanedCount++;
            });
            
            if (cleanedCount > 0) {
                await batch.commit();
                console.log(`[SESSION-STORE] Cleaned up ${cleanedCount} expired sessions from Firestore`);
            }
            
            return cleanedCount;
        } catch (error) {
            console.error('[SESSION-STORE] Error cleaning up expired sessions:', error);
            return 0;
        }
    }
};

// Token revocation functions with Firestore backend
export const TokenRevocation = {
    // Check if a token is revoked
    isTokenRevoked: async (uid: string): Promise<boolean> => {
        try {
            if (!isAdminAvailable()) {
                return false;
            }

            const db = getAdminFirestore();
            const revokedDoc = await db.collection(REVOKED_TOKENS_COLLECTION).doc(uid).get();
            
            if (!revokedDoc.exists) {
                return false;
            }
            
            const revokedData = revokedDoc.data();
            const now = Date.now();
            
            // Check if revocation has expired (optional: auto-cleanup old revocations)
            if (revokedData?.expiry && now > revokedData.expiry) {
                await db.collection(REVOKED_TOKENS_COLLECTION).doc(uid).delete();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error(`[TOKEN-REVOCATION] Error checking revocation for ${uid}:`, error);
            return false;
        }
    },
    
    // Revoke token for a specific user
    revokeToken: async (uid: string, reason?: string): Promise<void> => {
        try {
            if (!isAdminAvailable()) {
                console.warn('[TOKEN-REVOCATION] Firebase unavailable for token revocation');
                return;
            }

            const db = getAdminFirestore();
            const now = Date.now();
            
            await db.collection(REVOKED_TOKENS_COLLECTION).doc(uid).set({
                uid,
                revokedAt: now,
                reason: reason || 'Manual revocation',
                // Optional: Set expiry for auto-cleanup (e.g., 30 days)
                expiry: now + (30 * 24 * 60 * 60 * 1000) // 30 days
            });
            
            console.log(`[TOKEN-REVOCATION] Token revoked in Firestore for user ${uid}`);
            
            // Also revoke all sessions for this user
            await SessionStore.revokeUserSessions(uid);
        } catch (error) {
            console.error(`[TOKEN-REVOCATION] Error revoking token for ${uid}:`, error);
            throw new Error('Failed to revoke token');
        }
    },
    
    // Remove revocation (for testing/admin purposes)
    unrevokeToken: async (uid: string): Promise<boolean> => {
        try {
            if (!isAdminAvailable()) {
                return false;
            }

            const db = getAdminFirestore();
            const revokedDoc = await db.collection(REVOKED_TOKENS_COLLECTION).doc(uid).get();
            
            if (revokedDoc.exists) {
                await db.collection(REVOKED_TOKENS_COLLECTION).doc(uid).delete();
                console.log(`[TOKEN-REVOCATION] Token revocation removed from Firestore for user ${uid}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`[TOKEN-REVOCATION] Error unrevoking token for ${uid}:`, error);
            return false;
        }
    },
    
    // Get count of revoked tokens
    getRevokedTokenCount: async (): Promise<number> => {
        try {
            if (!isAdminAvailable()) {
                return 0;
            }

            const db = getAdminFirestore();
            const now = Date.now();
            const activeRevocations = await db.collection(REVOKED_TOKENS_COLLECTION)
                .where('expiry', '>', now)
                .get();
            
            return activeRevocations.size;
        } catch (error) {
            console.error('[TOKEN-REVOCATION] Error getting revoked token count:', error);
            return 0;
        }
    },
    
    // Clear all revoked tokens (admin function)
    clearAllRevocations: async (): Promise<number> => {
        try {
            if (!isAdminAvailable()) {
                return 0;
            }

            const db = getAdminFirestore();
            const allRevocations = await db.collection(REVOKED_TOKENS_COLLECTION).get();
            
            let count = 0;
            const batch = db.batch();
            
            allRevocations.forEach((doc: any) => {
                batch.delete(doc.ref);
                count++;
            });
            
            if (count > 0) {
                await batch.commit();
                console.log(`[TOKEN-REVOCATION] Cleared ${count} token revocations from Firestore`);
            }
            
            return count;
        } catch (error) {
            console.error('[TOKEN-REVOCATION] Error clearing all revocations:', error);
            return 0;
        }
    }
};

export interface AuthenticatedUser {
    uid: string;
    email: string;
    role: string;
    isAdmin: boolean;
}

/**
 * Extract and validate Firebase token from request
 * Uses Firebase Admin SDK for secure server-side token validation
 */
export async function validateFirebaseToken(request: NextRequest): Promise<AuthenticatedUser | null> {
    let idToken: string | null = null;
    try {
        // 1. Check for Authorization header (for API clients)
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            idToken = authHeader.substring(7);
        }

        // 2. If no header, check for firebaseToken cookie (for web clients)
        if (!idToken) {
            idToken = request.cookies.get(AUTH_COOKIE_CONFIG.FIREBASE_TOKEN)?.value ?? null;
        }
        
        if (!idToken) {
            console.log('[SERVER-AUTH] No token provided in Authorization header or cookie');
            return null;
        }

        // Validate the token using Firebase Admin SDK
        const decodedToken = await validateTokenWithFirebaseAdmin(idToken);
        if (!decodedToken) {
            console.warn('[SERVER-AUTH] Token validation failed');
            return null;
        }

        // NEW: Check if token is revoked
        if (await TokenRevocation.isTokenRevoked(decodedToken.uid)) {
            console.warn('[SERVER-AUTH] Token is revoked for user:', decodedToken.uid);
            return null;
        }

        // Check for admin role from Firebase custom claims or email domain
        const isAdmin = decodedToken.admin === true || 
                       decodedToken.email?.endsWith('@consortdigital.com') ||
                       decodedToken.email?.endsWith('@consort.com');
        
        if (!isAdmin) {
            console.warn('[SERVER-AUTH] User is not an admin:', decodedToken.email);
            return null;
        }

        // Only assign admin role to verified admin users
        const user: AuthenticatedUser = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            role: 'Admin',
            isAdmin: true
        };

        console.log('[SERVER-AUTH] Token validated successfully for user:', user.email);
        return user;

    } catch (error) {
        console.error('[SERVER-AUTH] Token validation failed:', error);
        return null;
    }
}

/**
 * Validate Firebase ID token using Firebase Admin SDK
 * Requires proper environment variables to be set
 */
async function validateTokenWithFirebaseAdmin(idToken: string): Promise<any> {
    try {
        // Check if Firebase Admin SDK is properly configured
        console.log('[SERVER-AUTH] Environment check:', {
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'present' : 'missing'
        });
        
        if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.error('[SERVER-AUTH] Firebase Admin SDK not configured. Required environment variables:');
            console.error('- FIREBASE_PRIVATE_KEY');
            console.error('- FIREBASE_CLIENT_EMAIL'); 
            console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
            throw new Error('Firebase Admin SDK not properly configured');
        }

        const { getAuth } = await import('firebase-admin/auth');
        const { initializeApp, getApps, cert } = await import('firebase-admin/app');
        
        // Initialize Firebase Admin if not already done
        if (getApps().length === 0) {
            initializeApp({
                credential: cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log('[SERVER-AUTH] Firebase Admin SDK initialized');
        }

        const adminAuth = getAuth();
        const decodedToken = await adminAuth.verifyIdToken(idToken, true); // checkRevoked = true for security
        console.log('[SERVER-AUTH] Token verified with Firebase Admin SDK for user:', decodedToken.email);
        return decodedToken;

    } catch (error) {
        console.error('[SERVER-AUTH] Firebase Admin SDK token validation error:', error);
        return null;
    }
}

/**
 * Middleware helper to require authentication for API routes
 */
export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
    return async (request: NextRequest) => {
        const user = await validateFirebaseToken(request);
        
        if (!user) {
            return new Response(
                JSON.stringify({ 
                    error: 'Authentication required',
                    message: 'Please log in to access this resource'
                }),
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return handler(request, user);
    };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
    return (
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.ip ||
        'unknown'
    );
}

/**
 * Enhanced auth check with rate limiting
 * Requires proper Firebase Admin SDK configuration
 */
export async function requireAuthWithRateLimit(
    handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>,
    rateLimitType: 'adminAction' | 'fileUpload' | 'formSubmission' = 'adminAction'
) {
    return async (request: NextRequest) => {
        const ip = getClientIP(request);
        
        // Apply rate limiting first
        const rateLimitResult = await RateLimiter.checkLimit(ip, rateLimitType);
        
        if (!rateLimitResult.success) {
            return new Response(
                JSON.stringify({ 
                    error: 'Rate limit exceeded',
                    message: 'Too many requests. Please try again later.',
                    retryAfter: rateLimitResult.reset
                }),
                { 
                    status: 429,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        // Require proper authentication - no shortcuts
        const user = await validateFirebaseToken(request);
        
        if (!user) {
            return new Response(
                JSON.stringify({ 
                    error: 'Authentication required',
                    message: 'Please log in to access this resource'
                }),
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        return handler(request, user);
    };
} 