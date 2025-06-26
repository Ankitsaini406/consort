import React from 'react';

interface StepCardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export const StepCard: React.FC<StepCardProps> = ({ children, title, subtitle }) => {
    return (
        <div className="h-full flex flex-col">
            {/* <div className="mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div> */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {children}
            </div>
        </div>
    );
}; 