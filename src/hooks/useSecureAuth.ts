import { useState, useCallback } from 'react';

interface AuthResponse {
  success: boolean;
  message: string;
  tempToken?: string;
  userName?: string;
  user?: any;
  sessionId?: string;
}

interface CSRFResponse {
  csrfToken: string;
  expiresIn: number;
  usage?: string;
}

export function useSecureAuth() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Client-side rate limiting with admin-friendly timing
  const canMakeRequest = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    // Progressive backoff for failed requests
    const minDelay = retryCount > 0 ? Math.min(1000 * Math.pow(2, retryCount), 5000) : 300;
    
    return timeSinceLastRequest >= minDelay;
  }, [lastRequestTime, retryCount]);

  // 🔧 Enhanced CSRF Token Management with Resilience
  const getCSRFToken = useCallback(async (forceRefresh = false): Promise<string> => {
    // Use cached token if available and not forcing refresh
    if (csrfToken && !forceRefresh) return csrfToken;

    try {

      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`CSRF token fetch failed: ${response.status} ${response.statusText}`);
      }

      const data: CSRFResponse = await response.json();
      
      if (!data.csrfToken) {
        throw new Error('CSRF token not received in response');
      }

      setCsrfToken(data.csrfToken);

      return data.csrfToken;
    } catch (error) {
      console.error('[CSRF] Error getting CSRF token:', error);
      
      // In development, allow continuation without CSRF
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CSRF] Continuing without CSRF token in development');
        return '';
      }
      
      throw new Error('Failed to obtain security token. Please refresh the page.');
    }
  }, [csrfToken]);

  // 🔧 Resilient Request Handler with Smart Retry Logic
  const makeSecureRequest = useCallback(async (
    url: string,
    body: any
  ): Promise<AuthResponse> => {
    // Client-side rate limiting
    if (!canMakeRequest()) {
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 5000);
      throw new Error(`Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again`);
    }

    setLastRequestTime(Date.now());

    // Get CSRF token with retry logic
    let token = '';
    let tokenAttempts = 0;
    const maxTokenAttempts = 3;

    while (tokenAttempts < maxTokenAttempts) {
      try {
        token = await getCSRFToken(tokenAttempts > 0);
        break;
      } catch (error) {
        tokenAttempts++;
        if (tokenAttempts >= maxTokenAttempts) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * tokenAttempts));
      }
    }

    // Build headers with enhanced context
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Helps with CSRF validation
    };

    if (token) {
      headers['X-CSRF-Token'] = token;
    }

    // Make the request with retry logic
    let lastError: Error;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] Making request to ${url} (attempt ${attempts + 1}/${maxAttempts})`);
  }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(body),
        });

        const data = await response.json();

        // Handle CSRF token issues with smart retry
        if (response.status === 403 && data.error?.toLowerCase().includes('csrf')) {
          console.log('[AUTH] CSRF token issue detected, refreshing token...');
          
          // Clear cached token and retry with fresh one
          setCsrfToken(null);
          
          if (attempts < maxAttempts - 1) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            continue;
          }
        }

        // Handle rate limiting with exponential backoff
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * Math.pow(2, attempts);
          
          if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] Rate limited, waiting ${waitTime}ms before retry`);
  }
          
          if (attempts < maxAttempts - 1) {
            attempts++;
            setRetryCount(prev => prev + 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }

        // Success or final failure
        if (response.ok || attempts >= maxAttempts - 1) {
          setRetryCount(0); // Reset retry count on success
          return data;
        }

        throw new Error(`Request failed: ${response.status} ${response.statusText}`);

      } catch (error) {
        lastError = error as Error;
        attempts++;
        
        if (attempts < maxAttempts) {
          const backoffTime = 1000 * Math.pow(2, attempts - 1);
          if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] Request failed, retrying in ${backoffTime}ms...`);
  }
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }

    throw lastError!;
  }, [canMakeRequest, getCSRFToken, retryCount]);

  // 🔧 Enhanced Step 1 Authentication
  const authenticateStep1 = useCallback(async (
    email: string,
    passkey: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      // Input validation
      if (!email || !passkey) {
        throw new Error('Email and passkey are required');
      }

      // Enhanced email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Sanitize inputs
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedPasskey = passkey.trim();

      if (sanitizedPasskey.length < 4) {
        throw new Error('Passkey must be at least 4 characters long');
      }

      const result = await makeSecureRequest('/api/auth/login', {
        email: sanitizedEmail,
        passkey: sanitizedPasskey
      });

      if (result.success) {
        
        setRetryCount(0); // Reset retry count on success
      } else {
        console.warn('[AUTH] Step 1 authentication failed:', result.message);
        setRetryCount(prev => prev + 1);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[AUTH] Step 1 authentication error:', errorMessage);
      setRetryCount(prev => prev + 1);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [makeSecureRequest]);

  // 🔧 Enhanced Step 2 Authentication
  const authenticateStep2 = useCallback(async (
    tempToken: string,
    password: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!tempToken || !password) {
        throw new Error('Temporary token and password are required');
      }

      // Sanitize inputs
      const sanitizedPassword = password.trim();
      
      if (sanitizedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('[AUTH] Starting Step 2 authentication');

      const result = await makeSecureRequest('/api/auth/login/login2', {
        tempToken,
        password: sanitizedPassword
      });

      if (result.success) {
        
        setRetryCount(0); // Reset retry count on success
        
        // Clear CSRF token cache after successful login (new session)
        setCsrfToken(null);
      } else {
        console.warn('[AUTH] Step 2 authentication failed:', result.message);
        setRetryCount(prev => prev + 1);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[AUTH] Step 2 authentication error:', errorMessage);
      setRetryCount(prev => prev + 1);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [makeSecureRequest]);

  // 🔧 Initialize Authentication System
  const initializeAuth = useCallback(async () => {
    try {
      console.log('[AUTH] Initializing authentication system...');
      await getCSRFToken();
      console.log('[AUTH] Authentication system initialized successfully');
    } catch (error) {
      console.warn('[AUTH] Failed to initialize authentication system:', error);
      // Don't throw error - allow app to continue
    }
  }, [getCSRFToken]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // 🔧 Force refresh CSRF token (for manual recovery)
  const refreshCSRFToken = useCallback(async () => {
    try {
      console.log('[AUTH] Manually refreshing CSRF token...');
      setCsrfToken(null);
      await getCSRFToken(true);
      setRetryCount(0);
      console.log('[AUTH] CSRF token refreshed successfully');
    } catch (error) {
      console.error('[AUTH] Failed to refresh CSRF token:', error);
      throw error;
    }
  }, [getCSRFToken]);

  return {
    authenticateStep1,
    authenticateStep2,
    initializeAuth,
    refreshCSRFToken,
    loading,
    error,
    clearError,
    canMakeRequest: canMakeRequest(),
    retryCount,
    hasCSRFToken: !!csrfToken
  };
} 