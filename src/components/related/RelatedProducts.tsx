'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import RelatedLayout from './RelatedLayout';
import ProductCardSkeleton from './ProductCardSkeleton';

interface RelatedItem {
    id: string;
    productName: string;
    productOverview: string;
    headline: string;
    productGalleryUrls: string[];
    globalTags: string[];
}

interface MappedItem {
    image: string;
    title: string;
    description: string;
    url: string;
}

export default function RelatedProducts({ tags }: { tags: string[] }) {
    const [relatedItems, setRelatedItems] = useState<MappedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            setLoading(true);
            try {
                const ref = collection(db, 'products');
                const q = tags.length
                    ? query(ref, 
                        where('globalTags', 'array-contains-any', tags),
                        where('isDraft', '==', false) // ✅ Filter out drafts from public view
                      )
                    : query(ref, where('isDraft', '==', false)); // ✅ Filter out drafts from public view

                const snapshot = await getDocs(q);
                const products: RelatedItem[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<RelatedItem, 'id'>),
                }));

                const mapped: MappedItem[] = products.map((p) => ({
                    image: p.productGalleryUrls?.[0] || '/icons/Placeholder.png', // Enhanced fallback image - will be routed to thumbnail in RelatedLayout
                    title: p.productName,
                    description: p.headline,
                    url: `/products/${p.id}`, // or use slug if needed
                }));

                setRelatedItems(mapped);
            } catch (error) {
                console.error('Error fetching related products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [tags]);

    // Show skeleton during loading
    if (loading) {
        return <ProductCardSkeleton rows={{ sm: 1, md: 1, lg: 1 }} title="Related Products & Accessories" />;
    }

    if (!relatedItems.length) return null;

    return (
        <RelatedLayout
            items={relatedItems}
            title="Related Products & Accessories"
            paginationPosition="bottom"
            rows={{ sm: 1, md: 1, lg: 1 }}
        />
    );
}
