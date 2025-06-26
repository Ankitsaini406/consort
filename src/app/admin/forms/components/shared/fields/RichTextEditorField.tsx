import React from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor-v2';
import { RenderedFieldProps } from '@/app/admin/forms/types';

interface RichTextEditorFieldProps extends RenderedFieldProps<string> {}

export const RichTextEditorField: React.FC<RichTextEditorFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
}) => {
  const handleChange = (newValue: string) => {
    onChange(field.id, newValue);
  };

  return (
    <div className="space-y-2">
      {/* <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label> */}
      <RichTextEditor
        value={value || ''}
        onChange={handleChange}
        placeholder={field.placeholder || 'Start typing...'}
        className={field.className}
        error={error}
        minHeight="300px"
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}; 