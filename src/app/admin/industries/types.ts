interface IndustryStatistic {
  id: string; // Or number, for unique key
  value: string; // Changed from statNumber
  description: string; // Changed from statDescription
}

interface IndustryFeature {
  id: string; // Or number, for unique key
  icon: string; // Value from the select dropdown
  description: string; // Changed from featureText
  brochureFile?: File | null; // Keep for backward compatibility
  caseStudyFile?: File | null; // Keep for backward compatibility
}

export interface IndustryFormData {
  // Step 1
  industryIcon: File | null;
  industryName: string;
  industryImage: File | null;
  industryOverview: string; // Changed from industryHeadline

  // Step 2
  industryStatistics: IndustryStatistic[]; // Changed from industryStats
  industryDescription: string; // Changed from industryBrief
  industryBriefDescription: string; // Keep for backward compatibility

  // Step 3
  industryFeatures: IndustryFeature[]; // Changed from industryKeyFeatures

  // Step 4 - Additional Details
  industryLeaders: string[]; // Changed from associatedCompanies
  industryBrochureFile: File | null; // Changed from industryBrochure
  industryCaseStudyFile: File | null; // Changed from industryCaseStudy
  industryDatasheetFile: File | null; // Added for datasheet support

  // Legacy fields for backward compatibility
  industryHeadline?: string; // Legacy
  industryStats?: IndustryStatItem[]; // Legacy
  industryBrief?: string; // Legacy
  industryKeyFeatures?: IndustryKeyFeatureItem[]; // Legacy
  associatedCompanies?: string[]; // Legacy
  industryBrochure?: File | null; // Legacy
  industryCaseStudy?: File | null; // Legacy

  // For AppFormRenderer compatibility, though try to avoid direct use
  [key: string]: any;
}

// Legacy interfaces for backward compatibility
interface IndustryStatItem {
  id: string;
  statNumber: string;
  statDescription: string;
}

interface IndustryKeyFeatureItem {
  id: string;
  icon: string;
  featureText: string;
  brochureFile?: File | null;
  caseStudyFile?: File | null;
}

// Helper function to create new industry statistic with unique ID
const createIndustryStatistic = (): IndustryStatistic => ({
  id: `stat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  value: '',
  description: ''
});

// Helper function to create new industry feature with unique ID
const createIndustryFeature = (): IndustryFeature => ({
  id: `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  icon: '',
  description: ''
}); 