import React from 'react';
import { cn } from '@/lib/utils';
import { FormLabel } from './FormLabel';

interface FormDateFieldProps {
    id: string;
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
    className?: string;
    compact?: boolean;
    min?: string; // Minimum date (YYYY-MM-DD format)
    max?: string; // Maximum date (YYYY-MM-DD format)
}

export const FormDateField: React.FC<FormDateFieldProps> = ({
    id,
    label,
    placeholder,
    value,
    onChange,
    required = false,
    error,
    className,
    compact = false,
    min,
    max,
}) => {
    const enhancedPlaceholder = compact && required 
        ? `${placeholder || label} *` 
        : placeholder || (compact ? label : undefined);

    return (
        <div className="flex flex-col gap-2 w-full">
            {!compact && (
                <FormLabel htmlFor={id} required={required}>
                    {label}
                </FormLabel>
            )}
            
            <input
                id={id}
                type="date"
                placeholder={enhancedPlaceholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                className={cn(
                    "flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    error ? "border-red-500 focus-visible:ring-red-500" : "",
                    compact && required ? "border-l-4 border-l-amber-400" : "",
                    className
                )}
            />
            
            {error && <span className="text-red-500 text-sm pl-2">{error}</span>}
        </div>
    );
}; 