'use client';

import React, { useState } from 'react';
import { FeatherPlus } from "@subframe/core";
import { Button3 } from "@/ui/components/Button3";
import { FormInput } from '@/app/admin/forms/components/shared/fields/FormInput';
import { FormTextArea } from '@/app/admin/forms/components/shared/fields/FormTextArea';
import { FormFileUpload } from '@/app/admin/forms/components/shared/fields/FormFileUpload';
import { ProductHighlight } from '../types';
import { FILE_UPLOAD_CONFIG } from '../constants';
import { AnimatedSection } from './AnimatedSection';
import { FormField } from '@/app/admin/forms/types';

interface HighlightsSectionProps {
    items: ProductHighlight[]; 
    addItem: (itemDefaults?: Partial<Omit<ProductHighlight, 'id'>> | (() => Partial<Omit<ProductHighlight, 'id'>>)) => void;
    removeItem: (indexOrId: number | string) => void;
    updateItem: (indexOrId: number | string, updatedItemPart: Partial<ProductHighlight> | ((item: ProductHighlight) => Partial<ProductHighlight>)) => void;
    field: FormField; 
    formData?: Record<string, unknown>;
}

const newHighlightDefault: () => Omit<ProductHighlight, 'id'> = () => ({
    productName: '',
    briefHeadline: '',
    productPhotos: [],
});

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({
    items, 
    addItem,
    removeItem,
    updateItem,
    field,
}) => {
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    const handleAddHighlight = () => {
        const newItem = newHighlightDefault();
        addItem(newItem); 
        setTimeout(() => setLastAddedId(null), 1000); 
    };

    const handleHighlightChange = (indexOrId: number | string, itemField: keyof Omit<ProductHighlight, 'id' | 'productPhotos'>) => (value: string) => {
        updateItem(indexOrId, { [itemField]: value });
    };

    const handlePhotoChange = (indexOrId: number | string) => (files: File[] | null) => {
        updateItem(indexOrId, { productPhotos: files || [] });
    };

    const handleRemovePhoto = (highlightIndexOrId: number | string, photoIndex: number) => {
        const currentHighlight = typeof highlightIndexOrId === 'number' ? items[highlightIndexOrId] : items.find(h => h.id === highlightIndexOrId);
        if (currentHighlight && currentHighlight.productPhotos) {
            const updatedPhotos = currentHighlight.productPhotos.filter((_, pIdx) => pIdx !== photoIndex);
            updateItem(highlightIndexOrId, { productPhotos: updatedPhotos });
        }
    };

    return (
        <div className="w-full">
            {items.map((highlight, index) => (
                <AnimatedSection key={highlight.id || index} isNew={highlight.id === lastAddedId}>
                    <div className="flex w-full flex-col gap-6 pt-4 p-2">
                        <div className="flex flex-col gap-2 w-full">
                            <FormInput
                                id={`${field.id}-${highlight.id || index}-name`}
                                label={`Highlight ${index + 1}`}
                                placeholder="Enter product name"
                                value={highlight.productName}
                                onChange={handleHighlightChange(highlight.id || index, 'productName')}
                            />
                        </div>

                        <div className="flex w-full items-start gap-6">
                            <FormTextArea
                                id={`${field.id}-${highlight.id || index}-brief`}
                                label={`Highlight ${index + 1} Brief`}
                                placeholder="Enter brief headline"
                                value={highlight.briefHeadline}
                                onChange={handleHighlightChange(highlight.id || index, 'briefHeadline')}
                            />

                            <FormFileUpload
                                id={`${field.id}-${highlight.id || index}-photos`}
                                label="Upload Photo(s)"
                                accept={FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.accept} 
                                multiple 
                                maxFiles={FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.maxFiles}
                                value={highlight.productPhotos}
                                onChange={handlePhotoChange(highlight.id || index)}
                                onRemove={(photoIdx) => handleRemovePhoto(highlight.id || index, photoIdx)}
                            />
                        </div>
                    </div>
                    <Button3
                        variant="destructive-primary"
                        onClick={() => removeItem(highlight.id ?? index)}
                        className="mb-4"
                    >
                        Remove Highlight
                    </Button3>
                </AnimatedSection>
            ))}

            <Button3
                variant="brand-secondary"
                className="mt-4"
                iconRight={<FeatherPlus />}
                onClick={handleAddHighlight}
            >
                Add New Highlight
            </Button3>
        </div>
    );
}; 