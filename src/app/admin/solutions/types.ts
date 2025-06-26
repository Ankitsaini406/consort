interface ContentSection {
  id?: string; // Optional: if items need unique IDs for backend or complex state management
  title: string;
  subheading: string; // Changed from descriptionHeading
  content: string; // Changed from descriptionText
  image: File | null;
}

export interface SolutionFormData {
  primaryIndustry: string; // Changed from solutionIndustry
  solutionName: string; // Changed from solutionTitle
  globalTags: string[];
  solutionOverview: string; // Changed from headline
  heroImage: File | null; // Changed from solutionHeroImage
  solutionBrochure: File | null; // Changed from brochure
  contentSections: ContentSection[]; // Changed from solutionSections
  clientCompanies: string[];

  [key: string]: unknown; // More type-safe index signature
}

// Legacy interface for backward compatibility
interface SolutionSectionItem {
  id?: string;
  title: string;
  descriptionHeading: string;
  descriptionText: string;
  image: File | null;
}

// Props for custom array component fields, if needed for more detailed typing
interface SolutionSectionItemProps {
  item: ContentSection;
  index: number;
  onUpdate: (index: number, updates: Partial<ContentSection>) => void;
  onRemove: (index: number) => void;
}