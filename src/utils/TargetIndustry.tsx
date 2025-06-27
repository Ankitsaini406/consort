'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { db } from '@/firebase/firebaseconfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Industry {
    slug: string;
    industryName: string;
    industryIconUrl: string;
}

export default function TargetIndustries({ slugs }: { slugs: string[] }) {
    const [industries, setIndustries] = useState<Industry[]>([]);

    useEffect(() => {
        const fetchIndustries = async () => {
            if (!slugs.length) return;
            try {
                const industriesRef = collection(db, 'industries');
                const q = query(industriesRef, where('slug', 'in', slugs));
                const snapshot = await getDocs(q);

                const results = snapshot.docs.map((doc) => ({
                    slug: doc.data().slug,
                    industryName: doc.data().industryName,
                    industryIconUrl: doc.data().industryIconUrl,
                }));

                setIndustries(results);
            } catch (err) {
                console.error('Error fetching industries:', err);
            }
        };

        fetchIndustries();
    }, [slugs]);

    if (!industries.length) return null;

    return (
        <div className="flex flex-wrap gap-6 justify-center">
            {industries.map((industry) => (
                <div key={industry.slug} className="flex flex-col items-center justify-between self-stretch">
                    {industry.industryIconUrl && (
                        <Image
                            alt={industry.industryName}
                            className="max-h-[40px] w-11 flex-none mobile:h-auto mobile:max-h-[36px] mobile:w-full mobile:max-w-[36px] mobile:flex-none"
                            src={industry.industryIconUrl}
                            width={44}
                            height={40}
                        />
                    )}
                    <p className="text-caption-bold font-caption-bold text-consort-blue mt-2">
                        {industry.industryName}
                    </p>
                </div>
            ))}
        </div>
    );
}