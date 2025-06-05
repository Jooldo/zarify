
import { useState } from 'react';
import { useRawMaterials } from './useRawMaterials';
import { useFinishedGoods } from './useFinishedGoods';
import { useOrders } from './useOrders';
import { useProcurementRequests } from './useProcurementRequests';

export interface QueryResponse {
  id: string;
  query: string;
  response: string;
  data?: any[];
  chartType?: 'table' | 'pie' | 'bar' | 'card';
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive';
    data?: any;
  }>;
  timestamp: Date;
}

export interface QueryContext {
  lastQuery?: string;
  lastResponse?: QueryResponse;
}

export const useConversationalQuery = () => {
  const [queryHistory, setQueryHistory] = useState<QueryResponse[]>([]);
  const [context, setContext] = useState<QueryContext>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { rawMaterials } = useRawMaterials();
  const { finishedGoods } = useFinishedGoods();
  const { orders } = useOrders();
  const { requests } = useProcurementRequests();

  const processQuery = async (query: string): Promise<QueryResponse> => {
    setIsProcessing(true);
    
    try {
      const response = await analyzeQuery(query.toLowerCase(), {
        rawMaterials,
        finishedGoods,
        orders,
        requests,
        context
      });

      const queryResponse: QueryResponse = {
        id: Date.now().toString(),
        query,
        response: response.message,
        data: response.data,
        chartType: response.chartType,
        actions: response.actions,
        timestamp: new Date()
      };

      setQueryHistory(prev => [...prev, queryResponse]);
      setContext({ lastQuery: query, lastResponse: queryResponse });
      
      return queryResponse;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    queryHistory,
    processQuery,
    isProcessing,
    clearHistory: () => setQueryHistory([])
  };
};

// Query analysis engine
const analyzeQuery = async (query: string, data: any) => {
  const { rawMaterials, finishedGoods, orders, requests, context } = data;

  // Raw Materials Queries
  if (query.includes('raw material') && (query.includes('shortfall') || query.includes('low'))) {
    const criticalMaterials = rawMaterials.filter((m: any) => m.shortfall > 0);
    return {
      message: `Found ${criticalMaterials.length} raw materials with shortfall. Total shortfall value across all materials needs immediate attention.`,
      data: criticalMaterials.slice(0, 5).map((m: any) => ({
        name: m.name,
        shortfall: `${m.shortfall} ${m.unit}`,
        current: `${m.current_stock} ${m.unit}`,
        required: `${m.required_quantity} ${m.unit}`,
        type: m.type
      })),
      chartType: 'table' as const,
      actions: [
        { label: 'Procure Critical Materials', action: 'bulk_procure', variant: 'default' as const }
      ]
    };
  }

  if (query.includes('top') && query.includes('raw material')) {
    const topMaterials = rawMaterials
      .sort((a: any, b: any) => b.shortfall - a.shortfall)
      .slice(0, 5);
    
    return {
      message: `Here are the top 5 raw materials by shortfall. ${topMaterials[0]?.name} has the highest shortfall.`,
      data: topMaterials.map((m: any) => ({
        name: m.name,
        shortfall: m.shortfall,
        type: m.type
      })),
      chartType: 'bar' as const,
      actions: [
        { label: 'View Full Inventory', action: 'view_inventory' }
      ]
    };
  }

  // Finished Goods Queries
  if (query.includes('finished goods') || query.includes('manufacturing')) {
    const criticalGoods = finishedGoods.filter((g: any) => 
      g.current_stock + g.in_manufacturing < g.required_quantity + g.threshold
    );
    
    return {
      message: `${criticalGoods.length} finished goods need manufacturing attention. Current production capacity shows ${finishedGoods.reduce((sum: number, g: any) => sum + g.in_manufacturing, 0)} units in progress.`,
      data: criticalGoods.slice(0, 5).map((g: any) => ({
        product: g.product_code,
        available: g.current_stock + g.in_manufacturing,
        needed: g.required_quantity + g.threshold,
        gap: (g.required_quantity + g.threshold) - (g.current_stock + g.in_manufacturing)
      })),
      chartType: 'table' as const,
      actions: [
        { label: 'Start Manufacturing', action: 'start_manufacturing' }
      ]
    };
  }

  // Order Queries
  if (query.includes('pending order') || query.includes('order') && query.includes('status')) {
    const pendingOrders = orders.filter((o: any) => 
      o.status === 'Created' || o.status === 'In Progress'
    );
    
    return {
      message: `You have ${pendingOrders.length} pending orders. ${orders.filter((o: any) => o.status === 'Created').length} are newly created and ${orders.filter((o: any) => o.status === 'In Progress').length} are in progress.`,
      data: pendingOrders.slice(0, 5).map((o: any) => ({
        order: o.order_number,
        customer: o.customer?.name || 'Unknown',
        status: o.status,
        amount: `₹${o.total_amount}`,
        date: new Date(o.created_date).toLocaleDateString()
      })),
      chartType: 'table' as const,
      actions: [
        { label: 'View All Orders', action: 'view_orders' }
      ]
    };
  }

  if (query.includes('delivered') && query.includes('week')) {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const deliveredOrders = orders.filter((o: any) => 
      o.status === 'Delivered' && new Date(o.updated_date) >= thisWeek
    );
    
    const totalValue = deliveredOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
    const highestOrder = deliveredOrders.reduce((max: any, o: any) => 
      Number(o.total_amount) > Number(max?.total_amount || 0) ? o : max, null
    );
    
    return {
      message: `${deliveredOrders.length} orders delivered this week with total value ₹${totalValue.toLocaleString()}. Highest value order: ₹${highestOrder?.total_amount || 0}.`,
      data: deliveredOrders.map((o: any) => ({
        order: o.order_number,
        customer: o.customer?.name,
        amount: Number(o.total_amount)
      })),
      chartType: 'pie' as const,
      actions: [
        { label: 'View Delivery Details', action: 'view_deliveries' }
      ]
    };
  }

  // Procurement Queries
  if (query.includes('procurement') || query.includes('supplier')) {
    const pendingRequests = requests.filter((r: any) => r.status === 'Pending');
    const approvedRequests = requests.filter((r: any) => r.status === 'Approved');
    
    return {
      message: `You have ${pendingRequests.length} pending and ${approvedRequests.length} approved procurement requests. Latest request was raised on ${requests[0]?.date_requested || 'N/A'}.`,
      data: [
        { status: 'Pending', count: pendingRequests.length },
        { status: 'Approved', count: approvedRequests.length },
        { status: 'Received', count: requests.filter((r: any) => r.status === 'Received').length }
      ],
      chartType: 'pie' as const,
      actions: [
        { label: 'Review Pending Requests', action: 'view_procurement' }
      ]
    };
  }

  // Stock threshold queries
  if (query.includes('below threshold') || query.includes('low stock')) {
    const lowStockMaterials = rawMaterials.filter((m: any) => m.current_stock <= m.minimum_stock);
    const lowStockFinished = finishedGoods.filter((g: any) => g.current_stock < g.threshold);
    
    return {
      message: `${lowStockMaterials.length} raw materials and ${lowStockFinished.length} finished goods are below threshold. Immediate restocking recommended.`,
      data: [
        { category: 'Raw Materials', count: lowStockMaterials.length },
        { category: 'Finished Goods', count: lowStockFinished.length }
      ],
      chartType: 'card' as const,
      actions: [
        { label: 'View Critical Stock', action: 'view_critical_stock' }
      ]
    };
  }

  // Default response for unrecognized queries
  return {
    message: "I didn't quite understand that query. Try asking about raw materials, orders, finished goods, or procurement requests. For example: 'Show pending orders' or 'Which materials are low in stock?'",
    data: [],
    chartType: 'card' as const,
    actions: []
  };
};
