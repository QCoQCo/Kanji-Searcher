import React from 'react';
import { useRandomWords } from '../hooks/useRandomWords';
import type { JLPTLevel } from '../types/kanji';
import './RandomWordsPage.css';

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

const RandomWordsPage: React.FC = () => {
    const {
        selectedLevel,
        wordPoolMode,
        currentWord,
        isLoading,
        error,
        loadingProgress,
        changeLevel,
        changeMode,
        getRandomWord,
        reload,
        totalWords,
    } = useRandomWords({ mode: 'comprehensive' }); // 기본적으로 포괄적 모드 사용

    const formatPartOfSpeech = (partsOfSpeech?: string[]) => {
        if (!partsOfSpeech || partsOfSpeech.length === 0) return '';
        return partsOfSpeech.map((pos) => pos.replace(/-/g, ' ')).join(', ');
    };

    return (
        <div className='random-words-page'>
            <div className='random-words-container'>
                <header className='page-header'>
                    <h1>Japanese Random Words</h1>
                    <p className='subtitle'>Practice with random vocabulary from various sources</p>
                </header>

                <div className='mode-selector'>
                    <h3>Word Pool Mode:</h3>
                    <div className='mode-buttons'>
                        <button
                            onClick={() => changeMode('comprehensive')}
                            className={`mode-button ${
                                wordPoolMode === 'comprehensive' ? 'active' : ''
                            }`}
                            disabled={isLoading}
                        >
                            🌐 Comprehensive (All Words)
                        </button>
                        <button
                            onClick={() => changeMode('jlpt')}
                            className={`mode-button ${wordPoolMode === 'jlpt' ? 'active' : ''}`}
                            disabled={isLoading}
                        >
                            📚 JLPT Only
                        </button>
                    </div>
                    <p className='mode-description'>
                        {wordPoolMode === 'comprehensive'
                            ? 'Access thousands of words from various categories and sources'
                            : 'Focus on JLPT-tagged vocabulary for test preparation'}
                    </p>
                </div>

                {wordPoolMode === 'jlpt' && (
                    <div className='level-selector'>
                        <h3>Select JLPT Level:</h3>
                        <div className='level-buttons'>
                            {JLPT_LEVELS.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => changeLevel(level)}
                                    className={`level-button ${
                                        selectedLevel === level ? 'active' : ''
                                    }`}
                                    disabled={isLoading}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {totalWords > 0 && (
                    <div className='word-pool-info'>
                        <p className='total-words'>
                            📖 Total words available: <strong>{totalWords.toLocaleString()}</strong>
                        </p>
                        {wordPoolMode === 'comprehensive' && (
                            <p className='pool-description'>
                                Sourced from JLPT levels, common vocabulary, categories, and more
                            </p>
                        )}
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
                        <p>{loadingProgress || 'Loading vocabulary...'}</p>
                        {wordPoolMode === 'comprehensive' && (
                            <p className='loading-note'>
                                This may take a moment as we gather words from multiple sources
                            </p>
                        )}
                    </div>
                ) : currentWord ? (
                    <div className='word-display'>
                        <div className='word-main'>
                            <div className='japanese-text'>
                                {currentWord.japanese.map((jp, index) => (
                                    <div key={index} className='japanese-item'>
                                        {jp.word && (
                                            <span className='japanese-word'>{jp.word}</span>
                                        )}
                                        <span className='japanese-reading'>{jp.reading}</span>
                                    </div>
                                ))}
                            </div>

                            <div className='word-meanings'>
                                {currentWord.senses.map((sense, index) => (
                                    <div key={index} className='sense-group'>
                                        <div className='definitions'>
                                            {sense.english_definitions.map((def, defIndex) => (
                                                <span key={defIndex} className='definition'>
                                                    {defIndex > 0 && ', '}
                                                    {def}
                                                </span>
                                            ))}
                                        </div>
                                        {sense.parts_of_speech &&
                                            sense.parts_of_speech.length > 0 && (
                                                <div className='part-of-speech'>
                                                    ({formatPartOfSpeech(sense.parts_of_speech)})
                                                </div>
                                            )}
                                        {sense.tags && sense.tags.length > 0 && (
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

                            {currentWord.jlpt && currentWord.jlpt.length > 0 && (
                                <div className='jlpt-tags'>
                                    {currentWord.jlpt.map((level, index) => (
                                        <span key={index} className='jlpt-tag'>
                                            {level.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className='word-actions'>
                            <button
                                onClick={getRandomWord}
                                className='next-word-button'
                                disabled={isLoading}
                            >
                                🎲 Get New Word
                            </button>
                        </div>
                    </div>
                ) : (
                    !error && (
                        <div className='no-words'>
                            <p>
                                No words found for{' '}
                                {wordPoolMode === 'jlpt'
                                    ? `${selectedLevel} level`
                                    : 'comprehensive search'}
                                .
                            </p>
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
