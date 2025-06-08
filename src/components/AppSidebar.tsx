

import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  Package2,
  BarChart3,
  Building2,
  ShoppingBag,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const navigationItems = [
    {
      label: "Dashboard",
      tab: "dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Orders",
      tab: "orders", 
      icon: ShoppingCart,
    },
    {
      label: "Raw Materials",
      icon: Package,
      items: [
        { label: "Inventory", tab: "rm-inventory", icon: Package },
        { label: "Procurement", tab: "rm-procurement", icon: ShoppingBag },
        { label: "Analytics", tab: "rm-analytics", icon: BarChart3 },
        { label: "Suppliers", tab: "rm-suppliers", icon: Building2 },
        { label: "Configuration", tab: "rm-config", icon: Settings },
      ]
    },
    {
      label: "Finished Goods",
      icon: Package2,
      items: [
        { label: "Inventory", tab: "fg-inventory", icon: Package2 },
        { label: "Procurement", tab: "fg-procurement", icon: ShoppingBag },
        { label: "Configuration", tab: "fg-config", icon: Settings },
      ]
    },
    {
      label: "Users",
      tab: "users",
      icon: Users,
    },
    {
      label: "Activity Logs",
      tab: "activity",
      icon: FileText,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 font-medium">
              <p className="text-sm">Acme Corp</p>
              <p className="text-xs text-muted-foreground">
                admin@example.com
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full py-2">
          <SidebarMenu>
            {navigationItems.map((item) =>
              item.items ? (
                <SidebarMenuItem key={item.label}>
                  <Accordion type="single" collapsible>
                    <AccordionItem value={item.label}>
                      <AccordionTrigger className="py-2 font-medium hover:no-underline" onClick={() => setIsAccordionOpen(!isAccordionOpen)}>
                        <div className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-1">
                        {item.items.map((subItem) => (
                          <SidebarMenuButton
                            key={subItem.label}
                            isActive={activeTab === subItem.tab}
                            onClick={() => onTabChange(subItem.tab)}
                            className="w-full justify-start"
                          >
                            <div className="flex items-center space-x-2">
                              <subItem.icon className="h-3 w-3" />
                              <span>{subItem.label}</span>
                            </div>
                          </SidebarMenuButton>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={activeTab === item.tab}
                    onClick={() => onTabChange(item.tab)}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <Button variant="outline" className="w-full mt-2">
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

