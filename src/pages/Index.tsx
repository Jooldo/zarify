
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { NavigationProvider } from '@/contexts/NavigationContext';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import OrdersTab from '@/components/OrdersTab';
import InventoryTab from '@/components/InventoryTab';
import ProductConfigTab from '@/components/ProductConfigTab';
import UsersTab from '@/components/UsersTab';
import ActivityLogsTab from '@/components/ActivityLogsTab';
import MerchantConfigurations from '@/components/settings/MerchantConfigurations';
import GeneralSettings from '@/components/settings/GeneralSettings';
import CatalogueManagement from '@/components/catalogue/CatalogueManagement';
import NotFound from '@/pages/NotFound';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map current route to active tab
  const getActiveTabFromRoute = (pathname: string) => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/orders') return 'orders';
    if (pathname === '/inventory') return 'fg-inventory';
    if (pathname === '/config') return 'config';
    if (pathname === '/users') return 'customers';
    if (pathname === '/activity') return 'activity';
    if (pathname === '/settings/merchant') return 'merchant-configurations';
    if (pathname === '/settings/general') return 'general-settings';
    if (pathname === '/catalogue') return 'catalogue-management';
    return 'dashboard';
  };

  // Handle tab changes by navigating to appropriate routes
  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        navigate('/');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'fg-inventory':
      case 'rm-inventory':
        navigate('/inventory');
        break;
      case 'config':
        navigate('/config');
        break;
      case 'customers':
      case 'suppliers':
      case 'workers':
      case 'roles':
        navigate('/users');
        break;
      case 'activity':
        navigate('/activity');
        break;
      case 'merchant-configurations':
        navigate('/settings/merchant');
        break;
      case 'general-settings':
        navigate('/settings/general');
        break;
      case 'catalogue-management':
        navigate('/catalogue');
        break;
      default:
        navigate('/');
    }
  };

  const activeTab = getActiveTabFromRoute(location.pathname);

  return (
    <SidebarProvider>
      <NavigationProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<UnifiedDashboard />} />
              <Route path="/orders" element={<OrdersTab />} />
              <Route path="/inventory" element={<InventoryTab />} />
              <Route path="/config" element={<ProductConfigTab />} />
              <Route path="/users" element={<UsersTab activeTab="customers" onTabChange={() => {}} />} />
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
