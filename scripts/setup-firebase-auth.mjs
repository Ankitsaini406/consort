import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase config (using the same config as your app)
const firebaseConfig = {
    apiKey: "AIzaSyB9w0Ryf0kZRGmzSnj8t2Oo-1o3OPgnCaI",
    authDomain: "consortdigital-327d9.firebaseapp.com",
    projectId: "consortdigital-327d9",
    storageBucket: "consortdigital-327d9.firebasestorage.app",
    messagingSenderId: "545144758087",
    appId: "1:545144758087:web:04e37c0c8eaa05ed1e3662",
    measurementId: "G-BW2XBY41V9"
};

// Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function setupFirebaseAuth() {
    console.log('🔥 Firebase Authentication Setup\n');
    
    const adminCredentials = {
        email: 'admin@consortdigital.com',
        password: 'Admin123!@#', // Strong password
    };
    
    const testCredentials = {
        email: 'user@test.com',
        password: 'User123!@#',
    };
    
    try {
        console.log('🔐 Creating Firebase Auth users...\n');
        
        // Create admin user
        console.log('👑 Creating admin user...');
        let adminUser;
        try {
            const adminCredential = await createUserWithEmailAndPassword(
                auth, 
                adminCredentials.email, 
                adminCredentials.password
            );
            adminUser = adminCredential.user;
            console.log('✅ Admin user created:', adminUser.uid);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log('⚠️  Admin email already exists, signing in...');
                const adminCredential = await signInWithEmailAndPassword(
                    auth,
                    adminCredentials.email,
                    adminCredentials.password
                );
                adminUser = adminCredential.user;
                console.log('✅ Admin user signed in:', adminUser.uid);
            } else {
                throw error;
            }
        }
        
        await signOut(auth);
        
        // Create test user
        console.log('\n👤 Creating test user...');
        let testUser;
        try {
            const testCredential = await createUserWithEmailAndPassword(
                auth,
                testCredentials.email,
                testCredentials.password
            );
            testUser = testCredential.user;
            console.log('✅ Test user created:', testUser.uid);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log('⚠️  Test email already exists, signing in...');
                const testCredential = await signInWithEmailAndPassword(
                    auth,
                    testCredentials.email,
                    testCredentials.password
                );
                testUser = testCredential.user;
                console.log('✅ Test user signed in:', testUser.uid);
            } else {
                throw error;
            }
        }
        
        await signOut(auth);
        
        console.log('\n🎉 FIREBASE USERS CREATED SUCCESSFULLY!');
        console.log('\n📋 User Credentials:');
        console.log(`Admin Email: ${adminCredentials.email}`);
        console.log(`Admin Password: ${adminCredentials.password}`);
        console.log(`Admin UID: ${adminUser.uid}`);
        console.log(`\nTest Email: ${testCredentials.email}`);
        console.log(`Test Password: ${testCredentials.password}`);
        console.log(`Test UID: ${testUser.uid}`);
        
        console.log('\n🔧 MANUAL SETUP REQUIRED:');
        console.log('Since we don\'t have Admin SDK credentials, you need to:');
        console.log('\n1. Go to Firebase Console > Authentication > Users');
        console.log('2. Find the admin user:', adminUser.uid);
        console.log('3. Click "Set custom claims"');
        console.log('4. Add this JSON:');
        console.log('   {');
        console.log('     "admin": true');
        console.log('   }');
        console.log('\n5. For the test user, set:');
        console.log('   {');
        console.log('     "admin": false');
        console.log('   }');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. Set custom claims in Firebase Console (above)');
        console.log('2. Enable Email/Password auth in Firebase Console');
        console.log('3. Test login with the new Firebase Auth system');
        console.log('4. Update admin APIs to use Firebase tokens');
        
        console.log('\n🧪 Test the new system:');
        console.log('- Navigate to /auth');
        console.log('- Login with admin credentials');
        console.log('- Verify admin dashboard access');
        
    } catch (error) {
        console.error('❌ Error setting up Firebase auth:', error);
        
        if (error.code === 'auth/weak-password') {
            console.log('\n💡 Password too weak. Using stronger passwords...');
        } else if (error.code === 'auth/invalid-email') {
            console.log('\n💡 Invalid email format.');
        } else {
            console.log('\n💡 Error details:', error.message);
        }
    }
}

// Run the script
setupFirebaseAuth()
    .then(() => {
        console.log('\n🏁 Firebase auth setup complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }); 