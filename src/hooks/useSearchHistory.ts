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

        setHistory((prev) => {
            const existingItem = prev.find((item) => item.query === query);
            const filtered = prev.filter((item) => item.query !== query);

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
        setHistory((prev) => {
            const newHistory = prev.map((item) =>
                item.query === query ? { ...item, isFavorite: !item.isFavorite } : item
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const getFrequentItems = () => {
        return [...history].sort((a, b) => b.frequency - a.frequency).slice(0, 10);
    };

    const getFavorites = () => {
        return history.filter((item) => item.isFavorite);
    };

    const removeFromHistory = (query: string) => {
        setHistory((prev) => {
            const newHistory = prev.filter((item) => item.query !== query);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    // JSON 내보내기/가져오기 기능
    const exportHistoryToJSON = () => {
        const exportData = {
            version: '1.0',
            timestamp: Date.now(),
            history: history,
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kanji-search-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const validateAndCleanImportData = (
        data: unknown
    ): { isValid: boolean; cleanedHistory?: SearchHistoryItem[] } => {
        if (!data || typeof data !== 'object') return { isValid: false };
        if (!('history' in data) || !Array.isArray(data.history)) return { isValid: false };

        const cleanedHistory: SearchHistoryItem[] = [];

        for (const item of data.history) {
            if (typeof item !== 'object' || item === null) continue;
            if (!('query' in item) || typeof item.query !== 'string') continue;
            if (!('timestamp' in item) || typeof item.timestamp !== 'number') continue;

            // 누락된 필드들을 기본값으로 채우기
            const frequency =
                'frequency' in item && typeof item.frequency === 'number' && item.frequency !== null
                    ? item.frequency
                    : 1;

            const isFavorite =
                'isFavorite' in item && typeof item.isFavorite === 'boolean'
                    ? item.isFavorite
                    : false;

            // type 필드 자동 판정
            let type: 'kanji' | 'word' | 'mixed' = 'word';
            if (
                'type' in item &&
                typeof item.type === 'string' &&
                ['kanji', 'word', 'mixed'].includes(item.type)
            ) {
                type = item.type as 'kanji' | 'word' | 'mixed';
            } else {
                // type이 없으면 query를 분석해서 자동 판정
                const isKanjiSearch = hasKanji(item.query);
                const isOnlyKanji = /^[一-龯々]+$/.test(item.query);
                type = isOnlyKanji ? 'kanji' : isKanjiSearch ? 'mixed' : 'word';
            }

            cleanedHistory.push({
                query: item.query,
                timestamp: item.timestamp,
                frequency,
                isFavorite,
                type,
            });
        }

        return { isValid: cleanedHistory.length > 0, cleanedHistory };
    };

    const importHistoryFromJSON = (
        file: File,
        mergeMode: 'replace' | 'merge' = 'merge'
    ): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target?.result as string);

                    const { isValid, cleanedHistory } = validateAndCleanImportData(importData);

                    if (!isValid || !cleanedHistory) {
                        alert('유효하지 않은 검색 기록 파일입니다.');
                        resolve(false);
                        return;
                    }

                    const importedHistory: SearchHistoryItem[] = cleanedHistory;

                    setHistory((prev) => {
                        let newHistory: SearchHistoryItem[];

                        if (mergeMode === 'replace') {
                            newHistory = importedHistory;
                        } else {
                            // 병합 모드: 기존 데이터와 가져온 데이터를 합치고 중복 제거
                            const combined = [...prev, ...importedHistory];
                            const uniqueHistory = new Map<string, SearchHistoryItem>();

                            // 더 최근 데이터 또는 더 높은 빈도를 우선
                            combined.forEach((item) => {
                                const existing = uniqueHistory.get(item.query);
                                if (
                                    !existing ||
                                    item.timestamp > existing.timestamp ||
                                    item.frequency > existing.frequency
                                ) {
                                    uniqueHistory.set(item.query, {
                                        ...item,
                                        frequency: existing
                                            ? Math.max(existing.frequency, item.frequency)
                                            : item.frequency,
                                        isFavorite: existing
                                            ? existing.isFavorite || item.isFavorite
                                            : item.isFavorite,
                                    });
                                }
                            });

                            newHistory = Array.from(uniqueHistory.values())
                                .sort((a, b) => b.timestamp - a.timestamp)
                                .slice(0, 50);
                        }

                        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
                        return newHistory;
                    });

                    resolve(true);
                } catch {
                    alert('파일을 읽는 중 오류가 발생했습니다.');
                    resolve(false);
                }
            };

            reader.onerror = () => {
                alert('파일을 읽는 중 오류가 발생했습니다.');
                resolve(false);
            };

            reader.readAsText(file);
        });
    };

    return {
        history,
        addToHistory,
        clearHistory,
        toggleFavorite,
        getFrequentItems,
        getFavorites,
        removeFromHistory,
        exportHistoryToJSON,
        importHistoryFromJSON,
    };
};
