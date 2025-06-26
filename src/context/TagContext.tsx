'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './userContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';

interface Tag {
    value: string;
    label: string;
    imageUrl?: string; // Only used for industries
}

interface TagContextType {
    globalTags: Tag[];
    clients: Tag[];
    clientLogos: Tag[]; // For SSG client logo display
    productBrands: Tag[];
    icons: Tag[];
    industries: Tag[];
    loading: boolean;
    error: Error | null;
    refreshData: () => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider = ({ children }: { children: ReactNode }) => {
    const [globalTags, setGlobalTags] = useState<Tag[]>([]);
    const [clients, setClients] = useState<Tag[]>([]);
    const [clientLogos, setClientLogos] = useState<Tag[]>([]);
    const [productBrands, setProductBrands] = useState<Tag[]>([]);
    const [icons, setIcons] = useState<Tag[]>([]);
    const [industries, setIndustries] = useState<Tag[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Get user context to check authentication
    const { user, isLoading: userLoading } = useUser();

    const fetchTagsFromCollection = async (collectionName: string): Promise<any[]> => {
        try {
            // Removed excessive fetch logging
            
            // PRODUCTION OPTION 1: Direct Firestore query - protected by security rules
            // This approach eliminates the need for API routes and relies on Firestore security rules
            const collectionRef = collection(db, collectionName);
            const snapshot = await getDocs(collectionRef);
            
            const tags = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Removed success logging
            return tags;
        } catch (error) {
            console.error(`[TAGS] Error fetching ${collectionName}:`, error);
            // Firestore security rules will automatically reject unauthorized requests
            // This provides server-side security without needing API middleware
            if (error instanceof Error && error.message.includes('permission')) {
                console.warn(`[TAGS] Permission denied for ${collectionName} - user may not be authenticated`);
            }
            return [];
        }
    };

    const fetchAllTags = async () => {
        // Removed excessive call logging
        
        setLoading(true);
        setError(null);
        
        try {
            // Removed start logging
            
            // Fetch tags from different collections
            const [
                globalTagsData,
                clientsData,
                productBrandsData,
                iconsData,
                industriesData
            ] = await Promise.all([
                fetchTagsFromCollection('global-tags'),
                fetchTagsFromCollection('clients'),
                fetchTagsFromCollection('product-brands'),
                fetchTagsFromCollection('icons'),
                fetchTagsFromCollection('industries')
            ]);

            // Removed raw data logging

            // Transform data to match the expected Tag interface
            setGlobalTags(globalTagsData.map((item: any) => ({
                value: item.label || item.name || item.title || item.id,
                label: item.label || item.name || item.title || item.id,
            })));

            setClients(clientsData.map((item: any) => ({
                value: item.label || item.name || item.title || item.id,
                label: item.label || item.name || item.title || item.id,
                imageUrl: item.imageUrl,
            })));

            // Set clientLogos (same as clients but for SSG logo display)
            setClientLogos(clientsData.map((item: any) => ({
                value: item.slug || item.id,
                label: item.label || item.name || item.title || item.id,
                imageUrl: item.imageUrl,
            })));

            setProductBrands(productBrandsData.map((item: any) => ({
                value: item.label || item.name || item.title || item.id,
                label: item.label || item.name || item.title || item.id,
                imageUrl: item.imageUrl,
            })));

            setIcons(iconsData.map((item: any) => ({
                value: item.label || item.name || item.title || item.id,
                label: item.label || item.name || item.title || item.id,
                imageUrl: item.imageUrl,
            })));

            setIndustries(industriesData.map((item: any) => ({
                value: item.label || item.name || item.title || item.id,
                label: item.label || item.name || item.title || item.id,
                imageUrl: item.imageUrl || item.industryImageUrl,
            })));

            // Removed transformation success logging

        } catch (err) {
            const error = err as Error;
            setError(error);
            console.error('[TAGS] Error fetching tags:', error.message);
            
            // Reset all tags to empty arrays on error
            setGlobalTags([]);
            setClients([]);
            setClientLogos([]);
            setProductBrands([]);
            setIcons([]);
            setIndustries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch tags if user is authenticated and not loading
        if (!userLoading && user) {
            // Removed authentication success logging
            fetchAllTags();
        } else if (!userLoading && !user) {
            // Removed not authenticated logging
            // Clear tags when user is not authenticated
            setGlobalTags([]);
            setClients([]);
            setClientLogos([]);
            setProductBrands([]);
            setIcons([]);
            setIndustries([]);
        }
    }, [user, userLoading]); // Only fetch when authentication state changes

    return (
        <TagContext.Provider
            value={{ 
                globalTags, 
                clients,
                clientLogos,
                productBrands, 
                icons, 
                industries, 
                loading, 
                error, 
                refreshData: fetchAllTags 
            }}
        >
            {children}
        </TagContext.Provider>
    );
};

export const useTags = () => {
    const context = useContext(TagContext);
    if (context === undefined) {
        throw new Error('useTags must be used within a TagProvider');
    }
    return context;
};
