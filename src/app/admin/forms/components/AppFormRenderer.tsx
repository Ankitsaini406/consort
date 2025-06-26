'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FormField, RenderedFieldProps, CustomArrayFieldProps, FormFieldType, FormFileUploadProps } from '../types';
import { useAppForm, UseAppFormProps } from '../hooks/useAppForm';
import { FormErrorBoundary } from './FormErrorBoundary';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Removed unused Input, Textarea from '@/components/ui'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/ui/multi-select";
// Updated import paths for base field components
import { FormFileUpload as BaseFormFileUpload, FormImageUpload, FormImageGallery } from './shared/fields';
import { FormInput as BaseFormInput } from './shared/fields/FormInput';
import { FormTextArea as BaseFormTextArea } from './shared/fields/FormTextArea';
import { FormDateField as BaseFormDateField } from './shared/fields/FormDateField';
import { FormLabel } from './shared/fields/FormLabel';
import { DynamicSection } from './shared/fields/DynamicSection';
import { RichTextEditorField } from './shared/fields/RichTextEditorField';
import { IconSelectField } from './shared/fields/IconSelectField';
// ReviewStep is used via config, linter might not see it. Keep for now.
// import { ReviewStep } from '@/app/admin/products/form/components/ReviewStep'; 

interface AppFormRendererProps<TData extends Record<string, unknown>> extends UseAppFormProps<TData> {
    fieldComponents?: Partial<Record<FormFieldType, React.FC<RenderedFieldProps<unknown> | CustomArrayFieldProps<unknown[]>>>>;
    StepProgressComponent?: React.FC<{ steps: Array<{ id: string | number; title: string; isCompleted: boolean; isActive: boolean }>; onStepClick: (stepId: string | number) => void; formTitle?: string; }>;
    StepCardComponent?: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; }>;
    FormActionsComponent?: React.FC<FormActionsProps>;
    customActionHandlers?: Record<string, (...args: unknown[]) => void>;
    onDataChange?: (data: TData) => void;
}

interface FormActionsProps {
    currentStep: number;
    totalSteps: number;
    isSubmitting: boolean;
    isCurrentStepValid: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: (isDraft?: boolean) => void;
    disableNext?: boolean;
}

const DefaultFieldRenderer: React.FC<RenderedFieldProps<unknown>> = ({ field, value, error, onChange, onBlur, formData }) => {
    const inputTextAreaProps = {
        id: field.id,
        value: (value as string) ?? '',
        onChange: (val: string) => onChange(field.id, val),
        onBlur: () => onBlur && onBlur(field.id),
        placeholder: field.placeholder,
        error: error,
        required: field.validation?.required,
        compact: field.compact,
        className: field.className || ''
    };

    switch (field.type) {
        case 'input':
            return <BaseFormInput label={field.label} type="text" maxLength={field.validation?.maxLength} {...inputTextAreaProps} />;
        case 'textarea':
            return <BaseFormTextArea label={field.label} maxLength={field.validation?.maxLength} {...inputTextAreaProps} />;
        case 'date':
            return <BaseFormDateField label={field.label} min={field.validation?.min ? String(field.validation.min) : undefined} max={field.validation?.max ? String(field.validation.max) : undefined} {...inputTextAreaProps} />;
        case 'select':
            return (
                <div className="flex flex-col gap-2 w-full">
                    {!field.compact && (
                        <FormLabel htmlFor={field.id} required={field.validation?.required}>
                            {field.label}
                        </FormLabel>
                    )}
                    <Select onValueChange={(val: string) => onChange(field.id, val)} value={value as string || ''}>
                        <SelectTrigger className={cn(
                            error ? 'border-red-500' : '',
                            field.compact && field.validation?.required ? 'border-l-4 border-l-orange-400' : '',
                            field.className
                        )}>
                            <SelectValue placeholder={
                                field.compact && field.validation?.required
                                    ? `${field.placeholder || field.label} *`
                                    : field.placeholder || (field.compact ? field.label : "Select...")
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {field.options?.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {error && <span className="text-red-500 text-sm pl-2">{error}</span>}
                </div>
            );
        case 'multi-select':
            return (
                <div className="flex flex-col w-full">
                    {!field.compact && (
                        <FormLabel htmlFor={field.id} required={field.validation?.required}>
                            {field.label}
                        </FormLabel>
                    )}
                    <MultiSelector
                        values={(value as string[] | undefined) || []}
                        onValuesChange={(values: string[]) => onChange(field.id, values)}
                        loop
                        maxItems={field.maxItems}
                        className={cn(
                            'w-full',
                            field.className,
                            error ? 'ring-1 ring-red-500' : '',
                            field.compact && field.validation?.required ? 'border-l-4 border-l-orange-400' : ''
                        )}
                    >
                        <MultiSelectorTrigger className={error ? 'border-red-500' : ''}>
                            <MultiSelectorInput placeholder={
                                field.compact && field.validation?.required
                                    ? `${field.placeholder || field.label} *`
                                    : field.placeholder || (field.compact ? field.label : "Select...")
                            } />
                        </MultiSelectorTrigger>
                        <MultiSelectorContent>
                            <MultiSelectorList>
                                {field.options?.map(opt => (
                                    <MultiSelectorItem key={opt.value} value={opt.value}>{opt.label}</MultiSelectorItem>
                                ))}
                            </MultiSelectorList>
                        </MultiSelectorContent>
                    </MultiSelector>
                    {error && <span className="text-red-500 text-sm pl-2">{error}</span>}
                </div>
            );
        case 'rich-text':
            return <RichTextEditorField field={field} value={(value as string) || ''} error={error} onChange={onChange} onBlur={onBlur} formData={formData} />;
        case 'icon-select':
            return (
                <IconSelectField
                    id={field.id}
                    label={field.label}
                    value={value as string || ''}
                    onChange={(val: string) => onChange(field.id, val)}
                    options={field.options || []}
                    placeholder={field.placeholder}
                    required={field.validation?.required}
                    error={error}
                    compact={field.compact}
                    className={field.className}
                />
            );
        default:
            if (field.renderComponent) {
                const CustomComponent = field.renderComponent as React.FC<RenderedFieldProps<unknown>>;
                return <CustomComponent field={field} value={value} error={error} onChange={onChange} onBlur={onBlur} formData={formData} />;
            }
            return <div>Unsupported field type in DefaultFieldRenderer: {field.type}</div>;
    }
};

const DefaultFormActions: React.FC<FormActionsProps> = ({ currentStep, totalSteps, onPrevious, onNext, onSubmit, isSubmitting, isCurrentStepValid, disableNext }) => (
    <div className="flex justify-between pt-6 mt-auto border-t border-neutral-border flex-shrink-0">
        <button type="button" onClick={onPrevious} disabled={currentStep === 0 || isSubmitting} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
        {currentStep < totalSteps - 1 ? (
            <button type="button" onClick={onNext} disabled={isSubmitting || disableNext || !isCurrentStepValid} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">Next</button>
        ) : (
            <button type="button" onClick={() => onSubmit()} disabled={isSubmitting || !isCurrentStepValid} className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit'}</button>
        )}
    </div>
);

function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}

export const AppFormRenderer = <TData extends Record<string, unknown>>({
    formConfig,
    fieldComponents: customFieldComponents,
    StepProgressComponent,
    StepCardComponent,
    FormActionsComponent,
    customActionHandlers,
    onDataChange,
    initialData: initialDataOverride,
    onSubmit: onSubmitOverride,
}: AppFormRendererProps<TData>) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const { steps, formId } = formConfig;

    const hookProps = { formConfig, initialData: initialDataOverride, onSubmit: onSubmitOverride };
    const appFormInstance = useAppForm<TData>(hookProps);
    const {
        formData,
        errors,
        isSubmitting,
        touchedFields,
        handleBlur,
        handleSubmit,
        validateField,
        handleInputChange,
        handleArrayInputChange,
        handleFileUpload,
        removeFile,
        addToArrayField,
        removeFromArrayField,
        updateArrayFieldItem,
        getNestedValue,
    } = appFormInstance;

    // Handle existing file removal for edit mode
    const handleExistingFileRemoval = useCallback((fieldId: string, originalIndex: number) => {
        // Create a special key to track removed existing files
        const removedFilesKey = `${fieldId}_removedExistingFiles`;
        const currentRemovedFiles = (formData as any)[removedFilesKey] || [];
        
        // Add the index to the removed files list
        const updatedRemovedFiles = [...currentRemovedFiles, originalIndex];
        handleInputChange(removedFilesKey, updatedRemovedFiles);
    }, [formData, handleInputChange]);

    useEffect(() => {
        if (onDataChange) {
            onDataChange(formData as TData);
        }
    }, [formData, onDataChange]);

    const activeStep = steps[currentStepIndex];

    const isStepFieldsValid = useCallback((stepIndexToValidate: number): boolean => {
        const stepToValidate = steps[stepIndexToValidate];
        if (!stepToValidate) return false;
        return stepToValidate.fields.every(f => {
            if (f.dependsOn && f.showIf) {
                const dependentValue = getNestedValue(formData, f.dependsOn);
                if (!f.showIf(dependentValue, formData as Record<string, unknown>)) {
                    return true;
                }
            }
            const error = validateField(f.id, formData);
            return !error;
        });
    }, [steps, formData, validateField, getNestedValue]);

    const isCurrentStepValid = isStepFieldsValid(currentStepIndex);

    const isStepCompletedVisual = useCallback((stepIndexToCheck: number): boolean => {
        if (stepIndexToCheck >= currentStepIndex) {
            return false;
        }
        return isStepFieldsValid(stepIndexToCheck);
    }, [currentStepIndex, isStepFieldsValid]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1 && isCurrentStepValid) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };
    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleStepClick = (stepId: string | number) => {
        const targetStepIndex = steps.findIndex(s => s.id === stepId);
        if (targetStepIndex === -1) return;

        if (targetStepIndex < currentStepIndex) {
            setCurrentStepIndex(targetStepIndex);
        } else if (targetStepIndex > currentStepIndex) {
            let canProceed = true;
            for (let i = currentStepIndex; i < targetStepIndex; i++) {
                if (!isStepFieldsValid(i)) {
                    canProceed = false;
                    break;
                }
            }
            if (canProceed) {
                setCurrentStepIndex(targetStepIndex);
            }
        }
    };

    const renderField = (field: FormField) => {
        const fieldType = field.type;
        const value = getNestedValue(formData, field.id);
        const error = touchedFields[field.id] ? errors[field.id] : undefined;

        // Specific props for RenderedFieldProps and CustomArrayFieldProps
        const commonRenderProps = {
            onBlur: handleBlur,
            // Spreading only specific, relevant parts of appFormInstance instead of the whole thing
            // This helps with type inference and avoids overly broad 'any' types.
            isSubmitting: appFormInstance.isSubmitting,
            touchedFields: appFormInstance.touchedFields,
            errors: appFormInstance.errors,
            // getNestedValue is useful for custom components needing to read other form values
            getNestedValue: appFormInstance.getNestedValue,
            // Pass custom action handlers if any
            ...customActionHandlers,
        };

        if (customFieldComponents && customFieldComponents[fieldType]) {
            const CustomRenderer = customFieldComponents[fieldType]!;
            const props: RenderedFieldProps<unknown> = {
                ...commonRenderProps,
                field: field,
                value: value,
                error: error,
                formData: formData as Record<string, unknown>,
                onChange: (fieldType === 'multi-select' || fieldType === 'custom-array' ? handleArrayInputChange : handleInputChange) as (fieldId: string, value: unknown) => void,
            };
            return <CustomRenderer {...props} />;
        }

        if (fieldType === 'file') {
            // Determine existing file URLs for edit mode
            let existingFileUrls: string[] = [];
            
            // Check for corresponding URL fields in form data
            if (field.id === 'productGallery') {
                existingFileUrls = (formData as any).productGalleryUrls || [];
            } else if (field.id === 'datasheetFile') {
                const url = (formData as any).datasheetUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'brochureFile') {
                const url = (formData as any).brochureUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'caseStudyFile') {
                const url = (formData as any).caseStudyUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'heroImage') {
                // Handle hero image for posts, resources, solutions
                const url = (formData as any).heroImageUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'industryIcon') {
                const url = (formData as any).industryIconUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'industryImage') {
                const url = (formData as any).industryImageUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'industryBrochureFile') {
                const url = (formData as any).brochureUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'industryCaseStudyFile') {
                const url = (formData as any).caseStudyUrl;
                existingFileUrls = url ? [url] : [];
            } else if (field.id === 'solutionBrochure') {
                const url = (formData as any).brochureUrl;
                existingFileUrls = url ? [url] : [];
            }

            // Use new image components for image fields
            if (field.id === 'productGallery' && field.multiple && field.accept?.includes('image')) {
                return (
                    <div className="flex flex-col gap-1 w-full">
                        <FormImageGallery
                            id={field.id}
                            label={field.label}
                            accept={field.accept}
                            value={value as File[] || []}
                            onChange={(files: File[]) => handleFileUpload(field.id, files)}
                            required={field.validation?.required || false}
                            maxFiles={field.maxFiles}
                            existingImageUrls={existingFileUrls}
                        />
                        {error && <span className="text-red-500 text-xs pl-2 pt-1">{error}</span>}
                        {field.validation?.required &&
                            (!value || (Array.isArray(value) && value.length === 0)) &&
                            touchedFields[field.id] &&
                            !error &&
                            <span className="text-red-500 text-xs pl-2 pt-1">{field.label} is required.</span>}
                    </div>
                );
            }
            
            // Use FormImageUpload for single image fields
            if (!field.multiple && field.accept?.includes('image')) {
                return (
                    <div className="flex flex-col gap-1 w-full">
                        <FormImageUpload
                            id={field.id}
                            label={field.label}
                            accept={field.accept}
                            value={value as File || null}
                            onChange={(file: File | null) => handleFileUpload(field.id, file ? [file] : null)}
                            required={field.validation?.required || false}
                            existingImageUrl={existingFileUrls[0]}
                        />
                        {error && <span className="text-red-500 text-xs pl-2 pt-1">{error}</span>}
                        {field.validation?.required &&
                            (!value || (Array.isArray(value) && value.length === 0)) &&
                            touchedFields[field.id] &&
                            !error &&
                            <span className="text-red-500 text-xs pl-2 pt-1">{field.label} is required.</span>}
                    </div>
                );
            }

            // Fall back to original FormFileUpload for non-image files
            const fileProps: FormFileUploadProps = {
                id: field.id,
                label: field.label,
                accept: field.accept ?? '',
                multiple: field.multiple,
                maxFiles: field.maxFiles,
                value: value as File | File[] | null,
                onChange: (files: File[] | null) => handleFileUpload(field.id, files),
                onRemove: field.multiple ? (idx: number | string) => removeFile(field.id, typeof idx === 'number' ? idx : undefined) : () => removeFile(field.id),
                onExistingFileRemove: (originalIndex: number) => handleExistingFileRemoval(field.id, originalIndex),
                required: field.validation?.required || false,
                compact: field.compact,
                existingFileUrls
            };
            return (
                <div className="flex flex-col gap-1 w-full">
                    <BaseFormFileUpload {...fileProps} />
                    {error && <span className="text-red-500 text-xs pl-2 pt-1">{error}</span>}
                    {field.validation?.required &&
                        (!value || (Array.isArray(value) && value.length === 0)) &&
                        touchedFields[field.id] &&
                        !error &&
                        <span className="text-red-500 text-xs pl-2 pt-1">{field.label} is required.</span>}
                </div>
            );
        }

        if (fieldType === 'custom-array' && field.renderComponent) {
            // Assuming TItem is unknown for a generic custom array component
            type TItem = unknown;
            const CustomArrayRenderer = field.renderComponent as React.FC<CustomArrayFieldProps<TItem>>;
            const arrayItems = (value as TItem[] | undefined) || [];

            const arrayProps: CustomArrayFieldProps<TItem> = {
                ...commonRenderProps,
                field: field,
                value: arrayItems,
                error: error,
                formData: formData as Record<string, unknown>,
                items: arrayItems,
                onChange: (fieldId: string, val: unknown) => handleInputChange(fieldId, val),
                addItem: (itemDefaults?: Partial<TItem> | (() => Partial<TItem>)) =>
                    addToArrayField(field.id, itemDefaults || (field.itemConfig ? () => field.itemConfig!.reduce((acc: Record<string, any>, f: FormField) => ({ ...acc, [f.id]: (f as any).defaultValue }), {}) : {})),
                removeItem: (indexOrId: number | string) => removeFromArrayField(field.id, indexOrId),
                updateItem: (indexOrId: number | string, updatedItemPart: Partial<TItem> | ((item: TItem) => Partial<TItem>)) =>
                    updateArrayFieldItem(field.id, indexOrId, updatedItemPart),
            };
            return <CustomArrayRenderer {...arrayProps} />;
        }

        if (fieldType === 'dynamic-section') {
            const sectionItems = (value as Record<string, unknown>[] | undefined) || [];

            const dynamicSectionProps: CustomArrayFieldProps<Record<string, unknown>> = {
                ...commonRenderProps,
                field: field,
                value: sectionItems,
                error: error,
                formData: formData as Record<string, unknown>,
                items: sectionItems,
                onChange: (fieldId: string, val: unknown) => handleInputChange(fieldId, val),
                addItem: (itemDefaults?: Partial<Record<string, unknown>> | (() => Partial<Record<string, unknown>>)) =>
                    addToArrayField(field.id, itemDefaults || {}),
                removeItem: (indexOrId: number | string) => removeFromArrayField(field.id, indexOrId),
                updateItem: (indexOrId: number | string, updatedItemPart: Partial<Record<string, unknown>> | ((item: Record<string, unknown>) => Partial<Record<string, unknown>>)) =>
                    updateArrayFieldItem(field.id, indexOrId, updatedItemPart),
            };
            return <DynamicSection {...dynamicSectionProps} />;
        }

        if (fieldType === 'custom-component' && field.renderComponent) {
            const CustomComponentRenderer = field.renderComponent as React.FC<RenderedFieldProps<unknown>>;
            const componentProps: RenderedFieldProps<unknown> = {
                ...commonRenderProps, // Spread common props
                field: field,
                value: value,
                error: error,
                formData: formData as Record<string, unknown>,
                onChange: (fieldId: string, val: unknown) => handleInputChange(fieldId, val),
            };
            if (field.id === 'reviewStepDisplay') {
                // This is a specific hack for reviewStepDisplay, consider a more generic approach if needed
                (componentProps as Record<string, unknown>).onEditSection = handleStepClick;
            }
            return <CustomComponentRenderer {...componentProps} />;
        }

        const defaultRendererProps: RenderedFieldProps<unknown> = {
            ...commonRenderProps,
            field: field,
            value: value,
            error: error,
            formData: formData as Record<string, unknown>,
            onChange: (fieldType === 'multi-select' ? handleArrayInputChange : handleInputChange) as (fieldId: string, value: unknown) => void,
        };

        return <DefaultFieldRenderer {...defaultRendererProps} />;
    };

    const DefaultStepProgress: React.FC<{ steps: Array<{ id: string | number; title: string; isCompleted: boolean; isActive: boolean }>; onStepClick: (stepId: string | number) => void; formTitle?: string; }> = ({ steps: progressStepsDataArg, onStepClick: onStepClickHandler, formTitle }) => {
        return (
            <div className="min-w-[300px] w-64 p-6 border-r bg-neutral-50 min-h-full flex flex-col">
                {formTitle && (
                    <div className="px-1 pt-3 pb-4 border-b mb-10 ml-1">
                        <span className="text-body-lg text-default-font pb-3 block">
                            {formTitle}
                        </span>
                    </div>
                )}
                <div className="flex-grow">
                    {progressStepsDataArg.map((step, index) => (
                        <div key={`${formId}-step-${step.id}`}>
                            <div
                                onClick={() => onStepClickHandler(step.id)}
                                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${step.isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-neutral-100'}`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-sm flex items-center justify-center border-2 text-sm ${step.isCompleted
                                        ? 'bg-success-200 border-success-200 text-success-700'
                                        : step.isActive
                                            ? 'border-brand-600 text-brand-600 font-semibold'
                                            : 'border-neutral-300 text-neutral-400'
                                        }`}
                                >
                                    {step.isCompleted ? (
                                        <span className="text-xs">✓</span>
                                    ) : (
                                        <span className={step.isActive ? "font-semibold" : ""}>{index + 1}</span>
                                    )}
                                </div>
                                <span className={`text-body ${step.isActive
                                    ? 'text-brand-700 font-semibold'
                                    : step.isCompleted
                                        ? 'text-success-700'
                                        : 'text-neutral-600'
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < progressStepsDataArg.length - 1 && (
                                <div className={`w-0.5 h-4 ml-[1.625rem] ${step.isCompleted ? 'bg-success-500' : 'bg-neutral-200'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const DefaultStepCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
        <div className="p-6">
            <div className="mb-4 border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {children}
        </div>
    );

    const progressStepsData = steps.map((step, index) => ({
        id: step.id,
        title: step.title,
        isCompleted: isStepCompletedVisual(index),
        isActive: index === currentStepIndex,
    }));

    const visibleFields = activeStep?.fields.filter(field => {
        if (field.dependsOn && field.showIf) {
            const dependentValue = getNestedValue(formData, field.dependsOn);
            return field.showIf(dependentValue, formData as Record<string, unknown>);
        }
        return true;
    }) || [];

    // Helper function to get the correct column span class
    const getColSpanClass = (colSpan?: number): string => {
        switch (colSpan) {
            case 1: return 'col-span-1';
            case 2: return 'col-span-2';
            case 3: return 'col-span-3';
            case 4: return 'col-span-4';
            default: return 'col-span-4'; // Default to full width
        }
    };

    const CurrentStepProgressComponent = StepProgressComponent || DefaultStepProgress;
    const CurrentStepCardComponent = StepCardComponent || DefaultStepCard;
    const CurrentFormActionsComponent = FormActionsComponent || DefaultFormActions;

    return (
        <FormErrorBoundary>
            <div className="flex h-[calc(100vh-100px)] w-full bg-gray-50">
                {/* Step Progress - Left Sidebar */}
                <CurrentStepProgressComponent
                    steps={progressStepsData}
                    onStepClick={handleStepClick}
                    formTitle={formConfig.formTitle}
                />

                {/* Form Content - Right Side */}
                <div className="flex-1">
                    <Card className="h-full p-3 flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle className="text-xl">{formConfig.formTitle}</CardTitle>
                            {activeStep?.subtitle && (
                                <CardDescription>{activeStep.subtitle}</CardDescription>
                            )}
                        </CardHeader>
                        
                        <CardContent className="flex-1 overflow-hidden p-6">
                            <CurrentStepCardComponent
                                title={activeStep?.title || ''}
                                subtitle={activeStep?.subtitle}
                            >
                                <div className="grid grid-cols-4 gap-x-3 gap-y-5 p-0.5">
                                    {visibleFields.map(field => (
                                        <div key={field.id} className={getColSpanClass(field.colSpan)}>
                                            {renderField(field)}
                                        </div>
                                    ))}
                                </div>
                            </CurrentStepCardComponent>
                        </CardContent>

                        <CardFooter className="flex-shrink-0 border-t">
                            <div className="w-full">
                                <CurrentFormActionsComponent
                                    currentStep={currentStepIndex}
                                    totalSteps={steps.length}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isCurrentStepValid={isCurrentStepValid}
                                />
                                
                                {/* Global Form Error Display */}
                                {errors._form && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="text-red-800 text-sm">
                                            {errors._form}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </FormErrorBoundary>
    );
}; 