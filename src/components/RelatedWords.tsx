import React, { useState, useEffect } from 'react';
import './RelatedWords.css';
import { searchKanji } from '../apis/jishoApi';
import { extractKanjiFromWordObject, hasKanji } from '../utils/kanjiExtractor';
import type { WordData } from '../types/kanji';

interface RelatedWordsProps {
  currentKanji: string[];
  onWordClick: (wordObj: WordData, extractedKanji: string) => void;
  currentJLPTLevels: string[];
}

const RelatedWords: React.FC<RelatedWordsProps> = ({ 
  currentKanji, 
  onWordClick, 
  currentJLPTLevels 
}) => {
  const [recommendations, setRecommendations] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'kanji' | 'jlpt'>('kanji');

  useEffect(() => {
    if (currentKanji.length > 0) {
      fetchRelatedWords();
    }
  }, [currentKanji]);

  const fetchRelatedWords = async () => {
    if (currentKanji.length === 0) return;
    
    setLoading(true);
    try {
      const relatedWords = new Set();
      
      // 각 한자로 검색하여 관련 단어 수집
      for (const kanji of currentKanji.slice(0, 3)) { // 최대 3개 한자만 검색
                 try {
           const data = await searchKanji(kanji);
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           data.data.forEach((word: any) => {
            // 현재 검색에서 나온 단어들과 중복 제거
            const kanjiInWord = extractKanjiFromWordObject(word);
            if (hasKanji(kanjiInWord) && relatedWords.size < 12) {
              relatedWords.add(JSON.stringify(word));
            }
          });
        } catch (error) {
          console.error(`Error fetching related words for ${kanji}:`, error);
        }
      }
      
      const uniqueWords = Array.from(relatedWords)
        .map(wordStr => JSON.parse(wordStr as string))
        .filter(word => {
          // JLPT 레벨 필터링
          if (currentJLPTLevels.length > 0) {
            return word.jlpt && Array.isArray(word.jlpt) && word.jlpt.some((level: string) => 
              currentJLPTLevels.includes(level)
            );
          }
          return true;
        })
        .slice(0, 8); // 최대 8개만 표시
      
      setRecommendations(uniqueWords);
    } catch (error) {
      console.error('Error fetching related words:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWordClick = (word: any) => {
    if (!word) return;
    
    try {
      const extractedKanji = extractKanjiFromWordObject(word);
      if (extractedKanji && extractedKanji.length > 0) {
        onWordClick(word, extractedKanji);
      }
    } catch (error) {
      console.error('Error handling related word click:', error);
    }
  };

  if (currentKanji.length === 0) return null;

  return (
    <div className="related-words-container">
      <div className="related-words-header">
        <h3>💡 추천 단어</h3>
        <div className="related-words-tabs">
          <button 
            className={`tab-btn ${activeTab === 'kanji' ? 'active' : ''}`}
            onClick={() => setActiveTab('kanji')}
          >
            🔸 한자 기반
          </button>
          <button 
            className={`tab-btn ${activeTab === 'jlpt' ? 'active' : ''}`}
            onClick={() => setActiveTab('jlpt')}
          >
            📊 JLPT 레벨
          </button>
        </div>
      </div>

      {loading ? (
        <div className="related-words-loading">
          <div className="mini-spinner"></div>
          <span>관련 단어 검색 중...</span>
        </div>
      ) : (
        <div className="related-words-content">
          {activeTab === 'kanji' && (
            <div className="kanji-recommendations">
              <p className="recommendation-desc">
                현재 한자 <strong>{currentKanji.join(', ')}</strong>와 관련된 단어들
              </p>
              <div className="recommendation-grid">
                {recommendations.map((word, idx) => (
                  <button
                    key={idx}
                    className="recommendation-card"
                    onClick={() => handleWordClick(word)}
                  >
                    <div className="rec-word">
                      {word.japanese?.[0]?.word || word.japanese?.[0]?.reading || '읽기 없음'}
                    </div>
                    <div className="rec-reading">
                      {word.japanese?.[0]?.reading || '읽기 없음'}
                    </div>
                    <div className="rec-meaning">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {word.senses?.flatMap((sense: any) => sense.english_definitions || []).filter(Boolean).slice(0, 2).join(', ') || '의미 없음'}
                    </div>
                    {word.jlpt?.[0] && (
                      <span className="rec-jlpt">{word.jlpt[0]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jlpt' && (
            <div className="jlpt-recommendations">
              <p className="recommendation-desc">
                현재 JLPT 레벨에서 학습하면 좋은 단어들
              </p>
              <div className="jlpt-stats">
                {currentJLPTLevels.map(level => (
                  <span key={level} className={`jlpt-badge jlpt-${level.toLowerCase()}`}>
                    {level}
                  </span>
                ))}
              </div>
              <div className="recommendation-grid">
                {recommendations
                  .filter(word => word.jlpt && word.jlpt.length > 0)
                  .map((word, idx) => (
                    <button
                      key={idx}
                      className="recommendation-card"
                      onClick={() => handleWordClick(word)}
                    >
                      <div className="rec-word">
                        {word.japanese[0]?.word || word.japanese[0]?.reading}
                      </div>
                      <div className="rec-reading">
                        {word.japanese[0]?.reading}
                      </div>
                      <div className="rec-meaning">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {word.senses.flatMap((sense: any) => sense.english_definitions).slice(0, 2).join(', ')}
                      </div>
                      <span className="rec-jlpt">{word.jlpt?.[0]}</span>
                    </button>
                  ))
                }
              </div>
            </div>
          )}

          {recommendations.length === 0 && !loading && (
            <div className="no-recommendations">
              <div className="no-rec-icon">🤔</div>
              <p>관련 단어를 찾을 수 없습니다</p>
              <small>다른 한자나 단어로 검색해보세요</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelatedWords; 