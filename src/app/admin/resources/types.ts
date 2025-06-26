export interface ResourceSectionItem {
  id: string;
  sectionTitle: string;
  sectionContent: string;
  sectionImage?: File | null;
  sectionImageUrl?: string | null;
}

type ResourceType =
  | "blog-post"
  | "case-study"
  | "news"
  | "event"
  | "client-review"
  | "announcement"
  | "whitepaper";

export interface ResourceFormData {
  slug: string;
  resourceType: ResourceType | "";
  industryUseCases: string[];
  resourceTitle: string;
  globalTags: string[];
  date: string;
  headline: string;
  heroImage?: File | null;
  heroImageUrl?: string;
  sections: ResourceSectionItem[];
  clientCompanies?: string[];
  [key: string]: unknown;
}

export interface ResourceStorageData {
  slug: string;
  resourceType: ResourceType | "";
  industryUseCases: string[];
  resourceTitle: string;
  globalTags: string[];
  date: string;
  headline: string;
  heroImageUrl: string;
  sections: Array<{
    id: string;
    sectionTitle: string;
    sectionContent: string;
    sectionImageUrl: string | null;
  }>;
  clientCompanies?: string[];
  isDraft?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
} 