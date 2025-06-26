const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase config - replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyDKdXNBl6xqWXYJl-EQ3OBQRZVXGZQGWvs",
    authDomain: "consortdigital-327d9.firebaseapp.com",
    projectId: "consortdigital-327d9",
    storageBucket: "consortdigital-327d9.firebasestorage.app",
    messagingSenderId: "1073654106900",
    appId: "1:1073654106900:web:5e1c4b8e9c6d1c8e9f1a2b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleTags() {
    console.log('🏷️  Adding sample tags to database...');
    
    try {
        // Sample Global Tags
        const globalTags = [
            'Innovation', 'Technology', 'Sustainability', 'Efficiency', 'Reliability'
        ];
        
        for (const tag of globalTags) {
            const slug = tag.toLowerCase().replace(/\s+/g, '-');
            await setDoc(doc(db, 'global-tags', slug), {
                label: tag,
                slug: slug,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'admin@consortdigital.com',
                updatedBy: 'admin@consortdigital.com',
                isDraft: false
            });
        }
        console.log(`✅ Added ${globalTags.length} global tags`);
        
        // Sample Product Brands
        const productBrands = [
            'ProMax Series', 'EliteCore', 'TechAdvance', 'PowerPlus', 'SmartLine'
        ];
        
        for (const brand of productBrands) {
            const slug = brand.toLowerCase().replace(/\s+/g, '-');
            await setDoc(doc(db, 'product-brands', slug), {
                label: brand,
                slug: slug,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'admin@consortdigital.com',
                updatedBy: 'admin@consortdigital.com',
                isDraft: false,
                imageUrl: '' // Empty for now
            });
        }
        console.log(`✅ Added ${productBrands.length} product brands`);
        
        // Sample Clients
        const clients = [
            'Acme Corporation', 'TechFlow Industries', 'Global Solutions Inc', 'Innovation Labs', 'Future Systems'
        ];
        
        for (const client of clients) {
            const slug = client.toLowerCase().replace(/\s+/g, '-');
            await setDoc(doc(db, 'clients', slug), {
                label: client,
                slug: slug,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'admin@consortdigital.com',
                updatedBy: 'admin@consortdigital.com',
                isDraft: false,
                imageUrl: '' // Empty for now
            });
        }
        console.log(`✅ Added ${clients.length} clients`);
        
        // Sample Industries
        const industries = [
            'Manufacturing', 'Healthcare', 'Telecommunications', 'Energy', 'Transportation'
        ];
        
        for (const industry of industries) {
            const slug = industry.toLowerCase().replace(/\s+/g, '-');
            await setDoc(doc(db, 'industries', slug), {
                label: industry,
                slug: slug,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'admin@consortdigital.com',
                updatedBy: 'admin@consortdigital.com',
                isDraft: false,
                imageUrl: '' // Empty for now
            });
        }
        console.log(`✅ Added ${industries.length} industries`);
        
        console.log('🎉 Sample tags added successfully!');
        console.log('📝 Now test the ProductForm and PostForm dropdowns');
        
    } catch (error) {
        console.error('❌ Error adding sample tags:', error);
    }
}

// Run the script
addSampleTags().then(() => {
    console.log('✅ Script completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
}); 