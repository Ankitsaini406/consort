import React from 'react';

interface ReviewStepContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const ReviewStepContainer: React.FC<ReviewStepContainerProps> = ({ 
  children, 
  className = "",
  maxWidth = '4xl'
}) => {
  const maxWidthClass = maxWidth === 'none' ? '' : `max-w-${maxWidth} mx-auto`;
  
  return (
    <div className={`w-full h-full overflow-y-auto ${maxWidthClass} ${className}`}>
      <div className="space-y-4 pb-4">
        {children}
      </div>
    </div>
  );
}; 