
import React, { useState } from 'react';
import { ReactFlow, Node, Edge, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ManufacturingStepCard, { StepCardData } from './ManufacturingStepCard';
import StartStepDialog from './StartStepDialog';
import StepDetailsDialog from './StepDetailsDialog';

interface ProductionFlowViewProps {
  manufacturingOrders: any[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewDetails: (order: any) => void;
}

const ProductionFlowView: React.FC<ProductionFlowViewProps> = ({
  manufacturingOrders,
  getPriorityColor,
  getStatusColor,
  onViewDetails,
}) => {
  const { manufacturingSteps, orderSteps, stepFields } = useManufacturingSteps();
  const [selectedStepData, setSelectedStepData] = useState<StepCardData | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [stepDetailsDialogOpen, setStepDetailsDialogOpen] = useState(false);

  const initialNodes: Node[] = manufacturingOrders.map(order => ({
    id: order.id,
    type: 'stepCard',
    data: {
      stepName: 'Manufacturing Order',
      stepOrder: 0,
      orderId: order.id,
      orderNumber: order.order_number,
      productName: order.product_name,
      status: order.status,
      progress: order.progress_percentage,
      quantityRequired: order.quantity,
      priority: order.priority,
      dueDate: order.due_date,
      productCode: order.product_code,
      category: order.category,
      qcRequired: order.qc_required,
    },
    position: { x: 0, y: 100 * manufacturingOrders.indexOf(order) },
  }));

  const initialEdges: Edge[] = [];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const handleAddStep = (stepData: StepCardData) => {
    setStartStepDialogOpen(true);
    setSelectedStepData(stepData);
    // Find the corresponding order for the StartStepDialog
    const order = manufacturingOrders.find(o => o.id === stepData.orderId);
    setSelectedOrder(order);
  };

  const handleStepClick = (stepData: StepCardData) => {
    setSelectedStepData(stepData);
    setStepDetailsDialogOpen(true);
  };

  const handleStartStep = async (newStepData: StepCardData) => {
    if (!selectedStepData) return;

    const newStepNode: Node = {
      id: newStepData.manufacturingStepId || `new-step-${Date.now()}`,
      type: 'stepCard',
      data: {
        ...newStepData,
        stepName: newStepData.stepName,
        stepOrder: newStepData.stepOrder,
        orderId: selectedStepData.orderId,
        orderNumber: selectedStepData.orderNumber,
        productName: selectedStepData.productName,
        status: 'pending',
        progress: 0,
        productCode: selectedStepData.productCode,
        category: selectedStepData.category,
        qcRequired: newStepData.qcRequired,
      },
      position: {
        x: nodes.find(node => node.id === selectedStepData.orderId)!.position.x + 300,
        y: nodes.find(node => node.id === selectedStepData.orderId)!.position.y,
      },
    };

    const newEdge: Edge = {
      id: `edge-${selectedStepData.orderId}-${newStepNode.id}`,
      source: selectedStepData.orderId,
      target: newStepNode.id,
    };

    setNodes(prevNodes => [...prevNodes, newStepNode]);
    setEdges(prevEdges => [...prevEdges, newEdge]);
    setStartStepDialogOpen(false);
  };

  const nodeTypes = {
    stepCard: ({ data }: { data: StepCardData }) => (
      <ManufacturingStepCard
        data={data}
        manufacturingSteps={manufacturingSteps}
        orderSteps={orderSteps}
        stepFields={stepFields}
        onAddStep={handleAddStep}
        onStepClick={handleStepClick}
      />
    ),
  };

  return (
    <div className="w-full h-[600px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        zoomOnScroll={false}
        panOnScroll
      >
        <Controls />
        <Background />
      </ReactFlow>

      <StartStepDialog
        open={startStepDialogOpen}
        onOpenChange={setStartStepDialogOpen}
        onStartStep={handleStartStep}
        order={selectedOrder}
        manufacturingSteps={manufacturingSteps}
      />

      <StepDetailsDialog
        open={stepDetailsDialogOpen}
        onOpenChange={setStepDetailsDialogOpen}
        stepData={selectedStepData}
      />
    </div>
  );
};

export default ProductionFlowView;
