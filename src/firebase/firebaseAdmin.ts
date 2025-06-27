// Firebase Admin SDK - ULTRA-SECURE IMPLEMENTATION
// SECURITY PRINCIPLE: FAIL-FAST - If Firebase Admin SDK can't initialize, LOCK DOWN EVERYTHING
let adminApp: any = null;
let initializationError: Error | null = null;
let initialized = false;
let securityLockdown = false; // NEW: Emergency lockdown flag

// CRITICAL: Required environment variables for security
const REQUIRED_FIREBASE_ENV_VARS = [
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

// Production-safe logging for Firebase Admin
function logAdmin(level: 'info' | 'warn' | 'error', message: string, details?: any) {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (level === 'error') {
    console.error(`[FIREBASE-ADMIN-SECURITY] ${message}`, isDev ? details : '');
  } else if (level === 'warn') {
    console.warn(`[FIREBASE-ADMIN-SECURITY] ${message}`, isDev ? details : '');
  } else if (isDev) {
    console.log(`[FIREBASE-ADMIN-SECURITY] ${message}`, details || '');
  }
}

// SECURITY: Check if Firebase Admin SDK is available and properly configured
export const isAdminAvailable = (): boolean => {
  // SECURITY LOCKDOWN: If we've detected a critical security issue, block everything
  if (securityLockdown) {
    logAdmin('error', 'SECURITY LOCKDOWN ACTIVE - All admin access blocked');
    return false;
  }

  // DEVELOPMENT: Allow development with explicit opt-in only
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      logAdmin('warn', 'Development mode: Firebase Admin SDK disabled (no service account key)');
      return false;
    }
  }
  
  // PRODUCTION: STRICT VALIDATION - NO EXCEPTIONS
  if (process.env.NODE_ENV === 'production') {
    const missingVars = REQUIRED_FIREBASE_ENV_VARS.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      const errorMsg = `CRITICAL SECURITY ERROR: Missing required Firebase environment variables: ${missingVars.join(', ')}`;
      logAdmin('error', errorMsg);
      securityLockdown = true; // LOCKDOWN: Block all admin access
      throw new Error(errorMsg);
    }
  }
  
  // Try to initialize if we haven't tried before
  if (!initialized) {
    tryInitializeAdmin();
  }
  
  // SECURITY CHECK: Only return true if Firebase Admin SDK is properly initialized
  const isAvailable = adminApp !== null && initializationError === null && !securityLockdown;
  
  if (!isAvailable) {
    logAdmin('error', 'Firebase Admin SDK not available - blocking admin access', {
      adminApp: !!adminApp,
      hasError: !!initializationError,
      lockdown: securityLockdown,
      errorMessage: initializationError?.message
    });
  }
  
  return isAvailable;
};

function tryInitializeAdmin() {
  if (initialized) return;
  
  try {
    // Dynamic import to avoid loading Firebase Admin SDK unless needed
    const { initializeApp, getApps, getApp, cert } = require('firebase-admin/app');
    
    if (getApps().length > 0) {
      adminApp = getApp();
      logAdmin('info', 'Using existing Firebase Admin app');
    } else {
      logAdmin('info', 'Initializing Firebase Admin SDK with explicit credentials');
      
      // SECURITY: Always use explicit credentials - NO FALLBACKS
      const adminConfig: any = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      };

      // PRODUCTION: Explicit credential validation
      if (process.env.NODE_ENV === 'production') {
        if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
          throw new Error('CRITICAL: Firebase Admin credentials missing in production');
        }
        
        adminConfig.credential = cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        
        logAdmin('info', 'Production: Firebase Admin SDK initialized with explicit credentials');
      } else {
        // DEVELOPMENT: Use service account key if provided
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (serviceAccount) {
          try {
            const serviceAccountData = JSON.parse(serviceAccount);
            adminConfig.credential = cert(serviceAccountData);
            logAdmin('info', 'Development: Firebase Admin SDK initialized with service account key');
          } catch (parseError) {
            throw new Error('Invalid service account JSON format');
          }
        } else {
          throw new Error('Development: Firebase service account key required for admin functionality');
        }
      }

      // SECURITY: Validate that all required config is present
      const requiredConfigKeys = ['projectId', 'credential'];
      const missingConfig = requiredConfigKeys.filter(key => !adminConfig[key]);
      if (missingConfig.length > 0) {
        throw new Error(`Firebase Admin config missing: ${missingConfig.join(', ')}`);
      }

      adminApp = initializeApp(adminConfig);
      logAdmin('info', 'Firebase Admin SDK initialized successfully');
      
      // SECURITY: Connection test will be performed on first use
      // (Removed immediate test to avoid async/await in initialization chain)
    }
  } catch (error) {
    const errorMsg = `CRITICAL: Firebase Admin SDK initialization failed: ${(error as Error).message}`;
    logAdmin('error', errorMsg);
    initializationError = error as Error;
    adminApp = null;
    
    // SECURITY LOCKDOWN: If Firebase Admin fails in production, block everything
    if (process.env.NODE_ENV === 'production') {
      securityLockdown = true;
      throw error; // Fail fast in production
    }
  }
  
  initialized = true;
}

// NEW: Test Firebase connection to ensure it's working
export async function testFirebaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!adminApp) {
      return { success: false, error: 'Admin app not initialized' };
    }
    
    const { getAuth } = require('firebase-admin/auth');
    const adminAuth = getAuth(adminApp);
    
    // Test by creating a custom token (doesn't actually create a user)
    const testUid = 'connection-test-' + Date.now();
    await adminAuth.createCustomToken(testUid);
    
    logAdmin('info', 'Firebase Admin SDK connection test successful');
    return { success: true };
  } catch (error) {
    const errorMessage = `Firebase connection test failed: ${(error as Error).message}`;
    logAdmin('error', 'Firebase Admin SDK connection test failed', error);
    return { success: false, error: errorMessage };
  }
}

// Export services with lazy initialization and error handling
export const getAdminAuth = () => {
  if (!isAdminAvailable()) {
    throw new Error('Firebase Admin not available: ' + (initializationError?.message || 'Not initialized'));
  }
  const { getAuth } = require('firebase-admin/auth');
  return getAuth(adminApp);
};

export const getAdminStorage = () => {
  if (!isAdminAvailable()) {
    throw new Error('Firebase Admin not available: ' + (initializationError?.message || 'Not initialized'));
  }
  const { getStorage } = require('firebase-admin/storage');
  return getStorage(adminApp);
};

export const getAdminFirestore = () => {
  if (!isAdminAvailable()) {
    throw new Error('Firebase Admin not available: ' + (initializationError?.message || 'Not initialized'));
  }
  const { getFirestore } = require('firebase-admin/firestore');
  return getFirestore(adminApp);
};

export const getAdminApp = () => {
  if (!isAdminAvailable()) {
    throw new Error('Firebase Admin not available: ' + (initializationError?.message || 'Not initialized'));
  }
  return adminApp;
}; 