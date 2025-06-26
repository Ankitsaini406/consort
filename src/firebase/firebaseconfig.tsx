'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { 
    getAuth, 
    Auth, 
    setPersistence, 
    inMemoryPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

/**
 * Firebase Auth Persistence Configuration
 * 
 * SECURITY LEVELS:
 * - inMemoryPersistence: HIGHEST SECURITY - Only persists while page is open
 * - browserSessionPersistence: MEDIUM SECURITY - Persists until browser tab is closed
 * - browserLocalPersistence: LOWEST SECURITY - Persists across browser restarts
 * 
 * For admin CMS systems, inMemoryPersistence is recommended for better security
 * For development, browserLocalPersistence provides better UX
 * 
 * Can be configured via AUTH_PERSISTENCE environment variable: memory|session|local
 */
function getAuthPersistence() {
    const persistenceType = process.env.NEXT_PUBLIC_AUTH_PERSISTENCE || 'session';
    
    switch (persistenceType) {
        case 'memory':
            return inMemoryPersistence;
        case 'local':
            return browserLocalPersistence;
        case 'session':
        default:
            return browserSessionPersistence;
    }
}

const AUTH_PERSISTENCE_MODE = getAuthPersistence();

/**
 * Enhanced environment variable debugging
 * Helps diagnose why Firebase variables might not load correctly
 */
function getEnvironmentVariables() {
    return {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        NODE_ENV: process.env.NODE_ENV
    };
}

/**
 * Get Firebase configuration from environment variables
 */
function getFirebaseConfig() {
    return {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
}

/**
 * Validate Firebase configuration
 */
function validateFirebaseConfig(config: any): boolean {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !config[key]);
    
    if (missingKeys.length > 0) {
        console.error('[FIREBASE] Missing required environment variables:', 
            missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)
        );
        return false;
    }
    
    return true;
}

/**
 * CLIENT-SIDE ONLY Firebase initialization
 * This function should only be called in the browser
 */
function initializeClientFirebase(): {
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
    storage: FirebaseStorage | null;
    analytics: Analytics | null;
} {
    // Guard: Only initialize in browser
    if (typeof window === 'undefined') {
        console.warn('[FIREBASE] Attempted to initialize on server - skipping');
        return { app: null, auth: null, db: null, storage: null, analytics: null };
    }

    // Return existing instances if already initialized
    if (app && auth && db && storage) {
        return { app, auth, db, storage, analytics };
    }

    try {
        const firebaseConfig = getFirebaseConfig();
        
        // Validate configuration
        if (!validateFirebaseConfig(firebaseConfig)) {
            throw new Error('Invalid Firebase configuration');
        }

        // Initialize app
        if (getApps().length > 0) {
            app = getApp();
            console.log('[FIREBASE] Using existing app instance');
        } else {
            app = initializeApp(firebaseConfig);
            console.log('[FIREBASE] Initialized new app instance');
        }
        
        // Initialize services
        auth = getAuth(app);
        storage = getStorage(app);
        db = getFirestore(app);

        // Set auth persistence
        const persistenceMode = getAuthPersistence();
        setPersistence(auth, persistenceMode)
            .then(() => {
                const persistenceType = persistenceMode === inMemoryPersistence ? 'MEMORY' :
                                       persistenceMode === browserSessionPersistence ? 'SESSION' : 'LOCAL';
                console.log(`[FIREBASE] Auth persistence set to: ${persistenceType}`);
            })
            .catch((error) => {
                console.error('[FIREBASE] Error setting auth persistence:', error);
            });

        // Initialize analytics (optional)
        if (firebaseConfig.measurementId) {
            try {
                analytics = getAnalytics(app);
                console.log('[FIREBASE] Analytics initialized');
            } catch (error) {
                console.warn('[FIREBASE] Analytics initialization failed (non-critical):', error);
                analytics = null;
            }
        }

        console.log('[FIREBASE] Client initialization completed successfully');
        return { app, auth, db, storage, analytics };

    } catch (error) {
        console.error('[FIREBASE] Client initialization failed:', error);
        return { app: null, auth: null, db: null, storage: null, analytics: null };
    }
}

/**
 * Get Firebase services - CLIENT-SIDE ONLY
 * These functions will return null on server-side
 */
export function getFirebaseApp(): FirebaseApp | null {
    if (typeof window === 'undefined') return null;
    if (!app) {
        const services = initializeClientFirebase();
        return services.app;
    }
    return app;
}

export function getFirebaseAuth(): Auth | null {
    if (typeof window === 'undefined') return null;
    if (!auth) {
        const services = initializeClientFirebase();
        return services.auth;
    }
    return auth;
}

export function getFirebaseDb(): Firestore | null {
    if (typeof window === 'undefined') return null;
    if (!db) {
        const services = initializeClientFirebase();
        return services.db;
    }
    return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
    if (typeof window === 'undefined') return null;
    if (!storage) {
        const services = initializeClientFirebase();
        return services.storage;
    }
    return storage;
}

export function getFirebaseAnalytics(): Analytics | null {
    if (typeof window === 'undefined') return null;
    if (!analytics) {
        const services = initializeClientFirebase();
        return services.analytics;
    }
    return analytics;
}

// Legacy exports for backward compatibility - these will be null on server
export { 
    getFirebaseApp as app,
    getFirebaseAuth as auth,
    getFirebaseDb as db,
    getFirebaseStorage as storage,
    getFirebaseAnalytics as analytics
}; 
