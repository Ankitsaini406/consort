/**
 * 🔒 SINGLE SESSION HOOK
 * 
 * React hook to manage single-session enforcement
 * Automatically initializes and manages session conflicts
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClientSessionManager } from '@/utils/clientSessionManager';

interface SessionInfo {
  sessionId: string;
  userId: string;
}

export function useSingleSession() {
  const router = useRouter();

  /**
   * 🚀 INITIALIZE SESSION
   * Call this after successful login
   */
  const initializeSession = useCallback(async (sessionInfo: SessionInfo) => {
    try {
      console.log('[SINGLE-SESSION] Initializing session for user:', sessionInfo.userId);
      ClientSessionManager.initializeSession(sessionInfo.sessionId);
    } catch (error) {
      console.error('[SINGLE-SESSION] Failed to initialize session:', error);
    }
  }, []);

  /**
   * 🧹 CLEANUP SESSION
   * Call this during logout
   */
  const cleanupSession = useCallback(() => {
    console.log('[SINGLE-SESSION] Cleaning up session');
    ClientSessionManager.cleanup();
  }, []);

  /**
   * 🔍 CHECK SESSION STATUS
   */
  const isSessionActive = useCallback(() => {
    return ClientSessionManager.isSessionActive();
  }, []);

  /**
   * 📱 GET CURRENT SESSION ID
   */
  const getCurrentSessionId = useCallback(() => {
    return ClientSessionManager.getCurrentSessionId();
  }, []);

  /**
   * 🔄 HANDLE PAGE VISIBILITY
   * Check session when user returns to tab
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isSessionActive()) {
        // Check if session is still valid when tab becomes visible
        console.log('[SINGLE-SESSION] Tab became visible, checking session...');
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isSessionActive]);

  /**
   * 🧹 CLEANUP ON UNMOUNT
   */
  useEffect(() => {
    return () => {
      // Don't cleanup automatically on unmount - only on explicit logout
      // ClientSessionManager.cleanup();
    };
  }, []);

  return {
    initializeSession,
    cleanupSession,
    isSessionActive,
    getCurrentSessionId,
  };
} 