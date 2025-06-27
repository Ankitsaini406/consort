import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface SingleTabConfig {
    enabled: boolean;
    checkInterval: number; // milliseconds
    warningTitle: string;
    warningMessage: string;
    closeButtonText: string;
}

const DEFAULT_CONFIG: SingleTabConfig = {
    enabled: false, // Disabled by default - enable only if needed
    checkInterval: 2000, // 2 seconds
    warningTitle: 'Multiple Admin Sessions Detected',
    warningMessage: 'Another admin session is already active in a different tab. For security reasons, only one admin session can be active at a time.\n\nPlease close this tab to continue using the other session.',
    closeButtonText: 'Close This Tab'
};

/**
 * User-friendly single-tab session control
 * - Detects multiple admin tabs
 * - Shows a popup asking user to close conflicting tab
 * - No forced logout - lets user decide
 */
export function useSingleTabSession(config: Partial<SingleTabConfig> = {}) {
    const { user, loading } = useAuth();
    const sessionIdRef = useRef<string | null>(null);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Function to show user-friendly conflict resolution
    const showTabConflictDialog = () => {
        setShowConflictModal(true);
        
        // Also show browser alert as fallback
        const userChoice = confirm(
            `${finalConfig.warningTitle}\n\n${finalConfig.warningMessage}\n\nClick OK to close this tab, or Cancel to stay (not recommended).`
        );
        
        if (userChoice) {
            // User chose to close this tab
            window.close();
            
            // If window.close() doesn't work (some browsers block it), 
            // redirect to a "please close this tab" page
            setTimeout(() => {
                window.location.href = '/admin/tab-conflict';
            }, 1000);
        } else {
            // User chose to stay - warn them about potential issues
            alert('Warning: Having multiple admin sessions may cause unexpected behavior. Please consider closing one of the tabs.');
        }
    };

    useEffect(() => {
        // Only run if enabled and user is authenticated
        if (!finalConfig.enabled || !user || loading) return;

        // Generate unique session ID for this tab
        sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionKey = 'admin_session_active';
        const sessionTimestampKey = 'admin_session_timestamp';
        const currentSessionId = sessionIdRef.current;
        const currentTimestamp = Date.now();



        // Check if another session is already active
        const existingSession = localStorage.getItem(sessionKey);
        const existingTimestamp = localStorage.getItem(sessionTimestampKey);
        
        if (existingSession && existingSession !== currentSessionId) {
            // Check if the existing session is recent (within last 30 seconds)
            const timeDiff = currentTimestamp - (parseInt(existingTimestamp || '0'));
            
            if (timeDiff < 30000) { // 30 seconds
                showTabConflictDialog();
                return; // Don't establish this session
            }
        }

        // Mark this session as active
        localStorage.setItem(sessionKey, currentSessionId);
        localStorage.setItem(sessionTimestampKey, currentTimestamp.toString());

        // Periodically update timestamp and check for conflicts
        checkIntervalRef.current = setInterval(() => {
            const activeSession = localStorage.getItem(sessionKey);
            const activeTimestamp = localStorage.getItem(sessionTimestampKey);
            
            if (activeSession && activeSession !== currentSessionId) {
                // Another session is active
                const timeDiff = Date.now() - (parseInt(activeTimestamp || '0'));
                
                if (timeDiff < 10000) { // 10 seconds - active session
                    showTabConflictDialog();
                }
            } else {
                // Update our timestamp to show we're active
                localStorage.setItem(sessionKey, currentSessionId);
                localStorage.setItem(sessionTimestampKey, Date.now().toString());
            }
        }, finalConfig.checkInterval);

        // Handle tab close/navigation
        const handleBeforeUnload = () => {
            const activeSession = localStorage.getItem(sessionKey);
            if (activeSession === currentSessionId) {
                localStorage.removeItem(sessionKey);
                localStorage.removeItem(sessionTimestampKey);
            }
        };

        // Handle storage changes from other tabs
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === sessionKey && event.newValue && event.newValue !== currentSessionId) {
                // Check if this is a recent session
                const timestamp = localStorage.getItem(sessionTimestampKey);
                const timeDiff = Date.now() - (parseInt(timestamp || '0'));
                
                if (timeDiff < 5000) { // 5 seconds - very recent
                    showTabConflictDialog();
                }
            }
        };

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('storage', handleStorageChange);

        // Cleanup function
        return () => {
            // Clear interval
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            
            // Remove session if it's ours
            const activeSession = localStorage.getItem(sessionKey);
            if (activeSession === currentSessionId) {
                localStorage.removeItem(sessionKey);
                localStorage.removeItem(sessionTimestampKey);
            }
            
            // Remove event listeners
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [user, loading, finalConfig]);

    // Function to manually close this tab
    const closeThisTab = () => {
        window.close();
        // Fallback if window.close() doesn't work
        setTimeout(() => {
            window.location.href = '/admin/tab-conflict';
        }, 1000);
    };

    return {
        sessionId: sessionIdRef.current,
        isEnabled: finalConfig.enabled,
        showConflictModal,
        closeThisTab,
        setShowConflictModal
    };
} 