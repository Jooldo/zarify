
import { useState, useCallback, useEffect } from 'react';
import { Node } from '@xyflow/react';

interface NodePosition {
  x: number;
  y: number;
}

interface UseNodePositionsReturn {
  userNodePositions: Record<string, NodePosition>;
  updateNodePosition: (nodeId: string, position: NodePosition) => void;
  resetPositions: () => void;
  hasUserPosition: (nodeId: string) => boolean;
}

export const useNodePositions = (): UseNodePositionsReturn => {
  const [userNodePositions, setUserNodePositions] = useState<Record<string, NodePosition>>(() => {
    try {
      const saved = localStorage.getItem('production-flow-node-positions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateNodePosition = useCallback((nodeId: string, position: NodePosition) => {
    setUserNodePositions(prev => {
      const updated = { ...prev, [nodeId]: position };
      localStorage.setItem('production-flow-node-positions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetPositions = useCallback(() => {
    setUserNodePositions({});
    localStorage.removeItem('production-flow-node-positions');
  }, []);

  const hasUserPosition = useCallback((nodeId: string) => {
    return nodeId in userNodePositions;
  }, [userNodePositions]);

  return {
    userNodePositions,
    updateNodePosition,
    resetPositions,
    hasUserPosition
  };
};
