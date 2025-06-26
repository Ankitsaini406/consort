import { FormConfig, FormFieldType } from '@/app/admin/forms/types';
import { ProductFormData, TechnicalSpecification } from '../types';
import { FILE_UPLOAD_CONFIG } from '../constants';
import { PORTFOLIO_CATEGORIES } from '@/config/portfolioConfig';

import { ReviewStep } from '../components/ReviewStep';
import { BaseReviewStepProps } from '@/app/admin/forms/components/shared/layout/ReviewStepTypes';
import { ICON_OPTIONS } from '@/components/admin/DynamicFeatherIcon';
  
  const initialProductFormData: ProductFormData = {
    // Product Details
    portfolioCategory: "",
    slug: "", // Auto-generated from productName, not user input
    targetIndustries: [],
    brandName: "",
    clientCompanies: [],
    globalTags: [],
    productName: "",
    headline: "",
    marketingTagline: "",
    productGallery: [],
    productDescription: "", // Rich text content combining overview, details, and bullet points
    keyFeatures: [{ id: "1", keyFeature: "", icon: "" }],
    
    // Technical Specifications
    technicalSpecifications: [{ id: "1", parameter: "", specification: "" }],
    
    // Resource Files
    datasheetFile: null,
    brochureFile: null,
    caseStudyFile: null,
    
    // Marketing Highlights
    marketingHighlights: [{ id: "1", headline: "", description: "", visuals: [] }],
    
    // Metadata
    fileMetadata: {
        lastUpdated: new Date().toISOString(),
        galleryCount: 0,
        highlightCount: 0,
        resourceCount: 0
    }
};

// export const industryFormConfig = (
//     icons: Tag[]
//   ): FormConfig<IndustryFormData> => ({

interface Tag {
    value: string;
    label: string;
    imageUrl?: string;
  }


export const productFormConfig =(
    globalTags: Tag[], 
    productBrands: Tag[], 
    clients: Tag[],
    industries: Tag[],
):
FormConfig<ProductFormData> => ({
    formId: 'product-form',
    formTitle: 'Add Product',
    description: 'Fill in the details to add a new product to the catalog.',
    initialData: initialProductFormData,
    onSubmit: async (data, isDraft) => {
        console.log('Submitting Product Form:', data, 'Is Draft:', isDraft);
        // Replace with actual API submission logic
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        if (data.productName === "fail") { // Example error condition
            throw new Error("Simulated server error: Product name cannot be 'fail'.");
        }
    },
    steps: [
        {
            id: 1,
            title: 'Product Details',
            subtitle: 'Product categorization and basic information',
            fields: [
                
                {
                    id: 'productName',
                    label: 'Product Name',
                    type: 'input' as FormFieldType,
                    placeholder: 'Enter product name',
                    validation: { required: true, minLength: 4, maxLength: 45 },
                    colSpan: 2,
                },
                {
                    id: 'headline',
                    label: 'Headline',
                    type: 'input' as FormFieldType,
                    placeholder: 'Enter headline',
                    validation: { required: true, minLength: 4, maxLength: 45 },
                    colSpan: 2,
                },
                {
                    id: 'portfolioCategory',
                    label: 'Product Category',
                    type: 'select' as FormFieldType,
                    placeholder: 'Select portfolio category',
                    options: PORTFOLIO_CATEGORIES,
                    validation: { required: true },
                    colSpan: 1,
                },
                
                {
                    id: 'brandName',
                    label: 'Product Brand',
                    type: 'select' as FormFieldType,
                    placeholder: 'Select brand',
                    options: productBrands,
                    validation: { required: false },
                    colSpan: 1,
                },
                {
                    id: 'globalTags',
                    label: 'Global Tags',
                    type: 'multi-select' as FormFieldType,
                    placeholder: 'Select global tags for content linking',
                    options: globalTags,
                    validation: { required: false },
                    colSpan: 2,
                },
                {
                    id: 'clientCompanies',
                    label: 'Client Companies',
                    type: 'multi-select' as FormFieldType,
                    placeholder: 'Select client companies',
                    options: clients,
                    validation: { required: false },
                    colSpan: 2,
                },
                
                {
                    id: 'targetIndustries',
                    label: 'Target Industries',
                    type: 'multi-select' as FormFieldType,
                    placeholder: 'Select target industries',
                    options: industries,
                    validation: { required: true },
                    colSpan: 2,
                },
                {
                    id: 'marketingTagline',
                    label: 'Marketing Tagline',
                    type: 'textarea' as FormFieldType,
                    placeholder: 'Enter marketing tagline',
                    validation: { required: true, minLength: 10, maxLength: 200 },
                    colSpan: 4,
                },
                {
                    id: 'productGallery',
                    label: 'Upload Product Gallery (up to 8 photos)',
                    type: 'file' as FormFieldType,
                    accept: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.accept,
                    multiple: true,
                    maxFiles: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.maxFiles,
                    validation: { 
                        required: false,
                        maxFiles: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.maxFiles,
                        maxSize: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.maxSize,
                        allowedTypes: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.accept
                    },
                    colSpan: 4,
                    onChange: (value: unknown) => {
                        const files = value as File[];
                        // Validate file uniqueness
                        const uniqueFiles = new Set(files.map(f => `${f.name}-${f.size}`));
                        if (uniqueFiles.size !== files.length) {
                            throw new Error('Duplicate files detected. Please remove duplicates before uploading.');
                        }
                        return files;
                    }
                },
            ],
        },
        {
            id: 2,
            title: 'Product Brief',
            subtitle: 'Detailed product information',
            fields: [
                {
                    id: 'productDescription',
                    label: 'Product Description',
                    type: 'rich-text' as FormFieldType,
                    placeholder: 'Enter product overview, detailed description, and key points using the rich text editor. Use headings to organize your content and bullet lists for key features.',
                    validation: { required: true, minLength: 50 },
                    colSpan: 4,
                },
                
                {
                    id: 'keyFeatures',
                    label: 'Key Features',
                    type: 'dynamic-section' as FormFieldType,
                    maxItems: 8,
                    minItems: 0,
                    addButtonText: 'Add Key Feature',
                    removeButtonText: 'Remove',
                    itemTitle: 'Key Feature',
                    itemFields: [
                        {
                            id: 'icon',
                            label: 'Icon',
                            type: 'icon-select' as FormFieldType,
                            options: ICON_OPTIONS,
                            placeholder: 'Choose an icon',
                            validation: { required: true },
                            colSpan: 1,
                        },
                        {
                            id: 'keyFeature',
                            label: 'Key Feature',
                            type: 'input' as FormFieldType,
                            placeholder: 'Enter key feature',
                            validation: { required: true, minLength: 4, maxLength: 50 },
                            colSpan: 3,
                            compact: false,
                        },
                    ],

                    validation: { required: false },
                    colSpan: 4,
                },
            ],
        },
        {
            id: 3,
            title: 'Technical Specifications',
            subtitle: 'Add technical parameters and specifications',
            fields: [
                {
                    id: 'technicalSpecifications',
                    label: 'Technical Specifications',
                    type: 'dynamic-section' as FormFieldType,
                    maxItems: 12,
                    minItems: 0,
                    addButtonText: 'Add Technical Specification',
                    removeButtonText: 'Remove',
                    itemTitle: 'Technical Specification',
                    itemFields: [
                        {
                            id: 'parameter',
                            label: 'Parameter',
                            type: 'input' as FormFieldType,
                            placeholder: 'Enter Parameter name ',
                            validation: { required: true, minLength: 3, maxLength: 90 },
                            colSpan: 2,
                            compact: true,
                        },
                        {
                            id: 'specification',
                            label: 'Specification',
                            type: 'input' as FormFieldType,
                            placeholder: 'Enter Specification',
                            validation: { required: true, minLength: 1, maxLength: 500 },
                            colSpan: 2,
                            compact: true,
                        },
                    ],
                    validation: { required: false },
                    colSpan: 4,
                },
            ],
        },
        {
            id: 4,
            title: 'Product Resources',
            subtitle: 'Upload product documents',
            fields: [
                {
                    id: 'datasheetFile',
                    label: 'Upload Datasheet PDF',
                    type: 'file' as FormFieldType,
                    accept: FILE_UPLOAD_CONFIG.DOCUMENTS.accept,
                    multiple: false,
                    validation: {
                        required: false,
                        maxSize: FILE_UPLOAD_CONFIG.DOCUMENTS.maxSize,
                        allowedTypes: FILE_UPLOAD_CONFIG.DOCUMENTS.accept,
                        maxFiles: 1
                    },
                    colSpan: 2,
                },
                {
                    id: 'brochureFile',
                    label: 'Upload Brochure PDF',
                    type: 'file' as FormFieldType,
                    accept: FILE_UPLOAD_CONFIG.DOCUMENTS.accept,
                    multiple: false,
                    validation: {
                        required: false,
                        maxSize: FILE_UPLOAD_CONFIG.DOCUMENTS.maxSize,
                        allowedTypes: FILE_UPLOAD_CONFIG.DOCUMENTS.accept,
                        maxFiles: 1
                    },
                    colSpan: 2,
                },
                {
                    id: 'caseStudyFile',
                    label: 'Upload Case Study PDF',
                    type: 'file' as FormFieldType,
                    accept: FILE_UPLOAD_CONFIG.DOCUMENTS.accept,
                    multiple: false,
                    validation: {
                        required: false,
                        maxSize: FILE_UPLOAD_CONFIG.DOCUMENTS.maxSize,
                        allowedTypes: FILE_UPLOAD_CONFIG.DOCUMENTS.accept,
                        maxFiles: 1
                    },
                    colSpan: 4,
                },
            ],
        },
        {
            id: 5,
            title: 'Marketing Highlights',
            subtitle: 'Marketing selling points with visuals',
            fields: [
                {
                    id: 'marketingHighlights',
                    label: 'Marketing Highlights',
                    type: 'dynamic-section' as FormFieldType,
                    maxItems: 6,
                    minItems: 0,
                    addButtonText: 'Add Marketing Highlight',
                    removeButtonText: 'Remove',
                    itemTitle: 'Marketing Highlight',
                    itemFields: [
                        {
                            id: 'headline',
                            label: 'Headline',
                            type: 'input' as FormFieldType,
                            placeholder: 'Enter highlight headline (7-10 words)',
                            validation: { required: true, minLength: 7, maxLength: 60},
                            colSpan: 4,
                            compact: true,
                        },
                        {
                            id: 'description',
                            label: 'Description',
                            type: 'textarea' as FormFieldType,
                            placeholder: 'Enter highlight description',
                            validation: { required: true, minLength: 10, maxLength: 300 },
                            colSpan: 4,
                            compact: true,
                        },
                        {
                            id: 'visuals',
                            label: 'Visuals / Illustrations',
                            type: 'file' as FormFieldType,
                            accept: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.accept,
                            multiple: false,
                            maxFiles: 1, // Fixed: single file mode should have maxFiles: 1
                            validation: {
                                required: false,
                                maxFiles: 1, // Fixed: consistent with multiple: false
                                maxSize: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.maxSize,
                                allowedTypes: FILE_UPLOAD_CONFIG.PRODUCT_PHOTOS.accept
                            },
                            colSpan: 4,
                            onChange: (value: unknown) => {
                                const file = value as File;
                                // For single file mode, just return the file directly
                                return file;
                            }
                        },
                    ],
                    validation: { required: false },
                    colSpan: 4,
                },
            ],
        },
        {
            id: 6,
            title: 'Review & Submit',
            subtitle: 'Please review all information before submitting',
            fields: [
                {
                    id: 'review',
                    label: 'Review & Submit',
                    type: 'custom-component' as FormFieldType,
                    renderComponent: ReviewStep as React.ComponentType<BaseReviewStepProps<ProductFormData> & { onEditSection: (stepId: number | string) => void }>,
                    colSpan: 4
                },
            ],
        },
    ],
}); 