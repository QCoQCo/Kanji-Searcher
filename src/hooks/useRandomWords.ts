import { useState, useEffect } from 'react';
import { fetchWordsForLevels } from '../apis/jlptData';
import type { WordData, JLPTLevel } from '../types/kanji';

export interface UseRandomWordsOptions {
    initialLevels?: JLPTLevel[];
}

export const useRandomWords = (options: UseRandomWordsOptions = {}) => {
    const { initialLevels = ['N5'] } = options;

    const [selectedLevels, setSelectedLevels] = useState<JLPTLevel[]>(initialLevels);
    const [allWords, setAllWords] = useState<WordData[]>([]);
    const [currentWord, setCurrentWord] = useState<WordData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 선택된 레벨들의 단어 풀을 가져오는 함수
    const fetchWordPool = async (levels: JLPTLevel[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const words = await fetchWordsForLevels(levels);

            if (words.length > 0) {
                setAllWords(words);
                // 첫 번째 랜덤 단어 설정
                const randomIndex = Math.floor(Math.random() * words.length);
                setCurrentWord(words[randomIndex]);
            } else {
                setAllWords([]);
                setCurrentWord(null);
            }
        } catch (err) {
            console.error('Error fetching word pool:', err);
            setError(`Failed to load vocabulary for ${levels.join(', ')}. Please try again.`);
            setAllWords([]);
            setCurrentWord(null);
        } finally {
            setIsLoading(false);
        }
    };

    // 새로운 랜덤 단어 선택
    const getRandomWord = () => {
        if (allWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * allWords.length);
            setCurrentWord(allWords[randomIndex]);
        }
    };

    // JLPT 레벨 토글 (최소 1개는 항상 선택 유지)
    const toggleLevel = (level: JLPTLevel) => {
        setSelectedLevels((prev) => {
            if (prev.includes(level)) {
                if (prev.length === 1) {
                    return prev; // 마지막 하나는 해제 불가
                }
                return prev.filter((l) => l !== level);
            }
            return [...prev, level];
        });
    };

    // 선택된 레벨이 변경되면 단어 풀을 다시 가져옴
    useEffect(() => {
        fetchWordPool(selectedLevels);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLevels]);

    // 다시 로드
    const reload = () => {
        fetchWordPool(selectedLevels);
    };

    return {
        selectedLevels,
        currentWord,
        allWords,
        isLoading,
        error,
        toggleLevel,
        getRandomWord,
        reload,
        totalWords: allWords.length,
    };
};
