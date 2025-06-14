
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
  // SidebarMenuSub, // Not used
  // SidebarMenuSubButton, // Not used
  // SidebarMenuSubItem, // Not used
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
  const { signOut } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "raw-materials": true,
    "finished-goods": true,
    "manufacturing": true,
    "users": true,
    "settings": false,
  });

  // console.log("AppSidebar rendered with activeTab:", activeTab); // Keep console logs if helpful for user

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
      label: "Finished Goods",
      id: "finished-goods",
      items: [
        {
          title: "Inventory",
          icon: Boxes,
          tab: "fg-inventory",
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
          title: "Procurement",
          icon: Truck,
          tab: "rm-procurement",
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
          title: "Merchant Configurations",
          icon: Settings,
          tab: "merchant-configurations",
        },
        {
          title: "General Settings",
          icon: Workflow,
          tab: "general-settings",
        },
      ],
    },
  ];

  return (
    <Sidebar className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar text-sidebar-primary"> {/* Updated: bg-sidebar, text-sidebar-primary, border-sidebar-border */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"> {/* Updated: bg-primary/10, text-primary */}
            <Package className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-primary">Jewelry ERP</span> {/* Ensured text color consistency */}
            <span className="text-xs text-sidebar-primary/80">Manufacturing</span> {/* Updated: text-sidebar-primary/80 */}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="[&>div]:space-y-0.5"> {/* Reduced spacing between groups */}
        {menuSections.map((section) => (
          <SidebarGroup key={section.label} className="py-1 first:pt-0 last:pb-0"> {/* Reduced padding for groups */}
            {section.id ? (
              <Collapsible 
                open={openSections[section.id]} 
                onOpenChange={() => toggleSection(section.id!)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent rounded-md p-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 hover:text-sidebar-foreground"> {/* Updated: hover:bg-sidebar-accent */}
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
                            className="w-full text-sm h-9 data-[active=true]:bg-gradient-to-r data-[active=true]:from-lp-blue-500 data-[active=true]:to-lp-emerald-500 data-[active=true]:text-white hover:bg-sidebar-accent data-[active=true]:hover:opacity-90" // Updated: hover:bg-sidebar-accent
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary-foreground"> {/* Adjusted badge for light sidebar */}
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
                <SidebarGroupLabel className="p-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.tab}>
                        <SidebarMenuButton 
                          onClick={() => onTabChange(item.tab)}
                          isActive={activeTab === item.tab}
                          className="w-full text-sm h-9 data-[active=true]:bg-gradient-to-r data-[active=true]:from-lp-blue-500 data-[active=true]:to-lp-emerald-500 data-[active=true]:text-white hover:bg-sidebar-accent data-[active=true]:hover:opacity-90" // Updated: hover:bg-sidebar-accent
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                             <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary-foreground"> {/* Adjusted badge for light sidebar */}
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

      <SidebarFooter className="border-t p-4 border-sidebar-border">
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent" // Updated: hover:bg-sidebar-accent
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
