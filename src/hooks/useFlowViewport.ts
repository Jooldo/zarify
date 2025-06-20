
import { useState, useCallback, useEffect } from 'react';

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export const useFlowViewport = () => {
  const [viewportState, setViewportState] = useState<ViewportState>(() => {
    try {
      const saved = localStorage.getItem('production-flow-viewport');
      return saved ? JSON.parse(saved) : { x: 0, y: 0, zoom: 1 };
    } catch {
      return { x: 0, y: 0, zoom: 1 };
    }
  });

  const saveViewport = useCallback((viewport: ViewportState) => {
    setViewportState(viewport);
    localStorage.setItem('production-flow-viewport', JSON.stringify(viewport));
  }, []);

  const restoreViewport = useCallback(() => {
    return viewportState;
  }, [viewportState]);

  return {
    saveViewport,
    restoreViewport,
    viewportState
  };
};
