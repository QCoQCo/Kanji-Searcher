import { useState, useEffect } from 'react';
import { searchJLPTWords, searchComprehensiveWordPool } from '../apis/jishoApi';
import type { WordData, JLPTLevel } from '../types/kanji';

export type WordPoolMode = 'jlpt' | 'comprehensive';

export interface UseRandomWordsOptions {
    mode?: WordPoolMode;
    jlptLevel?: JLPTLevel;
}

export const useRandomWords = (options: UseRandomWordsOptions = {}) => {
    const { mode = 'comprehensive', jlptLevel = 'N5' } = options;

    const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>(jlptLevel);
    const [wordPoolMode, setWordPoolMode] = useState<WordPoolMode>(mode);
    const [allWords, setAllWords] = useState<WordData[]>([]);
    const [currentWord, setCurrentWord] = useState<WordData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState<string>('');

    // 단어 풀을 가져오는 함수 (모드에 따라 다른 방식 사용)
    const fetchWordPool = async (mode: WordPoolMode, level?: JLPTLevel) => {
        setIsLoading(true);
        setError(null);
        setLoadingProgress('');

        try {
            let response;
            let words: WordData[] = [];

            if (mode === 'jlpt' && level) {
                setLoadingProgress(`Loading ${level} vocabulary...`);
                response = await searchJLPTWords(level);
                if (response.data && Array.isArray(response.data)) {
                    words = response.data;
                }
            } else if (mode === 'comprehensive') {
                setLoadingProgress('Loading comprehensive vocabulary database...');
                response = await searchComprehensiveWordPool();
                if (response.data && Array.isArray(response.data)) {
                    words = response.data;

                    // JLPT 레벨별 필터링 (선택사항)
                    if (level) {
                        words = words.filter(
                            (word) => word.jlpt && word.jlpt.includes(level.toLowerCase())
                        );
                    }
                }
            }

            if (words.length > 0) {
                setAllWords(words);
                // 첫 번째 랜덤 단어 설정
                const randomIndex = Math.floor(Math.random() * words.length);
                setCurrentWord(words[randomIndex]);
                setLoadingProgress(`Loaded ${words.length} words successfully!`);
            } else {
                setAllWords([]);
                setCurrentWord(null);
                setLoadingProgress('No words found');
            }
        } catch (err) {
            console.error(`Error fetching word pool (${mode}):`, err);
            const modeText = mode === 'jlpt' ? `JLPT ${level}` : 'comprehensive';
            setError(`Failed to fetch ${modeText} word pool. Please try again.`);
            setAllWords([]);
            setCurrentWord(null);
            setLoadingProgress('');
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

    // JLPT 레벨 변경
    const changeLevel = (level: JLPTLevel) => {
        setSelectedLevel(level);
    };

    // 단어 풀 모드 변경
    const changeMode = (newMode: WordPoolMode) => {
        setWordPoolMode(newMode);
    };

    // 모드나 레벨이 변경되면 단어 풀을 다시 가져옴
    useEffect(() => {
        fetchWordPool(wordPoolMode, wordPoolMode === 'jlpt' ? selectedLevel : undefined);
    }, [wordPoolMode, selectedLevel]);

    // 다시 로드
    const reload = () => {
        fetchWordPool(wordPoolMode, wordPoolMode === 'jlpt' ? selectedLevel : undefined);
    };

    return {
        selectedLevel,
        wordPoolMode,
        currentWord,
        allWords,
        isLoading,
        error,
        loadingProgress,
        changeLevel,
        changeMode,
        getRandomWord,
        reload,
        totalWords: allWords.length,
    };
};
