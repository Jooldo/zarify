import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import OrdersTab, { OrderFilters } from "@/components/OrdersTab";
import UsersTab from "@/components/UsersTab";
import ActivityLogsTab from "@/components/ActivityLogsTab";
import VisualDashboard from "@/components/dashboard/VisualDashboard";
import RawMaterialManagement from "@/components/RawMaterialManagement";
import FinishedGoodManagement from "@/components/FinishedGoodManagement";
import ManufacturingSettings from "@/components/manufacturing/config/ManufacturingSettings";
import MerchantConfigurations from "@/components/settings/MerchantConfigurations";
import GeneralSettings from "@/components/settings/GeneralSettings";
import CatalogueManagement from "@/components/catalogue/CatalogueManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [initialOrderFilters, setInitialOrderFilters] = useState<OrderFilters | null>(null);

  console.log('Index component rendered with activeTab:', activeTab);

  const handleNavigateToTab = (tab: string, filters?: Partial<OrderFilters>) => {
    console.log('Navigating to tab:', tab);
    
    // Handle removed tabs by redirecting to appropriate alternatives
    if (tab === 'rm-home') {
      tab = 'rm-inventory'; // Redirect rm-home to rm-inventory
    }
    if (tab === 'fg-analytics') {
      tab = 'fg-inventory'; // Redirect fg-analytics to fg-inventory
    }
    
    if (tab === 'orders' && filters) {
      const newFilters: OrderFilters = {
        customer: '', orderStatus: '', suborderStatus: '', category: '', subcategory: '',
        dateRange: '', minAmount: '', maxAmount: '', hasDeliveryDate: false,
        overdueDelivery: false, lowStock: false, stockAvailable: false,
        expectedDeliveryFrom: null, expectedDeliveryTo: null, expectedDeliveryRange: '',
        ...filters
      };
      setInitialOrderFilters(newFilters);
    } else {
      setInitialOrderFilters(null);
    }
    setActiveTab(tab);
  };

  const handleFiltersConsumed = () => {
    setInitialOrderFilters(null);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "";
      case "orders":
        return "Orders";
      case "rm-inventory":
        return "Raw Material Inventory";
      case "rm-procurement":
        return "Raw Material Procurement";
      case "fg-inventory":
        return "Finished Goods Inventory";
      case "fg-manufacturing":
        return "Finished Goods Manufacturing";
      case "customers":
        return "Customers";
      case "suppliers":
        return "Suppliers";
      case "workers":
        return "Workers";
      case "activity":
        return "Activity Logs";
      case "catalogue-management":
        return "Product Catalogues";
      case "merchant-configurations":
        return "Merchant Configurations";
      case "general-settings":
        return "General Settings";
      default:
        return "";
    }
  };

  const isRawMaterialTab = () => {
    return ['rm-inventory', 'rm-procurement'].includes(activeTab);
  };

  const isFinishedGoodTab = () => {
    return ['fg-inventory', 'fg-manufacturing'].includes(activeTab);
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
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full min-h-screen">
          <AppSidebar activeTab={activeTab} onTabChange={handleNavigateToTab} />

          <SidebarInset className="flex-1">
            {/* Header with Sidebar Toggle */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
              <SidebarTrigger className="-ml-1" />
              {pageTitle && (
                <div className="flex items-center gap-2 px-3">
                  <h1 className="text-lg font-semibold">{pageTitle}</h1>
                </div>
              )}
            </header>

            {/* Raw Material Management - Full width with its own layout */}
            {isRawMaterialTab() && (
              <Tabs value={activeTab} className="w-full h-full">
                <TabsContent value={activeTab} className="space-y-0 mt-0 h-full">
                  <RawMaterialManagement 
                    activeTab={activeTab} 
                    onTabChange={handleNavigateToTab} 
                  />
                </TabsContent>
              </Tabs>
            )}

            {/* Finished Good Management - Full width with its own layout */}
            {isFinishedGoodTab() && (
              <Tabs value={activeTab} className="w-full h-full">
                <TabsContent value={activeTab} className="space-y-0 mt-0 h-full">
                  <FinishedGoodManagement 
                    activeTab={activeTab} 
                    onTabChange={handleNavigateToTab} 
                  />
                </TabsContent>
              </Tabs>
            )}

            {/* Users Management - Full width with its own layout */}
            {isUsersTab() && (
              <UsersTab 
                activeTab={activeTab === 'users' ? 'customers' : activeTab} 
                onTabChange={handleNavigateToTab} 
              />
            )}

            {/* Settings Management - Full width with its own layout */}
            {isSettingsTab() && (
              <div className="h-full bg-background">
                {activeTab === 'merchant-configurations' && (
                  <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <MerchantConfigurations />
                  </div>
                )}
                {activeTab === 'general-settings' && (
                  <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <GeneralSettings />
                  </div>
                )}
              </div>
            )}

            {/* Other tabs with optimized layout */}
            {!isRawMaterialTab() && !isFinishedGoodTab() && !isUsersTab() && !isSettingsTab() && (
              <div className="h-full bg-background">
                {/* Main Content */}
                <Tabs value={activeTab} className="w-full h-full">
                  <TabsContent value="dashboard" className="space-y-0 mt-0 h-full">
                    <VisualDashboard onNavigateToTab={handleNavigateToTab} />
                  </TabsContent>

                  <TabsContent value="orders" className="space-y-6 mt-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                      <OrdersTab
                        initialFilters={initialOrderFilters}
                        onFiltersConsumed={handleFiltersConsumed}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="catalogue-management" className="space-y-6 mt-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                      <CatalogueManagement />
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-6 mt-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                      <ActivityLogsTab />
                    </div>
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
