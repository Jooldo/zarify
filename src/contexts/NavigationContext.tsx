
import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  showPageHeaders: boolean;
  showTabNavigation: boolean;
  togglePageHeaders: () => void;
  toggleTabNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPageHeaders, setShowPageHeaders] = useState(() => {
    const saved = localStorage.getItem('show-page-headers');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [showTabNavigation, setShowTabNavigation] = useState(() => {
    const saved = localStorage.getItem('show-tab-navigation');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('show-page-headers', JSON.stringify(showPageHeaders));
  }, [showPageHeaders]);

  useEffect(() => {
    localStorage.setItem('show-tab-navigation', JSON.stringify(showTabNavigation));
  }, [showTabNavigation]);

  const togglePageHeaders = () => {
    setShowPageHeaders(prev => !prev);
  };

  const toggleTabNavigation = () => {
    setShowTabNavigation(prev => !prev);
  };

  return (
    <NavigationContext.Provider value={{
      showPageHeaders,
      showTabNavigation,
      togglePageHeaders,
      toggleTabNavigation,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
