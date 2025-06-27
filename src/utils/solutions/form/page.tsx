"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger
} from "@/components/ui/multi-select";
import { HighlightsSection } from "./components/HighlightsSection";
import { SolutionHighlight, PhotoInfo } from "./types";
import { Save } from "lucide-react";
import { Button3 } from "@/ui/components/Button3";
import { FeatherArrowLeft } from "@subframe/core";
import { useRouter } from "next/navigation";

interface FormData {
    title: string;
    brief: string;
    image: string;
    tags: string[];
    highlights: SolutionHighlight[];
    isDraft?: boolean;
}

interface FormErrors {
    title?: string;
    brief?: string;
    image?: string;
    tags?: string;
    highlights?: string;
}

// Predefined tags for the multi-select
const AVAILABLE_TAGS = [
    { value: "web-development", label: "Web Development" },
    { value: "mobile-app", label: "Mobile App" },
    { value: "ui-ux", label: "UI/UX" },
    { value: "backend", label: "Backend" },
    { value: "frontend", label: "Frontend" },
    { value: "database", label: "Database" },
    { value: "cloud", label: "Cloud" },
    { value: "devops", label: "DevOps" },
    { value: "security", label: "Security" },
    { value: "api", label: "API" },
    { value: "performance", label: "Performance" },
    { value: "analytics", label: "Analytics" }
];

// Add this type at the top of the file
type StepNumber = 1 | 2 | 3 | 4;

export default function Page() {
    const [step, setStep] = useState<StepNumber>(1);
    const totalSteps = 4;
    const router = useRouter();
    
    const [formData, setFormData] = useState<FormData>({
        title: "",
        brief: "",
        image: "",
        tags: [],
        highlights: [],
        isDraft: false
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const handleInputChange = (
        field: keyof FormData,
        value: string | string[] | SolutionHighlight[]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleHighlightChange = (index: number, field: keyof SolutionHighlight, value: string | PhotoInfo[]) => {
        setFormData((prev) => ({
            ...prev,
            highlights: prev.highlights.map((highlight, i) =>
                i === index ? { ...highlight, [field]: value } : highlight
            ),
        }));
    };

    const handleAddHighlight = () => {
        setFormData((prev) => ({
            ...prev,
            highlights: [
                ...prev.highlights,
                {
                    title: "",
                    description: "",
                    photos: [],
                },
            ],
        }));
    };

    const handleRemoveHighlight = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index),
        }));
    };

    const handleRemovePhoto = (highlightIndex: number, photoIndex: number) => {
        setFormData((prev) => ({
            ...prev,
            highlights: prev.highlights.map((highlight, i) =>
                i === highlightIndex
                    ? {
                        ...highlight,
                        photos: highlight.photos.filter((_, j) => j !== photoIndex),
                    }
                    : highlight
            ),
        }));
    };

    const validateStep = (stepNumber: number): boolean => {
        const newErrors: FormErrors = {};

        if (stepNumber === 1) {
            if (!formData.title.trim()) {
                newErrors.title = "Title is required";
            }
            if (!formData.brief.trim()) {
                newErrors.brief = "Brief description is required";
            }
            if (formData.tags.length === 0) {
                newErrors.tags = "At least one tag is required";
            }
        }

        if (stepNumber === 2 && !formData.isDraft) {
            if (!formData.image) {
                newErrors.image = "Image is required";
            }
        }

        if (stepNumber === 3 && !formData.isDraft) {
            if (formData.highlights.length === 0) {
                newErrors.highlights = "At least one highlight is required";
            } else {
                const invalidHighlights = formData.highlights.some(
                    h => !h.title.trim() || !h.description.trim()
                );
                if (invalidHighlights) {
                    newErrors.highlights = "All highlights must have title and description";
                }
            }
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isStepValid = (stepNumber: number): boolean => {
        switch (stepNumber) {
            case 1:
                return !!(formData.title.trim() && formData.brief.trim() && formData.tags.length > 0);
            case 2:
                return formData.isDraft || !!formData.image;
            case 3:
                return formData.isDraft || (
                    formData.highlights.length > 0 &&
                    formData.highlights.every(h => h.title.trim() && h.description.trim())
                );
            default:
                return true;
        }
    };

    const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
        e.preventDefault();

        if (asDraft || validateStep(step)) {
            const dataToSubmit = {
                ...formData,
                isDraft: asDraft
            };

            console.log("Form submitted:", dataToSubmit);
            // Handle form submission
            // You would typically send this to your API
            // await submitSolution(dataToSubmit);
        }
    };

    const handleSaveAsDraft = (e: React.FormEvent) => {
        handleSubmit(e, true);
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep((prev) => {
                const next = Math.min(prev + 1, totalSteps);
                return next as StepNumber;
            });
        }
    };

    const prevStep = () => {
        setStep((prev) => {
            const next = Math.max(prev - 1, 1);
            return next as StepNumber;
        });
    };

    const goToStep = (targetStep: StepNumber) => {
        if (targetStep >= 1 && targetStep <= totalSteps) {
            setStep(targetStep);
        }
    };

    return (
        <div className="flex h-[100vh] items-center justify-center bg-slate-100">
            <div className="max-w-5xl w-full border h-[calc(100vh-20rem)] bg-white rounded-md overflow-hidden flex">
                {/* Left side vertical stepper */}
                <div className="w-64 border-r bg-gray-50 p-6">
                    <h1 className="text-xl font-bold mb-6">Create Solution</h1>
                    <Button3 variant="link" onClick={() => router.back()}>
                        <div className="flex items-center gap-2">
                            <FeatherArrowLeft /> <span>Go Back</span>
                        </div>
                    </Button3>
                    <div className="flex flex-col space-y-8 relative">
                        {/* Vertical line */}
                        <div className="absolute left-[19px] top-[30px] bottom-4 w-[2px] bg-gray-200">
                            <div
                                className="bg-blue-600 w-full transition-all duration-300"
                                style={{ height: `${((step - 1) / 3) * 100}%` }}
                            />
                        </div>

                        {([1, 2, 3, 4] as const).map((stepNumber) => (
                            <div key={stepNumber} className="flex items-start relative z-10">
                                <button
                                    onClick={() => stepNumber < step && goToStep(stepNumber)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0
                                        ${stepNumber <= step
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-gray-300 bg-white text-gray-400"
                                        } ${stepNumber < step ? "cursor-pointer hover:bg-blue-700" : ""}
                                    `}
                                >
                                    {stepNumber}
                                </button>
                                <div className="ml-3">
                                    <span className={`text-sm font-medium block
                                        ${stepNumber <= step ? "text-blue-600" : "text-gray-400"}`}
                                    >
                                        {stepNumber === 1 && "Basic Info"}
                                        {stepNumber === 2 && "Image"}
                                        {stepNumber === 3 && "Highlights"}
                                        {stepNumber === 4 && "Review"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {stepNumber === 1 && "Enter basic details"}
                                        {stepNumber === 2 && "Upload solution image"}
                                        {stepNumber === 3 && "Add key features"}
                                        {stepNumber === 4 && "Review and submit"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side content */}
                <div className="flex-1 p-6 overflow-auto">
                    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter the basic details about your solution
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => handleInputChange("title", e.target.value)}
                                            placeholder="Enter title"
                                        />
                                        {formErrors.title && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Brief Description <span className="text-red-500">*</span>
                                        </label>
                                        <Textarea
                                            value={formData.brief}
                                            onChange={(e) => handleInputChange("brief", e.target.value)}
                                            placeholder="Enter brief description"
                                        />
                                        {formErrors.brief && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.brief}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Tags <span className="text-red-500">*</span>
                                        </label>
                                        <MultiSelector
                                            values={formData.tags}
                                            onValuesChange={(newValues: string[]) => handleInputChange("tags", newValues)}
                                            className="w-full"
                                        >
                                            <MultiSelectorTrigger>
                                                <MultiSelectorInput placeholder="Select tags" />
                                            </MultiSelectorTrigger>
                                            <MultiSelectorContent>
                                                <MultiSelectorList>
                                                    {AVAILABLE_TAGS.map(tag => (
                                                        <MultiSelectorItem key={tag.value} value={tag.value}>
                                                            {tag.label}
                                                        </MultiSelectorItem>
                                                    ))}
                                                </MultiSelectorList>
                                            </MultiSelectorContent>
                                        </MultiSelector>
                                        {formErrors.tags && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.tags}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Image Upload</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload a representative image for your solution
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Image {!formData.isDraft && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const fileData: PhotoInfo = {
                                                            name: file.name,
                                                            url: URL.createObjectURL(file)
                                                        };
                                                        handleInputChange("image", fileData.url);
                                                    }
                                                }}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="cursor-pointer text-blue-600 hover:text-blue-800"
                                            >
                                                Click to upload image
                                            </label>
                                            {formData.image && (
                                                <div className="mt-4">
                                                    <img
                                                        src={formData.image}
                                                        alt="Preview"
                                                        className="max-w-xs mx-auto"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {formErrors.image && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Solution Highlights</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add key highlights and features of your solution
                                    </p>
                                </div>
                                <div>
                                    <HighlightsSection
                                        highlights={formData.highlights}
                                        onHighlightChange={handleHighlightChange}
                                        onAddHighlight={handleAddHighlight}
                                        onRemoveHighlight={handleRemoveHighlight}
                                        onRemovePhoto={handleRemovePhoto}
                                    />
                                    {formErrors.highlights && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.highlights}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Review Your Solution</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Review all the information before submitting
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    {/* Basic Information Review */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">Basic Information</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToStep(1)}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">Title:</span> {formData.title}</p>
                                            <p><span className="font-medium">Brief:</span> {formData.brief}</p>
                                            <div>
                                                <span className="font-medium">Tags:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {formData.tags.map((tagValue) => {
                                                        const tag = AVAILABLE_TAGS.find(t => t.value === tagValue);
                                                        return (
                                                            <span
                                                                key={tagValue}
                                                                className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                                                            >
                                                                {tag?.label || tagValue}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Review */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">Image</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToStep(2)}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                        {formData.image ? (
                                            <img
                                                src={formData.image}
                                                alt="Solution"
                                                className="max-w-xs mx-auto"
                                            />
                                        ) : (
                                            <p className="text-gray-500">No image uploaded</p>
                                        )}
                                    </div>

                                    {/* Highlights Review */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">Highlights</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToStep(3)}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            {formData.highlights.map((highlight, index) => (
                                                <div key={highlight.title || index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                                    <h4 className="font-medium mb-2">Highlight {index + 1}</h4>
                                                    <p><span className="font-medium">Title:</span> {highlight.title}</p>
                                                    <p><span className="font-medium">Description:</span> {highlight.description}</p>
                                                    {highlight.photos.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="font-medium mb-1">Photos:</p>
                                                            <div className="grid gap-2">
                                                                {highlight.photos.map((photo, photoIndex) => (
                                                                    <div
                                                                        key={photoIndex}
                                                                        className="text-sm text-gray-600"
                                                                    >
                                                                        {photo.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-6 border-t mt-8">
                            <div className="flex gap-2">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        className="flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </Button>
                                )}
                                {step === 4 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleSaveAsDraft}
                                        className="flex items-center"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save as Draft
                                    </Button>
                                )}
                            </div>

                            <div>
                                {step < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!isStepValid(step)}
                                        className="flex items-center"
                                    >
                                        Next
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={!isStepValid(step)}
                                        className="flex items-center"
                                    >
                                        Submit Solution
                                    </Button>
                                )}
                            </div>
                        </div>

                        {Object.keys(formErrors).length > 0 && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                                <h4 className="font-medium mb-2">Please fix the following errors:</h4>
                                <ul className="list-disc list-inside">
                                    {Object.entries(formErrors).map(([field, message]) => (
                                        message ? <li key={field}>{message}</li> : null
                                    ))}
                                </ul>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
