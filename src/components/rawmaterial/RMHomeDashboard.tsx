
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, FileText, History, Users, TrendingUp } from 'lucide-react';

interface RMHomeDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

const RMHomeDashboard = ({ onNavigateToTab }: RMHomeDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Raw Material Management - Home
        </h3>
        <p className="text-muted-foreground">
          Central hub for efficient raw material workflow management with quick access to key actions.
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used actions for efficient workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-inventory')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add Raw Material</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-procurement')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Raise Request</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-procurement')}
            >
              <History className="h-6 w-6" />
              <span className="text-sm">Procurement History</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-suppliers')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Suppliers</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RMHomeDashboard;
