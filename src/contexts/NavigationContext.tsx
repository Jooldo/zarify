
import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  showPageHeaders: boolean;
  showTabNavigation: boolean;
  togglePageHeaders: () => void;
  toggleTabNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [showPageHeaders, setShowPageHeaders] = useState(true);
  const [showTabNavigation, setShowTabNavigation] = useState(true);

  const togglePageHeaders = () => {
    setShowPageHeaders(prev => !prev);
  };

  const toggleTabNavigation = () => {
    setShowTabNavigation(prev => !prev);
  };

  const value = {
    showPageHeaders,
    showTabNavigation,
    togglePageHeaders,
    toggleTabNavigation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
