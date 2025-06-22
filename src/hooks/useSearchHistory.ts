import { useState, useEffect } from 'react';
import { hasKanji } from '../utils/kanjiExtractor';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  frequency: number;
  isFavorite: boolean;
  type: 'kanji' | 'word' | 'mixed';
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
    const isKanjiSearch = hasKanji(query);
    const isOnlyKanji = /^[一-龯々]+$/.test(query);
    
    setHistory(prev => {
      const existingItem = prev.find(item => item.query === query);
      const filtered = prev.filter(item => item.query !== query);
      
      const newItem: SearchHistoryItem = {
        query,
        timestamp: Date.now(),
        frequency: existingItem ? existingItem.frequency + 1 : 1,
        isFavorite: existingItem ? existingItem.isFavorite : false,
        type: isOnlyKanji ? 'kanji' : isKanjiSearch ? 'mixed' : 'word',
      };
      
      const newHistory = [newItem, ...filtered].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const toggleFavorite = (query: string) => {
    setHistory(prev => {
      const newHistory = prev.map(item => 
        item.query === query 
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const getFrequentItems = () => {
    return [...history]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  };

  const getFavorites = () => {
    return history.filter(item => item.isFavorite);
  };

  return { 
    history, 
    addToHistory, 
    clearHistory, 
    toggleFavorite,
    getFrequentItems,
    getFavorites
  };
}; 