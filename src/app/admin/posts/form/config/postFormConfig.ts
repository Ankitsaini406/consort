import { FormConfig, FormFieldType } from "@/app/admin/forms/types";
import { PostFormData } from "../../types";
import { ReviewPostStep } from "../components/ReviewPostStep";

const initialPostData: PostFormData = {
  slug: "",
  postType: "",
  industryUseCases: [],
  postTitle: "",
  globalTags: [],
  date: "",
  headline: "",
  heroImage: null,
  sections: [],
  clientCompanies: [],
};

const postTypeOptions = [
  { value: "blog-post", label: "Blog Post" },
  { value: "news", label: "News" },
  { value: "events", label: "Event" },
  { value: "announcements", label: "Announcement" },
];

interface Tag {
  value: string;
  label: string;
  imageUrl?: string;
}

export const postFormConfig = (
  globalTags: Tag[],
  clients: Tag[],
  industries: Tag[],
): FormConfig<PostFormData> => ({
  formId: "newPostForm",
  formTitle: "Create New Post",
  initialData: initialPostData,
  steps: [
    {
      id: 1,
      title: 'Post Details',
      fields: [
        {
          id: 'postType',
          label: 'Post Type',
          type: 'select' as FormFieldType,
          options: postTypeOptions,
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
          label: 'Global Tags (max 3)',
          type: 'multi-select' as FormFieldType,
          options: globalTags,
          validation: { required: true },
          maxItems: 3,
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
          id: 'postTitle',
          label: 'Post Title (max 120 characters)',
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
          id: 'reviewPostData',
          label: '',
          type: 'custom-component' as FormFieldType,
          renderComponent: ReviewPostStep as any,
          colSpan: 4,
        },
      ],
    },
  ],
  onSubmit: async (data, isDraft) => {
    console.log("Post Form Submitted", data, isDraft);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (data.postTitle === "force_error") {
      throw new Error("Simulated error submitting post.");
    }
    console.log("Post submission successful (simulated).");
  },
}); 