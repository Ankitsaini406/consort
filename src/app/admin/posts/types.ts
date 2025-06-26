export interface PostSectionItem {
  id: string;
  sectionTitle: string;
  sectionContent: string;
  sectionImage: File | null;
}

type PostType = 
  | "blog-post"
  | "news" 
  | "events"
  | "announcements";

export interface PostFormData {
  slug: string;
  postType: string;
  industryUseCases: string[]; // This will store slugs/ids of industries
  postTitle: string;
  globalTags: string[]; // This will store slugs/ids of global tags
  date: string; // Date field for post publication date
  headline: string;
  heroImage: File | null;
  sections: PostSectionItem[];
  clientCompanies?: string[]; // Optional, for associating with clients
  [key: string]: unknown; // Index signature for compatibility
}

interface PostDocument extends Omit<PostFormData, 'heroImage' | 'sections'> {
  heroImageUrl?: string;
  sections: Omit<PostSectionItem, 'sectionImage'> & { sectionImageUrl?: string }[];
  createdAt: Date;
  updatedAt: Date;
} 