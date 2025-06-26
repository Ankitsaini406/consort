import { FormConfig, FormFieldType } from '@/app/admin/forms/types';
import { IndustryFormData } from '../../types';
import { ReviewIndustryStep } from '../components/ReviewIndustryStep';
import { ICON_OPTIONS } from '@/components/admin/DynamicFeatherIcon';



const initialIndustryData: IndustryFormData = {
  industryIcon: null,
  industryName: '',
  industryImage: null,
  industryOverview: '',
  industryStatistics: [],
  industryDescription: '',
  industryBriefDescription: '',
  industryFeatures: [],
  industryLeaders: [],
  industryBrochureFile: null,
  industryCaseStudyFile: null,
  industryDatasheetFile: null,
  industryHeadline: '',
  industryStats: [],
  industryBrief: '',
  industryKeyFeatures: [],
  associatedCompanies: [],
  industryBrochure: null,
  industryCaseStudy: null,
};

interface Tag {
  value: string;
  label: string;
}

export const industryFormConfig = (
  clients: Tag[]
): FormConfig<IndustryFormData> => {
  return {
  formId: 'industry-form',
  formTitle: 'Add Industry',
  initialData: initialIndustryData,
  // Placeholder onSubmit - will be overridden by the component
  onSubmit: async (data: IndustryFormData) => {
    console.log('Default onSubmit called - this should be overridden', data);
  },
  steps: [
    // Step 1: Basic Information
    {
      id: 1,
      title: 'Industry Information',
      fields: [
        {
          id: 'industryName',
          label: 'Industry Name',
          type: 'input' as FormFieldType,
          validation: { required: true, maxLength: 60 },
          colSpan: 4,
        },
        {
          id: 'industryOverview',
          label: 'Industry Overview (max 250 characters)',
          type: 'textarea' as FormFieldType,
          validation: { required: true, maxLength: 250 },
          colSpan: 4,
        },
        {
          id: 'industryIcon',
          label: 'Industry Icon',
          type: 'file' as FormFieldType,
          accept: '.svg',
          validation: { required: false, maxLength: 1 },
          colSpan: 2,
        },
        {
          id: 'industryImage',
          label: 'Industry Image',
          type: 'file' as FormFieldType,
          accept: 'image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif, image/svg',
          validation: { required: false, maxLength: 1 },
          colSpan: 2,
        },
      ],
    },
    // Step 2: Industry Details & Stats
    {
      id: 2,
      title: 'Industry Details & Stats',
      fields: [
        {
          id: 'industryDescription',
          label: 'Industry Description',
          type: 'textarea' as FormFieldType,
          className: 'min-h-[120px]',
          validation: { required: true, maxLength: 2000 },
          colSpan: 2,
        },
        {
          id: 'industryBriefDescription', 
          label: 'Industry Brief Description',
          type: 'textarea' as FormFieldType,
          className: 'min-h-[120px]',
          validation: { required: true, maxLength: 500 },
          colSpan: 2,
        },
        {
          id: 'industryStatistics',
          label: 'Industry Statistics',
          type: 'dynamic-section' as FormFieldType,
          maxItems: 3,
          minItems: 0,
          addButtonText: 'Add Statistic',
          itemTitle: 'Industry Statistic',
          itemFields: [
            {
              id: 'value',
              label: 'Statistic Value',
              type: 'input' as FormFieldType,
              placeholder: 'Enter statistic value', 
              validation: { required: false, maxLength: 32 },
              colSpan: 1,
            },
            {
              id: 'description',
              label: 'Statistic Description',
              type: 'input' as FormFieldType,
              placeholder: 'Enter statistic description',
              validation: { required: false, maxLength: 96 },
              colSpan: 3,
            },
          ],
          colSpan: 3,
        },
      ],
    },
    // Step 3: Key Features
    {
      id: 3,
      title: 'Industry Key Features',
      fields: [
        {
          id: 'industryFeatures',
          label: 'Industry Features',
          type: 'dynamic-section' as FormFieldType,
          maxItems: 6,
          minItems: 0,
          addButtonText: 'Add Key Feature',
          removeButtonText: 'Remove',
          itemTitle: 'Industry Key Feature',
          itemFields: [
            {
              id: 'icon',
              label: 'Feature Icon',
              type: 'icon-select' as FormFieldType,
              options: ICON_OPTIONS,
              placeholder: 'Choose an icon',
              validation: { required: false },
              colSpan: 1,
            },
            {
              id: 'description',
              label: 'Feature Description',
              type: 'input' as FormFieldType,
              placeholder: 'Enter feature description',
              validation: { required: false, maxLength: 200 },
              colSpan: 3,
            },
          ],
          colSpan: 4,
        },
      ],
    },
    // Step 4: Additional Details
    {
      id: 4,
      title: 'Additional Details',
      fields: [
        {
          id: 'industryLeaders',
          label: 'Industry Leaders',
          type: 'multi-select' as FormFieldType,
          options: clients,
          colSpan: 4,
        },
        {
          id: 'industryBrochureFile',
          label: 'Upload Industry Brochure (PDF Only)',
          type: 'file' as FormFieldType,
          accept: '.pdf',
          multiple: false,
          colSpan: 2,
        },
        {
          id: 'industryDatasheetFile',
          label: 'Upload Industry Datasheet (PDF Only)',
          type: 'file' as FormFieldType,
          accept: '.pdf',
          multiple: false,
          colSpan: 2,
        },
        {
          id: 'industryCaseStudyFile',
          label: 'Upload Industry Case Study (PDF Only)',
          type: 'file' as FormFieldType,
          accept: '.pdf',
          multiple: false,
          colSpan: 2,
        },
      ],
    },
    // Step 5: Review & Submit
    {
      id: 5,
      title: 'Review & Submit',
      fields: [
        {
          id: 'reviewStepDisplay',
          label: '',
          type: 'custom-component' as FormFieldType,
          renderComponent: ReviewIndustryStep as any,
          colSpan: 4,
        },
      ],
    },
  ],
}; 
};

// Export a simplified version for edit mode with minimal validation
export const industryEditFormConfig = (
  clients: Tag[]
): FormConfig<IndustryFormData> => {
  const baseConfig = industryFormConfig(clients);
  
  // Override validation to be more lenient for edit mode
  return {
    ...baseConfig,
    formTitle: 'Edit Industry',
    // Make all validations more flexible for edit mode
    steps: baseConfig.steps.map(step => ({
      ...step,
      fields: step.fields.map(field => ({
        ...field,
        validation: field.validation ? {
          ...field.validation,
          required: field.id === 'industryName' ? true : false, // Only industry name is required
        } : undefined
      }))
    }))
  };
}; 