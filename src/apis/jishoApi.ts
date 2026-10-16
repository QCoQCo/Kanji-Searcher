import axios from 'axios';
import type { JishoApiResponse, KanjiApiResponse } from '../types/kanji';

// 개발 환경에서는 Vite 프록시(Jisho)·kanjiapi.dev 직접 호출, 프로덕션에서는 Netlify Functions 사용
const isDevelopment = import.meta.env.DEV;

const getWordSearchUrl = (keyword: string) => {
    const encoded = encodeURIComponent(keyword);
    return isDevelopment
        ? `/jisho-api/search/words?keyword=${encoded}`
        : `/.netlify/functions/jisho-search?keyword=${encoded}`;
};

const getKanjiInfoUrl = (kanji: string) => {
    const encoded = encodeURIComponent(kanji);
    return isDevelopment
        ? `https://kanjiapi.dev/v1/kanji/${encoded}`
        : `/.netlify/functions/kanji-info?kanji=${encoded}`;
};

export const searchKanji = async (keyword: string): Promise<JishoApiResponse> => {
    try {
        const response = await axios.get<JishoApiResponse>(getWordSearchUrl(keyword));
        return response.data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// 한자 정보 캐시 (한 번 조회한 한자는 재요청하지 않음, 진행 중인 요청도 공유)
const kanjiInfoCache = new Map<string, Promise<KanjiApiResponse>>();

export const fetchKanjiInfo = (kanji: string): Promise<KanjiApiResponse> => {
    const cached = kanjiInfoCache.get(kanji);
    if (cached) {
        return cached;
    }

    const request = axios
        .get<KanjiApiResponse>(getKanjiInfoUrl(kanji))
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
