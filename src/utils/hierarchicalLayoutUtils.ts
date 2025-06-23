
import { Node, Edge } from '@xyflow/react';

export interface HierarchicalNode {
  id: string;
  data: any;
  children: HierarchicalNode[];
  level: number;
  x?: number;
  y?: number;
  width: number;
  height: number;
  subtreeWidth?: number;
}

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  rootX: number;
  rootY: number;
  minNodeSpacing: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 380,
  nodeHeight: 240,
  horizontalSpacing: 250, // Increased significantly to prevent overlaps
  verticalSpacing: 450,   // Increased for better vertical separation
  rootX: 200,             // Adjusted starting position
  rootY: 50,
  minNodeSpacing: 100,    // Increased minimum spacing
};

// Build hierarchy tree from nodes and edges
export const buildHierarchy = (nodes: Node[], edges: Edge[]): HierarchicalNode[] => {
  const nodeMap = new Map<string, HierarchicalNode>();
  const rootNodes: HierarchicalNode[] = [];

  // Initialize all nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      data: node.data,
      children: [],
      level: 0,
      width: DEFAULT_LAYOUT_CONFIG.nodeWidth,
      height: DEFAULT_LAYOUT_CONFIG.nodeHeight,
    });
  });

  // Build parent-child relationships
  edges.forEach(edge => {
    const parent = nodeMap.get(edge.source);
    const child = nodeMap.get(edge.target);
    
    if (parent && child) {
      parent.children.push(child);
      child.level = parent.level + 1;
    }
  });

  // Find root nodes (nodes with no incoming edges)
  const hasParent = new Set(edges.map(e => e.target));
  nodes.forEach(node => {
    if (!hasParent.has(node.id)) {
      const hierarchicalNode = nodeMap.get(node.id);
      if (hierarchicalNode) {
        rootNodes.push(hierarchicalNode);
      }
    }
  });

  return rootNodes;
};

// Calculate subtree width with improved spacing
const calculateSubtreeWidth = (node: HierarchicalNode, config: LayoutConfig): number => {
  if (node.children.length === 0) {
    node.subtreeWidth = node.width + config.minNodeSpacing;
    return node.subtreeWidth;
  }

  // Calculate width for all children first (bottom-up)
  const childSubtreeWidths = node.children.map(child => 
    calculateSubtreeWidth(child, config)
  );

  // Total width needed for all children including enhanced spacing
  const totalChildrenWidth = childSubtreeWidths.reduce((sum, width, index) => {
    return sum + width + (index > 0 ? config.horizontalSpacing : 0);
  }, 0);

  // Add extra padding to prevent overlaps
  const paddedChildrenWidth = totalChildrenWidth + (config.minNodeSpacing * 2);
  
  // Subtree width is the maximum of node width and padded children total width
  node.subtreeWidth = Math.max(node.width + config.minNodeSpacing, paddedChildrenWidth);
  return node.subtreeWidth;
};

// Position nodes with enhanced spacing
const positionNodeAndChildren = (
  node: HierarchicalNode,
  centerX: number,
  y: number,
  config: LayoutConfig
): void => {
  // Position current node at center
  node.x = centerX - node.width / 2;
  node.y = y;

  if (node.children.length === 0) {
    return;
  }

  // Calculate positions for children with enhanced spacing
  const childY = y + config.verticalSpacing;
  
  // Calculate total width needed for all children
  const childSubtreeWidths = node.children.map(child => child.subtreeWidth || 0);
  const totalChildrenWidth = childSubtreeWidths.reduce((sum, width, index) => {
    return sum + width + (index > 0 ? config.horizontalSpacing : 0);
  }, 0);

  // Start positioning children from the left edge of their total span
  let currentX = centerX - totalChildrenWidth / 2;

  node.children.forEach((child, index) => {
    const childSubtreeWidth = childSubtreeWidths[index];
    const childCenterX = currentX + childSubtreeWidth / 2;
    
    // Recursively position child and its subtree
    positionNodeAndChildren(child, childCenterX, childY, config);
    
    // Move to next child position with enhanced spacing
    currentX += childSubtreeWidth + config.horizontalSpacing;
  });
};

// Calculate layout for hierarchical nodes with improved spacing
export const calculateHierarchicalLayout = (
  nodes: Node[], 
  edges: Edge[], 
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { nodes: Node[], edges: Edge[] } => {
  const hierarchy = buildHierarchy(nodes, edges);
  
  if (hierarchy.length === 0) {
    return { nodes, edges };
  }

  // Calculate subtree widths for all nodes (bottom-up)
  hierarchy.forEach(rootNode => {
    calculateSubtreeWidth(rootNode, config);
  });

  // Position each root tree with enhanced spacing between different trees
  let currentRootCenterX = config.rootX;
  
  hierarchy.forEach((rootNode, index) => {
    if (index > 0) {
      // Add enhanced spacing between different root trees
      const previousRootWidth = hierarchy[index - 1].subtreeWidth || 0;
      const currentRootWidth = rootNode.subtreeWidth || 0;
      currentRootCenterX += (previousRootWidth + currentRootWidth) / 2 + config.horizontalSpacing * 3; // Triple spacing between root trees
    } else {
      // First root - position at center of its subtree
      currentRootCenterX += (rootNode.subtreeWidth || 0) / 2;
    }
    
    // Position this root tree
    positionNodeAndChildren(rootNode, currentRootCenterX, config.rootY, config);
    
    // Update position for next root tree
    if (index < hierarchy.length - 1) {
      currentRootCenterX += (rootNode.subtreeWidth || 0) / 2;
    }
  });

  // Apply positions to React Flow nodes
  const positionedNodes = nodes.map(node => {
    const hierarchicalNode = findNodeInHierarchy(hierarchy, node.id);
    
    if (hierarchicalNode && hierarchicalNode.x !== undefined && hierarchicalNode.y !== undefined) {
      return {
        ...node,
        position: {
          x: hierarchicalNode.x,
          y: hierarchicalNode.y,
        },
      };
    }
    
    return node;
  });

  return {
    nodes: positionedNodes,
    edges,
  };
};

// Helper function to find a node in the hierarchy
const findNodeInHierarchy = (hierarchy: HierarchicalNode[], nodeId: string): HierarchicalNode | null => {
  for (const rootNode of hierarchy) {
    const found = findNodeRecursive(rootNode, nodeId);
    if (found) return found;
  }
  return null;
};

const findNodeRecursive = (node: HierarchicalNode, nodeId: string): HierarchicalNode | null => {
  if (node.id === nodeId) return node;
  
  for (const child of node.children) {
    const found = findNodeRecursive(child, nodeId);
    if (found) return found;
  }
  
  return null;
};

// Calculate the bounds of the entire layout
export const calculateLayoutBounds = (nodes: Node[]): { width: number, height: number, minX: number, minY: number } => {
  if (nodes.length === 0) {
    return { width: 0, height: 0, minX: 0, minY: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const nodeRight = node.position.x + DEFAULT_LAYOUT_CONFIG.nodeWidth;
    const nodeBottom = node.position.y + DEFAULT_LAYOUT_CONFIG.nodeHeight;

    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, nodeRight);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, nodeBottom);
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    minY,
  };
};
