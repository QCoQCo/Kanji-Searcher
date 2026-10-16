import { useState, useCallback, useEffect, useRef } from 'react';
import { searchKanji, fetchKanjiInfo } from '../apis/jishoApi';
import { isKanji } from '../utils/kanjiExtractor';
import type { KanjiData, WordData, SearchSource, JLPTLevel } from '../types/kanji';

interface SearchState {
    kanjiResults: KanjiData[];
    wordResults: WordData[];
    loading: boolean;
    selectedWord: WordData | null;
    searchSource: SearchSource;
}

interface UseSearchReturn extends SearchState {
    handleSearch: (query: string, source?: SearchSource) => Promise<void>;
    handleWordClick: (wordObj: WordData, extractedKanji: string) => void;
    handleManualSearch: (query?: string) => void;
    clearResults: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseKanjiApiResponse(data: any): KanjiData {
    return {
        kanji: data.kanji,
        readings: {
            kun: data.kun_readings || [],
            on: data.on_readings || [],
        },
        meanings: data.meanings || [],
        jlpt: data.jlpt ? (`N${data.jlpt}` as JLPTLevel) : null,
        stroke_count: data.stroke_count || 0,
        related_words: [],
    };
}

export function useSearch(
    getActiveLevels: () => string[],
    onSearchComplete?: (query: string, source: SearchSource) => void
): UseSearchReturn {
    const [state, setState] = useState<SearchState>({
        kanjiResults: [],
        wordResults: [],
        loading: false,
        selectedWord: null,
        searchSource: 'manual',
    });

    // 완료 콜백은 부모가 매 렌더 새로 만들어 넘기므로 ref로 최신 값만 유지 (의존성에서 제외)
    const onSearchCompleteRef = useRef(onSearchComplete);
    useEffect(() => {
        onSearchCompleteRef.current = onSearchComplete;
    });

    const clearResults = useCallback(() => {
        setState((prev) => ({
            ...prev,
            kanjiResults: [],
            wordResults: [],
            selectedWord: null,
        }));
    }, []);

    const handleSearch = useCallback(
        async (query: string, source: SearchSource = 'manual') => {
            if (!query.trim()) return;

            setState((prev) => ({ ...prev, loading: true, searchSource: source }));

            try {
                // 단어 검색 (word-click이 아닌 경우에만)
                let wordResults: WordData[] = [];
                if (source !== 'word-click') {
                    try {
                        const data = await searchKanji(query);
                        wordResults = data.data || [];
                    } catch (error) {
                        console.error('Error searching words:', error);
                        wordResults = [];
                    }
                }

                // 한자 검색
                const kanjiChars = Array.from(query).filter(isKanji);
                const kanjiDataArr: KanjiData[] = [];

                if (kanjiChars.length > 0) {
                    const activeLevels = getActiveLevels();

                    for (const ch of kanjiChars) {
                        try {
                            const res = await fetchKanjiInfo(ch);
                            const parsed = parseKanjiApiResponse(res);
                            if (!parsed.jlpt || activeLevels.includes(parsed.jlpt)) {
                                kanjiDataArr.push(parsed);
                            }
                        } catch (error) {
                            console.error(`Error fetching kanji info for ${ch}:`, error);
                        }
                    }
                }

                setState((prev) => ({
                    ...prev,
                    kanjiResults: kanjiDataArr,
                    wordResults: source === 'word-click' ? prev.wordResults : wordResults,
                    loading: false,
                }));

                onSearchCompleteRef.current?.(query, source);
            } catch (error) {
                console.error('Search error:', error);
                setState((prev) => ({
                    ...prev,
                    kanjiResults: [],
                    wordResults: source === 'word-click' ? prev.wordResults : [],
                    loading: false,
                }));
            }
        },
        [getActiveLevels]
    );

    const handleWordClick = useCallback(
        (wordObj: WordData, extractedKanji: string) => {
            setState((prev) => ({ ...prev, selectedWord: wordObj }));
            handleSearch(extractedKanji, 'word-click');
        },
        [handleSearch]
    );

    const handleManualSearch = useCallback(
        (query?: string) => {
            if (query) {
                setState((prev) => ({ ...prev, selectedWord: null }));
                handleSearch(query, 'manual');
            }
        },
        [handleSearch]
    );

    return {
        ...state,
        handleSearch,
        handleWordClick,
        handleManualSearch,
        clearResults,
    };
}
