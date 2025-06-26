'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import CaseStudiesSection from './CaseStudySection';


interface FirestoreResource {
    slug: string;
    heroImage: string;
    resourceTitle: string;
    headline: string;
    globalTags?: string[];
}

export default function CaseStudy({ globalTags }: { globalTags: string[] }) {
    const [items, setItems] = useState<FirestoreResource[]>([]);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const col = collection(db, 'resources');
                const q = globalTags.length
                    ? query(col, 
                        where('globalTags', 'array-contains-any', globalTags),
                        where('isDraft', '==', false) // ✅ Filter out drafts from public view
                      )
                    : query(col, where('isDraft', '==', false)); // ✅ Filter out drafts from public view

                const snap = await getDocs(q);
                const docs = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        slug: data.slug,
                        heroImage: data.heroImage,
                        resourceTitle: data.resourceTitle || '',
                        headline: data.headline || '',
                        globalTags: data.globalTags || [],
                    };
                });
                setItems(docs);
            } catch (err) {
                console.error('Error fetching case studies:', err);
            }
        };

        fetchResources();
    }, [globalTags]);

    if (items.length === 0) return null;

    return (
        <CaseStudiesSection
            title="Case Studies"
            items={items}
        />
    );
}
