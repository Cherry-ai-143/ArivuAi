'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  sidebarWidth: string; // '256px' or '68px'
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Read saved preference from localStorage on client side mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arivu_sidebar_expanded');
      if (saved !== null) {
        setIsExpanded(JSON.parse(saved));
      }
    } catch {
      // fallback to true
    }
  }, []);

  const handleSetIsExpanded: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    setIsExpanded((prev) => {
      const next = typeof value === 'function' ? (value as (p: boolean) => boolean)(prev) : value;
      try {
        localStorage.setItem('arivu_sidebar_expanded', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleSidebar = () => {
    handleSetIsExpanded((prev) => !prev);
  };

  const sidebarWidth = isExpanded ? '256px' : '68px';

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        setIsExpanded: handleSetIsExpanded,
        toggleSidebar,
        sidebarWidth,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    // Fallback safe defaults if used outside provider
    return {
      isExpanded: true,
      setIsExpanded: () => {},
      toggleSidebar: () => {},
      sidebarWidth: '256px',
    };
  }
  return context;
}
