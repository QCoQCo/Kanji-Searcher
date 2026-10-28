import type { WordData } from '../types/kanji';

// 단어의 고유 키: 표기|읽기 조합 (가나 단어는 표기가 없으므로 읽기만으로 구분)
export const getWordKey = (word: WordData): string => {
    const jp = word.japanese[0];
    return `${jp?.word || ''}|${jp?.reading || ''}`;
};
