import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { GitHubAuthService } from '../../services/githubAuthService';
import './LoginPage.css';

const LoginPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!repoUrl || !token) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const { user, owner, repo } = await GitHubAuthService.authenticate(token, repoUrl);

      login(user, token, repoUrl, owner, repo);

      navigate('/editor');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다. 토큰과 레포지토리 URL을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">morning page</h1>

        <form onSubmit={handleLogin}>
          <label className="login-label" htmlFor="repository">
            깃허브 레포 링크
          </label>
          <input
            id="repository"
            type="text"
            className="login-input"
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isLoading}
          />

          <label className="login-label" htmlFor="token">
            토큰
          </label>
          <input
            id="token"
            type="password"
            className="login-input"
            placeholder="Personal access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isLoading}
          />

          {error && <p className="login-error">{error}</p>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
