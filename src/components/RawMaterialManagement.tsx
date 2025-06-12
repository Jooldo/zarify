
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigation } from '@/contexts/NavigationContext';
import RawMaterialInventory from './RawMaterialInventory';
import RMHomeDashboard from './rawmaterial/RMHomeDashboard';

interface RawMaterialManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RawMaterialManagement = ({ activeTab, onTabChange }: RawMaterialManagementProps) => {
  const { hidePageHeader } = useNavigation();

  const getTabContent = () => {
    switch (activeTab) {
      case 'rm-home':
        return <RMHomeDashboard onNavigateToTab={onTabChange} />;
      case 'rm-inventory':
        return <RawMaterialInventory />;
      case 'rm-procurement':
        return <div className="p-6">Raw Material Procurement content coming soon...</div>;
      case 'rm-suppliers':
        return <div className="p-6">Supplier Management content coming soon...</div>;
      case 'rm-config':
        return <div className="p-6">Raw Material Configuration content coming soon...</div>;
      default:
        return <RMHomeDashboard onNavigateToTab={onTabChange} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Hide when hidePageHeader is true */}
      {!hidePageHeader && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">Raw Material Management</h2>
          <p className="text-muted-foreground">
            Manage inventory, procurement, suppliers, and analytics
          </p>
        </div>
      )}

      {/* Tabs Section - Hide when hidePageHeader is true */}
      {!hidePageHeader && (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rm-home">Home</TabsTrigger>
            <TabsTrigger value="rm-inventory">Inventory</TabsTrigger>
            <TabsTrigger value="rm-procurement">Procurement</TabsTrigger>
            <TabsTrigger value="rm-suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="rm-config">Config</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Content Section - Always visible */}
      <div className="mt-6">
        {getTabContent()}
      </div>
    </div>
  );
};

export default RawMaterialManagement;
