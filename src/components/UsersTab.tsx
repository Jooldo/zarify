
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
    <div className="min-h-screen bg-background">
      {/* Header Section with Tabs */}
      <div className="bg-card border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage customers, suppliers, and workers
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/10 h-12 p-1 rounded-lg border">
              <TabsTrigger 
                value="customers" 
                className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all font-medium"
              >
                <Users className="h-4 w-4" />
                <span>Customers</span>
              </TabsTrigger>
              <TabsTrigger 
                value="suppliers" 
                className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all font-medium"
              >
                <Building className="h-4 w-4" />
                <span>Suppliers</span>
              </TabsTrigger>
              <TabsTrigger 
                value="workers" 
                className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all font-medium"
              >
                <Hammer className="h-4 w-4" />
                <span>Workers</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-background">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value={activeTab} className="mt-0 animate-fade-in">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="min-h-[700px]">
                {renderActiveContent()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UsersTab;
