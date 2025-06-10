import React from 'react';
import './WordList.css';

interface WordListProps {
  results: any[];
}

const WordList: React.FC<WordListProps> = ({ results }) => {
  if (results.length === 0) return <div>검색 결과가 없습니다.</div>;
  return (
    <div className="word-list">
      {results.map((item, idx) => (
        <div key={idx} className="word-card">
          <h2>{item.japanese[0]?.word || item.japanese[0]?.reading}</h2>
          <div>읽기: {item.japanese.map((j: any) => j.reading).join(', ')}</div>
          <div>의미: {item.senses.flatMap((sense: any) => sense.english_definitions).join(', ')}</div>
          <div>JLPT: {item.jlpt[0] ?? '정보 없음'}</div>
        </div>
      ))}
    </div>
  );
};

export default WordList; 