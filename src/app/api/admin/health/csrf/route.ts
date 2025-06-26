import { NextRequest, NextResponse } from 'next/server';
import { getCSRFHealthStatus } from '@/utils/csrfProtection';
import { extractUserFromToken } from '@/utils/firebaseAuthServer';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Health check endpoint for CSRF system
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const userInfo = await extractUserFromToken(request);
    if (!userInfo) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (userInfo.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get CSRF system health status
    const healthStatus = getCSRFHealthStatus();
    
    // 🔒 SECURITY FIX: Remove sensitive environment information
    // Only expose essential system information needed for health monitoring
    const systemInfo = {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
      // REMOVED: environment, csrfEnabled, hasCSRFSecret (information disclosure)
    };

    const response = {
      status: healthStatus.healthy ? 'healthy' : 'warning',
      message: healthStatus.healthy ? 'CSRF system operating normally' : 'CSRF system needs attention',
      csrf: healthStatus,
      system: systemInfo
    };

    return NextResponse.json(response, { 
      status: healthStatus.healthy ? 200 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[HEALTH] CSRF health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      // 🔒 SECURITY FIX: Remove error details that could leak information
      system: {
        timestamp: new Date().toISOString()
        // REMOVED: environment and error details
      }
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }
} 