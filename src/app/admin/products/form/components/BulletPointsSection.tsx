'use client';

import React, { useState } from 'react';
import { FeatherPlus } from "@subframe/core";
import { Button3 } from "@/ui/components/Button3";
import { FormInput } from '@/app/admin/forms/components/shared/fields/FormInput';
import { BulletPoint } from '../types';
import { AnimatedSection } from './AnimatedSection';
import { FormField } from '@/app/admin/forms/types';

// Define props explicitly by picking from CustomArrayFieldProps
interface BulletPointsSectionProps {
    items: BulletPoint[]; // Use specific type here
    addItem: (itemDefaults?: Partial<Omit<BulletPoint, 'id'>> | (() => Partial<Omit<BulletPoint, 'id'>>)) => void;
    removeItem: (indexOrId: number | string) => void;
    updateItem: (indexOrId: number | string, updatedItemPart: Partial<BulletPoint> | ((item: BulletPoint) => Partial<BulletPoint>)) => void;
    field: FormField;
    formData?: Record<string, unknown>;
}

const newBulletPointDefault: () => Omit<BulletPoint, 'id'> = () => ({
    content: "",
});

export const BulletPointsSection: React.FC<BulletPointsSectionProps> = ({
    items,
    addItem,
    removeItem,
    updateItem,
    field,
}) => {
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    const handleAddBulletPoint = () => {
        const newItem = newBulletPointDefault();
        addItem(newItem); 
        // Animation logic might still be tricky due to ID generation in parent
        setTimeout(() => setLastAddedId(null), 1000);
    };

    const handleBulletPointChange = (indexOrId: number | string, newContent: string) => {
        updateItem(indexOrId, { content: newContent });
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {items.map((point, index) => (
                <AnimatedSection key={point.id || index} isNew={point.id === lastAddedId}>
                    <div className="flex w-full items-end gap-2 p-2">
                        <FormInput
                            id={`${field.id}-${point.id || index}`}
                            label={`Bullet Point ${index + 1}`}
                            placeholder="Enter bullet point"
                            value={point.content}
                            onChange={(value: string) => handleBulletPointChange(point.id || index, value)}
                        />
                        <Button3
                            variant="destructive-primary"
                            onClick={() => removeItem(point.id || index)} 
                        >
                            Remove
                        </Button3>
                    </div>
                </AnimatedSection>
            ))}

            <Button3
                variant="brand-secondary"
                iconRight={<FeatherPlus />}
                onClick={handleAddBulletPoint}
            >
                <span className='text-caption-bold'>Add New Bullet Point</span>
            </Button3>
        </div>
    );
}; 