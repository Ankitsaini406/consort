import { useState, useCallback, useEffect } from 'react';
import { FormConfig, FormField } from '../types';

interface AppFormErrors {
    [key: string]: string | undefined; // Field ID to error message or undefined
}

export interface UseAppFormProps<TData extends Record<string, unknown>> {
    formConfig: FormConfig<TData>;
    initialData?: TData; // Optional: can override formConfig.initialData
    onSubmit?: (data: TData, isDraft?: boolean) => Promise<void>; // Optional: can override formConfig.onSubmit
}

// Utility to get a value from a nested object path
const getNestedValue = (obj: Record<string, unknown> | null | undefined, path: string): unknown => {
    if (!obj) return undefined;
    return path.split('.').reduce((acc, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj as unknown);
};

// Utility to deep clone an object while preserving File objects
const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof File) {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    if (Array.isArray(obj)) {
        const arrCopy = [] as any[];
        for (const item of obj) {
            arrCopy.push(deepClone(item));
        }
        return arrCopy as any;
    }

    const objCopy = {} as { [key: string]: any };
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            objCopy[key] = deepClone((obj as any)[key]);
        }
    }

    return objCopy as T;
};

// Add this setNestedValue utility
const setNestedValue = (obj: Record<string, any>, path: string, value: any): Record<string, any> => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return obj;
};

export const useAppForm = <TData extends Record<string, unknown>>({
    formConfig,
    initialData: initialDataOverride,
    onSubmit: onSubmitOverride,
}: UseAppFormProps<TData>) => {
    const [formData, setFormData] = useState<TData>(() => initialDataOverride || formConfig.initialData);
    const [errors, setErrors] = useState<AppFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    const finalOnSubmit = onSubmitOverride || formConfig.onSubmit;

    const getFieldConfig = useCallback((fieldId: string): FormField | undefined => {
        for (const step of formConfig.steps) {
            const field = step.fields.find(f => f.id === fieldId);
            if (field) return field;
        }
        return undefined;
    }, [formConfig.steps]);

    const validateField = useCallback((fieldId: string, currentFormData: TData): string | undefined => {
        const fieldConfig = getFieldConfig(fieldId);
        const value = getNestedValue(currentFormData, fieldId);
        if (!fieldConfig || !fieldConfig.validation) return undefined;

        const { required, minLength, maxLength, pattern, custom } = fieldConfig.validation;
        const label = fieldConfig.label || fieldId;

        if (required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
            return `${label} is required.`;
        }
        if (value === undefined || value === null || value === '' ) return undefined; 

        if (minLength !== undefined && typeof value === 'string' && value.length < minLength) {
            return `${label} must be at least ${minLength} characters.`;
        }

        if (maxLength !== undefined && typeof value === 'string' && value.length > maxLength) {
            return `${label} must be at most ${maxLength} characters.`;
        }

        if (pattern && typeof value === 'string' && !pattern.test(value)) {
            return `${label} is invalid.`;
        }

        if (custom) {
            const customResult = custom(value, currentFormData);
            return typeof customResult === 'string' ? customResult : undefined;
        }

        return undefined;
    }, [getFieldConfig]);

    const validateForm = useCallback((dataToValidate: TData): AppFormErrors => {
        const newErrors: AppFormErrors = {};
        formConfig.steps.forEach((step) => {
            step.fields.forEach((field) => {
                const { dependsOn, showIf } = field as any;
                if (dependsOn && showIf) {
                    const dependentValue = getNestedValue(dataToValidate, dependsOn);
                    if (!showIf(dependentValue, dataToValidate)) {
                        return;
                    }
                }
                const error = validateField(field.id, dataToValidate);
                if (error) {
                    newErrors[field.id] = error;
                }
            });
        });
        setErrors(newErrors);
        return newErrors;
    }, [formConfig.steps, validateField]);

    const handleInputChange = useCallback((fieldId: string, value: unknown) => {
        setFormData(prev => {
            const newData = deepClone(prev);
            setNestedValue(newData, fieldId, value);
    
            if (touchedFields[fieldId] || errors[fieldId]) {
                const fieldError = validateField(fieldId, newData as TData);
                setErrors(prevErrors => ({ ...prevErrors, [fieldId]: fieldError }));
            } else if (errors[fieldId] && !validateField(fieldId, newData as TData)) {
                setErrors(prevErrors => { const updatedErrors = { ...prevErrors }; delete updatedErrors[fieldId]; return updatedErrors; });
            }
            return newData as TData;
        });
    }, [validateField, touchedFields, errors]);

    const handleBlur = useCallback((fieldId: string) => {
        setTouchedFields(prev => ({ ...prev, [fieldId]: true }));
        const fieldError = validateField(fieldId, formData);
        setErrors(prevErrors => ({
            ...prevErrors,
            [fieldId]: fieldError,
        }));
    }, [formData, validateField]);

    const handleSubmit = async (isDraft: boolean = false) => {
        const currentErrors = validateForm(formData);
        const activeErrors = Object.keys(currentErrors).filter(key => currentErrors[key] !== undefined);

        if (!isDraft && activeErrors.length > 0) {
            const allFieldsTouched = formConfig.steps.reduce((acc: Record<string, boolean>, step) => {
                step.fields.forEach((f: FormField) => {
                    acc[f.id] = true;
                });
                return acc;
            }, {} as Record<string, boolean>);
            setTouchedFields(allFieldsTouched);
            console.log("Validation errors:", currentErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await finalOnSubmit(formData, isDraft);
        } catch (error: unknown) {
            console.error('Form submission error:', error);
            const message = error instanceof Error ? error.message : 'Failed to submit form. Please try again.';
            setErrors(prev => ({
                ...prev,
                _form: message
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = useCallback(() => {
        setFormData(deepClone(initialDataOverride || formConfig.initialData));
        setErrors({});
        setTouchedFields({});
    }, [formConfig.initialData, initialDataOverride]);

    useEffect(() => {
        resetForm();
    }, [formConfig.formId, initialDataOverride, resetForm]);
    
    const handleArrayInputChange = useCallback((fieldId: string, values: string[] | File[]) => {
        handleInputChange(fieldId, values);
    }, [handleInputChange]);

    const handleFileUpload = useCallback((fieldId: string, files: File[] | null) => {
        const fieldConfig = getFieldConfig(fieldId);
        if(!fieldConfig) return;

        if (!files || files.length === 0) {
            handleInputChange(fieldId, fieldConfig.multiple ? [] : null);
            return;
        }
        const processedFiles = fieldConfig.multiple ? files.slice(0, fieldConfig.maxFiles) : files[0];
        handleInputChange(fieldId, processedFiles);

    }, [handleInputChange, getFieldConfig]);

    const removeFile = useCallback((fieldId: string, index?: number) => {
        const fieldConfig = getFieldConfig(fieldId);
        if (!fieldConfig) return;
        const currentFiles = getNestedValue(formData, fieldId);

        if (fieldConfig.multiple && Array.isArray(currentFiles) && index !== undefined) {
            const updatedFiles = currentFiles.filter((_, i) => i !== index);
            handleInputChange(fieldId, updatedFiles);
        } else {
            handleInputChange(fieldId, null); 
        }
    }, [formData, handleInputChange, getFieldConfig]);

    const addToArrayField = useCallback((fieldId: string, newItemDefaults: Record<string, unknown> | (() => Record<string, unknown>)) => {
        setFormData(prev => {
            const currentArray = (getNestedValue(prev, fieldId) as unknown[] | undefined) || [];
            const newItem = typeof newItemDefaults === 'function' ? newItemDefaults() : { ...newItemDefaults, id: String(Date.now() + Math.random()) };
            
            const newData = deepClone(prev);
            setNestedValue(newData, fieldId, [...currentArray, newItem]);
            return newData as TData;
        });
    }, []);

    const removeFromArrayField = useCallback((fieldId: string, indexOrId: number | string) => {
        setFormData(prev => {
            const currentArray = (getNestedValue(prev, fieldId) as Array<{id?:string, [key: string]: unknown}> | undefined) || [];
            let newArray;
            if (typeof indexOrId === 'number') {
                newArray = currentArray.filter((_, i) => i !== indexOrId);
            } else {
                newArray = currentArray.filter(item => item.id !== indexOrId);
            }
            
            const newData = deepClone(prev);
            setNestedValue(newData, fieldId, newArray);
            return newData as TData;
        });
    }, []);

    const updateArrayFieldItem = useCallback((fieldId: string, indexOrId: number | string, updatedItemPart: Partial<unknown> | ((item: unknown) => Partial<unknown>)) => {
        setFormData(prev => {
            const currentArray = (getNestedValue(prev, fieldId) as Array<{id?:string, [key: string]: unknown}> | undefined) || [];
            const newArray = currentArray.map((item, index) => {
                const matches = (typeof indexOrId === 'number' && index === indexOrId) || (typeof indexOrId === 'string' && item.id === indexOrId);
                if (matches) {
                    const updates = typeof updatedItemPart === 'function' ? updatedItemPart(item) : updatedItemPart;
                    // Return a new merged object, preserving file objects
                    return { ...item, ...updates };
                }
                return item;
            });
    
            const newData = deepClone(prev);
            setNestedValue(newData, fieldId, newArray);
            return newData as TData;
        });
    }, []);


    return {
        formData,
        setFormData, 
        errors,
        isSubmitting,
        touchedFields,
        handleInputChange,
        handleArrayInputChange,
        handleFileUpload,      
        removeFile,
        handleBlur,
        handleSubmit,
        resetForm,
        validateField,
        validateForm,
        addToArrayField,
        removeFromArrayField,
        updateArrayFieldItem,
        getNestedValue,
    };
}; 