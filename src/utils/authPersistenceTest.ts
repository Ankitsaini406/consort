/**
 * Firebase Auth Persistence Test Utility
 * Logs information about current persistence mode for development
 */

import { checkAuthState } from './authUtils';

/**
 * Log current auth persistence information
 */
export function logAuthPersistenceInfo(): void {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        return;
    }

    // Delay to ensure Firebase is initialized
    setTimeout(() => {
        const authState = checkAuthState();
        
        // Auth persistence info removed for production
    }, 2000);
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    logAuthPersistenceInfo();
} 