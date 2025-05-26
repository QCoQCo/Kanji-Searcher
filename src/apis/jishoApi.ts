import axios from 'axios';

export const searchKanji = async (keyword: string) => {
  const response = await axios.get(`/jisho-api/search/words?keyword=${encodeURIComponent(keyword)}`);
  return response.data;
};

export const fetchKanjiInfo = async (kanji: string) => {
  const response = await axios.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`);
  return response.data;
}; 