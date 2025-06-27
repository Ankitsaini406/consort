// Test Firebase Admin SDK with current environment variables
require('dotenv').config();

console.log('🔍 Testing Firebase Admin SDK Environment...');

// Check environment variables
const envVars = {
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Present' : 'Missing',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Present' : 'Missing',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Present' : 'Missing'
};

console.log('Environment Variables:', envVars);

if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log('Private key length:', process.env.FIREBASE_PRIVATE_KEY.length);
    console.log('Private key starts with:', process.env.FIREBASE_PRIVATE_KEY.substring(0, 50));
}

// Test Firebase Admin SDK initialization
async function testFirebaseAdmin() {
    try {
        console.log('\n🔧 Testing Firebase Admin SDK...');
        
        const admin = require('firebase-admin');
        
        if (admin.apps.length === 0) {
            const app = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log('✅ Firebase Admin SDK initialized successfully');
        }
        
        const auth = admin.auth();
        console.log('✅ Firebase Admin Auth instance created');
        
        // Try to list users (this will test if the credentials work)
        const listUsers = await auth.listUsers(1);
        console.log('✅ Firebase Admin SDK is working - can access user records');
        
    } catch (error) {
        console.error('❌ Firebase Admin SDK error:', error.message);
    }
}

testFirebaseAdmin(); 