import React, { useState } from 'react';
import { FeatherPlus, FeatherX } from "@subframe/core";
import { Button3 } from "@/ui/components/Button3";
import { FormInput } from '@/app/admin/forms/components/shared/fields/FormInput';
import { KeyFeature } from '../types';
import { FEATURE_TYPES } from '../constants';
import { AnimatedSection } from './AnimatedSection';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormLabel } from '@/app/admin/forms/components/shared/fields/FormLabel';

interface KeyFeaturesSectionProps {
    features: KeyFeature[];
    onFeatureChange: (id: string, field: keyof KeyFeature, value: string) => void;
    onAddFeature: () => void;
}

export const KeyFeaturesSection: React.FC<KeyFeaturesSectionProps> = ({
    features,
    onFeatureChange,
    onAddFeature
}) => {
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    const handleAddFeature = () => {
        onAddFeature();
        // Set the ID of the new feature
        setLastAddedId(`${features.length + 1}`);
        // Reset the lastAddedId after animation
        setTimeout(() => setLastAddedId(null), 1000);
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {features.map((feature, index) => (
                <AnimatedSection key={feature.id} isNew={feature.id === lastAddedId}>
                    <div className="flex w-full items-start gap-6 p-2">
                        <div className="flex flex-col gap-2 w-[180px]">
                            <div className="space-y-4">
                                <FormLabel htmlFor={`feature-${feature.id}-icon`}>
                                    Feature {index + 1} Icon
                                </FormLabel>
                                <Select
                                    value={feature.type}
                                    onValueChange={(value) => onFeatureChange(feature.id, 'type', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Feature Icons</SelectLabel>
                                            {FEATURE_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 grow">
                            <FormInput
                                id={`feature-${feature.id}`}
                                label={`Key Feature ${index + 1}`}
                                placeholder="Enter key feature text"
                                value={feature.content}
                                onChange={(value) => onFeatureChange(feature.id, 'content', value)}
                            />
                        </div>
                    </div>
                </AnimatedSection>
            ))}

            <Button3
                variant="brand-secondary"
                iconRight={<FeatherPlus />}
                onClick={handleAddFeature}
            >
                Add New Key Feature
            </Button3>
        </div>
    );
}; 