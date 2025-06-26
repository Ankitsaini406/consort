import { NextRequest } from 'next/server';

export interface UserInfo {
    userId: string;
    email: string;
    role: 'Admin' | 'User';
    isAdmin: boolean;
}

/**
 * Extract and validate Firebase token from request
 * Uses Firebase Admin SDK for secure server-side token validation
 */
export async function extractUserFromToken(request: NextRequest): Promise<UserInfo | null> {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[FIREBASE-AUTH-SERVER] No valid Authorization header provided');
            return null;
        }

        const idToken = authHeader.substring(7);
        if (!idToken) {
            console.log('[FIREBASE-AUTH-SERVER] No token provided in Authorization header');
            return null;
        }

        // Validate the token using Firebase Admin SDK
        const decodedToken = await validateTokenWithFirebaseAdmin(idToken);
        if (!decodedToken) {
            console.warn('[FIREBASE-AUTH-SERVER] Token validation failed');
            return null;
        }

        // For your CMS use case, all authenticated users are admins
        const userInfo: UserInfo = {
            userId: decodedToken.uid,
            email: decodedToken.email || '',
            role: 'Admin',
            isAdmin: true
        };

        console.log('[FIREBASE-AUTH-SERVER] Token validated successfully for user:', userInfo.email);
        return userInfo;

    } catch (error) {
        console.error('[FIREBASE-AUTH-SERVER] Token validation failed:', error);
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
        if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.error('[FIREBASE-AUTH-SERVER] Firebase Admin SDK not configured. Required environment variables:');
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
            console.log('[FIREBASE-AUTH-SERVER] Firebase Admin SDK initialized');
        }

        const adminAuth = getAuth();
        const decodedToken = await adminAuth.verifyIdToken(idToken, true); // checkRevoked = true for security
        console.log('[FIREBASE-AUTH-SERVER] Token verified with Firebase Admin SDK for user:', decodedToken.email);
        return decodedToken;

    } catch (error) {
        console.error('[FIREBASE-AUTH-SERVER] Firebase Admin SDK token validation error:', error);
        return null;
    }
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