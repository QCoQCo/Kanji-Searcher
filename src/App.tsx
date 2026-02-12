import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import RandomWordsPage from './pages/RandomWordsPage';

import './utils/animations.css';
import './App.css';

const Layout = () => {
    return (
        <div id='wrapper'>
            <Header />
            <main id='main-content'>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <div id='app'>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Layout />}>
                        <Route index element={<SearchPage />} />
                        <Route path='random-words' element={<RandomWordsPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
