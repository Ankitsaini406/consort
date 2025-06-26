import React from 'react';
import { cn } from '@/lib/utils';

interface CharacterCountProps {
  current: number;
  max?: number;
  className?: string;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({ 
  current, 
  max, 
  className 
}) => {
  if (!max) return null;
  
  const isNearLimit = current > max * 0.8;
  const isOverLimit = current > max;
  
  return (
    <span 
      className={cn(
        "text-xs font-medium font-body transition-colors duration-200",
        isOverLimit 
          ? "text-red-600" 
          : isNearLimit 
            ? "text-amber-600" 
            : "text-gray-400",
        className
      )}
    >
      {current}/{max}
    </span>
  );
}; 