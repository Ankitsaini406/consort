import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { FormLabel } from './FormLabel';
import { CharacterCount } from './CharacterCount';

interface FormTextAreaProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
  minHeight?: string;
  compact?: boolean; // New prop for compact mode
  maxLength?: number; // For character count display
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className,
  minHeight = "120px",
  compact = false,
  maxLength,
}) => {
  // Enhanced placeholder for compact mode
  const enhancedPlaceholder = compact && required 
    ? `${placeholder || label} *` 
    : placeholder || (compact ? label : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Show label only in non-compact mode */}
      {!compact && (
        <FormLabel 
          htmlFor={id} 
          required={required}
          rightContent={<CharacterCount current={value.length} max={maxLength} />}
        >
          {label}
        </FormLabel>
      )}
      
      <textarea
        id={id}
        placeholder={enhancedPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight }}
        className={cn(
          "flex w-full rounded-sm border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          error ? "border-red-500 focus:ring-red-500" : "",
          compact && required ? "border-l-4 border-l-amber-400" : "",
          className
        )}
      />
      
      {error && <span className="text-red-500 text-sm pl-2">{error}</span>}
    </div>
  );
}; 