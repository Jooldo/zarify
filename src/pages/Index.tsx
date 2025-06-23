import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { NavigationProvider } from '@/contexts/NavigationContext';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import OrdersTab from '@/components/OrdersTab';
import InventoryTab from '@/components/InventoryTab';
import FinishedGoodsInventory from '@/components/FinishedGoodsInventory';
import RawMaterialInventory from '@/components/RawMaterialInventory';
import FinishedGoodManagement from '@/components/FinishedGoodManagement';
import ProcurementRequestsSection from '@/components/ProcurementRequestsSection';
import ProductConfigTab from '@/components/ProductConfigTab';
import UsersTab from '@/components/UsersTab';
import ActivityLogsTab from '@/components/ActivityLogsTab';
import MerchantConfigurations from '@/components/settings/MerchantConfigurations';
import GeneralSettings from '@/components/settings/GeneralSettings';
import CatalogueManagement from '@/components/catalogue/CatalogueManagement';
import DevelopmentDashboard from '@/components/development/DevelopmentDashboard';
import NotFound from '@/pages/NotFound';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map current route to active tab (adjusted for /app prefix)
  const getActiveTabFromRoute = (pathname: string) => {
    if (pathname === '/app' || pathname === '/app/') return 'dashboard';
    if (pathname === '/app/orders') return 'orders';
    if (pathname === '/app/inventory') return 'fg-inventory';
    if (pathname === '/app/inventory/finished-goods') return 'fg-inventory';
    if (pathname === '/app/inventory/raw-materials') return 'rm-inventory';
    if (pathname === '/app/manufacturing') return 'fg-manufacturing';
    if (pathname === '/app/procurement') return 'rm-procurement';
    if (pathname === '/app/config') return 'config';
    if (pathname === '/app/users') return 'customers';
    if (pathname === '/app/activity') return 'activity';
    if (pathname === '/app/settings/merchant') return 'merchant-configurations';
    if (pathname === '/app/settings/general') return 'general-settings';
    if (pathname === '/app/catalogue') return 'catalogue-management';
    if (pathname === '/app/dev') return 'development';
    return 'dashboard';
  };

  // Handle tab changes by navigating to appropriate routes (with /app prefix)
  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        navigate('/app');
        break;
      case 'orders':
        navigate('/app/orders');
        break;
      case 'fg-inventory':
        navigate('/app/inventory/finished-goods');
        break;
      case 'rm-inventory':
        navigate('/app/inventory/raw-materials');
        break;
      case 'fg-manufacturing':
        navigate('/app/manufacturing');
        break;
      case 'rm-procurement':
        navigate('/app/procurement');
        break;
      case 'config':
        navigate('/app/config');
        break;
      case 'customers':
      case 'suppliers':
      case 'workers':
      case 'roles':
        navigate('/app/users');
        break;
      case 'activity':
        navigate('/app/activity');
        break;
      case 'merchant-configurations':
        navigate('/app/settings/merchant');
        break;
      case 'general-settings':
        navigate('/app/settings/general');
        break;
      case 'catalogue-management':
        navigate('/app/catalogue');
        break;
      case 'development':
        navigate('/app/dev');
        break;
      default:
        navigate('/app');
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
              <Route path="/inventory/finished-goods" element={<FinishedGoodsInventory />} />
              <Route path="/inventory/raw-materials" element={<RawMaterialInventory />} />
              <Route path="/manufacturing" element={<FinishedGoodManagement activeTab="fg-manufacturing" onTabChange={handleTabChange} />} />
              <Route path="/procurement" element={<ProcurementRequestsSection />} />
              <Route path="/config" element={<ProductConfigTab />} />
              <Route path="/users" element={<UsersTab activeTab="customers" onTabChange={() => {}} />} />
              <Route path="/activity" element={<ActivityLogsTab />} />
              <Route path="/settings/merchant" element={<MerchantConfigurations />} />
              <Route path="/settings/general" element={<GeneralSettings />} />
              <Route path="/catalogue" element={<CatalogueManagement />} />
              <Route path="/dev" element={<DevelopmentDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </NavigationProvider>
    </SidebarProvider>
  );
};

export default Index;
