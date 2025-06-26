import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getServerFirestore } from "@/firebase/firebaseServer";

interface ContentSection {
    id?: string; // Optional: if items need unique IDs for backend or complex state management
    title: string;
    subheading: string;
    content: string; // Changed from descriptionText
    sectionImage: string;
}

type Solutions = {
    brochure: string;
    clientCompanies: string[];
    contentSections: ContentSection[];
    description: string;
    globalTags: string[];
    headline: string; // Changed from descriptionHeading
    heroImage: string;
    isDraft: boolean;
    primaryIndustry: string;
    slug: string;
    solutionTitle: string;
    // solutionOverview: string;
};

export async function fetchAllSolutions(): Promise<Solutions[]> {
    try {
        const db = getServerFirestore();
        
        if (!db) {
            console.warn('[SOLUTION-ACTION] Server Firestore not available - returning mock data');
            // Return mock data for fallback
            return [
                {
                    slug: "lte-for-metro-trains",
                    solutionTitle: "LTE for Metro Trains",
                    description: "Advanced LTE communication solutions for metro transit systems",
                    brochure: "",
                    clientCompanies: [],
                    contentSections: [],
                    globalTags: ["LTE", "Metro", "Transit"],
                    headline: "Advanced LTE Solutions",
                    heroImage: "/products/RCP5210A_a.png",
                    isDraft: false,
                    primaryIndustry: "mass-transit",
                },
                {
                    slug: "tetra-for-metro-train",
                    solutionTitle: "TETRA for Metro Train",
                    description: "TETRA communication solutions for metro train operations",
                    brochure: "",
                    clientCompanies: [],
                    contentSections: [],
                    globalTags: ["TETRA", "Metro", "Train"],
                    headline: "TETRA Solutions",
                    heroImage: "/products/RCP5210A_f.png",
                    isDraft: false,
                    primaryIndustry: "mass-transit",
                }
            ];
        }

        const solutionsRef = collection(db, "solutions");
        const snapshot = await getDocs(solutionsRef);

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                slug: doc.id,
                solutionTitle: data.solutionTitle ?? "Unnamed",
                description: data.description ?? "",
                brochure: data.brochure ?? "",
                clientCompanies: data.clientCompanies ?? [],
                contentSections: data.contentSections ?? [],
                globalTags: data.globalTags ?? [],
                headline: data.headline ?? "",
                heroImage: data.heroImage ?? "",
                isDraft: data.isDraft ?? false,
                primaryIndustry: data.primaryIndustry ?? "",
            };
        });
    } catch (error) {
        console.error('[SOLUTION-ACTION] Error fetching solutions:', error);
        return [];
    }
}

export async function getSolutionBySlug(slug: string): Promise<Solutions | null> {
    if (!slug) return null;

    try {
        const db = getServerFirestore();
        
        if (!db) {
            console.warn('[SOLUTION-ACTION] Server Firestore not available - checking mock data');
            // Return mock data for fallback
            const mockSolutions = await fetchAllSolutions();
            return mockSolutions.find(solution => solution.slug === slug) || null;
        }

        const docRef = doc(db, "solutions", slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();

        return {
            slug: docSnap.id,
            solutionTitle: data.solutionTitle ?? "Unnamed",
            description: data.description ?? "",
            brochure: data.brochure ?? "",
            clientCompanies: data.clientCompanies ?? [],
            contentSections: data.contentSections ?? [],
            globalTags: data.globalTags ?? [],
            headline: data.headline ?? "",
            heroImage: data.heroImage ?? "",
            isDraft: data.isDraft ?? false,
            primaryIndustry: data.primaryIndustry ?? "",
        };
    } catch (error) {
        console.error(`[SOLUTION-ACTION] Error fetching solution ${slug}:`, error);
        return null;
    }
}
