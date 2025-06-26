import { FormConfig, FormFieldType } from "@/app/admin/forms/types";
import { ResourceFormData } from "../../types";
import { ReviewResourceStep } from "../components/ReviewResourceStep";

const initialResourceData: ResourceFormData = {
  slug: "",
  resourceType: "",
  industryUseCases: [],
  resourceTitle: "",
  globalTags: [],
  date: "",
  headline: "",
  heroImage: null, // ✅ Use null for initial File field
  heroImageUrl: "", // ✅ Use empty string for URL field
  sections: [],
  clientCompanies: [],
};

const resourceTypeOptions = [
  { value: "case-study", label: "Case Study" },
  { value: "whitepaper", label: "Whitepaper" },
  { value: "client-review", label: "Client Review" },
];

interface Tag {
  value: string;
  label: string;
  imageUrl?: string;
}

export const resourceFormConfig = (
  globalTags: Tag[],
  clients: Tag[],
  industries: Tag[],
): FormConfig<ResourceFormData> => ({
  formId: "newResourceForm",
  formTitle: "Create New Resource",
  initialData: initialResourceData,
  steps: [
    {
      id: 1,
      title: 'Resource Details',
      fields: [
        {
          id: 'resourceType',
          label: 'Resource Type',
          type: 'select' as FormFieldType,
          options: resourceTypeOptions,
          validation: { required: true },
          colSpan: 1,
        },
        {
          id: 'industryUseCases',
          label: 'Industry Use Cases',
          type: 'multi-select' as FormFieldType,
          options: industries,
          validation: { required: true },
          colSpan: 3,
        },
        {
          id: 'globalTags',
          label: 'Global Tags (max 7)',
          type: 'multi-select' as FormFieldType,
          options: globalTags,
          validation: { required: true },
          colSpan: 2,
        },
        {
          id: 'clientCompanies',
          label: 'Client Companies',
          type: 'multi-select' as FormFieldType,
          options: clients,
          colSpan: 2,
        },
        {
          id: 'resourceTitle',
          label: 'Resource Title (max 120 characters)',
          type: 'input' as FormFieldType,
          validation: { required: true, maxLength: 120 },
          colSpan: 3,
        },
        {
          id: 'date',
          label: 'Date',
          type: 'date' as FormFieldType,
          validation: { required: true },
          colSpan: 1,
        },
        {
          id: 'headline',
          label: 'Headline (max 150 characters)',
          type: 'textarea' as FormFieldType,
          validation: { required: true, maxLength: 150 },
          className: 'min-h-[150px]',
          colSpan: 2,
        },
        {
          id: 'heroImage',
          label: 'Hero Image',
          type: 'file' as FormFieldType,
          accept: 'image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg',
          multiple: false,
          maxFiles: 1,
          validation: { required: true },
          colSpan: 2,
        }
      ],
    },
    {
      id: 2,
      title: 'Content Sections',
      fields: [
        {
          id: 'sections',
          label: 'Content Sections',
          type: 'dynamic-section' as FormFieldType,
          maxItems: 4,
          minItems: 0,
          addButtonText: 'Add Content Section',
          removeButtonText: 'Remove',
          itemTitle: 'Content Section',
          itemFields: [
            {
              id: 'sectionTitle',
              label: 'Section Title (max 60 characters)',
              type: 'input' as FormFieldType,
              placeholder: 'Enter section title',
              validation: { required: true, maxLength: 60, minLength: 6 },
              colSpan: 2,
            },
            {
              id: 'sectionImage',
              label: 'Section Image',
              type: 'file' as FormFieldType,
              accept: 'image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg',
              multiple: false,
              validation: { required: false },
              compact: true,
              colSpan: 2,
            },
            {
              id: 'sectionContent',
              label: 'Section Content',
              type: 'rich-text' as FormFieldType,
              placeholder: 'Enter section content using the rich text editor. Use headings to structure your content and formatting for emphasis.',
              validation: { required: true, minLength: 20 },
              colSpan: 4,
            },
          ],
          colSpan: 4,
        },
      ],
    },
    {
      id: 3,
      title: 'Review & Submit',
      fields: [
        {
          id: 'reviewResourceData',
          label: '',
          type: 'custom-component' as FormFieldType,
          renderComponent: ReviewResourceStep as any,
          colSpan: 4,
        },
      ],
    },
  ],
  onSubmit: async (data, isDraft) => {
    console.log("Resource Form Submitted", data, isDraft);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (data.resourceTitle === "force_error") {
      throw new Error("Simulated error submitting resource.");
    }
    console.log("Resource submission successful (simulated).");
  },
}); 