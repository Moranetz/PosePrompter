import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'poseprompt_history';
const MAX_ENTRIES = 50;

/**
 * Hook that stores prompt history in localStorage.
 * Each entry: { prompt, timestamp, selections (category→optionTitle map) }
 */
export default function usePromptHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // localStorage full - trim older entries
      try {
        const trimmed = history.slice(-20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch { /* ignore */ }
    }
  }, [history]);

  const addEntry = useCallback((prompt, selectionSummary) => {
    if (!prompt || !prompt.trim()) return;
    setHistory(prev => {
      // Deduplicate - don't add if same prompt as most recent
      if (prev.length > 0 && prev[prev.length - 1].prompt === prompt) return prev;
      const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        prompt,
        selections: selectionSummary || {},
        timestamp: Date.now(),
      };
      const next = [...prev, entry];
      return next.length > MAX_ENTRIES ? next.slice(-MAX_ENTRIES) : next;
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}
