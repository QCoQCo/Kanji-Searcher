import { useState, useCallback } from 'react';
import { searchKanji, fetchKanjiInfo } from '../apis/jishoApi';
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
                const kanjiChars = Array.from(query).filter((ch) => /[一-龯々]/.test(ch));
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

                onSearchComplete?.(query, source);
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
        [getActiveLevels, onSearchComplete]
    );

    const handleWordClick = useCallback((wordObj: WordData, extractedKanji: string) => {
        setState((prev) => ({ ...prev, selectedWord: wordObj }));
        handleSearch(extractedKanji, 'word-click');
    }, []);

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
