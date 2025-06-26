'use client';

import { useEffect, useState } from 'react';
import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { FirebaseStorage } from "firebase/storage";
import { Analytics } from "firebase/analytics";
import { 
    getFirebaseApp, 
    getFirebaseAuth, 
    getFirebaseDb, 
    getFirebaseStorage, 
    getFirebaseAnalytics 
} from './firebaseconfig';

// Client-only Firebase services
interface FirebaseServices {
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
    storage: FirebaseStorage | null;
    analytics: Analytics | null;
    isInitialized: boolean;
    error: string | null;
}

/**
 * Client-only Firebase hook
 * Prevents SSR issues by only initializing Firebase in the browser
 */
export function useFirebase(): FirebaseServices {
    const [services, setServices] = useState<FirebaseServices>({
        app: null,
        auth: null,
        db: null,
        storage: null,
        analytics: null,
        isInitialized: false,
        error: null
    });

    useEffect(() => {
        // Only initialize in browser
        if (typeof window === 'undefined') {
            console.log('[CLIENT-FIREBASE] Server-side context - skipping initialization');
            return;
        }

        async function initializeClientFirebase() {
            try {
                console.log('[CLIENT-FIREBASE] Initializing client Firebase services...');
                
                // Get Firebase services using the new client-side functions
                const app = getFirebaseApp();
                const auth = getFirebaseAuth();
                const db = getFirebaseDb();
                const storage = getFirebaseStorage();
                const analytics = getFirebaseAnalytics();
                
                // Check if core services are available
                if (!app || !auth || !db || !storage) {
                    throw new Error('Failed to initialize core Firebase services');
                }
                
                setServices({
                    app,
                    auth,
                    db,
                    storage,
                    analytics, // Analytics can be null
                    isInitialized: true,
                    error: null
                });
                
                console.log('[CLIENT-FIREBASE] Successfully initialized all services');
                
            } catch (error) {
                console.error('[CLIENT-FIREBASE] Failed to initialize:', error);
                setServices(prev => ({ 
                    ...prev, 
                    isInitialized: false,
                    error: error instanceof Error ? error.message : 'Unknown initialization error'
                }));
            }
        }

        initializeClientFirebase();
    }, []);

    return services;
}

/**
 * Client-only Firebase context for components that need Firebase services
 * Now with proper error handling and loading states
 */
export function withClientFirebase<T extends {}>(
    Component: React.ComponentType<T & { firebase: FirebaseServices }>
) {
    return function ClientFirebaseWrapper(props: T) {
        const firebase = useFirebase();
        
        // Show error state if Firebase failed to initialize
        if (firebase.error) {
            return (
                <div className="flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="text-red-600 mb-2">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="text-sm text-red-600 font-medium">Firebase Initialization Failed</div>
                        <div className="text-xs text-gray-500 mt-1">{firebase.error}</div>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }
        
        // Show loading state while Firebase initializes
        if (!firebase.isInitialized) {
            return (
                <div className="flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                        <div className="text-sm text-gray-500">Initializing Firebase...</div>
                    </div>
                </div>
            );
        }

        return <Component {...props} firebase={firebase} />;
    };
} 