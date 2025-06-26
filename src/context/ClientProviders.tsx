'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AlertProvider } from '@/context/AlertContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AlertProvider>
        {children}
      </AlertProvider>
    </AuthProvider>
  );
} 