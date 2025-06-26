import { FormConfig, FormFieldType } from '@/app/admin/forms/types';
import { SolutionFormData } from '../../types';
import { ReviewSolutionStep } from '../components/ReviewSolutionStep';

const initialSolutionData: SolutionFormData = {
  primaryIndustry: '',
  solutionName: '',
  globalTags: [],
  solutionOverview: '',
  heroImage: null,
  solutionBrochure: null,
  contentSections: [],
  clientCompanies: [],

  solutionIndustry: '',
  solutionTitle: '',
  headline: '',
  solutionHeroImage: null,
  brochure: null,
  solutionSections: [],
};

interface Tag {
  value: string;
  label: string;
  imageUrl?: string;
}

export const solutionFormConfig = (
  globalTags: Tag[],
  clients: Tag[],
  industries: Tag[],
): FormConfig<SolutionFormData> => ({
  formId: 'add-new-solution-form',
  formTitle: 'Add Solution',
  initialData: initialSolutionData,
  onSubmit: async (data, isDraft) => {
    console.log('Submitting Solution Form:', data, { isDraft });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (data.solutionName === "force_error_solution") {
      throw new Error("Simulated API error during solution submission.");
    }
    console.log("Solution form submitted successfully (simulated).");
  },
  steps: [
    {
      id: 1,
      title: 'Solution Overview',
      fields: [
        {
          id: 'primaryIndustry',
          label: 'Primary Industry',
          type: 'select' as FormFieldType,
          options: industries,
          validation: { required: true },
          colSpan: 1,
        },
        {
          id: 'globalTags',
          label: 'Global Tags',
          type: 'multi-select' as FormFieldType,
          options: globalTags,
          colSpan: 3,
        },
        {
          id: 'solutionName',
          label: 'Solution Name',
          type: 'input' as FormFieldType,
          validation: { required: true, minLength: 3 },
          colSpan: 4,
        },
        {
          id: 'solutionOverview',
          label: 'Solution Overview',
          type: 'textarea' as FormFieldType,
          validation: { required: true, maxLength: 250 },
          className: 'min-h-[100px]',
          colSpan: 4,
        },
      ],
    },
    {
      id: 2,
      title: 'Media & Attachments',
      fields: [
        {
          id: 'heroImage',
          label: 'Hero Image',
          type: 'file' as FormFieldType,
          accept: 'image/*',
          multiple: false,
          validation: { required: false },
          colSpan: 2,
        },
        {
          id: 'solutionBrochure',
          label: 'Upload Solution Brochure (PDF)',
          type: 'file' as FormFieldType,
          accept: '.pdf',
          multiple: false,
          colSpan: 2,
        },
      ],
    },
    {
      id: 3,
      title: 'Content Sections',
      fields: [
        {
          id: 'contentSections',
          label: 'Content Sections',
          type: 'dynamic-section' as FormFieldType,
          maxItems: 10,
          minItems: 0,
          addButtonText: 'Add Content Section',
          removeButtonText: 'Remove',
          itemTitle: 'Content Section',
          itemFields: [
            {
              id: 'title',
              label: 'Section Title',
              type: 'input' as FormFieldType,
              placeholder: 'Enter section title',
              validation: { required: true },
              colSpan: 4,

            },
            {
              id: 'subheading',
              label: 'Section Subheading',
              type: 'textarea' as FormFieldType,
              placeholder: 'Enter section subheading',
              className: 'min-h-[80px]',
              colSpan: 4,
            },
            {
              id: 'content',
              label: 'Section Content',
              type: 'textarea' as FormFieldType,
              placeholder: 'Enter detailed content',
              validation: { required: true },
              className: 'min-h-[100px]',
              colSpan: 4,
            },
            {
              id: 'image',
              label: 'Section Image',
              type: 'file' as FormFieldType,
              accept: '.webp',
              multiple: false,
              colSpan: 4,
            },
          ],
          colSpan: 4,
        },
      ],
    },
    {
      id: 4,
      title: 'Client Companies',
      fields: [
        {
          id: 'clientCompanies',
          label: 'Client Companies',
          type: 'multi-select' as FormFieldType,
          options: clients,
          colSpan: 4,
        },
      ],
    },
    {
      id: 5,
      title: 'Review & Submit',
      fields: [
        {
          id: 'reviewSolutionData',
          label: '',
          type: 'custom-component' as FormFieldType,
          renderComponent: ReviewSolutionStep as any,
          colSpan: 4,
        },
      ],
    },
  ],
});
