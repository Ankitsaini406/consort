// src/app/admin/solutions/form/components/SolutionSectionComponent.tsx
import React from 'react';
import { CustomArrayFieldProps } from '@/app/admin/forms/types';
import { SolutionFormData } from '../types';
import { FormInput } from '@/app/admin/forms/components/shared/fields/FormInput';
import { FormTextArea } from '@/app/admin/forms/components/shared/fields/FormTextArea';
import { FormFileUpload } from '@/app/admin/forms/components/shared/fields/FormFileUpload';

interface SolutionSectionComponentProps extends CustomArrayFieldProps<SolutionFormData['sections'][0]> {
  field: any; // Replace with the correct type if available
  formData: SolutionFormData;
}

export const SolutionSectionComponent: React.FC<SolutionSectionComponentProps> = ({
  items,
  addItem,
  removeItem,
  updateItem,
  field,
}) => {
  const defaultNewItem = {
    title: '',
    descriptionHeading: '',
    descriptionText: '',
    image: null,
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-neutral-border p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormInput
                id={`sections[${index}].title`}
                label="Section Title"
                value={item.title}
                onChange={(value) => updateItem(index, { ...item, title: value })}
                required
              />
            </div>
            <div className="col-span-2">
              <FormTextArea
                id={`sections[${index}].descriptionHeading`}
                label="Section Description Heading"
                value={item.descriptionHeading}
                onChange={(value) => updateItem(index, { ...item, descriptionHeading: value })}
              />
            </div>
            <div className="col-span-2">
              <FormTextArea
                id={`sections[${index}].descriptionText`}
                label="Section Description Text"
                value={item.descriptionText}
                onChange={(value) => updateItem(index, { ...item, descriptionText: value })}
                required
              />
            </div>
            <div className="col-span-2">
              <FormFileUpload
                id={`sections[${index}].image`}
                label="Upload Section Image"
                accept=".webp"
                value={item.image}
                onChange={(files) => updateItem(index, { ...item, image: files[0] })}
                onRemove={() => updateItem(index, { ...item, image: null })}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="mt-2 text-red-500 text-sm"
          >
            Remove Section
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addItem(defaultNewItem)}
        className="mt-4 bg-brand-50 text-brand-700 px-4 py-2 rounded-md"
      >
        Add Section
      </button>
    </div>
  );
};