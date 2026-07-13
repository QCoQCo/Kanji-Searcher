import React, { useState } from 'react';
import type { WordData } from '../types/kanji';
import './WordCard.css';

export type CardDisplayMode = 'full' | 'flashcard';
export type CardFront = 'word' | 'meaning';

interface WordCardProps {
    word: WordData;
    mode: CardDisplayMode;
    front: CardFront;
    isSaved: boolean;
    onToggleSave: () => void;
}

const formatPartOfSpeech = (partsOfSpeech?: string[]) => {
    if (!partsOfSpeech || partsOfSpeech.length === 0) return '';
    return partsOfSpeech.map((pos) => pos.replace(/-/g, ' ')).join(', ');
};

const WordCard: React.FC<WordCardProps> = ({ word, mode, front, isSaved, onToggleSave }) => {
    const [revealed, setRevealed] = useState(false);

    const isFlashcard = mode === 'flashcard';
    const showAll = !isFlashcard || revealed;
    const showJapanese = showAll || front === 'word';
    const showMeanings = showAll || front === 'meaning';

    const handleCardClick = () => {
        if (isFlashcard) {
            setRevealed((prev) => !prev);
        }
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 플래시카드 뒤집힘 방지
        onToggleSave();
    };

    return (
        <div
            className={`word-card ${isFlashcard ? 'flashcard' : ''}`}
            onClick={handleCardClick}
        >
            <button
                onClick={handleSaveClick}
                className={`card-save-button ${isSaved ? 'saved' : ''}`}
                aria-label={isSaved ? 'Remove from word bank' : 'Save to word bank'}
            >
                {isSaved ? '★' : '☆'}
            </button>

            {showJapanese && (
                <div className='japanese-text'>
                    {word.japanese.map((jp, index) => {
                        // 단어 앞면에서는 읽기도 가림 (한자 읽기 연습) — 가나 전용 단어는 읽기가 곧 표기이므로 표시
                        const hideReading =
                            isFlashcard && !revealed && front === 'word' && !!jp.word;
                        return (
                            <div key={index} className='japanese-item'>
                                {jp.word && <span className='japanese-word'>{jp.word}</span>}
                                {!hideReading && (
                                    <span className='japanese-reading'>{jp.reading}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showMeanings && (
                <div className='word-meanings'>
                    {word.senses.map((sense, index) => (
                        <div key={index} className='sense-group'>
                            <div className='definitions'>
                                {sense.english_definitions.map((def, defIndex) => (
                                    <span key={defIndex} className='definition'>
                                        {defIndex > 0 && ', '}
                                        {def}
                                    </span>
                                ))}
                            </div>
                            {showAll &&
                                sense.parts_of_speech &&
                                sense.parts_of_speech.length > 0 && (
                                    <div className='part-of-speech'>
                                        ({formatPartOfSpeech(sense.parts_of_speech)})
                                    </div>
                                )}
                            {showAll && sense.tags && sense.tags.length > 0 && (
                                <div className='word-tags'>
                                    {sense.tags.map((tag, tagIndex) => (
                                        <span key={tagIndex} className='tag'>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showAll && word.jlpt && word.jlpt.length > 0 && (
                <div className='jlpt-tags'>
                    {word.jlpt.map((level, index) => (
                        <span key={index} className='jlpt-tag'>
                            {level.toUpperCase()}
                        </span>
                    ))}
                </div>
            )}

            {isFlashcard && !revealed && <div className='flashcard-hint'>Tap to reveal</div>}
        </div>
    );
};

export default WordCard;
