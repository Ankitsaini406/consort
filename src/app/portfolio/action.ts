import { getServerFirestore } from "@/firebase/firebaseServer";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getValidImageUrl } from "@/utils/imageUtils";
import { PORTFOLIO_CATEGORIES } from '@/config/portfolioConfig';

interface PortfolioProduct {
    id: string;
    slug: string;
    productName: string;
    productOverview: string;
    headline: string;
    productGalleryUrls: string[];
    portfolioCategory: string;
}

interface PortfolioItem {
    image: string;
    title: string;
    description: string;
    url: string;
    categoryId: string;
}

// Using unified portfolio categories from config

// Build-time static data interface
export interface StaticPortfolioData {
    productsByCategory: Record<string, PortfolioItem[]>;
    availableCategories: string[];
    buildTimestamp: string;
    productCount: number;
}

// ✅ BUILD-TIME: Generate static portfolio data at build time
export async function generateStaticPortfolioData(): Promise<StaticPortfolioData> {
    try {
        const db = getServerFirestore();
        if (!db) {
            throw new Error('Server Firestore not available');
        }
        const productsRef = collection(db, "portfolio");
        // ✅ PRODUCTION: Only fetch published products
        const q = query(productsRef, where("isDraft", "==", false));
        const snapshot = await getDocs(q);



        const products: PortfolioProduct[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug ?? doc.id,
                productName: data.productName ?? "",
                productOverview: data.productOverview ?? "",
                headline: data.headline ?? "",
                productGalleryUrls: Array.isArray(data.productGalleryUrls) ? data.productGalleryUrls : [],
                portfolioCategory: data.portfolioCategory ?? "",
            };
        });

        // Transform products to portfolio items - PRODUCTION: Only include products with valid categories
        const portfolioItems: PortfolioItem[] = products
            .filter(product => product.portfolioCategory && product.productGalleryUrls?.[0] && product.productName) // ✅ Ensure required fields exist
            .map(product => ({
                image: getValidImageUrl(product.productGalleryUrls[0]),
                title: product.productName,
                description: product.headline || product.productOverview || '', // Fallback chain
                url: `/portfolio/${product.id}`,
                categoryId: product.portfolioCategory,
            }));



        // Group products by category
        const productsByCategory: Record<string, PortfolioItem[]> = {};
        
        // Initialize all categories
        PORTFOLIO_CATEGORIES.forEach(category => {
            productsByCategory[category.value] = [];
        });

        // Populate categories with products
        portfolioItems.forEach(item => {
            if (productsByCategory[item.categoryId]) {
                productsByCategory[item.categoryId].push(item);
            }
        });

        // Get categories that have products
        const availableCategories = PORTFOLIO_CATEGORIES
            .filter(category => productsByCategory[category.value].length > 0)
            .map(category => category.value);

        // Add "all" category if there are any products
        if (portfolioItems.length > 0) {
            productsByCategory["all"] = portfolioItems;
            availableCategories.unshift("all");
        }

        const result: StaticPortfolioData = {
            productsByCategory,
            availableCategories,
            buildTimestamp: new Date().toISOString(),
            productCount: portfolioItems.length,
        };

        console.log(`[generateStaticPortfolioData] ✅ Successfully generated static data with ${portfolioItems.length} products at build time`);
        return result;
        
    } catch (error) {
        console.error('[generateStaticPortfolioData] ❌ Failed to generate static portfolio data:', error);
        // ✅ BUILD-TIME: Throw error to fail build instead of returning empty data
        throw new Error(`Failed to generate static portfolio data: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Legacy function maintained for backward compatibility (will be removed after migration)
export async function fetchPortfolioProducts(): Promise<{
    productsByCategory: Record<string, PortfolioItem[]>;
    availableCategories: string[];
}> {
    console.warn('[fetchPortfolioProducts] ⚠️ Using legacy runtime function. Please migrate to build-time generation.');
    const staticData = await generateStaticPortfolioData();
    return {
        productsByCategory: staticData.productsByCategory,
        availableCategories: staticData.availableCategories,
    };
} 
