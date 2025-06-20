
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package2, Calendar, Calculator, Play, Workflow } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useNavigation } from '@/contexts/NavigationContext';
import { useToast } from '@/hooks/use-toast';
import StartStepDialog from './StartStepDialog';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import { ManufacturingOrder } from '@/types/manufacturingOrders';

interface ManufacturingOrderCardProps {
  order: ManufacturingOrder;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewDetails: (order: ManufacturingOrder) => void;
}

const ManufacturingOrderCard = ({ order, getPriorityColor, getStatusColor, onViewDetails }: ManufacturingOrderCardProps) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const { setActiveTab, setProductionQueueFilters } = useNavigation();
  const { toast } = useToast();
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  // Get the first step from merchant's configuration
  const getFirstStep = () => {
    return manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order)[0];
  };

  // Check if any order steps exist for this order
  const hasAnyOrderSteps = orderSteps.some(step => step.manufacturing_order_id === order.id);
  
  const firstStep = getFirstStep();
  const shouldShowStartButton = !hasAnyOrderSteps && firstStep;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when button is clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setDetailsDialogOpen(true);
  };

  const handleStartStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (firstStep) {
      // Ensure we have a clean step object with proper ID
      const stepToPass = {
        ...firstStep,
        id: String(firstStep.id) // Ensure ID is always a string
      };
      
      setSelectedStep(stepToPass);
      setStartStepDialogOpen(true);
    }
  };

  const handleFlowViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Set filters for the specific order
    setProductionQueueFilters({
      status: '',
      priority: '',
      productName: order.product_name,
      orderNumber: order.order_number,
      hasInProgressSteps: false,
      hasCompletedSteps: false,
      urgentOnly: false,
    });
    
    // Navigate to production queue tab
    setActiveTab('manufacturing');
    
    toast({
      title: "Production Flow",
      description: `Showing flow view for order ${order.order_number}`,
    });
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{order.product_name}</CardTitle>
              <p className="text-sm text-gray-600 font-mono">{order.order_number}</p>
              {order.product_type && (
                <p className="text-xs text-gray-500">{order.product_type}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
                {order.priority}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFlowViewClick}
                className="h-6 w-full p-0 text-blue-600 hover:text-blue-700 mt-1"
                title="View in Production Flow"
              >
                <Workflow className="h-3 w-3 mr-1" />
                Flow
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Quantity: <span className="font-semibold">{order.quantity_required}</span></span>
            </div>
            
            {order.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Due: {format(new Date(order.due_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Created: {format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Product Configuration Info */}
          {order.product_configs && (
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-1 mb-1">
                <Calculator className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Product Config</span>
              </div>
              <p className="text-xs text-blue-600 font-mono">{order.product_configs.product_code}</p>
              <p className="text-xs text-blue-600">{order.product_configs.category} - {order.product_configs.subcategory}</p>
            </div>
          )}

          {/* Raw Material Requirements - Show first 3 only */}
          {order.product_configs?.product_config_materials && order.product_configs.product_config_materials.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Package2 className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium">Material Requirements</span>
              </div>
              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs p-2">Material</TableHead>
                      <TableHead className="text-xs p-2 text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.product_configs.product_config_materials.slice(0, 2).map((material, index) => {
                      const totalRequired = material.quantity_required * order.quantity_required;
                      
                      return (
                        <TableRow key={material.id || index}>
                          <TableCell className="text-xs p-2">
                            {material.raw_materials?.name || `Material #${material.raw_material_id.slice(-6)}`}
                          </TableCell>
                          <TableCell className="text-xs p-2 text-center font-medium">
                            {totalRequired.toFixed(1)} {material.unit}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {order.product_configs.product_config_materials.length > 2 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-xs p-2 text-center text-gray-500">
                          +{order.product_configs.product_config_materials.length - 2} more materials
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Start First Step Button */}
          {shouldShowStartButton && (
            <div className="pt-2 border-t">
              <Button 
                onClick={handleStartStep}
                className="w-full text-sm bg-primary hover:bg-primary/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Start {firstStep.step_name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={order}
        step={selectedStep}
      />

      <ManufacturingOrderDetailsDialog
        order={order}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />
    </>
  );
};

export default ManufacturingOrderCard;
