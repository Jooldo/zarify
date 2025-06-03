
import { useState } from 'react';
import { Users, Building, Hammer, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomersSection = () => {
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">No customers found. Add some customers to get started.</p>
    </div>
  );
};

const SuppliersSection = () => {
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">No suppliers found. Add some suppliers to get started.</p>
    </div>
  );
};

const WorkersSection = () => {
  return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">No workers found. Add some workers to get started.</p>
    </div>
  );
};

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
