'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { Button3 } from '@/ui/components/Button3';

export default function CreateSampleDataPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');

    const createSampleData = async () => {
        setLoading(true);
        setStatus('Creating sample data...');
        
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
            setStatus('✅ Added global tags');
            
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
                    imageUrl: ''
                });
            }
            setStatus('✅ Added product brands');
            
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
                    imageUrl: ''
                });
            }
            setStatus('✅ Added clients');
            
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
                    imageUrl: ''
                });
            }
            
            setStatus('🎉 All sample data created successfully! You can now test the dropdowns in ProductForm and PostForm.');
            
        } catch (error) {
            console.error('Error creating sample data:', error);
            setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Sample Data</h1>
            
            <div className="mb-6 p-4 bg-blue-100 rounded">
                <p className="text-sm text-blue-800">
                    This will create sample data for Global Tags, Product Brands, Clients, and Industries 
                    to test the dropdown functionality in forms.
                </p>
            </div>

            <Button3
                onClick={createSampleData}
                disabled={loading}
                variant="brand-primary"
                size="large"
            >
                {loading ? 'Creating...' : 'Create Sample Data'}
            </Button3>

            {status && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                    <p className="text-sm">{status}</p>
                </div>
            )}

            <div className="mt-8 p-4 bg-yellow-100 rounded">
                <h3 className="font-semibold mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Click "Create Sample Data" above</li>
                    <li>Visit <code>/debug-tags</code> to verify data was created</li>
                    <li>Test the ProductForm at <code>/admin/products/form</code></li>
                    <li>Test the PostForm at <code>/admin/posts/form</code></li>
                    <li>Check that dropdowns are now populated</li>
                </ol>
            </div>
        </div>
    );
} 