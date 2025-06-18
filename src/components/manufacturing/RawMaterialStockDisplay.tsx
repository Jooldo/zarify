
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface RawMaterialStockDisplayProps {
  productConfigId: string | null;
  quantityRequired: number;
}

const RawMaterialStockDisplay: React.FC<RawMaterialStockDisplayProps> = ({
  productConfigId,
  quantityRequired
}) => {
  const { rawMaterials, loading, error } = useRawMaterials();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Raw Material Stock</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground">Loading material requirements...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !productConfigId) {
    return null;
  }

  // Filter raw materials that are required for this product config
  const requiredMaterials = rawMaterials.filter(material => 
    material.required && material.required > 0
  );

  if (requiredMaterials.length === 0) {
    return null;
  }

  const getStockStatus = (currentStock: number, required: number, inProcurement: number) => {
    const totalAvailable = currentStock + inProcurement;
    const totalRequired = required * quantityRequired;
    
    if (totalAvailable >= totalRequired) {
      return { status: 'sufficient', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    } else if (totalAvailable >= totalRequired * 0.5) {
      return { status: 'low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'insufficient', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getShortUnit = (unit: string) => {
    const unitMap: { [key: string]: string } = {
      'grams': 'g',
      'gram': 'g',
      'kilograms': 'kg',
      'kilogram': 'kg',
      'liters': 'l',
      'liter': 'l',
      'milliliters': 'ml',
      'milliliter': 'ml',
      'pieces': 'pcs',
      'piece': 'pc',
      'meters': 'm',
      'meter': 'm',
      'centimeters': 'cm',
      'centimeter': 'cm'
    };
    return unitMap[unit.toLowerCase()] || unit;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Raw Material Stock Availability</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {requiredMaterials.map((material) => {
            const totalRequired = (material.required || 0) * quantityRequired;
            const stockStatus = getStockStatus(
              material.current_stock, 
              material.required || 0, 
              material.in_procurement
            );
            const StatusIcon = stockStatus.icon;
            const shortUnit = getShortUnit(material.unit);
            
            return (
              <div key={material.id} className={`p-3 rounded-lg border ${stockStatus.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                    <span className="font-medium text-sm">{material.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {material.type}
                    </Badge>
                  </div>
                  <Badge 
                    variant={stockStatus.status === 'sufficient' ? 'default' : 
                            stockStatus.status === 'low' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {stockStatus.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Required:</span>
                    <div className="font-semibold">{formatNumber(totalRequired)} {shortUnit}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available:</span>
                    <div className="font-semibold">
                      {formatNumber(material.current_stock + material.in_procurement)} {shortUnit}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Stock:</span>
                    <div className="font-medium">{formatNumber(material.current_stock)} {shortUnit}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">In Procurement:</span>
                    <div className="font-medium">{formatNumber(material.in_procurement)} {shortUnit}</div>
                  </div>
                </div>
                
                {stockStatus.status !== 'sufficient' && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Shortfall: {formatNumber(Math.max(0, totalRequired - (material.current_stock + material.in_procurement)))} {shortUnit}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RawMaterialStockDisplay;
