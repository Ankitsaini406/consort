
const PRODUCT_SUBCATEGORIES = [
    { label: 'Radio Systems', value: 'radio' },
    { label: 'Radar Systems', value: 'radar' },
    { label: 'Satellite Systems', value: 'satellite' },
];

const COMPANY_TAGS = [
    { label: 'Military', value: 'military' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Aerospace', value: 'aerospace' },
];

const FEATURE_TYPES = [
    { value: "technical", label: "Technical" },
    { value: "functional", label: "Functional" },
    { value: "performance", label: "Performance" },
    { value: "security", label: "Security" },
    { value: "integration", label: "Integration" },
    { value: "other", label: "Other" }
];

export const FILE_UPLOAD_CONFIG = {
    PRODUCT_PHOTOS: {
        accept: 'image/*',
        maxFiles: 8, // Increased since we now store main+thumbnails separately
        maxSize: 500 * 1024, // 500KB
    },
    DOCUMENTS: {
        accept: '.pdf',
        maxSize: 5 * 1024 * 1024, // 5MB
    },
};

const REQUIRED_FIELDS = [
    'productName',
    'briefHeadline',
    'briefDescription',
    'category',
] as const;

const FORM_VALIDATION_MESSAGES = {
    required: (field: string) => `${field} is required`,
    maxFiles: (max: number) => `Maximum ${max} files allowed`,
    maxFileSize: (size: number) => `File size should not exceed ${size / 1024}KB`,
    invalidFileType: 'Invalid file type',
}; 