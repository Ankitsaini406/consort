export interface User {
    id?: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
}

interface Section {
    id: string;
    sectionTitle: string;
    // sectionBulletPoints: string[];
    sectionContent: string;
    // sectionDescriptionText: string;
    sectionImageUrl: string;
}

export interface Posts {
    id: string;
    slug: string;
    isDraft: boolean;
    date: string;
    globalTags: string[];
    postTitle: string;
    headline: string;
    heroImageUrl: string;
    industryUseCases: string[];
    postType: string;
    sections: Section[];
    numberOfSections?: number;
    clientCompanies?: string[];
}

export interface Resources {
    id: string;
    slug: string;
    isDraft: boolean;
    date: string;
    globalTags: string[];
    resourceTitle: string;
    headline: string;
    heroImageUrl: string;
    industryUseCases: string[];
    resourceType: string;
    sections: Section[];
    numberOfSections?: number;
    clientCompanies?: string[];
}

interface BulletPoint {
    id: string;
    point: string;
}

interface Highlights {
    id: string;
    headline: string;
    description: string;
    visualUrls: string[];
}

export interface KeyFeatures {
    id: string;
    icon: string;
    keyFeature: string;
}

export interface TryFeatures {
    id: string;
    icon: string;
    description: string;
}

export interface TechnicalSpecification {
    id: string;
    parameter: string;
    specification: string;
}

interface ProductResources {
    brochure: {
        file: string;
    };
    caseStudy: {
        file: string;
    };
    datasheet: {
        file: string;
    };
}

interface Industry {
    slug: string;
    industryName: string;
    industryIconUrl: string;
}

export interface Products {
    id: string;
    slug: string;
    productName: string;
    briefDescription: string;
    briefHeadline: string;
    briefHighlight: string;
    bulletPoints: BulletPoint[];
    category: string[];
    highlights: Highlights[];
    productBrief: string;
    productIndex: string;
    productKeyFeatures: KeyFeatures[];
    productGalleryUrls: string[];
    brochureUrl: string;
    caseStudyUrl: string;
    datasheetUrl: string;
    globalTags: string[];
    keyFeatures: KeyFeatures[];
    marketingHighlights: Highlights[];
    marketingTagline: string;
    portfolioCategory: string;
    productOverview: string;
    productText: string;
    clientCompanies: string[];
    targetIndustries: string[];
    targetIndustriesData?: Industry[];
    clientCompaniesData?: { slug: string; label: string; imageUrl: string; }[];
    productDescription: string;
    technicalSpecifications?: TechnicalSpecification[];
}

interface IndustryKeyFeatures {
    id: string;
    icon: string;
    featureText: string;
}

interface IndustryStats {
    id: string;
    statDescription: string;
    statNumber: string;
}

export interface Industries {
    associatedCompanies: string[];
    slug: string;
    brochureUrl: string;
    caseStudyUrl: string;
    datasheetUrl: string;
    industryBrief: string;
    industryBriefDescription: string;
    industryOverview: string;
    industrySolutions: any[];
    industryName: string;
    industryIconUrl: string;
    industryDescription: string;
    industryFeatures: any[];
    industryHeadline: string;
    industryImageUrl: string;
    industryLeaders: string[];
    industryStatistics: any[];
    isDraft: boolean;
    // Legacy fields for backward compatibility
    industryBrochure?: string;
    industryCaseStudy?: string;
    industryIcon?: string;
    industryImage?: string;
    industryKeyFeatures?: IndustryKeyFeatures[];
    industryStats?: IndustryStats[];
}
