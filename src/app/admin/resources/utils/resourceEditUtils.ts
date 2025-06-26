import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { ResourceFormData, ResourceSectionItem } from '../types';

// Transform Firestore document data to form data structure
const transformFirestoreToFormData = (firestoreData: any): ResourceFormData => {
    // Handle sections that might have imageUrls
    const transformedSections: ResourceSectionItem[] = (firestoreData.sections || []).map((section: any, index: number) => ({
        id: section.id || `section-${index}`,
        sectionTitle: section.sectionTitle || "",
        sectionContent: section.sectionContent || "",
        sectionImage: null, // Reset file input
        sectionImageUrl: section.sectionImageUrl || "", // Store existing URL for display
    }));

    return {
        // Resource Details
        resourceType: firestoreData.resourceType || "",
        industryUseCases: firestoreData.industryUseCases || [],
        resourceTitle: firestoreData.resourceTitle || "",
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

export async function getResourceForEdit(documentId: string): Promise<ResourceFormData | null> {
    try {
        const docRef = doc(db, 'resources', documentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error(`Resource with ID ${documentId} not found`);
            return null;
        }
        
        const firestoreData = docSnap.data();
        return transformFirestoreToFormData(firestoreData);
    } catch (error) {
        console.error('Error loading resource for edit:', error);
        throw new Error(`Failed to load resource: ${documentId}`);
    }
} 