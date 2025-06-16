
export const generateOrderRowLayout = (
  totalOrders: number,
  orderIndex: number,
  userPosition?: { x: number; y: number }
): { x: number; y: number } => {
  if (userPosition) {
    return userPosition;
  }
  
  // Increased vertical spacing between rows from 180 to 220 to prevent card overlap
  const rowHeight = 220;
  const startY = 50;
  
  return {
    x: 50,
    y: startY + (orderIndex * rowHeight)
  };
};

export const generateStepLayout = (
  orderPosition: { x: number; y: number },
  stepIndex: number,
  userPosition?: { x: number; y: number }
): { x: number; y: number } => {
  if (userPosition) {
    return userPosition;
  }
  
  // Horizontal spacing for steps
  const stepWidth = 350;
  const stepStartX = orderPosition.x + 400; // Start steps after the order card
  
  return {
    x: stepStartX + (stepIndex * stepWidth),
    y: orderPosition.y
  };
};
