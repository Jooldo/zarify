
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Package, Users, Layers } from "lucide-react";

interface ConfigHeaderProps {
  materialCount: number;
  typeCount: number;
  supplierCount: number;
}

const ConfigHeader = ({ materialCount, typeCount, supplierCount }: ConfigHeaderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Raw Material Configuration</h2>
        <p className="text-sm text-gray-600">Configure raw materials, types, and supplier mappings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Materials</CardTitle>
            <div className="p-1.5 bg-blue-100 rounded-full">
              <Package className="h-3.5 w-3.5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-blue-700">{materialCount}</div>
            <p className="text-xs text-gray-500 mt-0.5">Configured items</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Material Types</CardTitle>
            <div className="p-1.5 bg-purple-100 rounded-full">
              <Layers className="h-3.5 w-3.5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-purple-700">{typeCount}</div>
            <p className="text-xs text-gray-500 mt-0.5">Categories</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Suppliers</CardTitle>
            <div className="p-1.5 bg-green-100 rounded-full">
              <Users className="h-3.5 w-3.5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-green-700">{supplierCount}</div>
            <p className="text-xs text-gray-500 mt-0.5">Active partners</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfigHeader;
