import { getServerFirestore } from "@/firebase/firebaseServer";
import { Industries } from "@/types/types";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

export async function fetchAllIndustries(): Promise<Industries[]> {
    try {
        console.log('[fetchAllIndustries] Starting fetch...');
        const db = getServerFirestore();
        if (!db) {
            console.error('[fetchAllIndustries] Server Firestore not available');
            return [];
        }
        const blogsRef = collection(db, "industries");
        const snapshot = await getDocs(blogsRef);

        if (snapshot.empty) {
            console.warn('[fetchAllIndustries] No industries found in database');
            return [];
        }

        const industries = snapshot.docs.map((doc) => {
            const data = doc.data();
            
            // Validate critical fields
            if (!data.industryName) {
                console.warn(`[fetchAllIndustries] Industry ${doc.id} missing industryName`);
            }
            
            return {
                associatedCompanies: data.associatedCompanies ?? [],
                slug: data.slug ?? doc.id, // Fallback to doc.id if no custom slug
                brochureUrl: data.brochureUrl ?? "",
                caseStudyUrl: data.caseStudyUrl ?? "",
                datasheetUrl: data.datasheetUrl ?? "",
                industryBriefDescription: data.industryBriefDescription ?? "",
                industryOverview: data.industryOverview ?? "",
                industrySolutions: data.industrySolutions ?? [],
                industryName: data.industryName ?? "",
                industryIconUrl: data.industryIconUrl ?? "",
                // Map industryBriefDescription to industryBrief for backward compatibility
                industryBrief: data.industryBriefDescription ?? data.industryBrief ?? "",
                industryDescription: data.industryDescription ?? "",
                industryFeatures: data.industryFeatures ?? [],
                industryHeadline: data.industryHeadline ?? "",
                industryImageUrl: data.industryImageUrl ?? "",
                industryLeaders: data.industryLeaders ?? [],
                industryStatistics: data.industryStatistics ?? [],
                isDraft: data.isDraft ?? false,
            };
        });

        console.log(`[fetchAllIndustries] Successfully fetched ${industries.length} industries`);
        return industries;
    } catch (error) {
        console.error('[fetchAllIndustries] Database fetch failed:', error);
        // Return empty array instead of throwing to prevent build failures
        return [];
    }
}

export async function getIndustryBySlug(slug: string): Promise<Industries | null> {
    if (!slug || slug.trim() === '') {
        console.warn('[getIndustryBySlug] Invalid slug provided');
        return null;
    }

    try {
        console.log(`[getIndustryBySlug] Fetching industry: ${slug}`);
        const db = getServerFirestore();
        if (!db) {
            console.error('[getIndustryBySlug] Server Firestore not available');
            return null;
        }
        const docRef = doc(db, "industries", slug);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.warn(`[getIndustryBySlug] Industry not found: ${slug}`);
            return null;
        }
        
        const data = docSnap.data();

        // Validate critical data
        if (!data.industryName) {
            console.error(`[getIndustryBySlug] Industry ${slug} missing required industryName field`);
        }

        const industry = {
            associatedCompanies: data.associatedCompanies ?? [],
            slug: data.slug ?? docSnap.id,
            brochureUrl: data.brochureUrl ?? "",
            caseStudyUrl: data.caseStudyUrl ?? "",
            datasheetUrl: data.datasheetUrl ?? "",
            industryBriefDescription: data.industryBriefDescription ?? "",
            industryOverview: data.industryOverview ?? "",
            industrySolutions: data.industrySolutions ?? [],
            industryName: data.industryName ?? "",
            industryIconUrl: data.industryIconUrl ?? "",
            // Map industryBriefDescription to industryBrief for backward compatibility
            industryBrief: data.industryBriefDescription ?? data.industryBrief ?? "",
            industryDescription: data.industryDescription ?? "",
            industryFeatures: data.industryFeatures ?? [],
            industryHeadline: data.industryHeadline ?? "",
            industryImageUrl: data.industryImageUrl ?? "",
            industryLeaders: data.industryLeaders ?? [],
            industryStatistics: data.industryStatistics ?? [],
            isDraft: data.isDraft ?? false,
        };

        console.log(`[getIndustryBySlug] Successfully fetched industry: ${industry.industryName}`);
        return industry;
    } catch (error) {
        console.error(`[getIndustryBySlug] Failed to fetch industry ${slug}:`, error);
        return null;
    }
}

export async function getSolutionsByIndustry(industrySlug: string) {
    try {
        console.log(`[getSolutionsByIndustry] Fetching solutions for industry: ${industrySlug}`);
        
        const db = getServerFirestore();
        if (!db) {
            console.error('[getSolutionsByIndustry] Server Firestore not available');
            return [];
        }
        
        const solutionsRef = collection(db, 'solutions');
        const q = query(solutionsRef, where('solutionIndustry', '==', industrySlug), where('isDraft', '==', false));
        const querySnapshot = await getDocs(q);
        
        const solutions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`[getSolutionsByIndustry] Found ${solutions.length} solutions for ${industrySlug}`);
        return solutions;
    } catch (error) {
        console.error(`[getSolutionsByIndustry] Error fetching solutions:`, error);
        return [];
    }
}
