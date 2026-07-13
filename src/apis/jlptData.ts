import type { WordData, JLPTLevel } from '../types/kanji';

// 레벨별 단어 데이터 캐시 (한 번 로드한 레벨은 재요청하지 않음)
const levelCache = new Map<JLPTLevel, WordData[]>();

// public/data/jlpt-nX.json에서 레벨별 단어 데이터를 가져옴
export const fetchJLPTLevelWords = async (level: JLPTLevel): Promise<WordData[]> => {
    const cached = levelCache.get(level);
    if (cached) {
        return cached;
    }

    const response = await fetch(`/data/jlpt-${level.toLowerCase()}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load ${level} data (${response.status})`);
    }

    const words: WordData[] = await response.json();
    levelCache.set(level, words);
    return words;
};

// 선택된 여러 레벨의 단어를 합쳐서 반환
export const fetchWordsForLevels = async (levels: JLPTLevel[]): Promise<WordData[]> => {
    const results = await Promise.all(levels.map((level) => fetchJLPTLevelWords(level)));
    return results.flat();
};
