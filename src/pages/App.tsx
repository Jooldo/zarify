
import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardOverview } from '@/components/DashboardOverview';
import { OrdersTab } from '@/components/OrdersTab';
import { InventoryTab } from '@/components/InventoryTab';
import { ProductConfigTab } from '@/components/ProductConfigTab';
import { UsersTab } from '@/components/UsersTab';
import { ActivityLogsTab } from '@/components/ActivityLogsTab';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onNavigateToTab={setActiveTab} />;
      case 'orders':
        return <OrdersTab onNavigateToTab={setActiveTab} />;
      case 'inventory':
        return <InventoryTab onNavigateToTab={setActiveTab} />;
      case 'config':
        return <ProductConfigTab onNavigateToTab={setActiveTab} />;
      case 'users':
        return <UsersTab activeTab={activeTab} onTabChange={setActiveTab} />;
      case 'logs':
        return <ActivityLogsTab />;
      default:
        return <DashboardOverview onNavigateToTab={setActiveTab} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} onNavigate={setActiveTab} />
        <main className="flex-1">
          <SidebarTrigger />
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default App;
