import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import OrdersTab from "@/components/OrdersTab";
import UsersTab from "@/components/UsersTab";
import ActivityLogsTab from "@/components/ActivityLogsTab";
import VisualDashboard from "@/components/dashboard/VisualDashboard";
import RawMaterialManagement from "@/components/RawMaterialManagement";
import FinishedGoodManagement from "@/components/FinishedGoodManagement";
import ManufacturingSettings from "@/components/manufacturing/config/ManufacturingSettings";
import MerchantConfigurations from "@/components/settings/MerchantConfigurations";
import GeneralSettings from "@/components/settings/GeneralSettings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  console.log('Index component rendered with activeTab:', activeTab);

  const handleNavigateToTab = (tab: string) => {
    console.log('Navigating to tab:', tab);
    setActiveTab(tab);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "";
      case "orders":
        return "Orders";
      case "rm-home":
        return "Raw Material Home";
      case "rm-inventory":
        return "Raw Material Inventory";
      case "rm-procurement":
        return "Raw Material Procurement";
      case "fg-inventory":
        return "Finished Goods Inventory";
      case "fg-manufacturing":
        return "Finished Goods Manufacturing";
      case "fg-analytics":
        return "Finished Goods Analytics";
      case "customers":
        return "Customers";
      case "suppliers":
        return "Suppliers";
      case "workers":
        return "Workers";
      case "activity":
        return "Activity Logs";
      case "merchant-configurations":
        return "Merchant Configurations";
      case "general-settings":
        return "General Settings";
      default:
        return "";
    }
  };

  const isRawMaterialTab = () => {
    return ['rm-home', 'rm-inventory', 'rm-procurement'].includes(activeTab);
  };

  const isFinishedGoodTab = () => {
    return ['fg-inventory', 'fg-manufacturing', 'fg-analytics'].includes(activeTab);
  };

  const isUsersTab = () => {
    const userTabs = ['users', 'customers', 'suppliers', 'workers'];
    const isUserTab = userTabs.includes(activeTab);
    console.log('Checking if user tab:', activeTab, 'Result:', isUserTab);
    return isUserTab;
  };

  const isSettingsTab = () => {
    return ['merchant-configurations', 'general-settings'].includes(activeTab);
  };

  const pageTitle = getPageTitle();

  console.log('Rendering with conditions:', {
    isRawMaterialTab: isRawMaterialTab(),
    isFinishedGoodTab: isFinishedGoodTab(),
    isUsersTab: isUsersTab(),
    isSettingsTab: isSettingsTab(),
    activeTab
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full min-h-screen">
          <AppSidebar activeTab={activeTab} onTabChange={handleNavigateToTab} />

          <SidebarInset className="overflow-auto">
            {/* Header with Sidebar Toggle */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              {pageTitle && (
                <div className="flex items-center gap-2 px-3">
                  <h1 className="text-lg font-semibold">{pageTitle}</h1>
                </div>
              )}
            </header>

            {/* Raw Material Management - Full width with its own layout */}
            {isRawMaterialTab() && (
              <Tabs value={activeTab} className="w-full">
                <TabsContent value={activeTab} className="space-y-0 mt-0">
                  <div className="px-4 sm:px-6 lg:px-8">
                    <RawMaterialManagement 
                      activeTab={activeTab} 
                      onTabChange={handleNavigateToTab} 
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Finished Good Management - Full width with its own layout */}
            {isFinishedGoodTab() && (
              <Tabs value={activeTab} className="w-full">
                <TabsContent value={activeTab} className="space-y-0 mt-0">
                  <div className="px-4 sm:px-6 lg:px-8">
                    <FinishedGoodManagement 
                      activeTab={activeTab} 
                      onTabChange={handleNavigateToTab} 
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Users Management - Full width with its own layout */}
            {isUsersTab() && (
              <div className="px-4 sm:px-6 lg:px-8">
                <UsersTab 
                  activeTab={activeTab === 'users' ? 'customers' : activeTab} 
                  onTabChange={handleNavigateToTab} 
                />
              </div>
            )}

            {/* Settings Management - Full width with its own layout */}
            {isSettingsTab() && (
              <div className="px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === 'merchant-configurations' && (
                  <MerchantConfigurations />
                )}
                {activeTab === 'general-settings' && (
                  <GeneralSettings />
                )}
              </div>
            )}

            {/* Other tabs with optimized layout */}
            {!isRawMaterialTab() && !isFinishedGoodTab() && !isUsersTab() && !isSettingsTab() && (
              <div className="px-4 sm:px-6 lg:px-8 py-6">
                {/* Main Content */}
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="dashboard" className="space-y-6 mt-0">
                    <VisualDashboard onNavigateToTab={handleNavigateToTab} />
                  </TabsContent>

                  <TabsContent value="orders" className="space-y-6 mt-0">
                    <OrdersTab />
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-6 mt-0">
                    <ActivityLogsTab />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
