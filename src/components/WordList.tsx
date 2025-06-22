import React from 'react';
import './WordList.css';
import { extractKanjiFromWordObject, hasKanji, getUniqueKanji } from '../utils/kanjiExtractor';

interface WordListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWordClick?: (wordObj: any, extractedKanji: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedWord?: any;
}

const WordList: React.FC<WordListProps> = ({ results, onWordClick, selectedWord }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWordClick = (item: any) => {
    if (onWordClick) {
      const extractedKanji = extractKanjiFromWordObject(item);
      if (extractedKanji) {
        onWordClick(item, extractedKanji);
      }
    }
  };

  if (results.length === 0) return <div>검색 결과가 없습니다.</div>;
  
  return (
    <div className="word-list">
      {results.map((item, idx) => {
        const kanjiText = extractKanjiFromWordObject(item);
        const isClickable = hasKanji(kanjiText);
        const isSelected = selectedWord && 
          (selectedWord.japanese?.[0]?.word === item.japanese?.[0]?.word ||
           selectedWord.japanese?.[0]?.reading === item.japanese?.[0]?.reading);
        
        return (
          <div 
            key={idx} 
            className={`word-card ${isClickable ? 'clickable' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => isClickable && handleWordClick(item)}
          >
            <h2>{item.japanese[0]?.word || item.japanese[0]?.reading}</h2>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <div>읽기: {item.japanese.map((j: any) => j.reading).join(', ')}</div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <div>의미: {item.senses.flatMap((sense: any) => sense.english_definitions).join(', ')}</div>
            <div>JLPT: {item.jlpt[0] ?? '정보 없음'}</div>
            {isClickable && (
              <div className="kanji-section">
                <div className="kanji-hint">
                  🔍 한자 분석: (클릭하여 상세보기)
                </div>
                <div className="kanji-chars">
                  {getUniqueKanji(kanjiText).map((char: string, charIdx: number) => (
                    <button
                      key={charIdx}
                      className="kanji-char-btn"
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
                  ))}
                  <button
                    className="kanji-all-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onWordClick) {
                        onWordClick(item, kanjiText);
                      }
                    }}
                    title="모든 한자 정보 보기"
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