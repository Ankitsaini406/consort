const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { cert } = require('firebase-admin/app');

// Initialize Firebase Admin SDK
const app = initializeApp({
    credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});

const db = getFirestore(app);

async function migrateProductsToPortfolio() {
    try {
        console.log('🔍 Checking for products in "products" collection...');
        
        // Get all documents from products collection
        const productsSnapshot = await db.collection('products').get();
        
        if (productsSnapshot.empty) {
            console.log('✅ No products found in "products" collection');
            return;
        }
        
        console.log(`📦 Found ${productsSnapshot.docs.length} products to migrate`);
        
        // Check if portfolio collection already has data
        const portfolioSnapshot = await db.collection('portfolio').get();
        console.log(`📁 Portfolio collection currently has ${portfolioSnapshot.docs.length} documents`);
        
        const batch = db.batch();
        let migratedCount = 0;
        
        for (const doc of productsSnapshot.docs) {
            const data = doc.data();
            const portfolioRef = db.collection('portfolio').doc(doc.id);
            
            // Check if document already exists in portfolio
            const portfolioDoc = await portfolioRef.get();
            if (portfolioDoc.exists) {
                console.log(`⚠️  Document ${doc.id} already exists in portfolio, skipping...`);
                continue;
            }
            
            // Add to batch for migration
            batch.set(portfolioRef, {
                ...data,
                migratedAt: new Date(),
                migratedFrom: 'products'
            });
            
            migratedCount++;
            console.log(`📋 Queued for migration: ${data.productName || doc.id}`);
        }
        
        if (migratedCount > 0) {
            console.log(`🚀 Migrating ${migratedCount} products to portfolio collection...`);
            await batch.commit();
            console.log('✅ Migration completed successfully!');
            
            console.log('\n📊 Migration Summary:');
            console.log(`   • Products migrated: ${migratedCount}`);
            console.log(`   • Total in portfolio: ${portfolioSnapshot.docs.length + migratedCount}`);
            console.log('\n⚠️  Note: Original products collection is preserved for safety');
            console.log('   You can manually delete it after verifying the migration');
        } else {
            console.log('✅ No migration needed - all products already in portfolio');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

async function checkCollections() {
    try {
        console.log('\n🔍 Collection Status Check:');
        
        // Check products collection
        const productsSnapshot = await db.collection('products').get();
        console.log(`   • products: ${productsSnapshot.docs.length} documents`);
        
        // Check portfolio collection  
        const portfolioSnapshot = await db.collection('portfolio').get();
        console.log(`   • portfolio: ${portfolioSnapshot.docs.length} documents`);
        
        if (portfolioSnapshot.docs.length > 0) {
            console.log('\n📋 Sample portfolio document:');
            const sampleDoc = portfolioSnapshot.docs[0];
            const data = sampleDoc.data();
            console.log(`   • ID: ${sampleDoc.id}`);
            console.log(`   • Product Name: ${data.productName || 'N/A'}`);
            console.log(`   • Created: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
            console.log(`   • Draft: ${data.isDraft || false}`);
        }
        
    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

// Main execution
async function main() {
    const command = process.argv[2];
    
    if (command === 'check') {
        await checkCollections();
    } else if (command === 'migrate') {
        await migrateProductsToPortfolio();
    } else {
        console.log('Usage:');
        console.log('  node migrate-products-to-portfolio.js check    # Check collection status');
        console.log('  node migrate-products-to-portfolio.js migrate  # Migrate products to portfolio');
    }
    
    process.exit(0);
}

main().catch(console.error); 