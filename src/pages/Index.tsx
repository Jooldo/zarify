
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NavigationProvider } from '@/contexts/NavigationContext';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import OrdersTab from '@/components/OrdersTab';
import InventoryTab from '@/components/InventoryTab';
import ProductConfigTab from '@/components/ProductConfig';
import UsersTab from '@/components/UsersTab';
import ActivityLogsTab from '@/components/ActivityLogsTab';
import MerchantConfigurations from '@/components/settings/MerchantConfigurations';
import GeneralSettings from '@/components/settings/GeneralSettings';
import CatalogueManagement from '@/components/catalogue/CatalogueManagement';
import { NotFound } from '@/pages/NotFound';

const Index = () => {
  return (
    <SidebarProvider>
      <NavigationProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<UnifiedDashboard />} />
              <Route path="/orders" element={<OrdersTab />} />
              <Route path="/inventory" element={<InventoryTab />} />
              <Route path="/config" element={<ProductConfigTab />} />
              <Route path="/users" element={<UsersTab />} />
              <Route path="/activity" element={<ActivityLogsTab />} />
              <Route path="/settings/merchant" element={<MerchantConfigurations />} />
              <Route path="/settings/general" element={<GeneralSettings />} />
              <Route path="/catalogue" element={<CatalogueManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </NavigationProvider>
    </SidebarProvider>
  );
};

export default Index;
