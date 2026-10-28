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
import type { BreadcrumbItem, WordData } from '../types/kanji';
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
        hasSearched,
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
        const isKanjiClick = Array.from(extractedKanji).length === 1; // 확장 영역 한자(서로게이트 쌍) 대응
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

    // 검색 기록 클릭: 검색창에도 해당 검색어를 채운 뒤 검색
    const handleHistorySelect = (term: string) => {
        setQuery(term);
        handleManualSearchWrapper(term);
    };

    // 브레드크럼 네비게이션 핸들러
    const handleBreadcrumbClick = (item: BreadcrumbItem) => {
        const navigatedItem = breadcrumb.navigateToBreadcrumbItem(item);
        setQuery(navigatedItem.query);

        if (navigatedItem.type === 'word-click' || navigatedItem.type === 'kanji-click') {
            if (navigatedItem.word) {
                // 당시 클릭한 단어를 선택 단어로 복원 (다른 단어의 배너가 남지 않도록)
                handleWordClick(navigatedItem.word, navigatedItem.query);
            } else {
                handleSearch(navigatedItem.query, 'word-click');
            }
        } else {
            // 되돌아가는 것이므로 검색 기록 횟수를 늘리지 않음
            handleManualSearch(navigatedItem.query, { silent: true });
        }
    };

    const handleKeyboardInput = () => {
        const fullText = keyboard.getFullText();
        setQuery(fullText);
    };

    // 키보드를 열 때 현재 검색어를 넘겨서 이어서 편집 (빈 키보드 텍스트로 검색어가 지워지지 않게)
    const handleKeyboardToggle = () => {
        if (!keyboard.isVisible) {
            keyboard.setText(query);
        }
        keyboard.toggleKeyboard();
    };

    // 키보드 입력이 변경될 때마다 query 업데이트 (getFullText는 키보드 텍스트가 바뀔 때만 새로 만들어짐)
    const { isVisible: isKeyboardVisible, getFullText } = keyboard;
    React.useEffect(() => {
        if (isKeyboardVisible) {
            setQuery(getFullText());
        }
    }, [isKeyboardVisible, getFullText]);

    return (
        <div className='search-page'>
            <div className='search-bar'>
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
                    className={`keyboard-toggle-btn ${keyboard.isVisible ? 'active' : ''}`}
                    onClick={handleKeyboardToggle}
                >
                    🗾 일본어 키보드
                </button>
            </div>
            <JLPTFilter selectedLevels={selectedLevels} onLevelChange={onLevelChange} />
            <SearchHistory
                history={history}
                onSelect={handleHistorySelect}
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
                                onWordClick={handleWordClickWrapper}
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

                    {kanjiResults.length === 0 &&
                        wordResults.length === 0 &&
                        (hasSearched ? (
                            <div className='no-results'>
                                <div className='no-results-icon'>🔍</div>
                                <h3>검색 결과가 없습니다</h3>
                                <p>다른 키워드로 검색해보세요</p>
                            </div>
                        ) : (
                            <div className='no-results'>
                                <div className='no-results-icon'>🈁</div>
                                <h3>한자나 단어를 검색해보세요</h3>
                                <p>예: 水, 日本語, たべる, water</p>
                            </div>
                        ))}
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
