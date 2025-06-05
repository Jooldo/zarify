
import { Users, Building, Hammer } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomersSection from '@/components/users/CustomersSection';
import SuppliersSection from '@/components/users/SuppliersSection';
import WorkersSection from '@/components/users/WorkersSection';

const UsersTab = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center gap-2">
            <Hammer className="h-4 w-4" />
            Workers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-6">
          <CustomersSection />
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <SuppliersSection />
        </TabsContent>

        <TabsContent value="workers" className="mt-6">
          <WorkersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersTab;
