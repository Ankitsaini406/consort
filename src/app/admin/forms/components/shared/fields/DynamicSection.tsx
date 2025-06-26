'use client';

import React, { useState } from 'react';
import { FeatherPlus, FeatherX } from "@subframe/core";
import { IconSelectField } from './IconSelectField';
import { RichTextEditorField } from './RichTextEditorField';
import { Button3 } from "@/ui/components/Button3";
import { FormInput } from './FormInput';
import { FormTextArea } from './FormTextArea';
import { FormDateField } from './FormDateField';
import { FormFileUpload } from './FormFileUpload';
import { FormLabel } from './FormLabel';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/ui/multi-select";
import { FormField, CustomArrayFieldProps } from '@/app/admin/forms/types';

interface DynamicSectionProps extends CustomArrayFieldProps<Record<string, unknown>> {
    field: FormField;
}

function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
    field,
    items = [],
    addItem,
    removeItem,
    updateItem,
    error,
    formData
}) => {
    const {
        itemFields = [],
        maxItems = 10,
        minItems = 0,
        addButtonText = "Add Item",
        removeButtonText = "Remove",
        itemTitle = "Item"
    } = field;

    const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);

    const handleAddItem = () => {
        if (items.length >= maxItems) return;
        
        // Create default values for new item based on itemFields
        const defaultItem: Record<string, unknown> = {};
        itemFields.forEach(itemField => {
            // Set default values based on field type
            switch (itemField.type) {
                case 'multi-select':
                    defaultItem[itemField.id] = [];
                    break;
                case 'file':
                    defaultItem[itemField.id] = itemField.multiple ? [] : null;
                    break;
                case 'rich-text':
                    defaultItem[itemField.id] = '';
                    break;
                default:
                    defaultItem[itemField.id] = '';
            }
        });
        
        const newIndex = items.length;
        addItem(defaultItem);
        
        // Set the newly added index for animation
        setNewlyAddedIndex(newIndex);
        
        // Clear the animation after 1 second
        setTimeout(() => {
            setNewlyAddedIndex(null);
        }, 1000);
    };

    const handleUpdateField = (itemIndex: number, fieldId: string, value: unknown) => {
        updateItem(itemIndex, (currentItem: Record<string, unknown>) => ({
            ...currentItem,
            [fieldId]: value
        }));
    };

    const renderField = (itemField: FormField, itemIndex: number, itemValue: Record<string, unknown>) => {
        const fieldValue = itemValue[itemField.id];
        const fieldId = `${field.id}-${itemIndex}-${itemField.id}`;

        const commonProps = {
            id: fieldId,
            label: itemField.label,
            placeholder: itemField.placeholder,
            required: itemField.validation?.required,
            className: itemField.className,
            compact: itemField.compact
        };

        switch (itemField.type) {
            case 'input':
                return (
                    <FormInput
                        {...commonProps}
                        type="text"
                        value={fieldValue as string || ''}
                        onChange={(val: string) => handleUpdateField(itemIndex, itemField.id, val)}
                        maxLength={itemField.validation?.maxLength}
                    />
                );
            
            case 'textarea':
                return (
                    <FormTextArea
                        {...commonProps}
                        value={fieldValue as string || ''}
                        onChange={(val: string) => handleUpdateField(itemIndex, itemField.id, val)}
                        maxLength={itemField.validation?.maxLength}
                    />
                );
            
            case 'date':
                return (
                    <FormDateField
                        {...commonProps}
                        value={fieldValue as string || ''}
                        onChange={(val: string) => handleUpdateField(itemIndex, itemField.id, val)}
                        min={itemField.validation?.min ? String(itemField.validation.min) : undefined}
                        max={itemField.validation?.max ? String(itemField.validation.max) : undefined}
                    />
                );
            
            case 'file':
                // Handle existing file URLs for dynamic sections (like marketing highlights visuals)
                let existingFileUrls: string[] = [];
                if (itemField.id === 'visuals') {
                    // For marketing highlights visuals, check if there are existing visualUrls
                    const currentItem = items[itemIndex] as any;
                    existingFileUrls = currentItem?.visualUrls || [];
                } else if (itemField.id === 'sectionImage') {
                    // For section images in posts/resources, check if there are existing sectionImageUrls
                    const currentItem = items[itemIndex] as any;
                    const existingUrl = currentItem?.sectionImageUrl;
                    existingFileUrls = existingUrl ? [existingUrl] : [];
                }

                return (
                    <FormFileUpload
                        {...commonProps}
                        accept={itemField.accept || ''}
                        multiple={itemField.multiple}
                        maxFiles={itemField.maxFiles}
                        value={fieldValue as File | File[] | null}
                        onChange={(files: File[] | null) => {
                            // If multiple is false, pass the single file or null. Otherwise, pass the array.
                            const valueToUpdate = itemField.multiple ? files : (files?.[0] || null);
                            handleUpdateField(itemIndex, itemField.id, valueToUpdate);
                        }}
                        onExistingFileRemove={(originalIndex: number) => {
                            // Handle existing file removal for marketing highlights visuals
                            if (itemField.id === 'visuals') {
                                // Create removal tracking key for this specific highlight item
                                const removalKey = `marketingHighlights[${itemIndex}].visuals_removedExistingFiles`;
                                const currentRemovedFiles = (formData as any)[removalKey] || [];
                                const updatedRemovedFiles = [...currentRemovedFiles, originalIndex];
                                
                                // Update form data with removal tracking
                                // Note: This is a bit of a hack, but necessary for dynamic sections
                                // We'll store the removal info in a special field that gets cleaned up later
                                (formData as any)[removalKey] = updatedRemovedFiles;
                            }
                        }}
                        compact={itemField.compact}
                        existingFileUrls={existingFileUrls}
                    />
                );
            
            case 'select':
                return (
                    <div className="flex flex-col gap-2 w-full">
                        {!itemField.compact && (
                            <FormLabel htmlFor={fieldId} required={itemField.validation?.required}>
                                {itemField.label}
                            </FormLabel>
                        )}
                        <Select onValueChange={(val: string) => handleUpdateField(itemIndex, itemField.id, val)} value={fieldValue as string || ''}>
                            <SelectTrigger className={cn(
                                itemField.className,
                                itemField.compact && itemField.validation?.required ? 'border-l-4 border-l-orange-400' : ''
                            )}>
                                <SelectValue placeholder={
                                    itemField.compact && itemField.validation?.required 
                                        ? `${itemField.placeholder || itemField.label} *` 
                                        : itemField.placeholder || (itemField.compact ? itemField.label : "Select...")
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {itemField.options?.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                );
            
            case 'icon-select':
                return (
                    <IconSelectField
                        id={fieldId}
                        label={itemField.label}
                        value={fieldValue as string || ''}
                        onChange={(val: string) => handleUpdateField(itemIndex, itemField.id, val)}
                        options={itemField.options || []}
                        placeholder={itemField.placeholder}
                        required={itemField.validation?.required}
                        compact={itemField.compact}
                        className={itemField.className}
                    />
                );

            case 'multi-select':
                // Check if this should behave as single-select (for searchable icon fields)
                const isSingleSelect = itemField.id === 'icon' || itemField.maxFiles === 1;
                
                if (isSingleSelect) {
                    // Handle as single-select with search capability
                    const currentValue = fieldValue as string || '';
                    return (
                        <div className="flex flex-col w-full">
                            {!itemField.compact && (
                                <FormLabel htmlFor={fieldId} required={itemField.validation?.required}>
                                    {itemField.label}
                                </FormLabel>
                            )}
                            <MultiSelector
                                values={currentValue ? [currentValue] : []}
                                onValuesChange={(values: string[]) => {
                                    // Only take the first/last selected value for single-select
                                    const newValue = values.length > 0 ? values[values.length - 1] : '';
                                    handleUpdateField(itemIndex, itemField.id, newValue);
                                }}
                                loop
                                maxItems={itemField.maxItems}
                                className={cn(
                                    'w-full', 
                                    itemField.className,
                                    itemField.compact && itemField.validation?.required ? 'border-l-4 border-l-orange-400' : ''
                                )}
                            >
                                <MultiSelectorTrigger>
                                    <MultiSelectorInput placeholder={
                                        itemField.compact && itemField.validation?.required 
                                            ? `${itemField.placeholder || itemField.label} *` 
                                            : itemField.placeholder || (itemField.compact ? itemField.label : "Search and select...")
                                    } />
                                </MultiSelectorTrigger>
                                <MultiSelectorContent>
                                    <MultiSelectorList>
                                        {itemField.options?.map(opt => (
                                            <MultiSelectorItem key={opt.value} value={opt.value}>{opt.label}</MultiSelectorItem>
                                        ))}
                                    </MultiSelectorList>
                                </MultiSelectorContent>
                            </MultiSelector>
                        </div>
                    );
                } else {
                    // Handle as normal multi-select
                    return (
                        <div className="flex flex-col w-full">
                            {!itemField.compact && (
                                <FormLabel htmlFor={fieldId} required={itemField.validation?.required}>
                                    {itemField.label}
                                </FormLabel>
                            )}
                            <MultiSelector
                                values={(fieldValue as string[] | undefined) || []}
                                onValuesChange={(values: string[]) => handleUpdateField(itemIndex, itemField.id, values)}
                                loop
                                maxItems={itemField.maxItems}
                                className={cn(
                                    'w-full', 
                                    itemField.className,
                                    itemField.compact && itemField.validation?.required ? 'border-l-4 border-l-orange-400' : ''
                                )}
                            >
                                <MultiSelectorTrigger>
                                    <MultiSelectorInput placeholder={
                                        itemField.compact && itemField.validation?.required 
                                            ? `${itemField.placeholder || itemField.label} *` 
                                            : itemField.placeholder || (itemField.compact ? itemField.label : "Select...")
                                    } />
                                </MultiSelectorTrigger>
                                <MultiSelectorContent>
                                    <MultiSelectorList>
                                        {itemField.options?.map(opt => (
                                            <MultiSelectorItem key={opt.value} value={opt.value}>{opt.label}</MultiSelectorItem>
                                        ))}
                                    </MultiSelectorList>
                                </MultiSelectorContent>
                            </MultiSelector>
                        </div>
                    );
                }
            
            case 'rich-text':
                return (
                    <div className="flex flex-col w-full">
                        {!itemField.compact && (
                            <FormLabel htmlFor={fieldId} required={itemField.validation?.required}>
                                {itemField.label}
                            </FormLabel>
                        )}
                        <RichTextEditorField
                            field={itemField}
                            value={fieldValue as string || ''}
                            onChange={(id: string, value: string) => handleUpdateField(itemIndex, itemField.id, value)}
                            onBlur={() => {}}
                            formData={formData}
                        />
                    </div>
                );

            default:
                return <div>Unsupported field type: {itemField.type}</div>;
        }
    };

    const getColSpanClass = (colSpan?: number): string => {
        switch (colSpan) {
            case 1: return 'col-span-1';
            case 2: return 'col-span-2';
            case 3: return 'col-span-3';
            case 4: return 'col-span-4';
            default: return 'col-span-4';
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-2">
                {items.map((item, index) => {
                    const isNewlyAdded = newlyAddedIndex === index;
                    
                    const animationClasses = isNewlyAdded 
                        ? "bg-neutral-50 transition-colors duration-1000 ease-out rounded-sm" 
                        : "bg-transparent";
                    
                    return (
                        <div 
                            key={index} 
                            className={`relative ${animationClasses} p-2`}
                        >
                            {/* Header with title and remove button */}
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-caption font-bold font-body-bold text-subtext-color">
                                    {itemTitle} {index + 1}
                                </h4>
                                {items.length > minItems && (
                                    <Button3
                                        variant="destructive-tertiary"
                                        size="small"
                                        onClick={() => removeItem(index)}
                                    >
                                        <FeatherX className="w-4 h-4 mr-1" />
                                        {removeButtonText}
                                    </Button3>
                                )}
                            </div>

                            {/* Fields grid - same as regular form fields */}
                            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                                {itemFields.map((itemField) => (
                                    <div key={itemField.id} className={getColSpanClass(itemField.colSpan)}>
                                        {renderField(itemField, index, item as Record<string, unknown>)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add button */}
            {items.length < maxItems && (
                <Button3
                    variant="brand-secondary"
                    className="mt-6"
                    iconRight={<FeatherPlus />}
                    onClick={handleAddItem}
                >
                    {addButtonText}
                </Button3>
            )}

            {/* Error display */}
            {error && (
                <div className="mt-2 text-red-500 text-sm pl-2">
                    {error}
                </div>
            )}

            {/* Item count info */}
            <div className="mt-2 text-sm text-gray-500 pl-2">
                {items.length} of {maxItems} {itemTitle.toLowerCase()}s
                {minItems > 0 && ` (minimum ${minItems} required)`}
            </div>
        </div>
    );
}; 