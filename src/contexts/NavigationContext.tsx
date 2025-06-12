
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  hideNavbar: boolean;
  hidePageHeader: boolean;
  setHideNavbar: (hide: boolean) => void;
  setHidePageHeader: (hide: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [hideNavbar, setHideNavbar] = useState(false);
  const [hidePageHeader, setHidePageHeader] = useState(false);

  return (
    <NavigationContext.Provider value={{
      hideNavbar,
      hidePageHeader,
      setHideNavbar,
      setHidePageHeader,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};
