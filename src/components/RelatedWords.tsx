import React, { useState, useEffect } from 'react';
import './RelatedWords.css';
import { searchKanji } from '../apis/jishoApi';
import { extractKanjiFromWordObject } from '../utils/kanjiExtractor';
import { formatJLPT, matchesJLPTLevels } from '../utils/jlpt';
import { getWordKey } from '../hooks/useWordBank';
import type { WordData } from '../types/kanji';

interface RelatedWordsProps {
    currentKanji: string[];
    onWordClick: (wordObj: WordData, extractedKanji: string) => void;
    currentJLPTLevels: string[];
}

const RelatedWords: React.FC<RelatedWordsProps> = ({
    currentKanji,
    onWordClick,
    currentJLPTLevels,
}) => {
    const [recommendations, setRecommendations] = useState<WordData[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'kanji' | 'jlpt'>('kanji');

    // 부모가 렌더마다 새 배열을 넘겨도 내용이 같으면 재요청하지 않도록 원시값 키로 비교
    const kanjiKey = currentKanji.join('');
    const levelsKey = currentJLPTLevels.join(',');

    useEffect(() => {
        if (!kanjiKey) return;

        let cancelled = false;
        const kanjiList = Array.from(kanjiKey).slice(0, 3); // 최대 3개 한자만 검색
        const levels = levelsKey ? levelsKey.split(',') : [];

        const fetchRelatedWords = async () => {
            setLoading(true);

            // 각 한자로 병렬 검색하여 관련 단어 수집
            const results = await Promise.all(
                kanjiList.map(async (kanji) => {
                    try {
                        const data = await searchKanji(kanji);
                        return (data.data || []) as WordData[];
                    } catch (error) {
                        console.error(`Error fetching related words for ${kanji}:`, error);
                        return [];
                    }
                })
            );

            // 더 최신 요청이 시작됐으면 이 결과는 버림
            if (cancelled) return;

            const uniqueWords = new Map<string, WordData>();
            for (const word of results.flat()) {
                if (extractKanjiFromWordObject(word).length === 0) continue;
                // JLPT 레벨 필터링 (선택된 레벨이 없으면 전체 허용)
                if (levels.length > 0 && !matchesJLPTLevels(word.jlpt, levels)) continue;
                uniqueWords.set(getWordKey(word), word);
            }

            setRecommendations(Array.from(uniqueWords.values()).slice(0, 8)); // 최대 8개만 표시
            setLoading(false);
        };

        fetchRelatedWords();

        return () => {
            cancelled = true;
        };
    }, [kanjiKey, levelsKey]);

    const handleWordClick = (word: WordData) => {
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
        <div className='related-words-container'>
            <div className='related-words-header'>
                <h3>💡 추천 단어</h3>
                <div className='related-words-tabs'>
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
                <div className='related-words-loading'>
                    <div className='mini-spinner'></div>
                    <span>관련 단어 검색 중...</span>
                </div>
            ) : (
                <div className='related-words-content'>
                    {activeTab === 'kanji' && (
                        <div className='kanji-recommendations'>
                            <p className='recommendation-desc'>
                                현재 한자 <strong>{currentKanji.join(', ')}</strong>와 관련된 단어들
                            </p>
                            <div className='recommendation-grid'>
                                {recommendations.map((word, idx) => (
                                    <button
                                        key={idx}
                                        className='recommendation-card'
                                        onClick={() => handleWordClick(word)}
                                    >
                                        <div className='rec-word'>
                                            {word.japanese?.[0]?.word ||
                                                word.japanese?.[0]?.reading ||
                                                '읽기 없음'}
                                        </div>
                                        <div className='rec-reading'>
                                            {word.japanese?.[0]?.reading || '읽기 없음'}
                                        </div>
                                        <div className='rec-meaning'>
                                            {word.senses
                                                ?.flatMap((sense) => sense.english_definitions || [])
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .join(', ') || '의미 없음'}
                                        </div>
                                        {word.jlpt?.[0] && (
                                            <span className='rec-jlpt'>{formatJLPT(word.jlpt[0])}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'jlpt' && (
                        <div className='jlpt-recommendations'>
                            <p className='recommendation-desc'>
                                현재 JLPT 레벨에서 학습하면 좋은 단어들
                            </p>
                            <div className='jlpt-stats'>
                                {currentJLPTLevels.map((level) => (
                                    <span
                                        key={level}
                                        className={`jlpt-badge jlpt-${level.toLowerCase()}`}
                                    >
                                        {level}
                                    </span>
                                ))}
                            </div>
                            <div className='recommendation-grid'>
                                {recommendations
                                    .filter((word) => word.jlpt && word.jlpt.length > 0)
                                    .map((word, idx) => (
                                        <button
                                            key={idx}
                                            className='recommendation-card'
                                            onClick={() => handleWordClick(word)}
                                        >
                                            <div className='rec-word'>
                                                {word.japanese[0]?.word ||
                                                    word.japanese[0]?.reading}
                                            </div>
                                            <div className='rec-reading'>
                                                {word.japanese[0]?.reading}
                                            </div>
                                            <div className='rec-meaning'>
                                                {word.senses
                                                    .flatMap((sense) => sense.english_definitions)
                                                    .slice(0, 2)
                                                    .join(', ')}
                                            </div>
                                            <span className='rec-jlpt'>
                                                {word.jlpt?.[0] && formatJLPT(word.jlpt[0])}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}

                    {recommendations.length === 0 && !loading && (
                        <div className='no-recommendations'>
                            <div className='no-rec-icon'>🤔</div>
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
