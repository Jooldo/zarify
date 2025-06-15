
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  Good: '#22c55e', // green-500
  Low: '#f97316', // orange-500
  Critical: '#ef4444', // red-500
};

const StockStatusChart = () => {
  const { finishedGoods, loading } = useFinishedGoods();

  const chartData = useMemo(() => {
    if (loading || finishedGoods.length === 0) {
      return [];
    }

    const statusCounts = {
      Good: 0,
      Low: 0,
      Critical: 0,
    };

    finishedGoods.forEach(fg => {
      const requiredForOrders = fg.required_quantity || 0;
      const threshold = fg.threshold || 0;
      
      if (fg.current_stock < requiredForOrders) {
        statusCounts.Critical++;
      } else if ((fg.current_stock - requiredForOrders) < threshold) {
        statusCounts.Low++;
      } else {
        statusCounts.Good++;
      }
    });

    return [
      { name: 'Good', value: statusCounts.Good },
      { name: 'Low', value: statusCounts.Low },
      { name: 'Critical', value: statusCounts.Critical },
    ].filter(d => d.value > 0);
  }, [finishedGoods, loading]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <p className="text-muted-foreground">No finished goods data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                if (percent === 0) return null;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StockStatusChart;
