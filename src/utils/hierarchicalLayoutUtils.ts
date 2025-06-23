
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
  subtreeHeight?: number;
}

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  rootX: number;
  rootY: number;
  minNodeSpacing: number;
  edgeMargin: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 380,
  nodeHeight: 240,
  horizontalSpacing: 50, // Minimal horizontal spacing between siblings
  verticalSpacing: 120,  // Minimal vertical spacing between levels
  rootX: 50,
  rootY: 50,
  minNodeSpacing: 30,    // Minimum space between any two nodes
  edgeMargin: 20,        // Extra margin for edge routing
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

// Calculate subtree dimensions using bottom-up approach
const calculateSubtreeDimensions = (node: HierarchicalNode, config: LayoutConfig): void => {
  if (node.children.length === 0) {
    // Leaf node - dimensions are just the node dimensions
    node.subtreeWidth = node.width;
    node.subtreeHeight = node.height;
    return;
  }

  // Calculate dimensions for all children first (bottom-up)
  node.children.forEach(child => calculateSubtreeDimensions(child, config));

  // Calculate total width needed for all children including spacing
  const totalChildrenWidth = node.children.reduce((sum, child, index) => {
    return sum + (child.subtreeWidth || 0) + (index > 0 ? config.horizontalSpacing : 0);
  }, 0);

  // Calculate maximum depth of children
  const maxChildHeight = Math.max(...node.children.map(child => child.subtreeHeight || 0));

  // Subtree dimensions
  node.subtreeWidth = Math.max(node.width, totalChildrenWidth);
  node.subtreeHeight = node.height + config.verticalSpacing + maxChildHeight;
};

// Calculate adaptive spacing based on content and connector needs
const calculateAdaptiveSpacing = (children: HierarchicalNode[], config: LayoutConfig): number => {
  if (children.length <= 1) return 0;
  
  // Base spacing for connectors
  const baseSpacing = config.horizontalSpacing;
  
  // Additional spacing based on node width and edge margin
  const edgeSpacing = config.edgeMargin * 2;
  
  return Math.max(baseSpacing, edgeSpacing);
};

// Position nodes using bottom-up recursive approach with adaptive spacing
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

  // Calculate adaptive spacing between children
  const adaptiveSpacing = calculateAdaptiveSpacing(node.children, config);
  
  // Calculate positions for children
  const childY = y + node.height + config.verticalSpacing;
  
  // Calculate total width needed for all children with adaptive spacing
  const totalChildrenWidth = node.children.reduce((sum, child, index) => {
    return sum + (child.subtreeWidth || 0) + (index > 0 ? adaptiveSpacing : 0);
  }, 0);

  // Start positioning children from the left edge of their total span
  let currentX = centerX - totalChildrenWidth / 2;

  node.children.forEach((child, index) => {
    const childSubtreeWidth = child.subtreeWidth || 0;
    const childCenterX = currentX + childSubtreeWidth / 2;
    
    // Recursively position child and its subtree
    positionNodeAndChildren(child, childCenterX, childY, config);
    
    // Move to next child position with adaptive spacing
    currentX += childSubtreeWidth + (index < node.children.length - 1 ? adaptiveSpacing : 0);
  });
};

// Check and resolve overlaps
const resolveOverlaps = (hierarchy: HierarchicalNode[], config: LayoutConfig): void => {
  const allNodes: HierarchicalNode[] = [];
  
  // Collect all nodes
  const collectNodes = (node: HierarchicalNode) => {
    allNodes.push(node);
    node.children.forEach(collectNodes);
  };
  
  hierarchy.forEach(collectNodes);
  
  // Sort nodes by level and then by x position
  allNodes.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return (a.x || 0) - (b.x || 0);
  });
  
  // Group nodes by level
  const nodesByLevel = new Map<number, HierarchicalNode[]>();
  allNodes.forEach(node => {
    if (!nodesByLevel.has(node.level)) {
      nodesByLevel.set(node.level, []);
    }
    nodesByLevel.get(node.level)!.push(node);
  });
  
  // Resolve horizontal overlaps within each level
  nodesByLevel.forEach((levelNodes, level) => {
    for (let i = 1; i < levelNodes.length; i++) {
      const prevNode = levelNodes[i - 1];
      const currentNode = levelNodes[i];
      
      const prevRight = (prevNode.x || 0) + prevNode.width;
      const currentLeft = currentNode.x || 0;
      const requiredGap = config.minNodeSpacing;
      
      if (prevRight + requiredGap > currentLeft) {
        const adjustment = prevRight + requiredGap - currentLeft;
        // Adjust current node and all nodes to its right
        for (let j = i; j < levelNodes.length; j++) {
          if (levelNodes[j].x !== undefined) {
            levelNodes[j].x! += adjustment;
          }
        }
      }
    }
  });
};

// Calculate layout for hierarchical nodes with compact spacing
export const calculateHierarchicalLayout = (
  nodes: Node[], 
  edges: Edge[], 
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { nodes: Node[], edges: Edge[] } => {
  const hierarchy = buildHierarchy(nodes, edges);
  
  if (hierarchy.length === 0) {
    return { nodes, edges };
  }

  // Calculate subtree dimensions for all nodes (bottom-up)
  hierarchy.forEach(rootNode => {
    calculateSubtreeDimensions(rootNode, config);
  });

  // Position each root tree with minimal spacing
  let currentRootX = config.rootX;
  
  hierarchy.forEach((rootNode, index) => {
    const rootCenterX = currentRootX + (rootNode.subtreeWidth || 0) / 2;
    
    // Position this root tree
    positionNodeAndChildren(rootNode, rootCenterX, config.rootY, config);
    
    // Update position for next root tree
    currentRootX += (rootNode.subtreeWidth || 0) + config.horizontalSpacing * 2;
  });

  // Resolve any remaining overlaps
  resolveOverlaps(hierarchy, config);

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
