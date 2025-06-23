
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory } from 'lucide-react';

const ManufacturingLoad = () => {
  return (
    <Card className="h-64 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Factory className="h-5 w-5 text-orange-500" />
          Manufacturing System
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex items-center justify-center h-full">
        <div className="text-center">
          <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-600">Manufacturing System</h4>
          <p className="text-gray-500 text-sm">
            Manufacturing features will be implemented here
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManufacturingLoad;
