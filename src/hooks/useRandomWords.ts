import { useState, useEffect, useRef } from 'react';
import { fetchWordsForLevels } from '../apis/jlptData';
import type { WordData, JLPTLevel } from '../types/kanji';

export interface UseRandomWordsOptions {
    initialLevels?: JLPTLevel[];
    initialCount?: number;
}

export const useRandomWords = (options: UseRandomWordsOptions = {}) => {
    const { initialLevels = ['N1'], initialCount = 1 } = options;

    const [selectedLevels, setSelectedLevels] = useState<JLPTLevel[]>(initialLevels);
    const [displayCount, setDisplayCount] = useState(initialCount);
    const [allWords, setAllWords] = useState<WordData[]>([]);
    const [currentWords, setCurrentWords] = useState<WordData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 셔플 덱: 단어 인덱스를 섞어서 순서대로 소비, 소진되면 재셔플
    const deckRef = useRef<number[]>([]);
    const deckPositionRef = useRef(0);
    const lastDrawnIndexRef = useRef<number | null>(null);

    const createShuffledDeck = (size: number): number[] => {
        const deck = Array.from({ length: size }, (_, i) => i);
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

    // 덱에서 count개의 단어를 뽑음 (배치 내 중복 없음, 소진 시 재셔플)
    const drawFromDeck = (count: number, pool: WordData[]): WordData[] => {
        const target = Math.min(count, pool.length);
        const drawnIndices: number[] = [];

        while (drawnIndices.length < target) {
            if (deckPositionRef.current >= deckRef.current.length) {
                // 재셔플 (직전 단어가 새 덱 맨 앞에 오면 스왑해서 연속 중복 방지)
                const newDeck = createShuffledDeck(pool.length);
                if (newDeck.length > 1 && newDeck[0] === lastDrawnIndexRef.current) {
                    [newDeck[0], newDeck[1]] = [newDeck[1], newDeck[0]];
                }
                deckRef.current = newDeck;
                deckPositionRef.current = 0;
            }

            const index = deckRef.current[deckPositionRef.current];
            deckPositionRef.current += 1;

            // 덱 경계를 넘어가는 배치에서 같은 단어가 두 번 나오지 않도록 스킵
            if (!drawnIndices.includes(index)) {
                drawnIndices.push(index);
            }
        }

        if (drawnIndices.length > 0) {
            lastDrawnIndexRef.current = drawnIndices[drawnIndices.length - 1];
        }
        return drawnIndices.map((i) => pool[i]);
    };

    // 선택된 레벨들의 단어 풀을 가져오는 함수
    const fetchWordPool = async (levels: JLPTLevel[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const words = await fetchWordsForLevels(levels);

            if (words.length > 0) {
                setAllWords(words);
                // 새 덱을 만들고 첫 배치 표시
                deckRef.current = createShuffledDeck(words.length);
                deckPositionRef.current = 0;
                lastDrawnIndexRef.current = null;
                setCurrentWords(drawFromDeck(displayCount, words));
            } else {
                setAllWords([]);
                setCurrentWords([]);
            }
        } catch (err) {
            console.error('Error fetching word pool:', err);
            setError(`Failed to load vocabulary for ${levels.join(', ')}. Please try again.`);
            setAllWords([]);
            setCurrentWords([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 덱에서 다음 배치 선택
    const drawNextWords = () => {
        if (allWords.length > 0) {
            setCurrentWords(drawFromDeck(displayCount, allWords));
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

    // 표시 개수가 변경되면 새 배치를 뽑음
    useEffect(() => {
        if (allWords.length > 0) {
            setCurrentWords(drawFromDeck(displayCount, allWords));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayCount]);

    // 다시 로드
    const reload = () => {
        fetchWordPool(selectedLevels);
    };

    return {
        selectedLevels,
        displayCount,
        setDisplayCount,
        currentWords,
        allWords,
        isLoading,
        error,
        toggleLevel,
        drawNextWords,
        reload,
        totalWords: allWords.length,
    };
};
