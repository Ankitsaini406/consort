'use client';

import React from 'react';
import { Button3 } from '@/ui/components/Button3';
import { FeatherArrowLeft } from '@subframe/core'; // Assuming @subframe/core is valid
import { useRouter } from "next/navigation";

interface Step {
    id: number | string; // Made id more generic to align with AppFormRenderer
    title: string;
    isCompleted: boolean;
    isActive: boolean;
}

interface StepProgressProps {
    steps: Step[];
    onStepClick: (stepId: number | string) => void; // Made stepId more generic
    formTitle?: string; // Optional: to display a title for the whole form like "New Product"
    backPath?: string; // Optional: for a custom back navigation path
}

export const StepProgress: React.FC<StepProgressProps> = ({ steps, onStepClick, formTitle = "Form Progress", backPath }) => {
    const router = useRouter();

    const handleBack = () => {
            router.push(backPath || '/admin');
    };

    return (
        <div className="min-w-[300px] w-64 p-6 min-h-full flex flex-col">
            <div className="px-3 py-1 border-b mb-10 ml-1">
                <span className="text-body-xl font-body-xl text-consort-blue text-default-font pb-3 block">
                    {formTitle}
                </span>
            </div>
            <div className="flex-grow">
                {steps.map((step, index) => (
                    <div key={step.id.toString()} > {/* Ensure key is string */}
                        <div
                            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${step.isActive
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'hover:bg-neutral-100'
                                }`}
                            onClick={() => onStepClick(step.id)}
                        >
                            <div
                                className={`w-7 h-7 rounded-sm flex items-center justify-center border-2 text-sm ${step.isCompleted
                                        ? 'bg-success-200 border-success-200 text-success-700'
                                        : step.isActive
                                            ? 'border-brand-600 text-brand-600 font-semibold'
                                            : 'border-neutral-300 text-neutral-400'
                                    }`}
                            >
                                {step.isCompleted ? (
                                    <span className="text-xs">✓</span>
                                ) : (
                                    // Display step index + 1 for active, non-completed steps
                                    <span className={step.isActive ? "font-semibold" : ""}>{index + 1}</span> 
                                )}
                            </div>
                            <span className={`text-body ${step.isActive
                                    ? 'text-brand-700 font-semibold'
                                    : step.isCompleted
                                        ? 'text-success-700'
                                        : 'text-neutral-600'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-0.5 h-4 ml-[1.625rem]  /* Approx center of the 7 width icon box */ ${step.isCompleted ? 'bg-success-500' : 'bg-neutral-200'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
            <div className='mt-auto pt-4'> {/* Ensure it stays at the bottom */}
                <Button3
                    className="w-fit !p-2"
                    variant="destructive-tertiary" // Consider a more neutral variant like 'neutral-tertiary' or 'outline'
                    onClick={handleBack}
                >
                    <div className="flex items-center gap-2">
                        <FeatherArrowLeft className="w-4 h-4" /> {backPath ? 'Cancel' : 'Dashboard'} 
                    </div>
                </Button3>
            </div>
        </div>
    );
}; 