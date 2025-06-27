import { getServerFirestore } from "@/firebase/firebaseServer";
import { Products } from "@/types/types";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getAllClientLogos, getClientLogosByNames } from "@/utils/getSSGClientLogos";

interface Industry {
    slug: string;
    industryName: string;
    industryIconUrl: string;
}

export async function fetchAllProducts(): Promise<Products[]> {
    try {
        const db = getServerFirestore();
        if (!db) {
            throw new Error('Server Firestore not available');
        }
        const productsRef = collection(db, "portfolio");
        // ✅ PRODUCTION: Only fetch published products for static generation
        const q = query(productsRef, where("isDraft", "==", false));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug ?? doc.id,
                productName: data.productName ?? "",
                briefDescription: data.briefDescription ?? "",
                briefHeadline: data.briefHeadline ?? "",
                briefHighlight: data.briefHighlight ?? "",
                bulletPoints: Array.isArray(data.bulletPoints) ? data.bulletPoints : [],
                category: Array.isArray(data.category) ? data.category : [],
                highlights: Array.isArray(data.highlights) ? data.highlights : [],
                productBrief: data.productBrief ?? "",
                productIndex: data.productIndex ?? "",
                productKeyFeatures: Array.isArray(data.productKeyFeatures) ? data.productKeyFeatures : [],
                productGalleryUrls: Array.isArray(data.productGalleryUrls) ? data.productGalleryUrls : [],
                brochureUrl: data.brochureUrl ?? "",
                caseStudyUrl: data.caseStudyUrl ?? "",
                datasheetUrl: data.datasheetUrl ?? "",
                globalTags: Array.isArray(data.globalTags) ? data.globalTags : [],
                keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
                marketingHighlights: Array.isArray(data.marketingHighlights) ? data.marketingHighlights : [],
                marketingTagline: data.marketingTagline ?? "",
                portfolioCategory: data.portfolioCategory ?? "",
                productOverview: data.productOverview ?? "",
                productText: data.productText ?? "",
                clientCompanies: Array.isArray(data.clientCompanies) ? data.clientCompanies : [],
                targetIndustries: Array.isArray(data.targetIndustries) ? data.targetIndustries : [],
                technicalSpecifications: Array.isArray(data.technicalSpecifications) ? data.technicalSpecifications : [],
                productDescription: data.productDescription ?? "",
                // Note: For fetchAllProducts, we don't pre-fetch related data to keep it lightweight
                targetIndustriesData: [],
                clientCompaniesData: [],
            };
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products');
    }
}

export async function getProductBySlug(slug: string): Promise<Products | null> {
    if (!slug) {
        console.warn('No slug provided to getProductBySlug');
        return null;
    }

    try {
        const db = getServerFirestore();
        if (!db) {
            console.error('Server Firestore not available');
            return null;
        }
        const docRef = doc(db, "portfolio", slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.warn(`Product with slug "${slug}" not found`);
            return null;
        }

        const data = docSnap.data();

        // Validate required fields
        if (!data.productName) {
            console.warn(`Product with slug "${slug}" missing required productName field`);
        }

        // Fetch industry data at build time if targetIndustries exist
        const targetIndustriesArray = Array.isArray(data.targetIndustries) ? data.targetIndustries : [];
        const targetIndustriesData = targetIndustriesArray.length > 0 
            ? await getIndustriesBySlug(targetIndustriesArray)
            : [];

        // Fetch client data at build time if clientCompanies exist
        const clientCompaniesArray = Array.isArray(data.clientCompanies) ? data.clientCompanies : [];
        let clientCompaniesData: any[] = [];
        if (clientCompaniesArray.length > 0) {
            const allClientLogos = await getAllClientLogos();
            clientCompaniesData = getClientLogosByNames(clientCompaniesArray, allClientLogos);
        }

        return {
            id: docSnap.id,
            slug: data.slug ?? docSnap.id,
            productName: data.productName ?? "",
            briefDescription: data.briefDescription ?? "",
            briefHeadline: data.briefHeadline ?? "",
            briefHighlight: data.briefHighlight ?? "",
            bulletPoints: Array.isArray(data.bulletPoints) ? data.bulletPoints : [],
            category: Array.isArray(data.category) ? data.category : [],
            highlights: Array.isArray(data.highlights) ? data.highlights : [],
            productBrief: data.productBrief ?? "",
            productIndex: data.productIndex ?? "",
            productKeyFeatures: Array.isArray(data.productKeyFeatures) ? data.productKeyFeatures : [],
            productGalleryUrls: Array.isArray(data.productGalleryUrls) ? data.productGalleryUrls : [],
            brochureUrl: data.brochureUrl ?? "",
            caseStudyUrl: data.caseStudyUrl ?? "",
            clientCompanies: Array.isArray(data.clientCompanies) ? data.clientCompanies : [],
            datasheetUrl: data.datasheetUrl ?? "",
            globalTags: Array.isArray(data.globalTags) ? data.globalTags : [],
            keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
            marketingHighlights: Array.isArray(data.marketingHighlights) ? data.marketingHighlights : [],
            marketingTagline: data.marketingTagline ?? "",
            portfolioCategory: data.portfolioCategory ?? "",
            productOverview: data.productOverview ?? "",
            productText: data.productText ?? "",
            targetIndustries: targetIndustriesArray,
            targetIndustriesData: targetIndustriesData,
            clientCompaniesData: clientCompaniesData,
            technicalSpecifications: Array.isArray(data.technicalSpecifications) ? data.technicalSpecifications : [],
            productDescription: data.productDescription ?? "",
        };
    } catch (error) {
        console.error(`Error fetching product with slug "${slug}":`, error);
        throw new Error(`Failed to fetch product: ${slug}`);
    }
}

async function getIndustriesBySlug(industrySlugs: string[]): Promise<Industry[]> {
    if (!industrySlugs || industrySlugs.length === 0) {
        return [];
    }

    try {
        const db = getServerFirestore();
        if (!db) {
            console.error('Server Firestore not available');
            return [];
        }
        const industriesRef = collection(db, 'industries');
        const q = query(industriesRef, where('slug', 'in', industrySlugs));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                slug: data.slug || doc.id,
                industryName: data.industryName || '',
                industryIconUrl: data.industryIconUrl || '',
            };
        });
    } catch (error) {
        console.error('Error fetching industries:', error);
        return [];
    }
}
