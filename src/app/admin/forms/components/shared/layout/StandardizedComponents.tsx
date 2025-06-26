import React from 'react';

// Standardized Section Header Component
interface SectionHeaderProps {
  title: string;
  index?: number;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  index, 
  className = "" 
}) => (
  <h4 className={`text-body font-body text-brand-600 mb-3 ${className}`}>
    {index !== undefined ? `${title} ${index + 1}` : title}
  </h4>
);

// Standardized Empty State Component
interface EmptyStateProps {
  message: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  className = "" 
}) => (
  <p className={`text-body font-body text-subtext-color ${className}`}>
    {message}
  </p>
);

// Standardized Nested Grid Component
interface NestedGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2;
}

export const NestedGrid: React.FC<NestedGridProps> = ({ 
  children, 
  className = "",
  cols = 2 
}) => {
  const gridClass = cols === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';
  
  return (
    <div className={`grid ${gridClass} gap-2 ${className}`}>
      {children}
    </div>
  );
};

// Standardized Section Divider Component
interface SectionDividerProps {
  children: React.ReactNode;
  isLast?: boolean;
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ 
  children, 
  isLast = false, 
  className = "" 
}) => (
  <div className={`py-3 ${!isLast ? 'border-b border-neutral-border' : ''} ${className}`}>
    {children}
  </div>
);

// Standardized Nested Section Container (for complex nested data like Industry stats/features)
interface NestedSectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const NestedSectionContainer: React.FC<NestedSectionContainerProps> = ({ 
  children, 
  className = "" 
}) => (
  <div className={`mb-4 p-3 rounded-lg bg-neutral-50 ${className}`}>
    {children}
  </div>
); 