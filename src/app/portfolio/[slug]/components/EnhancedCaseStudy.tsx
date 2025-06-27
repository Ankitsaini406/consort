'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import CaseStudiesSection from '@/components/CaseStudySection';

interface EnhancedCaseStudyProps {
    globalTags: string[];
    productName: string;
}

interface FirebaseResource {
    slug: string;
    resourceTitle: string;
    headline: string;
    heroImageUrl: string;
    globalTags: string[];
    resourceType: string;
    clientCompanies?: string[];
    industryUseCases?: string[];
    isDraft: boolean;
}

export default function EnhancedCaseStudy({ globalTags, productName }: EnhancedCaseStudyProps) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true);
                const col = collection(db, 'resources');

                // Query for case studies that match the global tags and are not drafts
                const q = globalTags.length
                    ? query(
                        col,
                        where('globalTags', 'array-contains-any', globalTags),
                        where('resourceType', '==', 'case-study'),
                        where('isDraft', '==', false)
                    )
                    : query(
                        col,
                        where('resourceType', '==', 'case-study'),
                        where('isDraft', '==', false)
                    );

                const snap = await getDocs(q);
                const docs = snap.docs.map(doc => {
                    const data = doc.data() as FirebaseResource;

                    // Map Firebase data to CaseStudiesSection format
                    return {
                        image: data.heroImageUrl || '/Consort-Blue.svg',
                        title: data.resourceTitle || 'Untitled Case Study',
                        description: data.headline || 'Case study description',
                        url: `/resources/${data.slug}`,
                        badges: [
                            { text: "Case Study", variant: "warning" }
                        ]
                    };
                });

                setItems(docs);
            } catch (err) {
                console.error('Error fetching case studies:', err);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [globalTags]);

    if (loading) {
        return (
            <div className="flex w-full justify-center items-center p-8">
                <div className="animate-pulse text-neutral-500">Loading case studies...</div>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <CaseStudiesSection
            title={productName}
            items={items}
        />
    );
} 