// import { Timestamp } from "firebase/firestore"; // No longer needed

interface TabItemConfig {
    label: string;
    collection: string;
    filterField?: string;
    filterValue?: string;
}

interface ListConfig {
    heading: string;
    tabs: TabItemConfig[];
    defaultSelectedTabIndex: number;
}

export interface AdminContentItem {
    id: string;
    slug: string;
    docType: string; // The collection name (e.g., 'products', 'posts')

    // Universal fields
    isDraft: boolean;
    updatedAt: Date;
    createdAt: Date;
    updatedBy: string;
    createdBy: string;

    // Title fields (optional)
    postTitle?: string;
    resourceTitle?: string;
    productName?: string;
    solutionName?: string;
    solutionTitle?: string; // Transformed solution title
    industryName?: string;
    label?: string;

    // Subheading fields (optional)
    headline?: string;
    productBrief?: string;
    solutionOverview?: string;
    industryOverview?: string;
    marketingTagline?: string;

    // Post-specific fields
    date?: string; // Publication date for posts
    industryUseCases?: string[]; // Industry use cases array
    globalTags?: string[]; // Global tags array
    clientCompanies?: string[]; // Client companies array
    sections?: any[]; // Content sections array
    postType?: string; // Post type field

    // Resource-specific fields
    resourceType?: string; // Resource type field

    // Solution-specific fields
    primaryIndustry?: string; // Primary industry for solutions
    solutionIndustry?: string; // Transformed solution industry
    contentSections?: any[]; // Content sections for solutions
    solutionSections?: any[]; // Transformed solution sections
    brochureUrl?: string; // Solution brochure URL

    // Product-specific fields
    portfolioCategory?: string; // Product category
    targetIndustries?: string[]; // Target industries array
    brandName?: string; // Product brand
    keyFeatures?: any[]; // Key features array
    technicalSpecifications?: any[]; // Technical specs array
    marketingHighlights?: any[]; // Marketing highlights array
    productGalleryUrls?: string[]; // Product gallery URLs
    datasheetUrl?: string; // Datasheet URL
    caseStudyUrl?: string; // Case study URL

    // Industry-specific fields
    industryDescription?: string; // Industry description
    industryBriefDescription?: string; // Industry brief description
    industryStatistics?: any[]; // Industry statistics array
    industryFeatures?: any[]; // Industry features array
    industryLeaders?: string[]; // Industry leaders array
    industryIconUrl?: string; // Industry icon URL
    industryImageUrl?: string; // Industry image URL
    industryBrochureUrl?: string; // Industry brochure URL
    industryCaseStudyUrl?: string; // Industry case study URL

    // Attachment fields (optional)
    productPhotos?: string[];
    imageUrl?: string;
    heroImage?: string;
    heroImageUrl?: string; // Hero image URL for posts
    productGallery?: string[];
    visuals?: string[];
    galleryCount?: number;
    datasheets?: string;
    brochures?: string;
    caseStudies?: string;
}

export const listConfigurations: Record<string, ListConfig> = {
    posts: {
        heading: "Posts Database",
        tabs: [
            { label: "Blog Posts", collection: "posts", filterField: "postType", filterValue: "blog-post" },
            { label: "News", collection: "posts", filterField: "postType", filterValue: "news" },
            { label: "Events", collection: "posts", filterField: "postType", filterValue: "events" },
            { label: "Announcements", collection: "posts", filterField: "postType", filterValue: "announcements" },
        ],
        defaultSelectedTabIndex: 0,
    },
    resources: {
        heading: "Resources Database",
        tabs: [
            { label: "Case Studies", collection: "resources", filterField: "resourceType", filterValue: "case-study" },
            { label: "Whitepapers", collection: "resources", filterField: "resourceType", filterValue: "whitepaper" },
            { label: "Customer Reviews", collection: "resources", filterField: "resourceType", filterValue: "client-review" },
        ],
        defaultSelectedTabIndex: 0,
    },
    products: {
        heading: "Products Database",
        tabs: [
            { label: "Products", collection: "portfolio" },
            { label: "Tags", collection: "global-tags" },
            { label: "Product Brands", collection: "product-brands" },
            { label: "Clients", collection: "clients" },
        ],
        defaultSelectedTabIndex: 0,
    },
    solutions: {
        heading: "Solutions Database",
        tabs: [
            { label: "Solutions", collection: "solutions" },
            { label: "Global Tags", collection: "globalTags" },
            { label: "Client logos", collection: "client-logos" },
        ],
        defaultSelectedTabIndex: 0,
    },
    industries: {
        heading: "Industries Database",
        tabs: [
            { label: "Industries", collection: "industries" },
        ],
        defaultSelectedTabIndex: 0,
    },
};
