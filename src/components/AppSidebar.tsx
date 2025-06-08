
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
  ChevronRight,
  Layers,
  Box,
  Wrench,
  ShoppingBag,
  TrendingUp,
  Building2,
  Factory
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

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
      title: "Raw Material Management",
      value: "raw-material-management",
      icon: Layers,
      subItems: [
        {
          title: "RM Inventory",
          value: "rm-inventory",
          icon: Package,
        },
        {
          title: "RM Procurement",
          value: "rm-procurement",
          icon: ShoppingBag,
        },
        {
          title: "Analytics",
          value: "rm-analytics",
          icon: TrendingUp,
        },
        {
          title: "Suppliers",
          value: "rm-suppliers",
          icon: Building2,
        },
        {
          title: "RM Config",
          value: "rm-config",
          icon: Settings,
        }
      ]
    },
    {
      title: "Finished Good Management",
      value: "finished-good-management",
      icon: Box,
      subItems: [
        {
          title: "FG Inventory",
          value: "fg-inventory",
          icon: Package,
        },
        {
          title: "FG Manufacturing",
          value: "fg-manufacturing",
          icon: Factory,
        },
        {
          title: "Analytics",
          value: "fg-analytics",
          icon: BarChart3,
        },
        {
          title: "Workers",
          value: "fg-workers",
          icon: Users,
        },
        {
          title: "FG Config",
          value: "fg-config",
          icon: Wrench,
        }
      ]
    },
    {
      title: "Users",
      value: "users",
      icon: Users,
    },
    {
      title: "Activity Logs",
      value: "activity",
      icon: Activity,
    },
  ];

  return (
    <Sidebar collapsible="icon">
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
                    isActive={activeTab === item.value || 
                      (item.subItems && item.subItems.some(sub => activeTab === sub.value))}
                    onClick={() => {
                      if (!item.subItems) {
                        onTabChange(item.value);
                      }
                    }}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                  
                  {item.subItems && !isCollapsed && (
                    <SidebarMenuSub>
                      {item.subItems.map(subItem => (
                        <SidebarMenuSubItem key={subItem.value}>
                          <SidebarMenuSubButton 
                            isActive={activeTab === subItem.value}
                            onClick={() => onTabChange(subItem.value)}
                          >
                            <subItem.icon className="h-4 w-4 mr-2" />
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
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
