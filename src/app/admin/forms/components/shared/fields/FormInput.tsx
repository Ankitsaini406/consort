import React from 'react';
import { cn } from '@/lib/utils';
import { FormLabel } from './FormLabel';
import { CharacterCount } from './CharacterCount';

interface FormInputProps {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
    className?: string;
    compact?: boolean;
    maxLength?: number; // For character count display
}

export const FormInput: React.FC<FormInputProps> = ({
    id,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    required = false,
    error,
    className,
    compact = false,
    maxLength,
}) => {
    const enhancedPlaceholder = compact && required 
        ? `${placeholder || label} *` 
        : placeholder || (compact ? label : undefined);

    return (
        <div className="flex flex-col gap-1 w-full">
            {!compact && (
                <FormLabel 
                    htmlFor={id} 
                    required={required}
                    rightContent={<CharacterCount current={value.length} max={maxLength} />}
                >
                    {label}
                </FormLabel>
            )}
            
            <input
                id={id}
                type={type}
                placeholder={enhancedPlaceholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    error ? "border-red-500 focus:ring-red-500" : "",
                    compact && required ? "border-l-4 border-l-amber-400" : "",
                    className
                )}
            />
            
            {error && <span className="text-red-500 text-sm pl-2">{error}</span>}
        </div>
    );
}; 