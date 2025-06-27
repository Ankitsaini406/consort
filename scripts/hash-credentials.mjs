import bcrypt from 'bcryptjs';

/**
 * Utility script to hash passwords and passkeys for existing users
 * Run this script to generate hashed versions of your credentials
 * 
 * Usage: node scripts/hash-credentials.mjs
 */

async function hashCredentials() {
    console.log('🔐 Credential Hashing Utility\n');
    
    // Example credentials - replace with your actual user credentials
    const users = [
        {
            email: 'admin@example.com',
            plainPasskey: 'admin123',
            plainPassword: 'securePassword123'
        },
        // Add more users here as needed
    ];

    console.log('Hashing credentials...\n');

    for (const user of users) {
        try {
            const hashedPasskey = await bcrypt.hash(user.plainPasskey, 12);
            const hashedPassword = await bcrypt.hash(user.plainPassword, 12);

            console.log(`User: ${user.email}`);
            console.log(`Hashed Passkey: ${hashedPasskey}`);
            console.log(`Hashed Password: ${hashedPassword}`);
            console.log('---');
        } catch (error) {
            console.error(`Error hashing credentials for ${user.email}:`, error);
        }
    }

    console.log('\n✅ Hashing complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your Firestore users collection with the hashed values');
    console.log('2. Add a "passkey" field to each user document');
    console.log('3. Replace the plain "password" field with the hashed version');
    console.log('4. Test the new authentication flow');
}

// Run the hashing function
hashCredentials().catch(console.error); 