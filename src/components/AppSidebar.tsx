
import { Home, Package, Users, ShoppingBag, FileText, Settings, Factory, UserCheck, FileBarChart, BarChart3, Book } from "lucide-react";
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
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Raw Materials",
    url: "/raw-materials",
    icon: Package,
  },
  {
    title: "Finished Goods",
    url: "/finished-goods",
    icon: Factory,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileText,
  },
  {
    title: "Workers",
    url: "/workers",
    icon: UserCheck,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileBarChart,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Catalogues",
    url: "/catalogues",
    icon: Book,
  },
];

const settingsItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold tracking-tight">Business Portal</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          Business Management System
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
