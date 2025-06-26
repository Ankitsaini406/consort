'use client';

import React from 'react';
import DynamicFeatherIcon from '@/components/admin/DynamicFeatherIcon';
import { KeyFeatures, TryFeatures } from '@/types/types';

type KeyFeatureProps =
    | { type: 'product'; features: KeyFeatures[] }
    | { type: 'industry'; features: TryFeatures[] };

export default function KeyFeature(props: KeyFeatureProps) {
    if (!props.features || props.features.length === 0) return null;

    if (props.type === 'product') {
        return (
            <>
                {props.features.map((feature) => (
                    <div
                        key={feature.id}
                        className="flex grow shrink lg:min-w-[calc(50%-2rem)] basis-[calc(50%-2rem)] md:basis-[calc(25%-1rem)] mobile:basis-[calc(25%-2rem)] flex-col items-start gap-4 self-stretch rounded-md bg-brand-50 p-6 shadow-sm mobile:h-auto mobile:min-w-[128px] mobile:p-4"
                    >
                        <DynamicFeatherIcon
                            name={feature.icon}
                            className="text-heading-4 font-heading-4 text-consort-blue"
                        />
                        <h4 className="font-inter text-[18px] font-normal leading-6 text-consort-blue">
                            {feature.keyFeature}
                        </h4>
                    </div>
                ))}
            </>
        );
    }

    // For type === 'industry'
    return (
        <>
            {props.features.map((feature) => (
                <div
                    key={feature.id}
                    className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md bg-brand-50 p-6 shadow-sm mobile:h-auto mobile:min-w-[128px] mobile:p-4"
                >
                    <DynamicFeatherIcon
                        name={feature.icon}
                        className="text-heading-4 font-heading-4 text-consort-blue"
                    />
                    <h4 className="font-inter text-[18px] font-normal leading-6 text-consort-blue">
                        {feature.description}
                    </h4>
                </div>
            ))}
        </>
    );
}
