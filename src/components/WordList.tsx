import React from 'react';
import './WordList.css';
import { extractKanjiFromWordObject, hasKanji, getUniqueKanji } from '../utils/kanjiExtractor';
import { formatJLPT } from '../utils/jlpt';
import type { JapaneseReading, Sense } from '../types/kanji';

interface WordListProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onWordClick?: (wordObj: any, extractedKanji: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedWord?: any;
}

const WordList: React.FC<WordListProps> = ({ results, onWordClick, selectedWord }) => {
    // 디버깅: 첫 번째 결과의 구조 확인
    // React.useEffect(() => {
    //   if (results.length > 0) {
    //     console.log('WordList - First result structure:', results[0]);
    //     console.log('WordList - All results:', results);
    //   }
    // }, [results]);

    // 테스트용 mock 데이터 (API가 작동하지 않을 때 사용)
    // const mockData = [
    //   {
    //     japanese: [
    //       { word: '水', reading: 'みず' }
    //     ],
    //     senses: [
    //       { english_definitions: ['water'] }
    //     ],
    //     jlpt: ['N5']
    //   },
    //   {
    //     japanese: [
    //       { word: '水曜日', reading: 'すいようび' }
    //     ],
    //     senses: [
    //       { english_definitions: ['Wednesday'] }
    //     ],
    //     jlpt: ['N5']
    //   }
    // ];

    // API 결과가 없으면 mock 데이터 사용 (테스트용)
    // const displayResults = results.length > 0 ? results : mockData;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleWordClick = (item: any) => {
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
                const isSelected =
                    selectedWord &&
                    (selectedWord.japanese?.[0]?.word === item.japanese?.[0]?.word ||
                        selectedWord.japanese?.[0]?.reading === item.japanese?.[0]?.reading);

                // 디버깅: 각 아이템의 데이터 확인
                // console.log(`Item ${idx}:`, {
                //   japanese: item.japanese,
                //   senses: item.senses,
                //   jlpt: item.jlpt,
                //   kanjiText,
                //   isClickable
                // });

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
                                    ?.map((j: JapaneseReading) => j.reading)
                                    .filter(Boolean)
                                    .join(', ') || '읽기 없음'}
                            </div>
                            <div className='meaning'>
                                의미:{' '}
                                {item.senses
                                    ?.flatMap((sense: Sense) => sense.english_definitions || [])
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
                                        (char: string, charIdx: number) => (
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
