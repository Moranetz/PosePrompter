import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePromptHistory from '../usePromptHistory';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('usePromptHistory', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => usePromptHistory());
    expect(result.current.history).toEqual([]);
  });

  it('should load history from localStorage on mount', () => {
    const stored = [{ id: 'abc', prompt: 'test', selections: {}, timestamp: 1000 }];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

    const { result } = renderHook(() => usePromptHistory());
    expect(result.current.history).toEqual(stored);
  });

  it('should add an entry', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addEntry('my prompt', { Outfit: 'Casual' }));

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].prompt).toBe('my prompt');
    expect(result.current.history[0].selections).toEqual({ Outfit: 'Casual' });
    expect(result.current.history[0].id).toBeTruthy();
    expect(result.current.history[0].timestamp).toBeTruthy();
  });

  it('should not add empty prompts', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addEntry('', {}));
    act(() => result.current.addEntry('  ', {}));

    expect(result.current.history).toHaveLength(0);
  });

  it('should deduplicate consecutive identical prompts', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addEntry('same prompt', {}));
    act(() => result.current.addEntry('same prompt', {}));

    expect(result.current.history).toHaveLength(1);
  });

  it('should allow re-adding after a different prompt', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addEntry('first', {}));
    act(() => result.current.addEntry('second', {}));
    act(() => result.current.addEntry('first', {}));

    expect(result.current.history).toHaveLength(3);
  });

  it('should remove an entry by id', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addEntry('one', {}));
    act(() => result.current.addEntry('two', {}));

    const idToRemove = result.current.history[0].id;
    act(() => result.current.removeEntry(idToRemove));

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].prompt).toBe('two');
  });

  it('should clear all history', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addEntry('one', {}));
    act(() => result.current.addEntry('two', {}));
    act(() => result.current.clearHistory());

    expect(result.current.history).toEqual([]);
  });

  it('should persist to localStorage on change', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addEntry('persist me', {}));

    // localStorage.setItem should have been called with the history
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'poseprompt_history',
      expect.any(String)
    );
    const persisted = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
    expect(persisted).toHaveLength(1);
    expect(persisted[0].prompt).toBe('persist me');
  });

  it('should cap at 50 entries', () => {
    const { result } = renderHook(() => usePromptHistory());

    for (let i = 0; i < 55; i++) {
      act(() => result.current.addEntry(`prompt ${i}`, {}));
    }

    expect(result.current.history.length).toBeLessThanOrEqual(50);
    // Should have kept the most recent entries
    expect(result.current.history.at(-1).prompt).toBe('prompt 54');
  });
});
