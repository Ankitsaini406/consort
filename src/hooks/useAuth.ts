'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/firebase/firebaseconfig';
import { AUTH_COOKIE_CONFIG } from '@/utils/authUtils';

// Predefined display names for admin users
// This allows customizing display names while maintaining email-based identity
const ADMIN_DISPLAY_NAMES: Record<string, string> = {
    // Add your admin email and preferred display name here
    'admin@consortdigital.com': 'Shree',
    'admin@consort.com': 'Consort Admin',
    // Add more admins as needed:
    // 'john@consort.com': 'John Smith',
    // 'jane@consort.com': 'Jane Doe',
};

export interface AuthUser {
    uid: string;
    email: string;
    displayName?: string;
    // Add custom display name for UI
    customDisplayName: string;
    // Add security fields
    emailVerified: boolean;
    lastSignInTime?: string;
}

// Helper function to get display name for UI
export function getDisplayName(user: AuthUser | null): string {
    if (!user) return 'Unknown User';
    
    // First check predefined admin names
    if (user.email && ADMIN_DISPLAY_NAMES[user.email]) {
        return ADMIN_DISPLAY_NAMES[user.email];
    }
    
    // Fall back to Firebase displayName
    if (user.displayName) {
        return user.displayName;
    }
    
    // Fall back to email (extract name part)
    if (user.email) {
        const emailName = user.email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'Admin User';
}

// Helper function to get database identity (always use email for audit trail)
export function getDatabaseIdentity(user: AuthUser | null): string {
    return user?.email || 'Unknown';
}

// Validate user object for security
function validateUser(firebaseUser: User): boolean {
    if (!firebaseUser) return false;
    if (!firebaseUser.uid || firebaseUser.uid.length < 10) return false;
    if (!firebaseUser.email || !firebaseUser.email.includes('@')) return false;
    // Add more validation as needed
    return true;
}

// Production-safe logging - only log critical errors and warnings
function logAuth(level: 'info' | 'warn' | 'error', message: string, details?: any) {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (level === 'error') {
        console.error(`[AUTH] ${message}`, isDev ? details : '');
    } else if (level === 'warn') {
        console.warn(`[AUTH] ${message}`, isDev ? details : '');
    }
    // Removed info logging to reduce console noise
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [firebaseInitialized, setFirebaseInitialized] = useState(false);

    useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        let unsubscribe: (() => void) | null = null;
        let loadingTimeout: NodeJS.Timeout | null = null;

        const initializeAuth = async () => {
            try {
                // Get Firebase auth instance (client-side only)
                const auth = getFirebaseAuth();
                
                if (!auth) {
                    logAuth('warn', 'Firebase Auth not available - likely server-side rendering');
                    setLoading(false);
                    setFirebaseInitialized(false);
                    return;
                }

                setFirebaseInitialized(true);

                // Set loading timeout
                loadingTimeout = setTimeout(() => {
                    logAuth('warn', 'Authentication timeout - resolving as unauthenticated');
                    setLoading(false);
                    setUser(null);
                    setError('Authentication service timeout. Please refresh and try again.');
                }, 2000); // 2 second timeout

                // Set up auth state listener
                unsubscribe = onAuthStateChanged(
                    auth, 
                    (firebaseUser: User | null) => {
                        // Clear timeout immediately on any auth state change
                        if (loadingTimeout) {
                            clearTimeout(loadingTimeout);
                            loadingTimeout = null;
                        }
                        
                        if (firebaseUser) {
                            // Validate user before accepting
                            if (!validateUser(firebaseUser)) {
                                logAuth('error', 'Invalid user object detected - rejecting');
                                setUser(null);
                                setError('Invalid user session detected. Please log in again.');
                                setLoading(false);
                                return;
                            }

                            // Only log email verification issues as warnings
                            if (!firebaseUser.emailVerified) {
                                logAuth('warn', 'Email not verified', { email: firebaseUser.email });
                            }

                            const authUser: AuthUser = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email!,
                                displayName: firebaseUser.displayName || undefined,
                                emailVerified: firebaseUser.emailVerified,
                                lastSignInTime: firebaseUser.metadata.lastSignInTime || undefined,
                                customDisplayName: getDisplayName({
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email!,
                                    displayName: firebaseUser.displayName || undefined,
                                    customDisplayName: '',
                                    emailVerified: firebaseUser.emailVerified,
                                }),
                            };

                            setUser(authUser);
                            setError(null);
                            setLoading(false);
                            
                        } else {
                            setUser(null);
                            setError(null);
                            setLoading(false);
                        }
                    },
                    (authError) => {
                        logAuth('error', 'Authentication error', authError);
                        if (loadingTimeout) {
                            clearTimeout(loadingTimeout);
                            loadingTimeout = null;
                        }
                        setError(`Authentication failed: ${authError.message}`);
                        setLoading(false);
                        setUser(null);
                    }
                );

            } catch (error) {
                logAuth('error', 'Failed to initialize auth', error);
                setError('Failed to initialize authentication');
                setLoading(false);
                setFirebaseInitialized(false);
            }
        };

        initializeAuth();

        // Cleanup function
        return () => {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []); // Empty dependency array - run once on mount

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            
            // Get Firebase auth instance
            const auth = getFirebaseAuth();
            if (!auth) {
                throw new Error('Firebase Auth not initialized');
            }
            
            // Validate input
            if (!email || !email.includes('@')) {
                throw new Error('Invalid email address');
            }
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            
            // Apply rate limiting before attempting authentication
            try {
                const rateLimitResponse = await fetch('/api/auth/rate-limit-check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        type: 'authentication'
                    })
                });

                if (!rateLimitResponse.ok) {
                    const rateLimitData = await rateLimitResponse.json();
                    if (rateLimitResponse.status === 429) {
                        // Rate limit exceeded
                        const retryAfter = rateLimitData.retryAfter || 'a few minutes';
                        throw new Error(`Too many login attempts. Please try again ${typeof retryAfter === 'number' ? `in ${Math.ceil(retryAfter / 60)} minutes` : retryAfter}.`);
                    }
                }
            } catch (rateLimitError: any) {
                setLoading(false);
                logAuth('warn', 'Rate limit check failed', rateLimitError.message);
                setError(rateLimitError.message);
                throw rateLimitError;
            }
            
            const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
            
            // Additional validation after login
            if (!validateUser(userCredential.user)) {
                await signOut(auth); // Sign out invalid user immediately
                throw new Error('Invalid user credentials');
            }

            // Get ID token for server-side authentication
            const token = await userCredential.user.getIdToken();
            
            // Set secure cookie (client-side)
            if (typeof window !== 'undefined') {
                document.cookie = AUTH_COOKIE_CONFIG.getSecureCookieString(AUTH_COOKIE_CONFIG.FIREBASE_TOKEN, token);
            }
            
            logAuth('info', 'Login successful', { email: userCredential.user.email });
            
        } catch (error: any) {
            setLoading(false);
            const errorMessage = error.message || 'Login failed';
            logAuth('error', 'Login failed', errorMessage);
            setError(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const auth = getFirebaseAuth();
            if (!auth) {
                logAuth('warn', 'Firebase Auth not available for logout');
                return;
            }
            
            // Sign out from Firebase
            await signOut(auth);
            
            // Clear secure cookie (client-side)
            if (typeof window !== 'undefined') {
                document.cookie = AUTH_COOKIE_CONFIG.getExpiredCookieString(AUTH_COOKIE_CONFIG.FIREBASE_TOKEN);
            }
            
            // Call server-side logout endpoint
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (fetchError) {
                logAuth('warn', 'Server-side logout failed (non-critical)', fetchError);
            }
            
            logAuth('info', 'Logout successful');
            
        } catch (error: any) {
            const errorMessage = error.message || 'Logout failed';
            logAuth('error', 'Logout failed', errorMessage);
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading: loading || !firebaseInitialized,
        error,
        login,
        logout,
        isAuthenticated: !loading && firebaseInitialized && !!user && !!user.uid && !!user.email,
    };
} 