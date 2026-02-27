import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

/**
 * Generic undo/redo hook for any state value.
 * Returns [state, setState, { undo, redo, canUndo, canRedo }]
 */
export default function useUndoRedo(initialState) {
  const [state, setStateInternal] = useState(initialState);
  const historyRef = useRef([JSON.parse(JSON.stringify(initialState))]);
  const indexRef = useRef(0);

  const setState = useCallback((updater) => {
    setStateInternal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Trim any future states when a new action is taken
      const history = historyRef.current;
      history.splice(indexRef.current + 1);
      history.push(JSON.parse(JSON.stringify(next)));
      if (history.length > MAX_HISTORY) {
        history.shift();
      } else {
        indexRef.current++;
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--;
      const prev = JSON.parse(JSON.stringify(historyRef.current[indexRef.current]));
      setStateInternal(prev);
      return prev;
    }
    return null;
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      const next = JSON.parse(JSON.stringify(historyRef.current[indexRef.current]));
      setStateInternal(next);
      return next;
    }
    return null;
  }, []);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  return [state, setState, { undo, redo, canUndo, canRedo }];
}
