
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Activity
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
  SidebarMenuItem
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
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
        <div className="px-3 pt-3 pb-1">
          <h1 className="text-lg font-bold text-sidebar-foreground">Anklet Order Management</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
              <SidebarMenuButton onClick={handleSignOut} className="text-red-500 hover:text-red-600">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
