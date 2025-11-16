import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import EditorPage from './pages/EditorPage/EditorPage';
import StatisticsPage from './pages/StatisticsPage/StatisticsPage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import AboutPage from './pages/AboutPage/AboutPage';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
