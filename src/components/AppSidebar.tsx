
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { signOut } = useAuth();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    setOpen(!isCollapsed);
  };

  const menuItems = [
    {
      title: "Dashboard",
      value: "dashboard",
      icon: BarChart3,
    },
    {
      title: "Orders",
      value: "orders",
      icon: ShoppingCart,
    },
    {
      title: "Inventory",
      value: "inventory",
      icon: Package,
    },
    {
      title: "Users",
      value: "users",
      icon: Users,
    },
    {
      title: "Product Config",
      value: "config",
      icon: Settings,
    },
    {
      title: "Activity Logs",
      value: "activity",
      icon: Activity,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-sidebar-foreground">Anklet Order Management</h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-6 w-6" 
            onClick={toggleSidebar}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleSignOut} 
                className="text-red-500 hover:text-red-600"
                tooltip={isCollapsed ? "Sign Out" : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Sign Out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
