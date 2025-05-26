import { useState, useEffect } from 'react';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const STORAGE_KEY = 'kanjiSearchHistory';

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const addToHistory = (query: string) => {
    const newItem: SearchHistoryItem = { query, timestamp: Date.now() };
    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== query);
      const newHistory = [newItem, ...filtered].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, clearHistory };
}; 