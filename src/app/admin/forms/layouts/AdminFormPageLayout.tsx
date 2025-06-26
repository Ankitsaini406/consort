'use client';

import React from 'react';

interface AdminFormPageLayoutProps {
  children: React.ReactNode;
}

export const AdminFormPageLayout: React.FC<AdminFormPageLayoutProps> = ({ 
  children
}) => {
  return (
    <div className="w-full h-screen bg-slate-50 flex justify-center items-center">
      <div className="max-w-[1280px] w-full h-fit mx-auto">
        {children}
      </div>
    </div>
  );
}; 