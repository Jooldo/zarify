
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
}

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  rootX: number;
  rootY: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 380,
  nodeHeight: 240,
  horizontalSpacing: 100,
  verticalSpacing: 300,
  rootX: 400,
  rootY: 50,
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

// Calculate subtree width recursively
const calculateSubtreeWidth = (node: HierarchicalNode, config: LayoutConfig): number => {
  if (node.children.length === 0) {
    return node.width;
  }

  const childrenWidth = node.children.reduce((totalWidth, child, index) => {
    const childSubtreeWidth = calculateSubtreeWidth(child, config);
    return totalWidth + childSubtreeWidth + (index > 0 ? config.horizontalSpacing : 0);
  }, 0);

  return Math.max(node.width, childrenWidth);
};

// Position nodes recursively
const positionNode = (
  node: HierarchicalNode, 
  x: number, 
  y: number, 
  config: LayoutConfig
): void => {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) {
    return;
  }

  // Calculate total width needed for all children
  const childSubtreeWidths = node.children.map(child => 
    calculateSubtreeWidth(child, config)
  );
  
  const totalChildrenWidth = childSubtreeWidths.reduce((sum, width, index) => 
    sum + width + (index > 0 ? config.horizontalSpacing : 0), 0
  );

  // Center children under parent
  let currentX = x - totalChildrenWidth / 2;
  const childY = y + config.verticalSpacing;

  node.children.forEach((child, index) => {
    const childSubtreeWidth = childSubtreeWidths[index];
    const childCenterX = currentX + childSubtreeWidth / 2;
    
    positionNode(child, childCenterX - child.width / 2, childY, config);
    
    currentX += childSubtreeWidth + config.horizontalSpacing;
  });
};

// Calculate layout for hierarchical nodes
export const calculateHierarchicalLayout = (
  nodes: Node[], 
  edges: Edge[], 
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { nodes: Node[], edges: Edge[] } => {
  const hierarchy = buildHierarchy(nodes, edges);
  
  // Position each root node and its subtree
  let currentRootX = config.rootX;
  
  hierarchy.forEach((rootNode, index) => {
    if (index > 0) {
      // Add spacing between different root trees
      const previousRootSubtreeWidth = calculateSubtreeWidth(hierarchy[index - 1], config);
      currentRootX += previousRootSubtreeWidth + config.horizontalSpacing * 2;
    }
    
    const rootSubtreeWidth = calculateSubtreeWidth(rootNode, config);
    const rootCenterX = currentRootX + rootSubtreeWidth / 2;
    
    positionNode(rootNode, rootCenterX - rootNode.width / 2, config.rootY, config);
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
