import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useUndoRedo from '../useUndoRedo';

describe('useUndoRedo', () => {
  it('should initialize with the provided state', () => {
    const { result } = renderHook(() => useUndoRedo({ a: 1 }));
    const [state] = result.current;
    expect(state).toEqual({ a: 1 });
  });

  it('should update state via setState', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    const [, setState] = result.current;

    act(() => setState(5));
    expect(result.current[0]).toBe(5);
  });

  it('should support updater functions', () => {
    const { result } = renderHook(() => useUndoRedo(10));
    const [, setState] = result.current;

    act(() => setState(prev => prev + 5));
    expect(result.current[0]).toBe(15);
  });

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useUndoRedo('a'));
    act(() => result.current[1]('b'));
    act(() => result.current[1]('c'));

    expect(result.current[0]).toBe('c');

    act(() => result.current[2].undo());
    expect(result.current[0]).toBe('b');

    act(() => result.current[2].undo());
    expect(result.current[0]).toBe('a');
  });

  it('should redo after undo', () => {
    const { result } = renderHook(() => useUndoRedo(1));
    act(() => result.current[1](2));
    act(() => result.current[1](3));

    act(() => result.current[2].undo());
    expect(result.current[0]).toBe(2);

    act(() => result.current[2].redo());
    expect(result.current[0]).toBe(3);
  });

  it('should report canUndo and canRedo correctly', () => {
    const { result } = renderHook(() => useUndoRedo(0));

    // Initially nothing to undo or redo
    expect(result.current[2].canUndo).toBe(false);
    expect(result.current[2].canRedo).toBe(false);

    // After a change, can undo but not redo
    act(() => result.current[1](1));
    expect(result.current[2].canUndo).toBe(true);
    expect(result.current[2].canRedo).toBe(false);

    // After undo, can redo
    act(() => result.current[2].undo());
    expect(result.current[2].canUndo).toBe(false);
    expect(result.current[2].canRedo).toBe(true);
  });

  it('should discard redo history when new action is taken after undo', () => {
    const { result } = renderHook(() => useUndoRedo('a'));
    act(() => result.current[1]('b'));
    act(() => result.current[1]('c'));

    // Undo to b, then set new value
    act(() => result.current[2].undo());
    act(() => result.current[1]('d'));

    expect(result.current[0]).toBe('d');
    // Redo should not be available - 'c' was discarded
    expect(result.current[2].canRedo).toBe(false);
  });

  it('should return null from undo/redo when at boundary', () => {
    const { result } = renderHook(() => useUndoRedo(0));
    let undoResult, redoResult;

    act(() => { undoResult = result.current[2].undo(); });
    expect(undoResult).toBeNull();

    act(() => { redoResult = result.current[2].redo(); });
    expect(redoResult).toBeNull();
  });

  it('should deep-clone state to prevent reference sharing', () => {
    const initial = { nested: { val: 1 } };
    const { result } = renderHook(() => useUndoRedo(initial));

    act(() => result.current[1]({ nested: { val: 2 } }));
    act(() => result.current[2].undo());

    // The undone state should be a deep copy, not the same reference
    expect(result.current[0]).toEqual({ nested: { val: 1 } });
    expect(result.current[0]).not.toBe(initial);
  });
});
