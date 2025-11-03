'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PageTitleContextType {
  title: string;
  subtitle?: string;
  showBackButton: boolean;
  backButtonText: string;
  onBackClick?: () => void;
  setPageTitle: (title: string, subtitle?: string) => void;
  setBackButton: (show: boolean, text?: string, onClick?: () => void) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const [showBackButton, setShowBackButton] = useState(false);
  const [backButtonText, setBackButtonText] = useState('Back');
  const [onBackClick, setOnBackClick] = useState<(() => void) | undefined>(undefined);

  const setPageTitle = useCallback((newTitle: string, newSubtitle?: string) => {
    setTitle(newTitle);
    setSubtitle(newSubtitle);
  }, []);

  const setBackButton = useCallback((show: boolean, text: string = 'Back', onClick?: () => void) => {
    setShowBackButton(show);
    setBackButtonText(text);
    setOnBackClick(() => onClick);
  }, []);

  return (
    <PageTitleContext.Provider value={{
      title,
      subtitle,
      showBackButton,
      backButtonText,
      onBackClick,
      setPageTitle,
      setBackButton
    }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
}