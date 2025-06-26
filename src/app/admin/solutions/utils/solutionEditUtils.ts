import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { SolutionFormData } from '../types';

// Transform Firestore document data to form data structure
const transformFirestoreToFormData = (firestoreData: any): SolutionFormData => {
    // Handle content sections that might have image URLs
    const transformedSections = (firestoreData.contentSections || []).map((section: any, index: number) => ({
        id: section.id || `section-${index}`,
        title: section.title || "",
        subheading: section.subheading || section.descriptionHeading || "",
        content: section.content || section.descriptionText || "",
        image: null, // Reset file input
        imageUrl: section.sectionImage || section.imageUrl || "", // Store existing URL for display
    }));

    return {
        // Solution Details
        solutionName: firestoreData.solutionName || firestoreData.solutionTitle || "",
        solutionOverview: firestoreData.solutionOverview || firestoreData.headline || "",
        primaryIndustry: firestoreData.primaryIndustry || firestoreData.solutionIndustry || "",
        globalTags: firestoreData.globalTags || [],
        clientCompanies: firestoreData.clientCompanies || [],
        
        // Files - Set to null, show existing as links
        heroImage: null,
        solutionBrochure: null,
        
        // Existing URLs for display
        heroImageUrl: firestoreData.heroImage || "",
        solutionBrochureUrl: firestoreData.brochureUrl || firestoreData.solutionBrochureUrl || "",
        
        // Dynamic sections with existing URLs
        contentSections: transformedSections,
        
        // Metadata
        slug: firestoreData.slug || "",
    };
};

export async function getSolutionForEdit(documentId: string): Promise<SolutionFormData | null> {
    try {
        const docRef = doc(db, 'solutions', documentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error(`Solution with ID ${documentId} not found`);
            return null;
        }
        
        const firestoreData = docSnap.data();
        return transformFirestoreToFormData(firestoreData);
    } catch (error) {
        console.error('Error loading solution for edit:', error);
        throw new Error(`Failed to load solution: ${documentId}`);
    }
} 