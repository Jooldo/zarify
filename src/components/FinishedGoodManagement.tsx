
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigation } from '@/contexts/NavigationContext';
import FinishedGoodsInventory from './FinishedGoodsInventory';

interface FinishedGoodManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FinishedGoodManagement = ({ activeTab, onTabChange }: FinishedGoodManagementProps) => {
  const { hidePageHeader } = useNavigation();

  const getTabContent = () => {
    switch (activeTab) {
      case 'fg-inventory':
        return <FinishedGoodsInventory />;
      case 'fg-manufacturing':
        return <div className="p-6">Manufacturing content coming soon...</div>;
      case 'fg-analytics':
        return <div className="p-6">Analytics content coming soon...</div>;
      case 'fg-workers':
        return <div className="p-6">Workers content coming soon...</div>;
      case 'fg-config':
        return <div className="p-6">Configuration content coming soon...</div>;
      default:
        return <FinishedGoodsInventory />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Hide when hidePageHeader is true */}
      {!hidePageHeader && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">Finished Good Management</h2>
          <p className="text-muted-foreground">
            Manage finished goods inventory, manufacturing, analytics, and workers
          </p>
        </div>
      )}

      {/* Tabs Section - Hide when hidePageHeader is true */}
      {!hidePageHeader && (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="fg-inventory">Inventory</TabsTrigger>
            <TabsTrigger value="fg-manufacturing">Manufacturing</TabsTrigger>
            <TabsTrigger value="fg-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="fg-workers">Workers</TabsTrigger>
            <TabsTrigger value="fg-config">Config</TabsTrigger>
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

export default FinishedGoodManagement;
