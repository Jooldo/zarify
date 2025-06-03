
import { useState } from 'react';
import { Users, Building, Hammer } from 'lucide-react';
import CustomersSection from '@/components/users/CustomersSection';
import SuppliersSection from '@/components/users/SuppliersSection';
import WorkersSection from '@/components/users/WorkersSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

        <TabsContent value="customers">
          <CustomersSection />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersSection />
        </TabsContent>

        <TabsContent value="workers">
          <WorkersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersTab;
