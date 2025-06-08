
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import OrdersTab from "@/components/OrdersTab";
import UsersTab from "@/components/UsersTab";
import ActivityLogsTab from "@/components/ActivityLogsTab";
import VisualDashboard from "@/components/dashboard/VisualDashboard";
import RawMaterialManagement from "@/components/RawMaterialManagement";
import FinishedGoodManagement from "@/components/FinishedGoodManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "";
      case "orders":
        return "Orders";
      case "rm-inventory":
        return "Raw Material Inventory";
      case "rm-config":
        return "Raw Material Configuration";
      case "rm-procurement":
        return "Raw Material Procurement";
      case "rm-analytics":
        return "Procurement Analytics";
      case "rm-suppliers":
        return "Supplier Management";
      case "fg-inventory":
        return "Finished Goods Inventory";
      case "fg-config":
        return "Finished Goods Configuration";
      case "fg-procurement":
        return "Finished Goods Procurement";
      case "users":
        return "Users";
      case "activity":
        return "Activity Logs";
      default:
        return "";
    }
  };

  const isRawMaterialTab = () => {
    return ['rm-inventory', 'rm-config', 'rm-procurement', 'rm-analytics', 'rm-suppliers'].includes(activeTab);
  };

  const isFinishedGoodTab = () => {
    return ['fg-inventory', 'fg-config', 'fg-procurement'].includes(activeTab);
  };

  const pageTitle = getPageTitle();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-h-screen bg-gray-50">
        <AppSidebar activeTab={activeTab} onTabChange={handleNavigateToTab} />

        <SidebarInset className="overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header - only show if there's a title and not handled by component */}
            {pageTitle && !isRawMaterialTab() && (
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {pageTitle}
                </h1>
              </div>
            )}

            {/* Main Content */}
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="dashboard" className="space-y-6 mt-0">
                <VisualDashboard onNavigateToTab={handleNavigateToTab} />
              </TabsContent>

              <TabsContent value="orders" className="space-y-6 mt-0">
                <OrdersTab />
              </TabsContent>

              {isRawMaterialTab() && (
                <TabsContent value={activeTab} className="space-y-6 mt-0">
                  <RawMaterialManagement 
                    activeTab={activeTab} 
                    onTabChange={handleNavigateToTab} 
                  />
                </TabsContent>
              )}

              {isFinishedGoodTab() && (
                <TabsContent value={activeTab} className="space-y-6 mt-0">
                  <FinishedGoodManagement 
                    activeTab={activeTab} 
                    onTabChange={handleNavigateToTab} 
                  />
                </TabsContent>
              )}

              <TabsContent value="users" className="space-y-6 mt-0">
                <UsersTab />
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-0">
                <ActivityLogsTab />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
