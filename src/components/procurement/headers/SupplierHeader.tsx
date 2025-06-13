
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Building2, CheckCircle, AlertCircle } from "lucide-react";

interface SupplierHeaderProps {
  onAddSupplier: () => void;
  supplierStats?: {
    total: number;
    active: number;
    inactive: number;
  };
}

const SupplierHeader = ({ onAddSupplier, supplierStats }: SupplierHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Supplier Management</h2>
          <p className="text-sm text-gray-600">Manage supplier information and track performance</p>
        </div>
        <Button onClick={onAddSupplier} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {supplierStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-700">Total Suppliers</CardTitle>
              <div className="p-1.5 bg-blue-100 rounded-full">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-blue-700">{supplierStats.total}</div>
              <p className="text-xs text-gray-500 mt-0.5">All suppliers</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-700">Active</CardTitle>
              <div className="p-1.5 bg-green-100 rounded-full">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-green-700">{supplierStats.active}</div>
              <p className="text-xs text-gray-500 mt-0.5">Working partners</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-red-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-700">Inactive</CardTitle>
              <div className="p-1.5 bg-red-100 rounded-full">
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-red-700">{supplierStats.inactive}</div>
              <p className="text-xs text-gray-500 mt-0.5">Not active</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupplierHeader;
