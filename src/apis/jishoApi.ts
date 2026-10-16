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

// 한자 정보 캐시 (한 번 조회한 한자는 재요청하지 않음, 진행 중인 요청도 공유)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const kanjiInfoCache = new Map<string, Promise<any>>();

export const fetchKanjiInfo = (kanji: string) => {
    const cached = kanjiInfoCache.get(kanji);
    if (cached) {
        return cached;
    }

    const apiBase = getApiBase();
    const url = isDevelopment
        ? `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`
        : `${apiBase}/kanji-info?kanji=${encodeURIComponent(kanji)}`;

    const request = axios
        .get(url)
        .then((response) => response.data)
        .catch((error) => {
            // 실패한 요청은 캐시에서 제거해 다음에 재시도할 수 있게 함
            kanjiInfoCache.delete(kanji);
            console.error(`Error fetching kanji info for ${kanji}:`, error);
            throw error;
        });

    kanjiInfoCache.set(kanji, request);
    return request;
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
