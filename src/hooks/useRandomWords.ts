import { useState, useEffect, useRef } from 'react';
import { fetchWordsForLevels } from '../apis/jlptData';
import type { WordData, JLPTLevel } from '../types/kanji';

export interface UseRandomWordsOptions {
    initialLevels?: JLPTLevel[];
}

export const useRandomWords = (options: UseRandomWordsOptions = {}) => {
    const { initialLevels = ['N1'] } = options;

    const [selectedLevels, setSelectedLevels] = useState<JLPTLevel[]>(initialLevels);
    const [allWords, setAllWords] = useState<WordData[]>([]);
    const [currentWord, setCurrentWord] = useState<WordData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 셔플 덱: 단어 인덱스를 섞어서 순서대로 소비, 소진되면 재셔플
    const deckRef = useRef<number[]>([]);
    const deckPositionRef = useRef(0);

    const createShuffledDeck = (size: number): number[] => {
        const deck = Array.from({ length: size }, (_, i) => i);
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

    // 선택된 레벨들의 단어 풀을 가져오는 함수
    const fetchWordPool = async (levels: JLPTLevel[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const words = await fetchWordsForLevels(levels);

            if (words.length > 0) {
                setAllWords(words);
                // 새 덱을 만들고 첫 단어 표시
                deckRef.current = createShuffledDeck(words.length);
                deckPositionRef.current = 1;
                setCurrentWord(words[deckRef.current[0]]);
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

    // 덱에서 다음 단어 선택 (한 바퀴 돌기 전까지 중복 없음)
    const getRandomWord = () => {
        if (allWords.length === 0) return;

        // 덱 소진 시 재셔플 (재셔플 직후 직전 단어가 연속으로 나오지 않도록 보정)
        if (deckPositionRef.current >= deckRef.current.length) {
            const lastIndex = deckRef.current[deckRef.current.length - 1];
            const newDeck = createShuffledDeck(allWords.length);
            if (newDeck.length > 1 && newDeck[0] === lastIndex) {
                [newDeck[0], newDeck[1]] = [newDeck[1], newDeck[0]];
            }
            deckRef.current = newDeck;
            deckPositionRef.current = 0;
        }

        setCurrentWord(allWords[deckRef.current[deckPositionRef.current]]);
        deckPositionRef.current += 1;
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
