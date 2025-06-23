import axios from 'axios';

// 배포 환경에서도 작동하도록 CORS 프록시 사용
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const JISHO_API_BASE = 'https://jisho.org/api/v1';

export const searchKanji = async (keyword: string) => {
  const jishoUrl = `${JISHO_API_BASE}/search/words?keyword=${encodeURIComponent(keyword)}`;
  
  try {
    // 먼저 직접 호출 시도 (CORS가 허용되는 경우)
    const response = await axios.get(jishoUrl);
    return response.data;
  } catch {
    // CORS 에러인 경우 프록시를 통해 호출
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(jishoUrl)}`;
      const response = await axios.get(proxyUrl);
      return response.data;
    } catch (proxyError) {
      console.error('API call failed:', proxyError);
      throw proxyError;
    }
  }
};

export const fetchKanjiInfo = async (kanji: string) => {
  const response = await axios.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`);
  return response.data;
}; 