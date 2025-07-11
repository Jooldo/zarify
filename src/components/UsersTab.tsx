
import { Users, Building, Hammer, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomersSection from '@/components/users/CustomersSection';
import SuppliersSection from '@/components/users/SuppliersSection';
import WorkersSection from '@/components/users/WorkersSection';
import UserRolesTab from '@/components/users/UserRolesTab';

interface UsersTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const UsersTab = ({ activeTab, onTabChange }: UsersTabProps) => {
  console.log('UsersTab rendered with activeTab:', activeTab);

  const renderActiveContent = () => {
    console.log('Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      case 'customers':
        console.log('Rendering CustomersSection');
        return <CustomersSection />;
      case 'suppliers':
        console.log('Rendering SuppliersSection');
        return <SuppliersSection />;
      case 'workers':
        console.log('Rendering WorkersSection');
        return <WorkersSection />;
      case 'roles':
        console.log('Rendering UserRolesTab');
        return <UserRolesTab />;
      default:
        console.log('Rendering default CustomersSection for tab:', activeTab);
        return <CustomersSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header Section */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage customers, suppliers, workers, and user roles
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted h-12">
            <TabsTrigger value="customers" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Building className="h-4 w-4" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Hammer className="h-4 w-4" />
              Workers
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Shield className="h-4 w-4" />
              User Roles
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Section */}
      <div className="bg-background py-6">
        <div className="min-h-[700px]">
          <div className="space-y-6">
            {renderActiveContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
