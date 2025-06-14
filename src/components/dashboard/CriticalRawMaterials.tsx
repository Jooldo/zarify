
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

interface CriticalRawMaterialsProps {
  onNavigateToProcurement?: () => void;
}

const CriticalRawMaterials = ({ onNavigateToProcurement }: CriticalRawMaterialsProps) => {
  const { rawMaterials, loading } = useRawMaterials();

  if (loading) {
    return (
      <CardSkeleton 
        showHeader={true}
        headerHeight="h-6"
        contentHeight="h-64"
        showFooter={true}
        footerHeight="h-10"
      />
    );
  }

  // Get top 3 materials with highest shortfall
  const criticalMaterials = rawMaterials
    .filter(material => material.shortfall > 0)
    .sort((a, b) => b.shortfall - a.shortfall)
    .slice(0, 3);

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.01]">
      <CardHeader className="pb-3 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900">Critical Raw Materials</CardTitle>
          {criticalMaterials.length > 0 && (
            <div className="p-1.5 bg-orange-100 rounded-full">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-3">
        {criticalMaterials.length === 0 ? (
          <div className="text-center py-6">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-2">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-xs text-green-700 font-medium">All materials adequately stocked</div>
            <div className="text-xs text-green-600 mt-0.5">No critical items found</div>
          </div>
        ) : (
          <div className="space-y-2">
            {criticalMaterials.map((material) => (
              <div key={material.id} className="border-l-4 border-l-orange-400 bg-orange-50 rounded-r-lg p-2 hover:bg-orange-100 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-gray-900 text-xs">{material.name}</div>
                  <div className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded text-[10px]">{material.type}</div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div className="text-center">
                    <div className="text-orange-600 font-semibold">{material.shortfall}</div>
                    <div className="text-gray-600">Shortfall</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-900 font-semibold">{material.current_stock}</div>
                    <div className="text-gray-600">Current</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-900 font-semibold">{material.required}</div>
                    <div className="text-gray-600">Required</div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              onClick={onNavigateToProcurement}
              className="w-full mt-3 bg-gray-900 hover:bg-gray-800 text-white h-8"
              size="sm"
            >
              Manage Procurement
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalRawMaterials;
