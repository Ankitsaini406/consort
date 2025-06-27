'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FeatherCheckCircle, FeatherAlertTriangle, FeatherXCircle, FeatherX } from '@subframe/core';
import eventEmitter from '@/lib/eventEmitter';

type AlertType = 'success' | 'warning' | 'error';

interface AlertState {
  message: string;
  type: AlertType;
  visible: boolean;
  progress: number;
}

interface AlertContextType {
  showAlert: (message: string, type: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

const ALERT_CONFIG = {
  success: {
    icon: <FeatherCheckCircle className="h-5 w-5" style={{ color: '#15803d' }} />,
    style: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      color: '#166534',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    progressColor: '#22c55e'
  },
  warning: {
    icon: <FeatherAlertTriangle className="h-5 w-5" style={{ color: '#a16207' }} />,
    style: {
      backgroundColor: '#fffbeb',
      borderColor: '#fde68a',
      color: '#92400e',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    progressColor: '#eab308'
  },
  error: {
    icon: <FeatherXCircle className="h-5 w-5" style={{ color: '#dc2626' }} />,
    style: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#991b1b',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    progressColor: '#ef4444'
  },
};

const ALERT_DURATION = 5000; // 5 seconds
const PROGRESS_UPDATE_INTERVAL = 200; // Update every 200ms instead of 50ms (reduces renders by 75%)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    message: '',
    type: 'success',
    visible: false,
    progress: 100,
  });
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize base alert styles to prevent recreation on every render
  const baseAlertStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: '20px',
    left: '50%',
    zIndex: 99999,
    minWidth: '380px',
    maxWidth: '600px',
    borderRadius: '12px',
    borderWidth: '2px',
    borderStyle: 'solid' as const,
    transition: 'all 0.3s ease-in-out',
    backdropFilter: 'blur(12px)',
    overflow: 'hidden' as const,
  }), []);

  // Memoize content styles
  const contentStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
  }), []);

  const messageStyle = useMemo(() => ({
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '1.4',
    color: 'inherit'
  }), []);

  const progressBarStyle = useMemo(() => ({
    width: '100%',
    height: '3px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  }), []);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return clearTimers;
  }, [clearTimers]);

  const showAlert = useCallback((message: string, type: AlertType) => {
    clearTimers();

    // Set initial state
    setAlertState({ message, type, visible: true, progress: 100 });

    // Progress bar animation with reduced frequency
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, ALERT_DURATION - elapsed);
      const progressPercent = (remaining / ALERT_DURATION) * 100;
      
      if (remaining > 0) {
        setAlertState(prev => ({ ...prev, progress: progressPercent }));
      } else {
        clearTimers();
        setAlertState(prev => ({ ...prev, visible: false, progress: 0 }));
      }
    };

    // Update progress less frequently to reduce renders
    progressIntervalRef.current = setInterval(updateProgress, PROGRESS_UPDATE_INTERVAL);

    // Hide alert after duration
    timeoutRef.current = setTimeout(() => {
      setAlertState(prev => ({ ...prev, visible: false }));
      clearTimers();
    }, ALERT_DURATION);
  }, [clearTimers]);

  useEffect(() => {
    const handler = ({ message, type }: { message: string, type: AlertType }) => {
      showAlert(message, type);
    };
    eventEmitter.on('showAlert', handler);
    return () => {
      eventEmitter.off('showAlert', handler);
    };
  }, [showAlert]);

  const hideAlert = useCallback(() => {
    clearTimers();
    setAlertState(prev => ({ ...prev, visible: false }));
  }, [clearTimers]);

  // Memoize the alert component to prevent unnecessary re-renders
  const alertComponent = useMemo(() => {
    if (!alertState.visible) return null;

    const config = ALERT_CONFIG[alertState.type];
    const transform = alertState.visible 
      ? 'translateX(-50%) translateY(0) scale(1)' 
      : 'translateX(-50%) translateY(-8px) scale(0.95)';

    return (
      <div
        className="fixed flex flex-col rounded-lg border-2 transition-all duration-300 ease-in-out"
        role="alert"
        style={{
          ...baseAlertStyle,
          transform,
          opacity: alertState.visible ? 1 : 0,
          ...config.style,
        }}
      >
        {/* Main alert content */}
        <div style={contentStyle}>
          {config.icon}
          <span style={messageStyle}>
            {alertState.message}
          </span>
          <button 
            onClick={hideAlert} 
            aria-label="Close alert"
            style={{
              padding: '6px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }}
          >
            <FeatherX className="h-4 w-4" style={{ color: 'inherit' }} />
          </button>
        </div>
        
        {/* Progress bar */}
        <div style={progressBarStyle}>
          <div
            style={{
              height: '100%',
              backgroundColor: config.progressColor,
              width: `${alertState.progress}%`,
              transition: `width ${PROGRESS_UPDATE_INTERVAL}ms linear`,
              borderRadius: '0 2px 2px 0',
              boxShadow: `0 0 8px ${config.progressColor}40`,
            }}
          />
        </div>
      </div>
    );
  }, [alertState, baseAlertStyle, contentStyle, messageStyle, progressBarStyle, hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {isMounted && typeof window !== 'undefined' ? createPortal(alertComponent, document.body) : null}
    </AlertContext.Provider>
  );
}; 