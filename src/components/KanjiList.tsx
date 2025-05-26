import React from 'react';
import type { KanjiData } from '../types/kanji';

function getKanjiStrokeGifUrl(kanji: string) {
  if (!kanji || kanji.length !== 1) return null;
  const codepoint = kanji.codePointAt(0)?.toString(16);
  return codepoint
    ? `https://raw.githubusercontent.com/mistval/kanji_images/master/gifs/${codepoint}.gif`
    : null;
}

interface KanjiListProps {
  results: KanjiData[];
}

const KanjiList: React.FC<KanjiListProps> = ({ results }) => {
  if (results.length === 0) return <div>검색 결과가 없습니다.</div>;
  return (
    <div className="kanji-list">
      {results.map((kanji, idx) => {
        const gifUrl = getKanjiStrokeGifUrl(kanji.kanji);
        return (
          <div key={idx} className="kanji-card">
            <h2>{kanji.kanji}</h2>
            {gifUrl && (
              <img src={gifUrl} alt={`${kanji.kanji} 획순`} style={{ width: 96, height: 96 }} />
            )}
            <div>음독: {kanji.readings.on.join(', ')}</div>
            <div>훈독: {kanji.readings.kun.join(', ')}</div>
            <div>의미: {kanji.meanings.join(', ')}</div>
            <div>JLPT: {kanji.jlpt ?? '정보 없음'}</div>
            <div>획수: {kanji.stroke_count}</div>
            <div>
              <strong>관련 단어:</strong>
              <ul>
                {kanji.related_words.map((word, i) => (
                  <li key={i}>
                    {word.word} ({word.reading}) - {word.meanings.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanjiList; 