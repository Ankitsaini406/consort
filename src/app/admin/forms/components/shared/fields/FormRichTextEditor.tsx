import React from 'react';
import { RichTextEditor } from "@/components/ui/rich-text-editor-v2";
import { cn } from '@/lib/utils';
import { FormLabel } from './FormLabel';

export interface FormRichTextEditorProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
  minHeight?: string;
  compact?: boolean;
  disabled?: boolean;
}

export const FormRichTextEditor: React.FC<FormRichTextEditorProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className,
  minHeight = "200px",
  compact = false,
  disabled = false,
}) => {
  const editorRef = React.useRef<any>(null);

  // Enhanced placeholder for compact mode
  const enhancedPlaceholder = compact && required 
    ? `${placeholder || label} *` 
    : placeholder || (compact ? label : "Start typing...");

  // Helper functions to get formatted content
  const getFormattedContent = () => {
    if (editorRef.current) {
      return {
        html: editorRef.current.getHTML(),
        plainText: editorRef.current.getPlainText(),
        blocks: editorRef.current.getBlocks()
      };
    }
    return null;
  };

  // Expose helper functions for parent components
  React.useImperativeHandle(React.createRef(), () => ({
    getFormattedContent,
    focus: () => {
      // Focus the first editable block
      const firstBlock = document.querySelector(`[data-block-id]`) as HTMLElement;
      if (firstBlock) {
        firstBlock.focus();
      }
    }
  }));

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Show label only in non-compact mode */}
      {!compact && (
        <FormLabel htmlFor={id} required={required}>
          {label}
        </FormLabel>
      )}
      
      <RichTextEditor
        ref={editorRef}
        value={value}
        onChange={onChange}
        placeholder={enhancedPlaceholder}
        minHeight={minHeight}
        error={error}
        disabled={disabled}
        className={cn(
          compact && required ? "border-l-4 border-l-amber-400" : "",
          className
        )}
      />
      
      {/* Display formatted content info in development mode */}
      {process.env.NODE_ENV === 'development' && value && (
        <details className="text-xs text-muted-foreground mt-1">
          <summary className="cursor-pointer">View stored data</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(JSON.parse(value || '[]'), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}; 