
import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { StepDebugLogger } from './debug/StepDebugLogger';
import ManufacturingStepCard, { StepCardData } from './ManufacturingStepCard';

interface ProductionFlowViewProps {
  manufacturingOrders: ManufacturingOrder[];
  onViewDetails: (order: ManufacturingOrder) => void;
}

const nodeTypes = {
  stepCard: ManufacturingStepCard,
};

const ProductionFlowView: React.FC<ProductionFlowViewProps> = ({ 
  manufacturingOrders, 
  onViewDetails 
}) => {
  const { manufacturingSteps, orderSteps, getStepFields } = useManufacturingSteps();

  // Force re-render when orderSteps change
  console.log('[ProductionFlowView] Order steps updated:', orderSteps.length);

  const { nodes, edges } = useMemo(() => {
    console.log('[ProductionFlowView] Regenerating nodes and edges');
    console.log('[ProductionFlowView] Manufacturing orders:', manufacturingOrders.length);
    console.log('[ProductionFlowView] Order steps:', orderSteps.length);
    
    const flowNodes: any[] = [];
    const flowEdges: any[] = [];
    
    let currentY = 50;
    const verticalSpacing = 400;
    
    manufacturingOrders.forEach((order, orderIndex) => {
      console.log(`[ProductionFlowView] Processing order ${order.order_number}`);
      
      // Get all order steps for this manufacturing order
      const currentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(order.id)
      );
      
      console.log(`[ProductionFlowView] Order ${order.order_number} has ${currentOrderSteps.length} steps`);
      
      let currentX = 50;
      const horizontalSpacing = 350;
      
      // Manufacturing Order Card (always first)
      const orderCardData: StepCardData = {
        stepName: 'Manufacturing Order',
        stepOrder: 0,
        orderId: order.id,
        orderNumber: order.order_number,
        productName: order.product_name,
        status: order.status as any,
        progress: 0,
        productCode: order.product_configs?.product_code,
        category: order.product_configs?.category,
        quantityRequired: order.quantity_required,
        priority: order.priority,
        dueDate: order.due_date,
        rawMaterials: order.product_configs?.product_config_materials?.map(material => ({
          name: material.raw_materials?.name || 'Unknown Material',
          quantity: material.quantity_required * order.quantity_required,
          unit: material.unit,
        })),
      };

      flowNodes.push({
        id: `order-${order.id}`,
        type: 'stepCard',
        position: { x: currentX, y: currentY },
        data: orderCardData,
      });

      currentX += horizontalSpacing;

      // Get manufacturing steps in order and create cards for them
      const sortedManufacturingSteps = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order);

      sortedManufacturingSteps.forEach((step, stepIndex) => {
        // Find the corresponding order step
        const orderStep = currentOrderSteps.find(os => 
          String(os.manufacturing_step_id) === String(step.id)
        );

        console.log(`[ProductionFlowView] Step ${step.step_name} for order ${order.order_number}:`, 
          orderStep ? `Status: ${orderStep.status}` : 'No order step found'
        );

        // Properly type the status with a fallback
        const stepStatus: 'pending' | 'in_progress' | 'completed' | 'blocked' = 
          (orderStep?.status as 'pending' | 'in_progress' | 'completed' | 'blocked') || 'pending';

        const stepCardData: StepCardData = {
          stepName: step.step_name,
          stepOrder: step.step_order,
          orderId: order.id,
          orderNumber: order.order_number,
          productName: order.product_name,
          status: stepStatus,
          progress: orderStep?.progress_percentage || 0,
          assignedWorker: orderStep?.workers?.name,
          estimatedDuration: step.estimated_duration_hours,
          isJhalaiStep: step.step_name.toLowerCase().includes('jhalai'),
          productCode: order.product_configs?.product_code,
          category: order.product_configs?.category,
          quantityRequired: order.quantity_required,
          priority: order.priority,
          qcRequired: step.qc_required,
          dueDate: order.due_date,
          stepFields: getStepFields(step.id),
          manufacturingStepId: step.id,
        };

        const nodeId = `step-${order.id}-${step.id}`;
        
        flowNodes.push({
          id: nodeId,
          type: 'stepCard',
          position: { x: currentX, y: currentY },
          data: stepCardData,
        });

        // Create edge from previous node
        const previousNodeId = stepIndex === 0 
          ? `order-${order.id}` 
          : `step-${order.id}-${sortedManufacturingSteps[stepIndex - 1].id}`;
        
        flowEdges.push({
          id: `edge-${previousNodeId}-${nodeId}`,
          source: previousNodeId,
          target: nodeId,
          type: 'smoothstep',
          style: { stroke: '#9CA3AF', strokeWidth: 2 },
        });

        currentX += horizontalSpacing;
      });

      currentY += verticalSpacing;
    });

    console.log(`[ProductionFlowView] Generated ${flowNodes.length} nodes and ${flowEdges.length} edges`);
    return { nodes: flowNodes, edges: flowEdges };
  }, [manufacturingOrders, manufacturingSteps, orderSteps, getStepFields]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes when data changes
  React.useEffect(() => {
    console.log('[ProductionFlowView] Updating flow nodes due to data change');
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const handleAddStep = (stepData: StepCardData) => {
    console.log('[ProductionFlowView] Add step requested for:', stepData);
    // This would trigger step creation logic
  };

  const handleStepClick = (stepData: StepCardData) => {
    console.log('[ProductionFlowView] Step clicked:', stepData);
    // Find the corresponding order and show details
    const order = manufacturingOrders.find(o => o.id === stepData.orderId);
    if (order) {
      onViewDetails(order);
    }
  };

  if (manufacturingOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No manufacturing orders to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg border">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
        <MiniMap 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #e5e7eb',
          }}
          nodeColor="#3b82f6"
        />
      </ReactFlow>
      
      {/* Debug logging for specific orders */}
      {manufacturingOrders.map(order => (
        <StepDebugLogger 
          key={order.id}
          open={true}
          order={order}
          step={null}
        />
      ))}
    </div>
  );
};

export default ProductionFlowView;
