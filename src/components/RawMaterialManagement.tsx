
import { Package, Settings, ShoppingBag } from 'lucide-react';
import RawMaterialInventory from './RawMaterialInventory';
import RawMaterialsConfig from './config/RawMaterialsConfig';
import RMProcurementTab from './procurement/RMProcurementTab';

interface RawMaterialManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RawMaterialManagement = ({ activeTab, onTabChange }: RawMaterialManagementProps) => {
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'rm-inventory':
        return <RawMaterialInventory onRequestCreated={() => {}} />;
      case 'rm-procurement':
        return <RMProcurementTab />;
      case 'rm-config':
        return <RawMaterialsConfig />;
      default:
        return <RawMaterialInventory onRequestCreated={() => {}} />;
    }
  };

  return (
    <div className="space-y-4">
      {renderActiveContent()}
    </div>
  );
};

export default RawMaterialManagement;
