
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Clock, CheckCircle, Search } from "lucide-react";

interface ProcurementHeaderProps {
  requestStats?: {
    total: number;
    pending: number;
    completed: number;
  };
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const ProcurementHeader = ({ requestStats, searchTerm, onSearchChange }: ProcurementHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Procurement Requests</h2>
          <p className="text-sm text-gray-600">Manage and track raw material procurement requests</p>
        </div>
        
        {onSearchChange && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search procurement requests..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        )}
      </div>

      {requestStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requestStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requestStats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requestStats.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProcurementHeader;
