'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FormLabel } from '@/app/admin/forms/components/shared/fields/FormLabel';
import DynamicFeatherIcon from '@/components/admin/DynamicFeatherIcon';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface IconOption {
    value: string;
    label: string;
}

interface IconSelectFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: IconOption[];
    placeholder?: string;
    required?: boolean;
    error?: string;
    compact?: boolean;
    className?: string;
}

// Memoized icon item component to prevent unnecessary re-renders
const IconSelectItem = React.memo(({ option }: { option: IconOption }) => (
    <SelectItem value={option.value} className="flex items-center gap-2 cursor-pointer">
        <div className="flex items-center gap-1 w-full">
            <DynamicFeatherIcon 
                name={option.value} 
                className="h-4 w-4 text-consort-blue flex-shrink-0" 
            />
            <span className="text-sm font-body">{option.label}</span>
        </div>
    </SelectItem>
));

IconSelectItem.displayName = 'IconSelectItem';

export const IconSelectField: React.FC<IconSelectFieldProps> = ({
    id,
    label,
    value,
    onChange,
    options,
    placeholder,
    required,
    error,
    compact,
    className
}) => {
    // Lazy loading: only render options when dropdown is open
    const [isOpen, setIsOpen] = useState(false);

    // Memoize selected option lookup to prevent unnecessary re-computation
    const selectedOption = useMemo(() => 
        value ? options.find(opt => opt.value === value) : null, 
        [value, options]
    );

    // Memoize placeholder to prevent template literal re-computation
    const placeholderText = useMemo(() => 
        placeholder || (compact ? label : `Select from ${options.length} icons...`), 
        [placeholder, compact, label, options.length]
    );

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {!compact && (
                <FormLabel htmlFor={id} required={required}>
                    {label}
                </FormLabel>
            )}
            <Select 
                onValueChange={onChange} 
                value={value || ''}
                onOpenChange={setIsOpen}
            >
                <SelectTrigger 
                    className={cn(
                        error ? 'border-red-500' : '',
                        compact && required ? 'border-l-4 border-l-orange-400' : ''
                    )}
                >
                    {selectedOption ? (
                        <div className="flex items-center gap-2 w-full">
                            <DynamicFeatherIcon 
                                name={selectedOption.value} 
                                className="h-4 w-4 text-consort-blue" 
                            />
                            <span>{selectedOption.label}</span>
                        </div>
                    ) : (
                        <SelectValue placeholder={placeholderText} />
                    )}
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                    <SelectGroup>
                        {/* Lazy loading: only render options when dropdown is open */}
                        {isOpen && options.map(option => (
                            <IconSelectItem key={option.value} option={option} />
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {error && <span className="text-red-500 text-sm pl-2">{error}</span>}
        </div>
    );
}; 