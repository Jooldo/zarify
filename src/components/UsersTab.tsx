
import { Users, Building, Hammer } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomersSection from '@/components/users/CustomersSection';
import SuppliersSection from '@/components/users/SuppliersSection';
import WorkersSection from '@/components/users/WorkersSection';

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
      default:
        console.log('Rendering default CustomersSection for tab:', activeTab);
        return <CustomersSection />;
    }
  };

  return (
    <div className="bg-white">
      {/* Fixed Header Section */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-heading">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage customers, suppliers, and workers
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted h-12">
            <TabsTrigger value="customers" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Building className="h-4 w-4" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Hammer className="h-4 w-4" />
              Workers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Section */}
      <div className="bg-white py-6">
        <div>
          <div className="space-y-6">
            {renderActiveContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
