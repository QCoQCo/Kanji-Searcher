import { useState, useEffect } from 'react';
import type { WordData } from '../types/kanji';
import { readStorageArray, writeStorage, removeStorage } from '../utils/storage';

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

// 저장된 항목 중 화면에서 쓰는 필드가 올바른 것만 사용
const isWordBankItem = (item: unknown): item is WordBankItem => {
    if (typeof item !== 'object' || item === null) return false;
    const { key, word } = item as WordBankItem;
    return (
        typeof key === 'string' &&
        typeof word === 'object' &&
        word !== null &&
        Array.isArray(word.japanese) &&
        Array.isArray(word.senses)
    );
};

export const useWordBank = () => {
    // 지연 초기화로 첫 렌더부터 저장된 단어 사용
    const [items, setItems] = useState<WordBankItem[]>(() =>
        readStorageArray(STORAGE_KEY, (item) => (isWordBankItem(item) ? item : null))
    );

    // 단어장이 바뀔 때마다 저장 (state updater 안에서 부수효과를 일으키지 않도록 effect로 분리)
    useEffect(() => {
        if (items.length > 0) {
            writeStorage(STORAGE_KEY, items);
        } else {
            removeStorage(STORAGE_KEY);
        }
    }, [items]);

    const isSaved = (word: WordData) => {
        const key = getWordKey(word);
        return items.some((item) => item.key === key);
    };

    // 저장/해제 토글 (WordData 전체를 복사 저장 — 출처 무관하게 저장 가능)
    const toggleWord = (word: WordData) => {
        const key = getWordKey(word);
        setItems((prev) => {
            const exists = prev.some((item) => item.key === key);
            return exists
                ? prev.filter((item) => item.key !== key)
                : [{ key, word, savedAt: Date.now() }, ...prev];
        });
    };

    const removeWord = (key: string) => {
        setItems((prev) => prev.filter((item) => item.key !== key));
    };

    const clearAll = () => {
        setItems([]);
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
