import { useState, useCallback } from 'react';

export interface HistoryItem<T> {
  state: T;
  description: string;
}

export function useHistory<T>(initialState: T, maxHistory = 50) {
  const [present, setPresent] = useState<T>(initialState);
  const [past, setPast] = useState<HistoryItem<T>[]>([]);
  const [future, setFuture] = useState<HistoryItem<T>[]>([]);

  // Standard update: pushes current to past, sets new present
  // Use this for discrete actions (Split, Delete, Add)
  const set = useCallback((newState: T, description: string = 'Change') => {
    setPast(prev => {
      const newPast = [...prev, { state: present, description }];
      if (newPast.length > maxHistory) newPast.shift();
      return newPast;
    });
    setPresent(newState);
    setFuture([]);
  }, [present, maxHistory]);

  // Update present without pushing to history 
  // Use this for realtime updates (dragging sliders, moving clips)
  const updatePresent = useCallback((newState: T) => {
    setPresent(newState);
  }, []);
  
  // Manual push to history (Snapshot)
  // Use this at the END of a drag interaction to save the state AS IT WAS before the drag
  const pushToPast = useCallback((state: T, description: string) => {
      setPast(prev => {
          const newPast = [...prev, { state, description }];
          if (newPast.length > maxHistory) newPast.shift();
          return newPast;
      });
      setFuture([]); // Clear future on new branch
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture(prev => [{ state: present, description: previous.description }, ...prev]);
    setPresent(previous.state);
    setPast(newPast);
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast(prev => [...prev, { state: present, description: next.description }]);
    setPresent(next.state);
    setFuture(newFuture);
  }, [future, present]);

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    state: present,
    set,
    updatePresent,
    pushToPast,
    undo,
    redo,
    clear,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    history: past,
    future
  };
}