
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings,
  LogOut,
  ChevronRight,
  Factory,
  Hammer,
  UserCheck,
  FileText,
  Truck,
  Building2,
  Boxes,
  BarChart3,
  ChevronDown,
  Workflow
} from "lucide-react";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "raw-materials": true,
    "finished-goods": true,
    "manufacturing": true,
    "users": true,
    "settings": false,
  });

  console.log("AppSidebar rendered with activeTab:", activeTab);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuSections = [
    {
      label: "Main",
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          tab: "dashboard",
          badge: null,
        },
        {
          title: "Orders",
          icon: ShoppingCart,
          tab: "orders",
          badge: null,
        },
      ],
    },
    {
      label: "Raw Materials",
      id: "raw-materials",
      items: [
        {
          title: "Home",
          icon: Factory,
          tab: "rm-home",
        },
        {
          title: "Inventory",
          icon: Package,
          tab: "rm-inventory",
        },
        {
          title: "Configuration",
          icon: Settings,
          tab: "rm-config",
        },
        {
          title: "Procurement",
          icon: Truck,
          tab: "rm-procurement",
        },
        {
          title: "Suppliers",
          icon: Building2,
          tab: "rm-suppliers",
        },
      ],
    },
    {
      label: "Finished Goods",
      id: "finished-goods",
      items: [
        {
          title: "Inventory",
          icon: Boxes,
          tab: "fg-inventory",
        },
        {
          title: "Configuration",
          icon: Settings,
          tab: "fg-config",
        },
        {
          title: "Manufacturing",
          icon: Hammer,
          tab: "fg-manufacturing",
        },
        {
          title: "Analytics",
          icon: BarChart3,
          tab: "fg-analytics",
        },
        {
          title: "Workers",
          icon: UserCheck,
          tab: "fg-workers",
        },
      ],
    },
    {
      label: "Users",
      id: "users",
      items: [
        {
          title: "Customers",
          icon: Users,
          tab: "customers",
        },
        {
          title: "Suppliers",
          icon: Building2,
          tab: "suppliers",
        },
        {
          title: "Workers",
          icon: UserCheck,
          tab: "workers",
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "Activity Logs",
          icon: FileText,
          tab: "activity",
        },
      ],
    },
    {
      label: "Settings",
      id: "settings",
      items: [
        {
          title: "Manufacturing",
          icon: Workflow,
          tab: "manufacturing-settings",
        },
        {
          title: "General",
          icon: Settings,
          tab: "general-settings",
        },
      ],
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Jewelry ERP</span>
            <span className="text-xs text-muted-foreground">Manufacturing</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            {section.id ? (
              <Collapsible 
                open={openSections[section.id]} 
                onOpenChange={() => toggleSection(section.id!)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent rounded-md p-2">
                    <span>{section.label}</span>
                    {openSections[section.id] ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.tab}>
                          <SidebarMenuButton 
                            onClick={() => onTabChange(item.tab)}
                            isActive={activeTab === item.tab}
                            className="w-full"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.tab}>
                        <SidebarMenuButton 
                          onClick={() => onTabChange(item.tab)}
                          isActive={activeTab === item.tab}
                          className="w-full"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
