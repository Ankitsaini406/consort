import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { IndustryFormData } from '../types';

// Transform Firestore document data to form data structure
const transformFirestoreToFormData = (firestoreData: any): IndustryFormData => {
    return {
        // Industry Details
        industryName: firestoreData.industryName || "",
        industryOverview: firestoreData.industryOverview || "",
        industryDescription: firestoreData.industryDescription || "",
        industryBriefDescription: firestoreData.industryBriefDescription || "",
        industryHeadline: firestoreData.industryHeadline || "",
        globalTags: firestoreData.globalTags || [],
        
        // Files - Set to null, show existing as links
        industryIcon: null,
        industryImage: null,
        industryBrochureFile: null,
        industryDatasheetFile: null,
        industryCaseStudyFile: null,
        
        // Existing URLs for display
        industryIconUrl: firestoreData.industryIconUrl || "",
        industryImageUrl: firestoreData.industryImageUrl || "",
        brochureUrl: firestoreData.brochureUrl || "",
        datasheetUrl: firestoreData.datasheetUrl || "",
        caseStudyUrl: firestoreData.caseStudyUrl || "",
        
        // Dynamic sections
        industryStatistics: firestoreData.industryStatistics || [{ id: "1", value: "", description: "" }],
        industryFeatures: firestoreData.industryFeatures || [{ id: "1", description: "", icon: "" }],
        industryLeaders: firestoreData.industryLeaders || [],
        
        // Metadata
        slug: firestoreData.slug || "",
    };
};

export async function getIndustryForEdit(documentId: string): Promise<IndustryFormData | null> {
    try {
        const docRef = doc(db, 'industries', documentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error(`Industry with ID ${documentId} not found`);
            return null;
        }
        
        const firestoreData = docSnap.data();
        return transformFirestoreToFormData(firestoreData);
    } catch (error) {
        console.error('Error loading industry for edit:', error);
        throw new Error(`Failed to load industry: ${documentId}`);
    }
} 