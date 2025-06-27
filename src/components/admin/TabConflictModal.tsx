'use client';

import { useEffect } from 'react';

interface TabConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCloseTab: () => void;
    title?: string;
    message?: string;
}

export function TabConflictModal({
    isOpen,
    onClose,
    onCloseTab,
    title = "Multiple Admin Sessions Detected",
    message = "Another admin session is already active in a different tab. For security reasons, only one admin session can be active at a time."
}: TabConflictModalProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <svg 
                                    className="w-6 h-6 text-orange-600" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-blue-900 mb-2">Recommended Action:</h4>
                            <p className="text-sm text-blue-800">
                                Close this tab and continue using the admin panel in your other tab.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={onCloseTab}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                Close This Tab
                            </button>
                            
                            <button
                                onClick={onClose}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                Keep Both Tabs (Not Recommended)
                            </button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                Having multiple admin sessions may cause unexpected behavior
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 