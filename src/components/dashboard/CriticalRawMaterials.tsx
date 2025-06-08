
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface CriticalRawMaterialsProps {
  onNavigateToProcurement?: () => void;
}

const CriticalRawMaterials = ({ onNavigateToProcurement }: CriticalRawMaterialsProps) => {
  const { rawMaterials, loading } = useRawMaterials();

  if (loading) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-sm">Loading materials...</div>
        </CardContent>
      </Card>
    );
  }

  // Get top 3 materials with highest shortfall
  const criticalMaterials = rawMaterials
    .filter(material => material.shortfall > 0)
    .sort((a, b) => b.shortfall - a.shortfall)
    .slice(0, 3);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-gray-900">Critical Raw Materials</CardTitle>
          {criticalMaterials.length > 0 && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {criticalMaterials.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-500">All materials adequately stocked</div>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalMaterials.map((material) => (
              <div key={material.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900 text-sm">{material.name}</div>
                  <div className="text-xs text-gray-500">{material.type}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Shortfall:</span>
                    <span className="font-medium text-red-600">
                      {material.shortfall} {material.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Current:</span>
                    <span className="text-gray-900">
                      {material.current_stock} {material.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Required:</span>
                    <span className="text-gray-900">
                      {material.required} {material.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={onNavigateToProcurement}
              className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white"
              size="sm"
            >
              Manage Procurement
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalRawMaterials;
