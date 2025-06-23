import React, { useState } from 'react';
import JLPTFilter from '../components/JLPTFilter';
import KanjiList from '../components/KanjiList';
import WordList from '../components/WordList';
import SearchHistory from '../components/SearchHistory';
import VirtualKeyboard from '../components/VirtualKeyboard';
import Breadcrumb from '../components/Breadcrumb';
import RelatedWords from '../components/RelatedWords';
import { useJLPTFilter } from '../hooks/useJLPTFilter';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { useBreadcrumb } from '../hooks/useBreadcrumb';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [searchSource, setSearchSource] = useState<'manual' | 'word-click'>('manual');
  const { selectedLevels, onLevelChange, getActiveLevels } = useJLPTFilter();
  const { history, addToHistory, clearHistory, toggleFavorite, getFrequentItems, getFavorites } = useSearchHistory();
  const keyboard = useVirtualKeyboard();
  const breadcrumb = useBreadcrumb();

  const handleSearch = async (q?: string, source: 'manual' | 'word-click' = 'manual') => {
    const searchTerm = q ?? query;
    if (!searchTerm) return;
    setLoading(true);
    setSearchSource(source);
    
    try {
      // word-click이 아닌 경우에만 WordList 검색 (무한 루프 방지)
      if (source !== 'word-click') {
        const data = await searchKanji(searchTerm);
        setWordResults(data.data);
      }
      
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
      
      // 검색 히스토리에 추가 (manual 검색시에만)
      if (source === 'manual') {
        addToHistory(searchTerm);
        breadcrumb.addBreadcrumbItem(searchTerm, 'manual');
      }
    } catch {
      setKanjiResults([]);
      if (source !== 'word-click') {
        setWordResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Word card 클릭 핸들러
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWordClick = (wordObj: any, extractedKanji: string) => {
    setSelectedWord(wordObj);
    setQuery(extractedKanji);
    
    // 브레드크럼에 추가
    const isKanjiClick = extractedKanji.length === 1;
    breadcrumb.addBreadcrumbItem(
      extractedKanji, 
      isKanjiClick ? 'kanji-click' : 'word-click', 
      wordObj
    );
    
    handleSearch(extractedKanji, 'word-click');
    
    // 한자 결과로 스크롤 (검색 완료 후)
    setTimeout(() => {
      const kanjiSection = document.querySelector('.kanji-list');
      if (kanjiSection) {
        kanjiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  };

  // 새로운 manual 검색 시 선택된 word 초기화
  const handleManualSearch = (q?: string) => {
    setSelectedWord(null);
    handleSearch(q, 'manual');
  };

  // 브레드크럼 네비게이션 핸들러
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBreadcrumbClick = (item: any) => {
    const navigatedItem = breadcrumb.navigateToBreadcrumbItem(item);
    setQuery(navigatedItem.query);
    
    if (navigatedItem.type === 'word-click' || navigatedItem.type === 'kanji-click') {
      handleSearch(navigatedItem.query, 'word-click');
    } else {
      handleManualSearch(navigatedItem.query);
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
      <h1 className="search-page-title">Kanji Searcher</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a kanji or word"
          onKeyDown={(e) => { if (e.key === 'Enter') handleManualSearch(); }}
        />
        <button onClick={() => handleManualSearch()}>Search</button>
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
          🗾 일본어 키보드
        </button>
      </div>
      <JLPTFilter selectedLevels={selectedLevels} onLevelChange={onLevelChange} />
      <SearchHistory 
        history={history} 
        onSelect={(term) => handleManualSearch(term)} 
        onClear={clearHistory}
        onToggleFavorite={toggleFavorite}
        getFrequentItems={getFrequentItems}
        getFavorites={getFavorites}
      />
      <Breadcrumb 
        items={breadcrumb.breadcrumbItems} 
        onItemClick={handleBreadcrumbClick} 
        onClear={breadcrumb.clearBreadcrumb} 
      />
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            {searchSource === 'word-click' ? '한자 정보를 분석하는 중...' : '검색 중...'}
          </div>
        </div>
      ) : (
        <>
          {searchSource === 'word-click' && selectedWord && (
            <div className="selected-word-banner">
              📖 선택한 단어: <strong>{selectedWord.japanese?.[0]?.word || selectedWord.japanese?.[0]?.reading}</strong>의 한자 분석 결과
            </div>
          )}
          
          {kanjiResults.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                <h2>🔸 한자 상세 정보</h2>
                <span className="result-count">{kanjiResults.length}개 한자</span>
              </div>
              <KanjiList results={kanjiResults} />
              <RelatedWords 
                currentKanji={kanjiResults.map(k => k.kanji)}
                onWordClick={handleWordClick}
                currentJLPTLevels={getActiveLevels()}
              />
            </div>
          )}
          
          {wordResults.length > 0 && (
            <div className="results-section">
              <div className="section-header">
                <h2>📚 관련 단어</h2>
                <span className="result-count">{wordResults.length}개 단어</span>
              </div>
              <WordList results={wordResults} onWordClick={handleWordClick} selectedWord={selectedWord} />
            </div>
          )}
          
          {kanjiResults.length === 0 && wordResults.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>검색 결과가 없습니다</h3>
              <p>다른 키워드로 검색해보세요</p>
            </div>
          )}
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