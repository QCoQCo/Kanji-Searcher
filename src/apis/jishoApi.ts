import axios from 'axios';

// Vite 프록시를 통해 Jisho API 호출
const JISHO_API_BASE = '/jisho-api';

export const searchKanji = async (keyword: string) => {
  const jishoUrl = `${JISHO_API_BASE}/search/words?keyword=${encodeURIComponent(keyword)}`;
  
  try {
    const response = await axios.get(jishoUrl);
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const fetchKanjiInfo = async (kanji: string) => {
  try {
    const response = await axios.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching kanji info for ${kanji}:`, error);
    throw error;
  }
}; 