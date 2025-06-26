import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseconfig';

/**
 * Centralized cookie configuration to prevent naming inconsistencies
 */
export const AUTH_COOKIE_CONFIG = {
    FIREBASE_TOKEN: 'firebaseToken',
    COOKIE_OPTIONS: {
        path: '/',
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 3600, // 1 hour
    },
    getSecureCookieString: (name: string, value: string, maxAge?: number) => {
        const options = AUTH_COOKIE_CONFIG.COOKIE_OPTIONS;
        return `${name}=${value}; path=${options.path}; secure; samesite=${options.sameSite}; max-age=${maxAge || options.maxAge}`;
    },
    getHttpOnlyCookieString: (name: string, value: string, maxAge?: number) => {
        const options = AUTH_COOKIE_CONFIG.COOKIE_OPTIONS;
        return `${name}=${value}; path=${options.path}; secure; samesite=${options.sameSite}; httponly; max-age=${maxAge || options.maxAge}`;
    },
    getExpiredCookieString: (name: string) => {
        return `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },
    getExpiredHttpOnlyCookieString: (name: string) => {
        return `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly; secure; samesite=strict`;
    }
} as const;

/**
 * Force logout and clear all authentication data
 * Enhanced with server-side session invalidation
 */
export async function forceLogout(includeServerInvalidation: boolean = true): Promise<void> {
    try {
        console.log('[AUTH-UTILS] Starting enhanced force logout...');
        
        // 1. Server-side session invalidation (if enabled)
        if (includeServerInvalidation) {
            try {
                await fetch('/api/auth/invalidate-session', {
                    method: 'POST',
                    credentials: 'include'
                });
                console.log('[AUTH-UTILS] Server-side session invalidated');
            } catch (error) {
                console.warn('[AUTH-UTILS] Server-side invalidation failed (continuing with client logout):', error);
            }
        }
        
        // 2. Sign out from Firebase
        await signOut(auth);
        console.log('[AUTH-UTILS] Firebase signOut completed');
        
        // 3. Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.clear();
            console.log('[AUTH-UTILS] localStorage cleared');
            
            // 4. Clear sessionStorage
            sessionStorage.clear();
            console.log('[AUTH-UTILS] sessionStorage cleared');
            
            // 5. Clear specific Firebase auth data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('firebase:') || key.includes('auth'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // 6. Clear session management data
            localStorage.removeItem('session_closed');
            localStorage.removeItem('admin_session_active');
            
            // 7. Clear any auth cookies by setting them to expire
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            console.log('[AUTH-UTILS] Cookies and session data cleared');
        }
        
        // 8. Call server-side logout for cleanup
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            console.log('[AUTH-UTILS] Server-side logout completed');
        } catch (error) {
            console.warn('[AUTH-UTILS] Server-side logout failed:', error);
        }
        
        console.log('[AUTH-UTILS] Enhanced force logout completed successfully');
        
        // 9. Reload the page to ensure clean state
        if (typeof window !== 'undefined') {
            window.location.href = '/auth';
        }
        
    } catch (error) {
        console.error('[AUTH-UTILS] Enhanced force logout failed:', error);
        throw error;
    }
}

/**
 * Check if user is actually logged out (no persistent sessions)
 */
export function checkAuthState(): { 
    hasFirebaseUser: boolean;
    hasLocalStorageData: boolean;
    hasSessionData: boolean;
} {
    if (typeof window === 'undefined') {
        return { hasFirebaseUser: false, hasLocalStorageData: false, hasSessionData: false };
    }
    
    const hasFirebaseUser = !!auth.currentUser;
    
    const hasLocalStorageData = Object.keys(localStorage).some(key => 
        key.startsWith('firebase:') || key.includes('auth')
    );
    
    const hasSessionData = Object.keys(sessionStorage).some(key => 
        key.startsWith('firebase:') || key.includes('auth')
    );
    
    return { hasFirebaseUser, hasLocalStorageData, hasSessionData };
} 