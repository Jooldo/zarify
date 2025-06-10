

import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import DashboardOverview from '@/components/DashboardOverview';
import OrdersTab from '@/components/OrdersTab';
import InventoryTab from '@/components/InventoryTab';
import ProductConfigTab from '@/components/ProductConfigTab';
import UsersTab from '@/components/UsersTab';
import ActivityLogsTab from '@/components/ActivityLogsTab';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <OrdersTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'products':
        return <ProductConfigTab />;
      case 'users':
        return <UsersTab activeTab="customers" onTabChange={() => {}} />;
      case 'logs':
        return <ActivityLogsTab />;
      default:
        return <DashboardOverview onNavigateToTab={setActiveTab} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default App;

