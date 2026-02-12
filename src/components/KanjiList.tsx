import React from 'react';
import './KanjiList.css';
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
        <div className='kanji-list'>
            {results.map((kanji, idx) => {
                const gifUrl = getKanjiStrokeGifUrl(kanji.kanji);
                return (
                    <div key={idx} className='kanji-card'>
                        <div className='kanji-info'>
                            <h2>{kanji.kanji}</h2>
                            <div className='stroke-gif'>
                                {gifUrl && <img src={gifUrl} alt={`${kanji.kanji} 획순`} />}
                            </div>
                            <div className='kanji-readings on'>
                                음독: {kanji.readings.on.join(', ')}
                            </div>
                            <div className='kanji-readings kun'>
                                훈독: {kanji.readings.kun.join(', ')}
                            </div>
                            <div className='kanji-meanings'>의미: {kanji.meanings.join(', ')}</div>
                            <div className='kanji-jlpt'>JLPT: {kanji.jlpt ?? '정보 없음'}</div>
                            <div className='kanji-stroke-count'>획수: {kanji.stroke_count}</div>
                            <div className='kanji-related-words'>
                                <strong>관련 단어:</strong>
                                <ul className='kanji-related-words-list'>
                                    {kanji.related_words.map((word, i) => (
                                        <li key={i}>
                                            {word.word} ({word.reading}) -{' '}
                                            {word.meanings.join(', ')}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KanjiList;
