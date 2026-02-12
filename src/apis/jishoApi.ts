import axios from 'axios';

// Netlify Functions를 통해 API 호출
const isDevelopment = import.meta.env.DEV;

// 개발 환경에서는 Vite 프록시 사용, 프로덕션에서는 Netlify Functions 사용
const getApiBase = () => {
    if (isDevelopment) {
        return '/jisho-api';
    }
    return '/.netlify/functions';
};

export const searchKanji = async (keyword: string) => {
    const apiBase = getApiBase();
    const url = isDevelopment
        ? `${apiBase}/search/words?keyword=${encodeURIComponent(keyword)}`
        : `${apiBase}/jisho-search?keyword=${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

export const fetchKanjiInfo = async (kanji: string) => {
    const apiBase = getApiBase();
    const url = isDevelopment
        ? `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`
        : `${apiBase}/kanji-info?kanji=${encodeURIComponent(kanji)}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching kanji info for ${kanji}:`, error);
        throw error;
    }
};

export const searchJLPTWords = async (jlptLevel: string) => {
    const apiBase = getApiBase();
    const keyword = `#jlpt-${jlptLevel.toLowerCase()}`;
    const url = isDevelopment
        ? `${apiBase}/search/words?keyword=${encodeURIComponent(keyword)}`
        : `${apiBase}/jisho-search?keyword=${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching JLPT ${jlptLevel} words:`, error);
        throw error;
    }
};

// 다양한 카테고리의 단어를 검색하는 함수들
export const searchCommonWords = async () => {
    const apiBase = getApiBase();
    const keyword = '#common';
    const url = isDevelopment
        ? `${apiBase}/search/words?keyword=${encodeURIComponent(keyword)}`
        : `${apiBase}/jisho-search?keyword=${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching common words:', error);
        throw error;
    }
};

export const searchWordsByCategory = async (category: string) => {
    const apiBase = getApiBase();
    const url = isDevelopment
        ? `${apiBase}/search/words?keyword=${encodeURIComponent(category)}`
        : `${apiBase}/jisho-search?keyword=${encodeURIComponent(category)}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching words for category ${category}:`, error);
        throw error;
    }
};

// 포괄적인 단어 풀 생성을 위한 함수
export const searchComprehensiveWordPool = async () => {
    const searchTerms = [
        // JLPT 레벨별
        '#jlpt-n5',
        '#jlpt-n4',
        '#jlpt-n3',
        '#jlpt-n2',
        '#jlpt-n1',
        // 공통/빈도 기반
        '#common',
        '#frequent',
        '#basic',
        // 카테고리별
        '動物',
        '食べ物',
        '色',
        '家族',
        '仕事',
        '学校',
        '時間',
        '天気',
        'animal',
        'food',
        'color',
        'family',
        'work',
        'school',
        'time',
        'weather',
        // 품사별
        '名詞',
        '動詞',
        '形容詞',
        // 레벨/그레이드별
        '小学校',
        '中学校',
        // 일반적인 검색어
        'everyday',
        'daily',
        'basic vocabulary',
        'essential',
        // 빈도 기반
        'frequency',
        'most used',
        'top 1000',
        'common words',
        // 추가 카테고리
        '数字',
        '月',
        '曜日',
        '季節',
        '服',
        '家',
        '交通',
        '国',
        'numbers',
        'months',
        'days',
        'seasons',
        'clothes',
        'home',
        'transport',
        'countries',
    ];

    const apiBase = getApiBase();
    const allWords = new Map(); // 중복 제거를 위한 Map 사용

    // 병렬로 검색 수행 (너무 많은 요청을 동시에 보내지 않도록 배치로 나눔)
    // 레이트 리밋을 피하기 위해 배치 크기를 줄이고 지연 시간을 늘림
    const batchSize = 2; // 5에서 2로 줄임
    const delayBetweenRequests = 500; // 배치 내 요청 간 지연 (ms)
    const delayBetweenBatches = 2000; // 배치 간 지연 (ms) - 1초에서 2초로 증가

    for (let i = 0; i < searchTerms.length; i += batchSize) {
        const batch = searchTerms.slice(i, i + batchSize);
        
        // 배치 내 요청을 순차적으로 처리하되, 각 요청 사이에 지연 추가
        for (const term of batch) {
            try {
                const url = isDevelopment
                    ? `${apiBase}/search/words?keyword=${encodeURIComponent(term)}`
                    : `${apiBase}/jisho-search?keyword=${encodeURIComponent(term)}`;

                const response = await axios.get(url);
                if (response.data && response.data.data) {
                    response.data.data.forEach((word: any) => {
                        // 일본어 텍스트가 있는 경우에만 추가
                        if (word.japanese && word.japanese.length > 0) {
                            const key =
                                word.slug || word.japanese[0].word || word.japanese[0].reading;
                            if (key && !allWords.has(key)) {
                                allWords.set(key, word);
                            }
                        }
                    });
                }
            } catch (error: any) {
                // 429 에러인 경우 더 긴 지연 후 재시도
                if (error.response?.status === 429) {
                    console.warn(`Rate limited for term "${term}", waiting longer...`);
                    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5초 대기
                    // 재시도는 하지 않고 다음으로 넘어감
                } else {
                    console.error(`Error searching for term "${term}":`, error);
                }
                // 개별 검색 실패는 무시하고 계속 진행
            }
            
            // 배치 내 마지막 요청이 아니면 지연 추가
            if (term !== batch[batch.length - 1]) {
                await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
            }
        }

        // API 레이트 리밋을 피하기 위한 배치 간 지연
        if (i + batchSize < searchTerms.length) {
            await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
        }
    }

    // Map을 배열로 변환
    const wordsArray = Array.from(allWords.values());

    return {
        data: wordsArray,
        meta: {
            total: wordsArray.length,
            searchTerms: searchTerms.length,
            uniqueWords: allWords.size,
        },
    };
};
