
interface NodeDimensions {
  width: number;
  height: number;
}

interface NodePosition {
  x: number;
  y: number;
}

interface LayoutNode {
  id: string;
  position: NodePosition;
  dimensions: NodeDimensions;
}

// Default card dimensions - can be adjusted based on actual measurements
const DEFAULT_CARD_DIMENSIONS = {
  order: { width: 320, height: 180 },
  step: { width: 320, height: 200 }
};

const MIN_SPACING = {
  horizontal: 50,
  vertical: 50
};

export const calculateOptimalPosition = (
  nodes: LayoutNode[],
  newNodeId: string,
  newNodeDimensions: NodeDimensions,
  preferredPosition?: NodePosition
): NodePosition => {
  // If preferred position is provided and doesn't collide, use it
  if (preferredPosition && !hasCollision(nodes, { 
    id: newNodeId, 
    position: preferredPosition, 
    dimensions: newNodeDimensions 
  })) {
    return preferredPosition;
  }

  // Find the best available position
  const startX = 50;
  const startY = 50;
  let currentX = startX;
  let currentY = startY;

  while (true) {
    const testPosition = { x: currentX, y: currentY };
    const testNode = { id: newNodeId, position: testPosition, dimensions: newNodeDimensions };

    if (!hasCollision(nodes, testNode)) {
      return testPosition;
    }

    // Move to next position
    currentX += newNodeDimensions.width + MIN_SPACING.horizontal;

    // If we've gone too far horizontally, move to next row
    if (currentX > 1200) {
      currentX = startX;
      currentY += newNodeDimensions.height + MIN_SPACING.vertical;
    }
  }
};

const hasCollision = (existingNodes: LayoutNode[], newNode: LayoutNode): boolean => {
  return existingNodes.some(node => {
    if (node.id === newNode.id) return false;

    const node1 = {
      left: node.position.x,
      right: node.position.x + node.dimensions.width,
      top: node.position.y,
      bottom: node.position.y + node.dimensions.height
    };

    const node2 = {
      left: newNode.position.x,
      right: newNode.position.x + newNode.dimensions.width,
      top: newNode.position.y,
      bottom: newNode.position.y + newNode.dimensions.height
    };

    return !(
      node1.right + MIN_SPACING.horizontal < node2.left ||
      node2.right + MIN_SPACING.horizontal < node1.left ||
      node1.bottom + MIN_SPACING.vertical < node2.top ||
      node2.bottom + MIN_SPACING.vertical < node1.top
    );
  });
};

export const generateOrderRowLayout = (
  orderCount: number,
  orderIndex: number,
  userPosition?: NodePosition
): NodePosition => {
  if (userPosition) return userPosition;

  const baseY = 50 + orderIndex * (DEFAULT_CARD_DIMENSIONS.order.height + MIN_SPACING.vertical + 50); // Extra space for steps
  return { x: 50, y: baseY };
};

export const generateStepLayout = (
  orderPosition: NodePosition,
  stepIndex: number,
  userPosition?: NodePosition
): NodePosition => {
  if (userPosition) return userPosition;

  const stepX = orderPosition.x + DEFAULT_CARD_DIMENSIONS.order.width + MIN_SPACING.horizontal + (stepIndex * (DEFAULT_CARD_DIMENSIONS.step.width + MIN_SPACING.horizontal));
  return { x: stepX, y: orderPosition.y };
};

export { DEFAULT_CARD_DIMENSIONS };
