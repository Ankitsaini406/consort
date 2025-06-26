import React from 'react';

interface FormLabelProps {
    htmlFor: string;
    children: React.ReactNode;
    required?: boolean;
    className?: string;
    rightContent?: React.ReactNode; // For character count or other right-aligned content
}

export const FormLabel: React.FC<FormLabelProps> = ({
    htmlFor,
    children,
    required = false,
    className = "",
    rightContent,
}) => {
    return (
        <div className="flex items-center justify-between">
            <label 
                htmlFor={htmlFor} 
                className={`text-[12px] font-medium font-inter pl-2 text-default-font ${className}`}
            >
                {children} {required && <span className="text-red-500">*</span>}
            </label>
            {rightContent && (
                <div className="pr-2">
                    {rightContent}
                </div>
            )}
        </div>
    );
}; 