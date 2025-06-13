
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package2, Calendar, User, FileText, Eye, Calculator, Play } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';

interface ManufacturingOrderCardProps {
  order: ManufacturingOrder;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewDetails: (order: ManufacturingOrder) => void;
}

const ManufacturingOrderCard = ({ order, getPriorityColor, getStatusColor, onViewDetails }: ManufacturingOrderCardProps) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();

  // Get the next step that should be started
  const getNextStep = () => {
    const currentOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === order.id);
    
    if (currentOrderSteps.length === 0) {
      // No steps exist, get the first manufacturing step
      return manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)[0];
    }
    
    // Find the next pending step
    const nextPendingStep = currentOrderSteps
      .filter(step => step.status === 'pending')
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0))[0];
    
    return nextPendingStep?.manufacturing_steps;
  };

  const nextStep = getNextStep();
  const hasStarted = orderSteps.some(step => step.manufacturing_order_id === order.id && step.status !== 'pending');

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(order)}>
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Details */}
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

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">Instructions</span>
            </div>
            <p className="text-xs text-yellow-700 line-clamp-2">{order.special_instructions}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(order);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          
          {nextStep && !hasStarted && (
            <Button 
              size="sm" 
              className="flex-1 text-xs bg-primary hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(order);
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              Start {nextStep.step_name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManufacturingOrderCard;
