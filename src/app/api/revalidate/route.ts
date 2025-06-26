import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, secret } = body;

        // Check for secret to confirm this is a legitimate request
        if (secret !== process.env.REVALIDATION_SECRET) {
            return NextResponse.json(
                { message: 'Invalid secret' },
                { status: 401 }
            );
        }

        if (!path) {
            return NextResponse.json(
                { message: 'Path is required' },
                { status: 400 }
            );
        }

        // Revalidate the specified path
        revalidatePath(path);

        return NextResponse.json({
            revalidated: true,
            path,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error revalidating:', error);
        return NextResponse.json(
            { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// GET method for health check
export async function GET() {
    return NextResponse.json({
        message: 'Revalidation API is working',
        timestamp: new Date().toISOString()
    });
} 