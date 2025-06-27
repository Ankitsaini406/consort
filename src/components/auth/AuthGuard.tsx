'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const { user, loading, error } = useAuthContext();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);

    // Robust authentication check - NO BYPASSES
    const isAuthenticated = !loading && user && user.uid && user.email;
    const shouldRedirect = !loading && !isAuthenticated && !hasRedirected;

    // Token cookie is set during login process in useAuth.ts
    // This ensures proper timing and prevents redirect loops

    // Immediate redirect for unauthorized access - standardized timing
    useEffect(() => {
        if (shouldRedirect) {
            console.warn('[AUTH-GUARD] UNAUTHORIZED ACCESS DETECTED - Redirecting to /auth');
            setHasRedirected(true);
            // Prefetch auth page for better perceived performance
            router.prefetch('/auth');
            // Use setTimeout to prevent timing attacks
            setTimeout(() => {
                router.replace('/auth');
            }, 200);
        }
    }, [shouldRedirect, router]);

    // Additional security: redirect if user becomes invalid - standardized timing
    useEffect(() => {
        if (!loading && user && (!user.uid || !user.email)) {
            console.warn('[AUTH-GUARD] INVALID USER DETECTED - Redirecting to /auth');
            setHasRedirected(true);
            // Use setTimeout to prevent timing attacks
            setTimeout(() => {
                router.replace('/auth');
            }, 200);
        }
    }, [user, loading, router]);

    // Show loading state only briefly with better UX
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Verifying credentials...</p>
                    <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
                </div>
            </div>
        );
    }

    // Show error state with secure handling
    if (error) {
        console.error('[AUTH-GUARD] Authentication error detected:', error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="text-red-600 mb-6">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Authentication Failed</h3>
                    <p className="text-gray-600 mb-6">Your session has expired or there was an authentication error.</p>
                    <button 
                        onClick={() => {
                            setHasRedirected(true);
                            router.replace('/auth');
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // Final security check before showing content
    if (!isAuthenticated) {
        console.warn('[AUTH-GUARD] Final security check failed - Access denied');
        return fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-gray-600 mb-4">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 font-medium">Access Denied</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Only show protected content for fully authenticated users
    return <>{children}</>;
} 