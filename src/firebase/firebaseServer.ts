// Server-side Firebase configuration for ISR and server actions
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let serverApp: FirebaseApp | null = null;
let serverDb: Firestore | null = null;

/**
 * Get Firebase configuration from environment variables
 * Same config as client but for server-side use
 */
function getServerFirebaseConfig() {
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
 * Validate server Firebase configuration
 */
function validateServerConfig(config: any): boolean {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !config[key]);
    
    if (missingKeys.length > 0) {
        console.error('[FIREBASE-SERVER] Missing required environment variables:', 
            missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)
        );
        return false;
    }
    
    return true;
}

/**
 * Initialize Firebase for server-side operations (ISR, server actions)
 * This runs on the server during build time and SSR
 */
function initializeServerFirebase(): { app: FirebaseApp | null; db: Firestore | null } {
    try {
        // Check if we're in a server environment
        if (typeof window !== 'undefined') {
            console.warn('[FIREBASE-SERVER] Attempted to initialize server Firebase in browser');
            return { app: null, db: null };
        }

        // Return existing instances if already initialized
        if (serverApp && serverDb) {
            return { app: serverApp, db: serverDb };
        }

        const firebaseConfig = getServerFirebaseConfig();
        
        // Validate configuration
        if (!validateServerConfig(firebaseConfig)) {
            console.error('[FIREBASE-SERVER] Invalid configuration, cannot initialize');
            return { app: null, db: null };
        }

        // Initialize app for server-side use
        if (getApps().length > 0) {
            serverApp = getApp();
            console.log('[FIREBASE-SERVER] Using existing server app instance');
        } else {
            serverApp = initializeApp(firebaseConfig, 'server-app');
            console.log('[FIREBASE-SERVER] Initialized new server app instance');
        }
        
        // Initialize Firestore for server-side operations
        serverDb = getFirestore(serverApp);

        console.log('[FIREBASE-SERVER] Server Firebase initialization completed successfully');
        return { app: serverApp, db: serverDb };

    } catch (error) {
        console.error('[FIREBASE-SERVER] Server Firebase initialization failed:', error);
        return { app: null, db: null };
    }
}

/**
 * Get server-side Firestore instance
 * For use in ISR pages, server actions, and API routes
 */
export function getServerFirestore(): Firestore | null {
    // Only initialize on server-side
    if (typeof window !== 'undefined') {
        console.warn('[FIREBASE-SERVER] getServerFirestore called in browser context');
        return null;
    }

    if (!serverDb) {
        const { db } = initializeServerFirebase();
        return db;
    }
    
    return serverDb;
}

/**
 * Get server-side Firebase app instance
 */
export function getServerFirebaseApp(): FirebaseApp | null {
    // Only initialize on server-side
    if (typeof window !== 'undefined') {
        console.warn('[FIREBASE-SERVER] getServerFirebaseApp called in browser context');
        return null;
    }

    if (!serverApp) {
        const { app } = initializeServerFirebase();
        return app;
    }
    
    return serverApp;
}

/**
 * Check if server Firebase is available
 */
export function isServerFirebaseAvailable(): boolean {
    if (typeof window !== 'undefined') return false;
    
    try {
        const db = getServerFirestore();
        return db !== null;
    } catch (error) {
        console.error('[FIREBASE-SERVER] Error checking availability:', error);
        return false;
    }
} 