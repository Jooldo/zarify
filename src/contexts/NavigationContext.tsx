
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NavigationTab = 'dashboard' | 'orders' | 'inventory' | 'manufacturing' | 'procurement' | 'users' | 'config';

interface ProductionQueueFilters {
  status: string;
  priority: string;
  productName: string;
  orderNumber: string;
  hasInProgressSteps: boolean;
  hasCompletedSteps: boolean;
  urgentOnly: boolean;
}

interface NavigationContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  productionQueueFilters: ProductionQueueFilters | null;
  setProductionQueueFilters: (filters: ProductionQueueFilters) => void;
  clearProductionQueueFilters: () => void;
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

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [productionQueueFilters, setProductionQueueFilters] = useState<ProductionQueueFilters | null>(null);

  const clearProductionQueueFilters = () => {
    setProductionQueueFilters(null);
  };

  return (
    <NavigationContext.Provider value={{
      activeTab,
      setActiveTab,
      productionQueueFilters,
      setProductionQueueFilters,
      clearProductionQueueFilters,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};
