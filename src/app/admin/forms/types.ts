export type FormFieldType =
    | "input"
    | "textarea"
    | "select"
    | "multi-select"
    | "file"
    | "checkbox"
    | "radio-group"
    | "combobox"
    | "date"
    | "rich-text" // For rich text editor
    | "icon-select" // For icon selection with preview
    | "custom-array" // For complex array structures like Highlights, BulletPoints
    | "dynamic-section" // For configurable dynamic sections (replaces custom-array in many cases)
    | "custom-component"; // For entirely custom field components

interface FormFieldOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

export interface FormFieldValidation {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    maxFiles?: number;
    maxSize?: number;
    allowedTypes?: string;
    custom?: (value: any, formData?: Record<string, unknown>) => boolean | string | undefined;
}

export interface FormField {
    id: string;
    label: string;
    type: FormFieldType;
    placeholder?: string;
    validation?: FormFieldValidation;
    colSpan?: number;
    className?: string;
    options?: { value: string; label: string }[];
    multiple?: boolean;
    maxFiles?: number;
    accept?: string;
    compact?: boolean;
    renderComponent?: React.ComponentType<any>;
    onChange?: (value: unknown) => unknown;
    
    // For conditional fields
    dependsOn?: string;
    showIf?: (dependentValue: any, formData: Record<string, unknown>) => boolean;
    
    // Dynamic section properties
    maxItems?: number;
    minItems?: number;
    addButtonText?: string;
    removeButtonText?: string;
    itemTitle?: string;
    itemFields?: FormField[];
    itemConfig?: FormField[]; // For default values in 'custom-array'
}

interface FormStepConfig {
    id: string | number;
    title: string;
    subtitle?: string;
    fields: FormField[];
    // Step-level validation function if needed, though field-level is often enough
    validateStep?: (stepData: Record<string, unknown>, allFormData: Record<string, unknown>) => Record<string, string>; // Returns error map for the step
}

export interface FormConfig<TData extends Record<string, unknown> = Record<string, unknown>> {
    formId: string;
    formTitle: string;
    description?: string;
    steps: FormStepConfig[];
    initialData: TData;
    onSubmit: (data: TData, isDraft?: boolean) => Promise<void>;
    // Optional: custom component for overall form wrapper or layout
    formLayoutComponent?: React.FC<{ children: React.ReactNode; currentStep: number; totalSteps: number }>;
}

// Local type for AppFormErrors, as it's not exported from useAppForm directly for now
type AppFormErrors = Record<string, string | undefined>;

// Props for individual rendered field components
export interface RenderedFieldProps<TValue = unknown> {
    field: FormField;
    value: TValue;
    error?: string; // Specific error for this field
    onChange: (fieldId: string, value: TValue) => void;
    onBlur?: (fieldId: string) => void; // For field-level touch state, this is useAppForm.handleBlur
    formData: Record<string, unknown>; // Full form data

    // Common methods and state from useAppForm, passed by AppFormRenderer
    getNestedValue?: (obj: Record<string, unknown> | null | undefined, path: string) => unknown;
    errors?: AppFormErrors; // All form errors
    touchedFields?: Record<string, boolean>; // All touched fields
    isSubmitting?: boolean;

    // Allow spreading other custom props if needed by specific renderers
    [key: string]: unknown;
}

// Props for custom array item renderers
export interface CustomArrayFieldProps<TItem = Record<string, unknown>> extends RenderedFieldProps<TItem[]> {
    items: TItem[]; // Explicitly add items here, this will be `formData[field.id]`
    addItem: (itemDefaults?: Partial<TItem> | (() => Partial<TItem>)) => void;
    removeItem: (indexOrId: number | string) => void;
    updateItem: (indexOrId: number | string, updatedItemPart: Partial<TItem> | ((item: TItem) => Partial<TItem>)) => void;
    moveItem?: (fromIndex: number, toIndex: number) => void; // Optional for reordering
    // Specific handlers for items, e.g., for product highlights
    itemHandlers?: {
        [handlerName: string]: (...args: unknown[]) => void;
    };
}

// Form Field Component Prop Types

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
  compact?: boolean; // New prop for compact mode
}

interface FormTextAreaProps extends Omit<FormInputProps, 'type'> {
  minHeight?: string;
}

interface FormDateFieldProps extends Omit<FormInputProps, 'type'> {
  min?: string; // Minimum date (YYYY-MM-DD format)
  max?: string; // Maximum date (YYYY-MM-DD format)
}

export interface FormFileUploadProps {
  id: string;
  label: string;
  accept?: string; // Made optional to align with BaseFormFileUpload usage in AppFormRenderer
  multiple?: boolean;
  maxFiles?: number;
  value?: File | File[] | null;
  onChange: (files: File[] | null) => void;
  onRemove?: (indexOrFileId: number | string) => void; // Made more generic if file IDs are used
  onExistingFileRemove?: (originalIndex: number) => void; // New callback for existing file removal
  required?: boolean; // Add required prop for asterisk display
  compact?: boolean; // New prop for compact mode
  existingFileUrls?: string[]; // URLs of existing files for edit mode
  existingFileNames?: string[]; // Optional display names for existing files
}

// General Form Section (if needed globally)
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

// Props for custom FormActions component passed to AppFormRenderer
// These are the handlers and state AppFormRenderer provides to a FormActionsComponent
interface AppFormRendererActionHandlers {
    currentStep: number;
    totalSteps: number;
    isSubmitting: boolean;
    isCurrentStepValid: boolean; 
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: (isDraft?: boolean) => void; // Changed from handleSubmit to onSubmit
    // Optional text overrides, can be sourced from formConfig if needed
    // These are not directly provided by AppFormRenderer but can be added by a wrapper or the component itself
    submitButtonText?: string; 
    previousButtonText?: string;
    nextButtonText?: string;
    customActions?: React.ReactNode; // For additional buttons like "Save as Draft"
} 