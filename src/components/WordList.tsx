import React from 'react';
import './WordList.css';
import { extractKanjiFromWordObject, hasKanji, getUniqueKanji } from '../utils/kanjiExtractor';
import { formatJLPT } from '../utils/jlpt';
import { getWordKey } from '../hooks/useWordBank';
import type { WordData } from '../types/kanji';

interface WordListProps {
    results: WordData[];
    onWordClick?: (wordObj: WordData, extractedKanji: string) => void;
    selectedWord?: WordData | null;
}

const WordList: React.FC<WordListProps> = ({ results, onWordClick, selectedWord }) => {
    const selectedKey = selectedWord ? getWordKey(selectedWord) : null;

    const handleWordClick = (item: WordData) => {
        if (onWordClick && item) {
            try {
                const extractedKanji = extractKanjiFromWordObject(item);
                if (extractedKanji && extractedKanji.length > 0) {
                    onWordClick(item, extractedKanji);
                }
            } catch (error) {
                console.error('Error handling word click:', error);
            }
        }
    };

    if (results.length === 0) return <div>검색 결과가 없습니다.</div>;

    return (
        <div className='word-list'>
            {results.map((item, idx) => {
                // 데이터 구조 검증
                if (!item || typeof item !== 'object') {
                    console.warn(`Invalid item at index ${idx}:`, item);
                    return (
                        <div key={idx} className='word-card error'>
                            <h2>❌ 잘못된 데이터</h2>
                            <div>데이터 구조가 올바르지 않습니다.</div>
                        </div>
                    );
                }

                const kanjiText = extractKanjiFromWordObject(item);
                const isClickable = hasKanji(kanjiText);
                // 표기+읽기가 모두 같은 단어만 선택 표시 (읽기만 같은 동음이의어는 제외)
                const isSelected = selectedKey !== null && getWordKey(item) === selectedKey;

                return (
                    <div
                        key={idx}
                        className={`word-card ${isClickable ? 'clickable' : ''} ${
                            isSelected ? 'selected' : ''
                        }`}
                        onClick={() => isClickable && handleWordClick(item)}
                    >
                        <div className='word-card-content'>
                            <h2>
                                {item.japanese?.[0]?.word || item.japanese?.[0]?.reading || '읽기 없음'}
                            </h2>
                            <div className='reading'>
                                읽기:{' '}
                                {item.japanese
                                    ?.map((j) => j.reading)
                                    .filter(Boolean)
                                    .join(', ') || '읽기 없음'}
                            </div>
                            <div className='meaning'>
                                의미:{' '}
                                {item.senses
                                    ?.flatMap((sense) => sense.english_definitions || [])
                                    .filter(Boolean)
                                    .join(', ') || '의미 없음'}
                            </div>
                            <div className='jlpt'>JLPT: {item.jlpt?.[0] ? formatJLPT(item.jlpt[0]) : '정보 없음'}</div>
                        </div>
                        {isClickable && (
                            <div className='kanji-section'>
                                <div className='kanji-hint'>🔍 한자 분석: (클릭하여 상세보기)</div>
                                <div className='kanji-chars'>
                                    {getUniqueKanji(kanjiText).map(
                                        (char, charIdx) => (
                                            <button
                                                key={charIdx}
                                                className='kanji-char-btn'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onWordClick) {
                                                        onWordClick(item, char);
                                                    }
                                                }}
                                                title={`${char} 한자 정보 보기`}
                                            >
                                                {char}
                                            </button>
                                        )
                                    )}
                                    <button
                                        className='kanji-all-btn'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onWordClick) {
                                                onWordClick(item, kanjiText);
                                            }
                                        }}
                                        title='모든 한자 정보 보기'
                                    >
                                        전체
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default WordList;
