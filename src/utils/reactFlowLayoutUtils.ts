
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
  reworkVerticalOffset: number;
  reworkHorizontalOffset: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeSpacing: 700, // Increased from 600 for more vertical space between order rows
  stepCardSpacing: 500, // Increased from 450 for more horizontal space between step cards
  childOrderOffset: 450, // Increased from 400 for better rework order spacing
  minVerticalGap: 150, // Increased minimum gap between rows
  cardWidth: 320, // Standard card width
  cardHeight: 250, // Increased estimated card height
  reworkVerticalOffset: 300, // Dedicated spacing for rework orders
  reworkHorizontalOffset: 150, // Horizontal offset for rework positioning
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
    x: orderPosition.x + 500 + (stepIndex * config.stepCardSpacing),
    y: orderPosition.y
  };
};

export const calculateChildOrderPosition = (
  parentPosition: LayoutPosition,
  childIndex: number,
  stepCardPosition?: LayoutPosition,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutPosition => {
  // If we have a step card position, position relative to it
  if (stepCardPosition) {
    return {
      x: stepCardPosition.x + config.reworkHorizontalOffset,
      y: stepCardPosition.y + config.reworkVerticalOffset + (childIndex * 250)
    };
  }
  
  // Fallback to parent-relative positioning
  return {
    x: parentPosition.x + config.reworkHorizontalOffset,
    y: parentPosition.y + config.reworkVerticalOffset + (childIndex * 250)
  };
};

export const calculateTotalRowHeight = (
  parentOrder: any,
  childOrders: any[],
  parentStepCount: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): number => {
  const childOrdersHeight = childOrders.length * config.reworkVerticalOffset;
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
    
    // Calculate total height needed for this row including rework orders
    const totalRowHeight = calculateTotalRowHeight(order, childOrders, stepCount, config);
    
    // Add extra spacing if there are rework orders
    const extraSpacing = childOrders.length > 0 ? config.reworkVerticalOffset : 0;
    
    // Update currentY for next row
    currentY += totalRowHeight + extraSpacing;
  });

  return positions;
};

// New utility for calculating positions based on visual hierarchy
export const calculateHierarchicalPosition = (
  basePosition: LayoutPosition,
  level: number,
  index: number,
  type: 'step' | 'rework',
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutPosition => {
  switch (type) {
    case 'step':
      return {
        x: basePosition.x + 500 + (index * config.stepCardSpacing),
        y: basePosition.y
      };
    case 'rework':
      return {
        x: basePosition.x + config.reworkHorizontalOffset,
        y: basePosition.y + config.reworkVerticalOffset + (index * 300)
      };
    default:
      return basePosition;
  }
};

// Utility to check for potential overlaps and adjust positions
export const adjustForOverlaps = (
  positions: Map<string, LayoutPosition>,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): Map<string, LayoutPosition> => {
  const adjustedPositions = new Map(positions);
  const occupiedAreas: Array<{ x: number; y: number; width: number; height: number; id: string }> = [];

  // Convert positions to occupied areas
  adjustedPositions.forEach((position, id) => {
    occupiedAreas.push({
      x: position.x,
      y: position.y,
      width: config.cardWidth,
      height: config.cardHeight,
      id
    });
  });

  // Check for overlaps and adjust
  occupiedAreas.forEach((area, index) => {
    for (let i = index + 1; i < occupiedAreas.length; i++) {
      const otherArea = occupiedAreas[i];
      
      // Check if areas overlap
      if (
        area.x < otherArea.x + otherArea.width &&
        area.x + area.width > otherArea.x &&
        area.y < otherArea.y + otherArea.height &&
        area.y + area.height > otherArea.y
      ) {
        // Adjust the second area to avoid overlap
        const newY = area.y + area.height + config.minVerticalGap;
        adjustedPositions.set(otherArea.id, { 
          x: otherArea.x, 
          y: newY 
        });
        otherArea.y = newY;
      }
    }
  });

  return adjustedPositions;
};
