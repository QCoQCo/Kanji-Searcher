import { useState, useCallback, useEffect, useRef } from 'react';
import { searchWords, fetchKanjiInfo } from '../apis/jishoApi';
import { isKanji } from '../utils/kanjiExtractor';
import type { KanjiData, KanjiApiResponse, WordData, SearchSource, JLPTLevel } from '../types/kanji';

interface SearchState {
    kanjiResults: KanjiData[];
    wordResults: WordData[];
    loading: boolean;
    selectedWord: WordData | null;
    searchSource: SearchSource;
    hasSearched: boolean; // 검색을 한 번이라도 완료했는지 (첫 화면 안내 표시용)
}

interface SearchOptions {
    // true면 완료 콜백(검색 기록·브레드크럼 추가)을 호출하지 않음 (브레드크럼으로 되돌아갈 때)
    silent?: boolean;
}

interface UseSearchReturn extends SearchState {
    handleSearch: (query: string, source?: SearchSource, options?: SearchOptions) => Promise<void>;
    handleWordClick: (wordObj: WordData, extractedKanji: string, restoreWordResults?: WordData[]) => void;
    handleManualSearch: (query?: string, options?: SearchOptions) => void;
}

function parseKanjiApiResponse(data: KanjiApiResponse): KanjiData {
    return {
        kanji: data.kanji,
        readings: {
            kun: data.kun_readings || [],
            on: data.on_readings || [],
        },
        meanings: data.meanings || [],
        jlpt: data.jlpt ? (`N${data.jlpt}` as JLPTLevel) : null,
        stroke_count: data.stroke_count || 0,
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
        hasSearched: false,
    });

    // 가장 최근 검색 요청 번호 (늦게 도착한 이전 검색 결과가 최신 결과를 덮어쓰지 않도록)
    const latestRequestIdRef = useRef(0);

    // 완료 콜백은 부모가 매 렌더 새로 만들어 넘기므로 ref로 최신 값만 유지 (의존성에서 제외)
    const onSearchCompleteRef = useRef(onSearchComplete);
    useEffect(() => {
        onSearchCompleteRef.current = onSearchComplete;
    });

    const handleSearch = useCallback(
        async (query: string, source: SearchSource = 'manual', options: SearchOptions = {}) => {
            if (!query.trim()) return;

            const requestId = ++latestRequestIdRef.current;
            const isStale = () => requestId !== latestRequestIdRef.current;

            setState((prev) => ({ ...prev, loading: true, searchSource: source }));

            try {
                // 단어 검색 (word-click이 아닌 경우에만)
                let wordResults: WordData[] = [];
                if (source !== 'word-click') {
                    try {
                        const data = await searchWords(query);
                        wordResults = data.data || [];
                    } catch (error) {
                        console.error('Error searching words:', error);
                        wordResults = [];
                    }
                }

                // 한자 검색 (중복 글자 제거 후 병렬 요청, 입력 순서 유지)
                const kanjiChars = Array.from(new Set(Array.from(query).filter(isKanji)));
                const activeLevels = getActiveLevels();

                const kanjiInfos = await Promise.all(
                    kanjiChars.map(async (ch) => {
                        try {
                            return parseKanjiApiResponse(await fetchKanjiInfo(ch));
                        } catch (error) {
                            console.error(`Error fetching kanji info for ${ch}:`, error);
                            return null;
                        }
                    })
                );

                const kanjiDataArr = kanjiInfos.filter(
                    (info): info is KanjiData =>
                        info !== null && (!info.jlpt || activeLevels.includes(info.jlpt))
                );

                if (isStale()) return;

                setState((prev) => ({
                    ...prev,
                    kanjiResults: kanjiDataArr,
                    wordResults: source === 'word-click' ? prev.wordResults : wordResults,
                    loading: false,
                    hasSearched: true,
                }));

                if (!options.silent) {
                    onSearchCompleteRef.current?.(query, source);
                }
            } catch (error) {
                console.error('Search error:', error);
                if (isStale()) return;
                setState((prev) => ({
                    ...prev,
                    kanjiResults: [],
                    wordResults: source === 'word-click' ? prev.wordResults : [],
                    loading: false,
                    hasSearched: true,
                }));
            }
        },
        [getActiveLevels]
    );

    const handleWordClick = useCallback(
        (wordObj: WordData, extractedKanji: string, restoreWordResults?: WordData[]) => {
            setState((prev) => ({
                ...prev,
                selectedWord: wordObj,
                // 브레드크럼으로 돌아갈 때는 클릭 당시의 단어 목록을 복원 (word-click 검색은 목록을 새로 가져오지 않음)
                wordResults: restoreWordResults ?? prev.wordResults,
            }));
            handleSearch(extractedKanji, 'word-click');
        },
        [handleSearch]
    );

    const handleManualSearch = useCallback(
        (query?: string, options?: SearchOptions) => {
            if (query) {
                setState((prev) => ({ ...prev, selectedWord: null }));
                handleSearch(query, 'manual', options);
            }
        },
        [handleSearch]
    );

    return {
        ...state,
        handleSearch,
        handleWordClick,
        handleManualSearch,
    };
}
