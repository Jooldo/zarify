
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
  horizontalGap: number;
  verticalGap: number;
  rootX: number;
  rootY: number;
  minSiblingGap: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 380,
  nodeHeight: 240,
  horizontalGap: 60,      // Minimal gap between sibling nodes
  verticalGap: 80,        // Minimal gap between levels
  rootX: 200,
  rootY: 50,
  minSiblingGap: 40,      // Absolute minimum space between siblings
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

// Calculate subtree width bottom-up (compact approach)
const calculateSubtreeWidth = (node: HierarchicalNode, config: LayoutConfig): number => {
  if (node.children.length === 0) {
    // Leaf node: width is just the node width
    node.subtreeWidth = node.width;
    return node.subtreeWidth;
  }

  // Calculate subtree widths for all children first
  const childSubtreeWidths = node.children.map(child => 
    calculateSubtreeWidth(child, config)
  );

  // Calculate total width needed for all children with minimal gaps
  let totalChildrenWidth = 0;
  for (let i = 0; i < childSubtreeWidths.length; i++) {
    totalChildrenWidth += childSubtreeWidths[i];
    if (i < childSubtreeWidths.length - 1) {
      // Add adaptive gap based on subtree complexity
      const adaptiveGap = Math.max(
        config.minSiblingGap,
        Math.min(config.horizontalGap, childSubtreeWidths[i] * 0.1)
      );
      totalChildrenWidth += adaptiveGap;
    }
  }

  // Subtree width is the maximum of node width and children total width
  node.subtreeWidth = Math.max(node.width, totalChildrenWidth);
  return node.subtreeWidth;
};

// Position nodes with compact spacing (bottom-up)
const positionNodeAndChildren = (
  node: HierarchicalNode,
  leftX: number,
  y: number,
  config: LayoutConfig
): number => {
  if (node.children.length === 0) {
    // Leaf node: position at leftX
    node.x = leftX;
    node.y = y;
    return leftX + node.width;
  }

  // Position children first (bottom-up)
  const childY = y + node.height + config.verticalGap;
  let currentChildX = leftX;
  
  // If children span is less than node width, center children under node
  const childrenSpan = node.subtreeWidth!;
  const nodeSpan = node.width;
  
  if (childrenSpan < nodeSpan) {
    // Children are narrower than parent - center them
    currentChildX = leftX + (nodeSpan - childrenSpan) / 2;
  }

  // Position all children
  const childPositions: number[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childWidth = child.subtreeWidth!;
    
    childPositions.push(currentChildX);
    currentChildX = positionNodeAndChildren(child, currentChildX, childY, config);
    
    // Add adaptive gap for next child
    if (i < node.children.length - 1) {
      const adaptiveGap = Math.max(
        config.minSiblingGap,
        Math.min(config.horizontalGap, childWidth * 0.1)
      );
      currentChildX += adaptiveGap;
    }
  }

  // Position parent node
  if (childrenSpan >= nodeSpan) {
    // Children are wider - center parent above children
    const childrenLeftmost = childPositions[0];
    const childrenRightmost = currentChildX - (node.children.length > 1 ? 
      Math.max(config.minSiblingGap, Math.min(config.horizontalGap, node.children[node.children.length - 1].subtreeWidth! * 0.1)) : 0);
    const childrenCenter = (childrenLeftmost + childrenRightmost) / 2;
    node.x = childrenCenter - node.width / 2;
  } else {
    // Children are narrower - position parent at leftX
    node.x = leftX;
  }
  
  node.y = y;

  // Return the rightmost edge of this subtree
  return Math.max(leftX + nodeSpan, currentChildX);
};

// Calculate compact hierarchical layout
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

  // Position each root tree with compact spacing
  let currentX = config.rootX;
  
  hierarchy.forEach((rootNode, index) => {
    // Position this root tree
    const rightEdge = positionNodeAndChildren(rootNode, currentX, config.rootY, config);
    
    // Update position for next root tree with minimal gap
    if (index < hierarchy.length - 1) {
      currentX = rightEdge + config.horizontalGap * 2; // Double gap between separate trees
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
