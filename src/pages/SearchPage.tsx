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
import { useSearch } from '../hooks/useSearch';
import type { WordData } from '../types/kanji';
import './SearchPage.css';

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const { selectedLevels, onLevelChange, getActiveLevels } = useJLPTFilter();
    const {
        history,
        addToHistory,
        clearHistory,
        toggleFavorite,
        getFrequentItems,
        getFavorites,
        removeFromHistory,
        exportHistoryToJSON,
        importHistoryFromJSON,
    } = useSearchHistory();
    const keyboard = useVirtualKeyboard();
    const breadcrumb = useBreadcrumb();

    const {
        kanjiResults,
        wordResults,
        loading,
        selectedWord,
        searchSource,
        handleSearch,
        handleWordClick,
        handleManualSearch,
    } = useSearch(getActiveLevels, (query, source) => {
        if (source === 'manual') {
            addToHistory(query);
            breadcrumb.addBreadcrumbItem(query, 'manual');
        }
    });

    // Word card 클릭 핸들러
    const handleWordClickWrapper = (wordObj: WordData, extractedKanji: string) => {
        setQuery(extractedKanji);

        // 브레드크럼에 추가
        const isKanjiClick = extractedKanji.length === 1;
        breadcrumb.addBreadcrumbItem(
            extractedKanji,
            isKanjiClick ? 'kanji-click' : 'word-click',
            wordObj
        );

        handleWordClick(wordObj, extractedKanji);

        // 한자 결과로 스크롤 (검색 완료 후)
        setTimeout(() => {
            const kanjiSection = document.querySelector('.kanji-list');
            if (kanjiSection) {
                kanjiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    };

    // 새로운 manual 검색 시 선택된 word 초기화
    const handleManualSearchWrapper = (q?: string) => {
        handleManualSearch(q || query);
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
        <div className='search-page'>
            <div style={{ display: 'flex', gap: 16 }}>
                <input
                    type='text'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Search for a kanji or word'
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleManualSearchWrapper();
                    }}
                />
                <button className='search-btn' onClick={() => handleManualSearchWrapper()}>
                    Search
                </button>
                <button
                    className='keyboard-toggle-btn'
                    onClick={keyboard.toggleKeyboard}
                    style={{
                        background: keyboard.isVisible ? '#00ff88' : '#404040',
                        color: keyboard.isVisible ? '#000' : '#fff',
                        border: '1px solid #555',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
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
                onRemove={removeFromHistory}
                onExport={exportHistoryToJSON}
                onImport={importHistoryFromJSON}
            />
            <Breadcrumb
                items={breadcrumb.breadcrumbItems}
                onItemClick={handleBreadcrumbClick}
                onClear={breadcrumb.clearBreadcrumb}
            />
            {loading ? (
                <div className='loading-container'>
                    <div className='loading-spinner'></div>
                    <div className='loading-text'>
                        {searchSource === 'word-click'
                            ? '한자 정보를 분석하는 중...'
                            : '검색 중...'}
                    </div>
                </div>
            ) : (
                <>
                    {searchSource === 'word-click' && selectedWord && (
                        <div className='selected-word-banner'>
                            📖 선택한 단어:{' '}
                            <strong>
                                {selectedWord.japanese?.[0]?.word ||
                                    selectedWord.japanese?.[0]?.reading}
                            </strong>
                            의 한자 분석 결과
                        </div>
                    )}

                    {kanjiResults.length > 0 && (
                        <div className='results-section'>
                            <div className='section-header'>
                                <h2>🔸 한자 상세 정보</h2>
                                <span className='result-count'>{kanjiResults.length}개 한자</span>
                            </div>
                            <KanjiList results={kanjiResults} />
                            <RelatedWords
                                currentKanji={kanjiResults.map((k) => k.kanji)}
                                onWordClick={handleWordClick}
                                currentJLPTLevels={getActiveLevels()}
                            />
                        </div>
                    )}

                    {wordResults.length > 0 && (
                        <div className='results-section'>
                            <div className='section-header'>
                                <h2>📚 관련 단어</h2>
                                <span className='result-count'>{wordResults.length}개 단어</span>
                            </div>
                            <WordList
                                results={wordResults}
                                onWordClick={handleWordClickWrapper}
                                selectedWord={selectedWord}
                            />
                        </div>
                    )}

                    {kanjiResults.length === 0 && wordResults.length === 0 && (
                        <div className='no-results'>
                            <div className='no-results-icon'>🔍</div>
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
                activeKey={keyboard.activeKey}
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
