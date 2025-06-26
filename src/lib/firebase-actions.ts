import { Posts, Resources } from "@/types/types";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getServerFirestore } from "@/firebase/firebaseServer";

// ===== POSTS ACTIONS =====
export async function fetchAllBlogs(): Promise<Posts[]> {
    try {
        const db = getServerFirestore();
        if (!db) {
            console.log('[FIREBASE-ACTIONS] fetchAllBlogs: Server Firestore unavailable, returning empty array');
            return [];
        }
        
        const blogsRef = collection(db, "posts");
        const snapshot = await getDocs(blogsRef);

        return snapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    slug: data.slug ?? doc.id,
                    isDraft: data.isDraft ?? false,
                    postTitle: data.postTitle ?? "Unnamed",
                    globalTags: data.globalTags ?? [],
                    headline: data.headline ?? "",
                    heroImageUrl: data.heroImageUrl ?? "",
                    date: data.date ?? "",
                    industryUseCases: data.industryUseCases ?? [],
                    numberOfSections: data.numberOfSections ?? 0,
                    postType: data.postType ?? "blog-post",
                    sections: data.sections ?? [],
                    clientCompanies: data.clientCompanies ?? [],
                };
            })
            .filter((post) => !post.isDraft); // Filter out draft posts from public view
    } catch (error) {
        console.error("Error fetching all blogs:", error);
        return [];
    }
}

export async function getPostBySlug(slug: string): Promise<Posts | null> {
    if (!slug) return null;

    try {
        const db = getServerFirestore();
        if (!db) {
            console.log('[FIREBASE-ACTIONS] getPostBySlug: Server Firestore unavailable, returning null');
            return null;
        }
        
        const docRef = doc(db, "posts", slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();

        // Don't show draft posts to public
        if (data.isDraft === true) return null;

        return {
            id: docSnap.id,
            slug: data.slug ?? docSnap.id,
            postTitle: data.postTitle ?? "Unnamed",
            globalTags: data.globalTags ?? [],
            headline: data.headline ?? "",
            heroImageUrl: data.heroImageUrl ?? "",
            date: data.date ?? "",
            industryUseCases: data.industryUseCases ?? [],
            isDraft: data.isDraft ?? false,
            numberOfSections: data.numberOfSections ?? 0,
            postType: data.postType ?? "blog-post",
            sections: data.sections ?? [],
            clientCompanies: data.clientCompanies ?? [],
        };
    } catch (error) {
        console.error("Error fetching post by slug:", error);
        return null;
    }
}

export async function fetchPostsByType(postType: string): Promise<Posts[]> {
    try {
        const db = getServerFirestore();
        if (!db) {
            console.log('[FIREBASE-ACTIONS] fetchPostsByType: Server Firestore unavailable, returning empty array');
            return [];
        }
        
        const blogsRef = collection(db, "posts");
        const q = query(blogsRef, where("postType", "==", postType));
        const snapshot = await getDocs(q);

        return snapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    slug: data.slug ?? doc.id,
                    isDraft: data.isDraft ?? false,
                    postTitle: data.postTitle ?? "Unnamed",
                    globalTags: data.globalTags ?? [],
                    headline: data.headline ?? "",
                    heroImageUrl: data.heroImageUrl ?? "",
                    date: data.date ?? "",
                    industryUseCases: data.industryUseCases ?? [],
                    numberOfSections: data.numberOfSections ?? 0,
                    postType: data.postType ?? "blog-post",
                    sections: data.sections ?? [],
                    clientCompanies: data.clientCompanies ?? [],
                };
            })
            .filter((post) => !post.isDraft); // Filter out draft posts
    } catch (error) {
        console.error("Error fetching posts by type:", error);
        return [];
    }
}

// ===== RESOURCES ACTIONS =====
export async function fetchAllResources(): Promise<Resources[]> {
    try {
        const db = getServerFirestore();
        if (!db) {
            console.log('[FIREBASE-ACTIONS] fetchAllResources: Server Firestore unavailable, returning empty array');
            return [];
        }
        
        const resourcesRef = collection(db, "resources");
        const snapshot = await getDocs(resourcesRef);

        return snapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    slug: data.slug ?? doc.id,
                    isDraft: data.isDraft ?? false,
                    resourceTitle: data.resourceTitle ?? "Unnamed",
                    globalTags: data.globalTags ?? [],
                    headline: data.headline ?? "",
                    heroImageUrl: data.heroImageUrl ?? "",
                    date: data.date ?? "",
                    industryUseCases: data.industryUseCases ?? [],
                    numberOfSections: data.numberOfSections ?? 0,
                    resourceType: data.resourceType ?? "case-study",
                    sections: data.sections ?? [],
                    clientCompanies: data.clientCompanies ?? [],
                };
            })
            .filter((resource) => !resource.isDraft); // Filter out draft resources
    } catch (error) {
        console.error("Error fetching all resources:", error);
        return [];
    }
}

export async function getResourceBySlug(slug: string): Promise<Resources | null> {
    if (!slug) return null;

    try {
        const db = getServerFirestore();
        if (!db) {
            console.log('[FIREBASE-ACTIONS] getResourceBySlug: Server Firestore unavailable, returning null');
            return null;
        }
        
        const docRef = doc(db, "resources", slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();

        // Don't show draft resources to public
        if (data.isDraft === true) return null;

        return {
            id: docSnap.id,
            slug: data.slug ?? docSnap.id,
            resourceTitle: data.resourceTitle ?? "Unnamed",
            globalTags: data.globalTags ?? [],
            headline: data.headline ?? "",
            heroImageUrl: data.heroImageUrl ?? "",
            date: data.date ?? "",
            industryUseCases: data.industryUseCases ?? [],
            isDraft: data.isDraft ?? false,
            numberOfSections: data.numberOfSections ?? 0,
            resourceType: data.resourceType ?? "case-study",
            sections: data.sections ?? [],
            clientCompanies: data.clientCompanies ?? [],
        };
    } catch (error) {
        console.error("Error fetching resource by slug:", error);
        return null;
    }
}

export async function fetchResourcesByType(resourceType: string): Promise<Resources[]> {
    try {
        const db = getServerFirestore();
        if (!db) {
            console.log('[FIREBASE-ACTIONS] fetchResourcesByType: Server Firestore unavailable, returning empty array');
            return [];
        }
        
        const resourcesRef = collection(db, "resources");
        const q = query(resourcesRef, where("resourceType", "==", resourceType));
        const snapshot = await getDocs(q);

        return snapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    slug: data.slug ?? doc.id,
                    isDraft: data.isDraft ?? false,
                    resourceTitle: data.resourceTitle ?? "Unnamed",
                    globalTags: data.globalTags ?? [],
                    headline: data.headline ?? "",
                    heroImageUrl: data.heroImageUrl ?? "",
                    date: data.date ?? "",
                    industryUseCases: data.industryUseCases ?? [],
                    numberOfSections: data.numberOfSections ?? 0,
                    resourceType: data.resourceType ?? "case-study",
                    sections: data.sections ?? [],
                    clientCompanies: data.clientCompanies ?? [],
                };
            })
            .filter((resource) => !resource.isDraft); // Filter out draft resources
    } catch (error) {
        console.error("Error fetching resources by type:", error);
        return [];
    }
} 