
import { Package, Wrench, ShoppingBag } from 'lucide-react';
import FinishedGoodsInventory from './FinishedGoodsInventory';
import FinishedGoodsConfig from './config/FinishedGoodsConfig';
import FGProcurementTab from './procurement/FGProcurementTab';

interface FinishedGoodManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FinishedGoodManagement = ({ activeTab, onTabChange }: FinishedGoodManagementProps) => {
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'fg-inventory':
        return <FinishedGoodsInventory />;
      case 'fg-procurement':
        return <FGProcurementTab />;
      case 'fg-config':
        return <FinishedGoodsConfig />;
      default:
        return <FinishedGoodsInventory />;
    }
  };

  return (
    <div className="space-y-4">
      {renderActiveContent()}
    </div>
  );
};

export default FinishedGoodManagement;
