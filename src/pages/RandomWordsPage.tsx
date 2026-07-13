import React, { useState } from 'react';
import { useRandomWords } from '../hooks/useRandomWords';
import { useWordBank, getWordKey } from '../hooks/useWordBank';
import WordCard from '../components/WordCard';
import type { CardDisplayMode, CardFront } from '../components/WordCard';
import type { JLPTLevel } from '../types/kanji';
import './RandomWordsPage.css';

const JLPT_LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];
const COUNT_OPTIONS = [1, 3, 5, 10];

const RandomWordsPage: React.FC = () => {
    const {
        selectedLevels,
        displayCount,
        setDisplayCount,
        currentWords,
        isLoading,
        error,
        toggleLevel,
        drawNextWords,
        reload,
        totalWords,
    } = useRandomWords();

    const { isSaved, toggleWord } = useWordBank();

    const [displayMode, setDisplayMode] = useState<CardDisplayMode>('full');
    const [cardFront, setCardFront] = useState<CardFront>('word');

    return (
        <div className='random-words-page'>
            <div className='random-words-container'>
                <header className='page-header'>
                    <h1>Japanese Random Words</h1>
                    <p className='subtitle'>Practice with random JLPT vocabulary</p>
                </header>

                <div className='level-selector'>
                    <h3>Select JLPT Levels:</h3>
                    <div className='level-buttons'>
                        {JLPT_LEVELS.map((level) => (
                            <button
                                key={level}
                                onClick={() => toggleLevel(level)}
                                className={`level-button ${
                                    selectedLevels.includes(level) ? 'active' : ''
                                }`}
                                disabled={isLoading}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <p className='level-description'>
                        Combine multiple levels to build your word pool
                    </p>
                </div>

                <div className='display-controls'>
                    <div className='control-group'>
                        <span className='control-label'>Display:</span>
                        <button
                            onClick={() => setDisplayMode('full')}
                            className={`control-button ${displayMode === 'full' ? 'active' : ''}`}
                        >
                            Full
                        </button>
                        <button
                            onClick={() => setDisplayMode('flashcard')}
                            className={`control-button ${
                                displayMode === 'flashcard' ? 'active' : ''
                            }`}
                        >
                            Flashcard
                        </button>
                    </div>

                    {displayMode === 'flashcard' && (
                        <div className='control-group'>
                            <span className='control-label'>Front:</span>
                            <button
                                onClick={() => setCardFront('word')}
                                className={`control-button ${cardFront === 'word' ? 'active' : ''}`}
                            >
                                Word
                            </button>
                            <button
                                onClick={() => setCardFront('meaning')}
                                className={`control-button ${
                                    cardFront === 'meaning' ? 'active' : ''
                                }`}
                            >
                                Meaning
                            </button>
                        </div>
                    )}

                    <div className='control-group'>
                        <span className='control-label'>Count:</span>
                        {COUNT_OPTIONS.map((count) => (
                            <button
                                key={count}
                                onClick={() => setDisplayCount(count)}
                                className={`control-button ${
                                    displayCount === count ? 'active' : ''
                                }`}
                                disabled={isLoading}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                {totalWords > 0 && (
                    <div className='word-pool-info'>
                        <p className='total-words'>
                            📖 Total words available: <strong>{totalWords.toLocaleString()}</strong>
                        </p>
                    </div>
                )}

                {error && (
                    <div className='error-message'>
                        <p>{error}</p>
                        <button onClick={reload} className='retry-button'>
                            Try Again
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className='loading-container'>
                        <div className='loading-spinner'></div>
                        <p>Loading vocabulary...</p>
                    </div>
                ) : currentWords.length > 0 ? (
                    <>
                        <div className={`words-grid ${currentWords.length > 1 ? 'multi' : ''}`}>
                            {currentWords.map((word) => (
                                <WordCard
                                    key={`${getWordKey(word)}-${displayMode}-${cardFront}`}
                                    word={word}
                                    mode={displayMode}
                                    front={cardFront}
                                    isSaved={isSaved(word)}
                                    onToggleSave={() => toggleWord(word)}
                                />
                            ))}
                        </div>

                        <div className='word-actions'>
                            <button
                                onClick={drawNextWords}
                                className='next-word-button'
                                disabled={isLoading}
                            >
                                {displayCount === 1 ? '🎲 Get New Word' : '🎲 Get New Words'}
                            </button>
                        </div>
                    </>
                ) : (
                    !error && (
                        <div className='no-words'>
                            <p>No words found for {selectedLevels.join(', ')}.</p>
                            <button onClick={reload} className='retry-button'>
                                Try Again
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RandomWordsPage;
