// Set Firebase custom claims for admin users
// Run with: node scripts/set-admin-claims.mjs

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔥 Firebase Admin Claims Setup\n');

// Initialize Firebase Admin SDK
try {
    if (getApps().length === 0) {
        console.log('🔧 Initializing Firebase Admin SDK...');
        
        // Check required environment variables
        const requiredEnvVars = {
            FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
            FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        };

        console.log('📋 Environment variables status:');
        for (const [key, value] of Object.entries(requiredEnvVars)) {
            console.log(`  ${key}: ${value ? '✅ Present' : '❌ Missing'}`);
        }

        if (!requiredEnvVars.FIREBASE_PRIVATE_KEY || !requiredEnvVars.FIREBASE_CLIENT_EMAIL || !requiredEnvVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            throw new Error('❌ Firebase Admin SDK environment variables are missing');
        }

        // Initialize with service account credentials
        initializeApp({
            credential: cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
        
        console.log('✅ Firebase Admin SDK initialized successfully\n');
    } else {
        console.log('✅ Firebase Admin SDK already initialized\n');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.log('\n💡 Make sure your .env file has the correct Firebase Admin credentials');
    process.exit(1);
}

// Admin user to set claims for
const ADMIN_UID = '9IYkZfqHKZfuPJljqTlzFuRFyS83';
const ADMIN_EMAIL = 'admin@consortdigital.com';

async function setAdminClaims() {
    try {
        const auth = getAuth();
        
        console.log('👑 Setting admin claims...');
        console.log(`   UID: ${ADMIN_UID}`);
        console.log(`   Email: ${ADMIN_EMAIL}\n`);
        
        // Verify user exists first
        console.log('🔍 Verifying user exists...');
        const userRecord = await auth.getUser(ADMIN_UID);
        console.log(`✅ User found: ${userRecord.email}`);
        
        // Set custom claims
        console.log('🔧 Setting custom claims...');
        await auth.setCustomUserClaims(ADMIN_UID, {
            admin: true
        });
        
        console.log('✅ Custom claims set successfully!');
        
        // Verify claims were set
        console.log('🔍 Verifying claims...');
        const updatedUser = await auth.getUser(ADMIN_UID);
        console.log('📋 Current custom claims:', JSON.stringify(updatedUser.customClaims, null, 2));
        
        if (updatedUser.customClaims?.admin === true) {
            console.log('\n🎉 SUCCESS! Admin claims have been set correctly.');
            console.log('\n📝 Next steps:');
            console.log('1. User must sign out and sign back in for claims to take effect');
            console.log('2. Test at: http://localhost:3001/firebase-auth-test');
            console.log('3. Click "🧪 Test Custom Claims" to verify');
            console.log('4. Try uploading files in admin panel');
        } else {
            console.log('\n⚠️ WARNING: Claims may not have been set correctly');
        }
        
    } catch (error) {
        console.error('❌ Error setting admin claims:', error.message);
        
        if (error.code === 'auth/user-not-found') {
            console.log('💡 User not found. Make sure the UID is correct.');
        } else if (error.code === 'auth/invalid-uid') {
            console.log('💡 Invalid UID format.');
        } else {
            console.log('💡 Check your Firebase Admin SDK credentials and permissions.');
        }
        
        process.exit(1);
    }
}

// Run the script
setAdminClaims(); 