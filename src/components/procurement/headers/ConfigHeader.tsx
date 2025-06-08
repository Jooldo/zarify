
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materials</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Material Types</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfigHeader;
