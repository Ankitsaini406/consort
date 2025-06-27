// Content Card Variants - 5 unique designs
export { default as ContentCard1 } from './ContentCard1';
export { default as ContentCard2 } from './ContentCard2';
export { default as ContentCard3 } from './ContentCard3';
export { default as ContentCard4 } from './ContentCard4';
export { default as ContentCard5 } from './ContentCard5';

// Type definitions
export interface ContentCardProps {
  image?: string;
  title: string;
  date?: string;
  url: string;
  tags?: string[];
  className?: string;
  type?: 'post' | 'resource';
} 