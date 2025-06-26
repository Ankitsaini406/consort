import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { PostFormData, PostSectionItem } from '../types';

// Transform Firestore document data to form data structure
const transformFirestoreToFormData = (firestoreData: any): PostFormData => {
    // Handle sections that might have imageUrls
    const transformedSections: PostSectionItem[] = (firestoreData.sections || []).map((section: any, index: number) => ({
        id: section.id || `section-${index}`,
        sectionTitle: section.sectionTitle || "",
        sectionContent: section.sectionContent || "",
        sectionImage: null, // Reset file input
        sectionImageUrl: section.sectionImageUrl || "", // Store existing URL for display
    }));

    return {
        // Post Details
        postType: firestoreData.postType || "",
        industryUseCases: firestoreData.industryUseCases || [],
        postTitle: firestoreData.postTitle || "",
        globalTags: firestoreData.globalTags || [],
        date: firestoreData.date || "",
        headline: firestoreData.headline || "",
        clientCompanies: firestoreData.clientCompanies || [],
        
        // Files - Set to null, show existing as links
        heroImage: null,
        
        // Existing URLs for display
        heroImageUrl: firestoreData.heroImageUrl || "",
        
        // Dynamic sections with existing URLs
        sections: transformedSections,
        numberOfSections: transformedSections.length,
        
        // Metadata
        slug: firestoreData.slug || "",
    };
};

export async function getPostForEdit(documentId: string): Promise<PostFormData | null> {
    try {
        const docRef = doc(db, 'posts', documentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error(`Post with ID ${documentId} not found`);
            return null;
        }
        
        const firestoreData = docSnap.data();
        return transformFirestoreToFormData(firestoreData);
    } catch (error) {
        console.error('Error loading post for edit:', error);
        throw new Error(`Failed to load post: ${documentId}`);
    }
} 