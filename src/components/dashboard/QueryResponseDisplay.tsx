
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { QueryResponse } from '@/hooks/useConversationalQuery';
import { ArrowRight, Package, ShoppingCart, Wrench } from 'lucide-react';

interface QueryResponseDisplayProps {
  response: QueryResponse;
  onNavigateToTab?: (tab: string) => void;
}

const QueryResponseDisplay = ({ response, onNavigateToTab }: QueryResponseDisplayProps) => {
  const handleAction = (action: string) => {
    switch (action) {
      case 'view_inventory':
      case 'bulk_procure':
      case 'view_critical_stock':
      case 'view_procurement':
        onNavigateToTab?.('inventory');
        break;
      case 'view_orders':
      case 'view_deliveries':
        onNavigateToTab?.('orders');
        break;
      case 'start_manufacturing':
        onNavigateToTab?.('inventory');
        break;
      default:
        console.log('Action:', action);
    }
  };

  const renderVisualization = () => {
    if (!response.data || response.data.length === 0) return null;

    switch (response.chartType) {
      case 'table':
        const columns = Object.keys(response.data[0]);
        return (
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="text-xs">
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {response.data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((col) => (
                      <TableCell key={col} className="text-xs">
                        {row[col]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'bar':
        return (
          <div className="mt-3 h-48">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={response.data}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="shortfall" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        );

      case 'pie':
        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        return (
          <div className="mt-3 h-48">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={response.data}
                    dataKey="amount"
                    nameKey="order"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={(entry) => `₹${entry.amount?.toLocaleString()}`}
                  >
                    {response.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        );

      case 'card':
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {response.data.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-2">
                  {item.category === 'Raw Materials' ? (
                    <Package className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Wrench className="h-4 w-4 text-blue-500" />
                  )}
                  <div>
                    <div className="text-lg font-bold">{item.count}</div>
                    <div className="text-xs text-gray-600">{item.category || item.status}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Response Text */}
      <p className="text-sm text-gray-700">{response.response}</p>

      {/* Data Visualization */}
      {renderVisualization()}

      {/* Action Buttons */}
      {response.actions && response.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {response.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={() => handleAction(action.action)}
              className="text-xs flex items-center gap-1"
            >
              {action.label}
              <ArrowRight className="h-3 w-3" />
            </Button>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-400 pt-1">
        {response.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default QueryResponseDisplay;
