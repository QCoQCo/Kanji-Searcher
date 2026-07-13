import { useState, useEffect } from 'react';
import type { WordData } from '../types/kanji';

export interface WordBankItem {
    key: string;
    word: WordData;
    savedAt: number;
}

const STORAGE_KEY = 'kanjiWordBank';

// 단어의 고유 키: 표기|읽기 조합 (가나 단어는 표기가 없으므로 읽기만으로 구분)
export const getWordKey = (word: WordData): string => {
    const jp = word.japanese[0];
    return `${jp?.word || ''}|${jp?.reading || ''}`;
};

export const useWordBank = () => {
    const [items, setItems] = useState<WordBankItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setItems(JSON.parse(stored));
        }
    }, []);

    const isSaved = (word: WordData) => {
        const key = getWordKey(word);
        return items.some((item) => item.key === key);
    };

    // 저장/해제 토글 (WordData 전체를 복사 저장 — 출처 무관하게 저장 가능)
    const toggleWord = (word: WordData) => {
        const key = getWordKey(word);
        setItems((prev) => {
            const exists = prev.some((item) => item.key === key);
            const newItems = exists
                ? prev.filter((item) => item.key !== key)
                : [{ key, word, savedAt: Date.now() }, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            return newItems;
        });
    };

    const removeWord = (key: string) => {
        setItems((prev) => {
            const newItems = prev.filter((item) => item.key !== key);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            return newItems;
        });
    };

    const clearAll = () => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        items,
        isSaved,
        toggleWord,
        removeWord,
        clearAll,
        totalSaved: items.length,
    };
};
