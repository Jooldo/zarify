
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface ManufacturingDashboardHeaderProps {
  onShowCreateDialog: () => void;
}

const ManufacturingDashboardHeader = ({ onShowCreateDialog }: ManufacturingDashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Manufacturing Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage production orders and track manufacturing progress
        </p>
      </div>
      <Button onClick={onShowCreateDialog} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Create Manufacturing Order
      </Button>
    </div>
  );
};

export default ManufacturingDashboardHeader;
