import { getServerFirestore } from '@/firebase/firebaseServer';
import { collection, getDocs } from 'firebase/firestore';

interface ClientLogo {
    slug: string;
    label: string;
    imageUrl: string;
}

let cachedClientLogos: ClientLogo[] | null = null;

export async function getAllClientLogos(): Promise<ClientLogo[]> {
    if (cachedClientLogos) {
        return cachedClientLogos;
    }

    try {
        // Use server-side Firestore for SSG builds
        const db = getServerFirestore();
        if (!db) {
            console.warn('[SSG] Server Firestore not available - client logos will be empty');
            return [];
        }

        const clientsRef = collection(db, 'clients');
        const snapshot = await getDocs(clientsRef);
        
        cachedClientLogos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                slug: data.slug || doc.id,
                label: data.label || '',
                imageUrl: data.imageUrl || '',
            };
        });

        console.log(`[SSG] Successfully loaded ${cachedClientLogos.length} client logos`);
        return cachedClientLogos;
    } catch (error) {
        console.error('Error fetching client logos:', error);
        return [];
    }
}

export function getClientLogosByNames(clientNames: string[], allClientLogos: ClientLogo[]): ClientLogo[] {
    const results: ClientLogo[] = [];
    
    for (const clientName of clientNames) {
        // Try exact label match first
        let match = allClientLogos.find(client => client.label === clientName);
        
        // Try case-insensitive label match
        if (!match) {
            match = allClientLogos.find(client => 
                client.label.toLowerCase() === clientName.toLowerCase()
            );
        }
        
        if (match) {
            results.push(match);
        }
    }
    
    return results;
} 