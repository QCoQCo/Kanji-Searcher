import React, { useState } from 'react';
import JLPTFilter from '../components/JLPTFilter';
import KanjiList from '../components/KanjiList';
import WordList from '../components/WordList';
import SearchHistory from '../components/SearchHistory';
import { useJLPTFilter } from '../hooks/useJLPTFilter';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { searchKanji, fetchKanjiInfo } from '../apis/jishoApi';
import type { KanjiData, JLPTLevel } from '../types/kanji';
import './SearchPage.css';

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

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [kanjiResults, setKanjiResults] = useState<KanjiData[]>([]);
  const [wordResults, setWordResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedLevels, onLevelChange, getActiveLevels } = useJLPTFilter();
  const { history, addToHistory, clearHistory } = useSearchHistory();

  const handleSearch = async (q?: string) => {
    const searchTerm = q ?? query;
    if (!searchTerm) return;
    setLoading(true);
    try {
      // WordList: 단어 전체 검색
      const data = await searchKanji(searchTerm);
      setWordResults(data.data);
      // KanjiList: 각 글자별 한자 정보 검색 (kanjiapi.dev)
      const kanjiChars = Array.from(searchTerm).filter(ch => /[一-龯々]/.test(ch));
      const kanjiDataArr: KanjiData[] = [];
      for (const ch of kanjiChars) {
        try {
          const res = await fetchKanjiInfo(ch);
          const parsed = parseKanjiApiResponse(res);
          const activeLevels = getActiveLevels();
          if (!parsed.jlpt || activeLevels.includes(parsed.jlpt)) {
            kanjiDataArr.push(parsed);
          }
        } catch {
          console.error(`Error fetching kanji info for ${ch}`);
        }
      }
      setKanjiResults(kanjiDataArr);
      addToHistory(searchTerm);
    } catch (e) {
      setKanjiResults([]);
      setWordResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h1>Kanji Searcher</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a kanji or word"
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button onClick={() => handleSearch()}>Search</button>
      </div>
      <JLPTFilter selectedLevels={selectedLevels} onLevelChange={onLevelChange} />
      <SearchHistory history={history} onSelect={handleSearch} onClear={clearHistory} />
      {loading ? <div>로딩 중...</div> : (
        <>
          <KanjiList results={kanjiResults} />
          <WordList results={wordResults} />
        </>
      )}
    </div>
  );
};

export default SearchPage; 