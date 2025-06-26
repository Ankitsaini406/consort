import { NextRequest, NextResponse } from 'next/server';
import { isAdminAvailable, testFirebaseConnection } from '@/firebase/firebaseAdmin';
import { validateFirebaseToken } from '@/utils/serverAuth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Require authentication to check system health
    const user = await validateFirebaseToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check Firebase Admin SDK health
    let firebaseAdminStatus = 'unknown';
    let firebaseAdminError = null;
    let connectionTestResult = null;
    
    try {
      const isAvailable = isAdminAvailable();
      
      if (isAvailable) {
        // If admin is available, test the connection
        connectionTestResult = await testFirebaseConnection();
        firebaseAdminStatus = connectionTestResult.success ? 'healthy' : 'unhealthy';
        if (!connectionTestResult.success) {
          firebaseAdminError = connectionTestResult.error;
        }
      } else {
        firebaseAdminStatus = 'unhealthy';
        firebaseAdminError = 'Firebase Admin SDK not available';
      }
    } catch (error) {
      firebaseAdminStatus = 'error';
      firebaseAdminError = (error as Error).message;
    }

    // Environment check
    const requiredEnvVars = [
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL', 
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    const environmentStatus = missingEnvVars.length === 0 ? 'healthy' : 'unhealthy';

    const response = {
      status: firebaseAdminStatus === 'healthy' && environmentStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        firebaseAdmin: {
          status: firebaseAdminStatus,
          error: firebaseAdminError,
          connectionTest: connectionTestResult
        },
        environment: {
          status: environmentStatus,
          missingVariables: missingEnvVars.length > 0 ? missingEnvVars : undefined
        }
      },
      security: {
        lockdownActive: firebaseAdminStatus === 'error' || environmentStatus === 'unhealthy'
      }
    };

    return NextResponse.json(response, { 
      status: response.status === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[HEALTH] Firebase health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }
} 