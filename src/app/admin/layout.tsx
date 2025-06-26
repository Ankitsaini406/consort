'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat';
import { useSingleTabSession } from '@/hooks/useSingleTabSession';
import { TabConflictModal } from '@/components/admin/TabConflictModal';

// Auth persistence testing removed to fix chunk loading error

interface AdminLayoutProps {
  children: React.ReactNode;
}

function SessionManager() {
  // Auto-logout after 5 minutes of inactivity
  useSessionHeartbeat({
    maxInactivity: 300000, // 5 minutes
    heartbeatInterval: 30000, // Check every 30 seconds
    enableTabCloseDetection: true
  });

  // Single tab session (disabled by default - uncomment to enable)
  const { showConflictModal, closeThisTab, setShowConflictModal } = useSingleTabSession({ 
    enabled: true // Enable the improved single tab session
  });

  return (
    <>
      <TabConflictModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        onCloseTab={closeThisTab}
      />
    </>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard>
      <SessionManager />
      {children}
    </AuthGuard>
  );
} 