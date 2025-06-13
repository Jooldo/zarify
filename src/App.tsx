
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ErrorDialogProvider } from "@/components/ErrorDialogProvider";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Import pages
import DashboardOverview from "@/components/DashboardOverview";
import OrdersTab from "@/components/OrdersTab";
import InventoryTab from "@/components/InventoryTab";
import ProcurementRequestsSection from "@/components/ProcurementRequestsSection";
import AuthPage from "@/components/AuthPage";
import ProtectedRoute from "@/components/ProtectedRoute";

// Configuration pages
import RawMaterialsConfig from "@/components/config/RawMaterialsConfig";
import FinishedGoodsConfig from "@/components/config/FinishedGoodsConfig";

// Development pages
import DevelopmentDashboard from "@/components/development/DevelopmentDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState("raw-materials");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system settings and configurations
        </p>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("raw-materials")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "raw-materials"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            Raw Materials
          </button>
          <button
            onClick={() => setActiveTab("finished-goods")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "finished-goods"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            Finished Goods
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "raw-materials" && <RawMaterialsConfig />}
        {activeTab === "finished-goods" && <FinishedGoodsConfig />}
      </div>
    </div>
  );
}

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme || 'light');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorDialogProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="flex h-screen w-full">
                        <AppSidebar />
                        <main className="flex-1 overflow-auto p-6">
                          <Routes>
                            <Route path="/" element={<DashboardOverview />} />
                            <Route path="/orders" element={<OrdersTab />} />
                            <Route path="/inventory" element={<InventoryTab />} />
                            <Route path="/procurement" element={<ProcurementRequestsSection />} />
                            <Route path="/config" element={<ConfigurationPage />} />
                            <Route path="/development" element={<DevelopmentDashboard />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </main>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ErrorDialogProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
