import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import ResponsiveEditorPage from './pages/EditorPage/ResponsiveEditorPage';
import StatisticsPage from './pages/StatisticsPage/StatisticsPage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/editor" element={<ResponsiveEditorPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
