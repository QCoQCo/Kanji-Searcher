import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    const location = useLocation();

    return (
        <header className='app-header'>
            <div className='header-container'>
                <div className='header-content'>
                    <h1 className='app-title'>Kanji Searcher</h1>
                    <nav className='main-navigation'>
                        <Link
                            to='/'
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            Search
                        </Link>
                        <Link
                            to='/random-words'
                            className={`nav-link ${
                                location.pathname === '/random-words' ? 'active' : ''
                            }`}
                        >
                            Random Words
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
