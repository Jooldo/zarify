
export interface LayoutPosition {
  x: number;
  y: number;
}

export interface LayoutConfig {
  nodeSpacing: number;
  stepCardSpacing: number;
  childOrderOffset: number;
  minVerticalGap: number;
  cardWidth: number;
  cardHeight: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeSpacing: 500, // Increased from 400
  stepCardSpacing: 420, // Increased spacing between step cards
  childOrderOffset: 350, // Increased child order offset
  minVerticalGap: 100, // Minimum gap between rows
  cardWidth: 320, // Standard card width
  cardHeight: 200, // Estimated card height
};

export const calculateOrderRowPosition = (
  orderIndex: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutPosition => {
  return {
    x: 50,
    y: 50 + (orderIndex * config.nodeSpacing)
  };
};

export const calculateStepCardPosition = (
  orderPosition: LayoutPosition,
  stepIndex: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutPosition => {
  return {
    x: orderPosition.x + 450 + (stepIndex * config.stepCardSpacing),
    y: orderPosition.y
  };
};

export const calculateChildOrderPosition = (
  parentPosition: LayoutPosition,
  childIndex: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutPosition => {
  return {
    x: parentPosition.x + 500,
    y: parentPosition.y + ((childIndex + 1) * config.childOrderOffset)
  };
};

export const calculateTotalRowHeight = (
  parentOrder: any,
  childOrders: any[],
  parentStepCount: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): number => {
  const childOrdersHeight = childOrders.length * config.childOrderOffset;
  const baseHeight = Math.max(config.cardHeight, childOrdersHeight);
  return baseHeight + config.minVerticalGap;
};

export const optimizeLayoutPositions = (
  orders: any[],
  childOrdersMap: Map<string, any[]>,
  stepCountsMap: Map<string, number>,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
) => {
  const positions = new Map<string, LayoutPosition>();
  let currentY = 50;

  orders.forEach((order, index) => {
    const childOrders = childOrdersMap.get(order.id) || [];
    const stepCount = stepCountsMap.get(order.id) || 0;
    
    // Calculate position for parent order
    const orderPosition = {
      x: 50,
      y: currentY
    };
    positions.set(`parent-${order.id}`, orderPosition);
    
    // Calculate total height needed for this row
    const totalRowHeight = calculateTotalRowHeight(order, childOrders, stepCount, config);
    
    // Update currentY for next row
    currentY += totalRowHeight;
  });

  return positions;
};
