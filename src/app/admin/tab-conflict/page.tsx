'use client';

import { useEffect } from 'react';

export default function TabConflictPage() {
    useEffect(() => {
        // Try to close the tab again after page loads
        const timer = setTimeout(() => {
            window.close();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleCloseTab = () => {
        window.close();
        // If window.close() doesn't work, show instructions
        setTimeout(() => {
            alert('Please manually close this tab using Ctrl+W (Windows/Linux) or Cmd+W (Mac), or click the X button on the tab.');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <svg 
                            className="w-8 h-8 text-orange-600" 
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Multiple Admin Sessions
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Another admin session is already active. For security reasons, 
                        only one admin session can be active at a time.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleCloseTab}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Close This Tab
                    </button>
                    
                    <div className="text-sm text-gray-500">
                        <p className="mb-2">If the button doesn't work, please manually close this tab:</p>
                        <div className="bg-gray-100 rounded p-3 text-left">
                            <p><strong>Windows/Linux:</strong> Ctrl + W</p>
                            <p><strong>Mac:</strong> Cmd + W</p>
                            <p><strong>Or:</strong> Click the X on this tab</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        You can continue using the admin panel in your other tab.
                    </p>
                </div>
            </div>
        </div>
    );
} 