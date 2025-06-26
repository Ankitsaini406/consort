import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/utils/serverAuth';

// Force dynamic rendering for this route since it uses request.headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        
        return NextResponse.json({ 
            ip,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[GET-IP] Error getting client IP:', error);
        return NextResponse.json({ 
            ip: 'unknown',
            timestamp: new Date().toISOString()
        });
    }
} 