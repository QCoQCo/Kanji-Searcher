import React, { useState } from 'react';
import JLPTFilter from '../components/JLPTFilter';
import KanjiList from '../components/KanjiList';
import WordList from '../components/WordList';
import SearchHistory from '../components/SearchHistory';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { useJLPTFilter } from '../hooks/useJLPTFilter';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { searchKanji, fetchKanjiInfo } from '../apis/jishoApi';
import type { KanjiData, JLPTLevel } from '../types/kanji';
import './SearchPage.css';

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

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [kanjiResults, setKanjiResults] = useState<KanjiData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wordResults, setWordResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedLevels, onLevelChange, getActiveLevels } = useJLPTFilter();
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const keyboard = useVirtualKeyboard();

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
    } catch {
      setKanjiResults([]);
      setWordResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyboardInput = () => {
    const fullText = keyboard.getFullText();
    setQuery(fullText);
  };

  // 키보드 입력이 변경될 때마다 query 업데이트
  React.useEffect(() => {
    if (keyboard.isVisible) {
      handleKeyboardInput();
    }
  }, [keyboard.convertedText, keyboard.inputBuffer, keyboard.isVisible]);

  return (
    <div className="search-page">
      <h1>Kanji Searcher</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a kanji or word"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button onClick={() => handleSearch()}>Search</button>
        <button 
          className="keyboard-toggle-btn"
          onClick={keyboard.toggleKeyboard}
          style={{
            background: keyboard.isVisible ? '#00ff88' : '#404040',
            color: keyboard.isVisible ? '#000' : '#fff',
            border: '1px solid #555',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          🗾 일본어
        </button>
      </div>
      <JLPTFilter selectedLevels={selectedLevels} onLevelChange={onLevelChange} />
      <SearchHistory history={history} onSelect={handleSearch} onClear={clearHistory} />
      {loading ? <div>로딩 중...</div> : (
        <>
          <KanjiList results={kanjiResults} />
          <WordList results={wordResults} />
        </>
      )}
      
      <VirtualKeyboard
        isVisible={keyboard.isVisible}
        inputBuffer={keyboard.inputBuffer}
        convertedText={keyboard.convertedText}
        onKeyPress={keyboard.addToBuffer}
        onBackspace={keyboard.backspace}
        onClear={keyboard.clear}
        onSpace={keyboard.space}
        onClose={() => {
          handleKeyboardInput();
          keyboard.hideKeyboard();
        }}
      />
    </div>
  );
};

export default SearchPage; 