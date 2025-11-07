import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import EditorPage from './pages/EditorPage/EditorPage';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/" element={<Navigate to="/editor" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
