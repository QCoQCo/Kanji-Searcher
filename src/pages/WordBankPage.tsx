import React from 'react';
import { Link } from 'react-router-dom';
import { useWordBank } from '../hooks/useWordBank';
import './WordBankPage.css';

const WordBankPage: React.FC = () => {
    const { items, removeWord, clearAll, totalSaved } = useWordBank();

    const exportToJson = () => {
        const data = JSON.stringify(
            items.map((item) => item.word),
            null,
            2,
        );
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'word-bank.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAll = () => {
        if (window.confirm('Remove all saved words?')) {
            clearAll();
        }
    };

    return (
        <div className='word-bank-page'>
            <div className='word-bank-container'>
                <header className='page-header'>
                    <h1>Word Bank</h1>
                    <p className='subtitle'>
                        {totalSaved > 0
                            ? `${totalSaved.toLocaleString()} saved word${totalSaved > 1 ? 's' : ''}`
                            : 'Your saved vocabulary'}
                    </p>
                </header>

                {totalSaved > 0 ? (
                    <>
                        <div className='word-bank-actions'>
                            <button onClick={exportToJson} className='export-button'>
                                ⬇️ Export JSON
                            </button>
                            <button onClick={handleClearAll} className='clear-button'>
                                🗑️ Clear All
                            </button>
                        </div>

                        <ul className='word-bank-list'>
                            {items.map((item) => {
                                const jp = item.word.japanese[0];
                                const definitions = item.word.senses
                                    .flatMap((sense) => sense.english_definitions)
                                    .join(', ');
                                return (
                                    <li key={item.key} className='word-bank-item'>
                                        <div className='word-bank-japanese'>
                                            {jp?.word && (
                                                <span className='word-bank-word'>{jp.word}</span>
                                            )}
                                            <span className='word-bank-reading'>{jp?.reading}</span>
                                        </div>
                                        <div className='word-bank-meanings'>{definitions}</div>
                                        {item.word.jlpt && item.word.jlpt.length > 0 && (
                                            <div className='word-bank-jlpt'>
                                                {item.word.jlpt.map((level, index) => (
                                                    <span key={index} className='jlpt-tag'>
                                                        {level.toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeWord(item.key)}
                                            className='remove-button'
                                            aria-label='Remove word'
                                        >
                                            ✕
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                ) : (
                    <div className='word-bank-empty'>
                        <p>No saved words yet.</p>
                        <p>
                            Save words with the ⭐ button on the{' '}
                            <Link to='/random-words'>Random Words</Link> page.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordBankPage;
