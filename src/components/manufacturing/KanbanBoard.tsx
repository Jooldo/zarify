
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, User, Calendar, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface KanbanItem {
  id: string;
  order_number: string;
  product_code: string;
  category: string;
  subcategory: string;
  size: string;
  quantity_required: number;
  priority: 'High' | 'Medium' | 'Low';
  assigned_worker?: string;
  delivery_date?: string;
  materials: { name: string; allocated_weight: number; unit: string; }[];
  total_weight?: number;
  created_at: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
  color: string;
}

const KanbanBoard = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'jhalai', title: 'Jhalai', items: [], color: 'bg-blue-50 border-blue-200' },
    { id: 'qullais', title: 'Qullais', items: [], color: 'bg-yellow-50 border-yellow-200' },
    { id: 'meena', title: 'Meena', items: [], color: 'bg-green-50 border-green-200' },
    { id: 'vibrator', title: 'Vibrator', items: [], color: 'bg-purple-50 border-purple-200' }
  ]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();
  const { toast } = useToast();

  // Mock data for demonstration - in a real app, this would come from your database
  useEffect(() => {
    const loadKanbanData = async () => {
      try {
        setLoading(true);
        
        // Mock data for demonstration
        const mockItems: KanbanItem[] = [
          {
            id: '1',
            order_number: 'OD000001',
            product_code: 'RING-001',
            category: 'Rings',
            subcategory: 'Gold Rings',
            size: '18"',
            quantity_required: 10,
            priority: 'High',
            assigned_worker: 'John Doe',
            delivery_date: '2024-01-15',
            materials: [
              { name: 'Gold Wire', allocated_weight: 5.2, unit: 'g' },
              { name: 'Silver Base', allocated_weight: 2.1, unit: 'g' }
            ],
            total_weight: 7.3,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            order_number: 'OD000002',
            product_code: 'NECKLACE-002',
            category: 'Necklaces',
            subcategory: 'Silver Necklaces',
            size: '20"',
            quantity_required: 5,
            priority: 'Medium',
            assigned_worker: 'Jane Smith',
            delivery_date: '2024-01-20',
            materials: [
              { name: 'Silver Wire', allocated_weight: 8.5, unit: 'g' }
            ],
            total_weight: 8.5,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            order_number: 'OD000003',
            product_code: 'BRACELET-003',
            category: 'Bracelets',
            subcategory: 'Gold Bracelets',
            size: '16"',
            quantity_required: 8,
            priority: 'Low',
            materials: [
              { name: 'Gold Wire', allocated_weight: 6.2, unit: 'g' }
            ],
            total_weight: 6.2,
            created_at: new Date().toISOString()
          }
        ];

        // Distribute items across columns for demonstration
        setColumns(prev => prev.map((col, index) => ({
          ...col,
          items: index === 0 ? mockItems : []
        })));

      } catch (error) {
        console.error('Error loading kanban data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load kanban data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadKanbanData();
  }, [profile?.merchantId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDragStart = (e: React.DragEvent, item: KanbanItem, sourceColumnId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      item,
      sourceColumnId
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const { item, sourceColumnId } = data;

    if (sourceColumnId === targetColumnId) return;

    setColumns(prev => prev.map(col => {
      if (col.id === sourceColumnId) {
        return {
          ...col,
          items: col.items.filter(i => i.id !== item.id)
        };
      }
      if (col.id === targetColumnId) {
        return {
          ...col,
          items: [...col.items, item]
        };
      }
      return col;
    }));

    toast({
      title: 'Item Moved',
      description: `Moved ${item.product_code} to ${columns.find(c => c.id === targetColumnId)?.title}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading Kanban board...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manufacturing Kanban Board</h2>
          <p className="text-muted-foreground">Track production items through manufacturing steps</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`min-h-[600px] rounded-lg border-2 border-dashed p-4 ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="mb-4">
              <h3 className="font-semibold text-lg flex items-center justify-between">
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {column.items.length}
                </Badge>
              </h3>
            </div>

            <div className="space-y-4">
              {column.items.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-move hover:shadow-md transition-shadow bg-white"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item, column.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {item.product_code}
                      </CardTitle>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      <div>{item.category} • {item.subcategory}</div>
                      <div>Size: {item.size}</div>
                      <div>Order: {item.order_number}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{item.quantity_required} pcs</span>
                      </div>
                      {item.total_weight && (
                        <div className="font-medium">
                          {item.total_weight.toFixed(1)}g
                        </div>
                      )}
                    </div>

                    {item.assigned_worker && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{item.assigned_worker}</span>
                      </div>
                    )}

                    {item.delivery_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.delivery_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {item.materials.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Materials:</div>
                        <div className="space-y-1">
                          {item.materials.map((material, index) => (
                            <div key={index} className="text-xs text-muted-foreground flex justify-between">
                              <span>{material.name}</span>
                              <span>{material.allocated_weight}{material.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {column.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items in {column.title}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Kanban Board Usage:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Drag and drop items between columns to update their manufacturing step</li>
              <li>• Each column represents a manufacturing stage: Jhalai → Qullais → Meena → Vibrator</li>
              <li>• Items show material allocations, assigned workers, and delivery dates</li>
              <li>• Priority levels help identify urgent items that need attention</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
