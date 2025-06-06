
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import InventoryTab from "@/components/InventoryTab";
import OrdersTab from "@/components/OrdersTab";
import UsersTab from "@/components/UsersTab";
import ProductConfigTab from "@/components/ProductConfigTab";
import ActivityLogsTab from "@/components/ActivityLogsTab";
import VisualDashboard from "@/components/dashboard/VisualDashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gray-50">
        <AppSidebar activeTab={activeTab} onTabChange={handleNavigateToTab} />

        <SidebarInset className="overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "orders" && "Orders"}
                {activeTab === "inventory" && "Inventory"}
                {activeTab === "users" && "Users"}
                {activeTab === "config" && "Product Configuration"}
                {activeTab === "activity" && "Activity Logs"}
              </h1>
              <SidebarTrigger />
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="dashboard" className="space-y-6 mt-0">
                <VisualDashboard onNavigateToTab={handleNavigateToTab} />
              </TabsContent>

              <TabsContent value="orders" className="space-y-6 mt-0">
                <OrdersTab />
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6 mt-0">
                <InventoryTab />
              </TabsContent>

              <TabsContent value="users" className="space-y-6 mt-0">
                <UsersTab />
              </TabsContent>

              <TabsContent value="config" className="space-y-6 mt-0">
                <ProductConfigTab />
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
