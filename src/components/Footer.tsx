import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className='app-footer'>
            <div className='footer-container'>
                <div className='footer-content'>
                    <div className='footer-section'>
                        <h3>Kanji Searcher</h3>
                        <p>
                            Learn Japanese vocabulary with JLPT level filtering and random word
                            practice.
                        </p>
                    </div>

                    <div className='footer-section'>
                        <h4>Features</h4>
                        <ul>
                            <li>Kanji and word search</li>
                            <li>JLPT level filtering</li>
                            <li>Random vocabulary practice</li>
                            <li>Search history</li>
                        </ul>
                    </div>

                    <div className='footer-section'>
                        <h4>Data Sources</h4>
                        <ul>
                            <li>
                                <a
                                    href='https://jisho.org'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    Jisho.org API
                                </a>
                            </li>
                            <li>
                                <a
                                    href='https://kanjiapi.dev'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    KanjiAPI.dev
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className='footer-bottom'>
                    <p>
                        &copy; {new Date().getFullYear()} Kanji Searcher. Made with ❤️ for Japanese
                        learners.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
