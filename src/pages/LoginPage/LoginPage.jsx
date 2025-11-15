import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastContainer from '../../components/common/Message/ToastContainer';
import Modal from '../../components/common/Modal/Modal';
import useToast from '../../hooks/useToast';
import { useAuthStore } from '../../store/authStore';
import { GitHubAuthService } from '../../services/githubAuthService';
import { ERROR_MESSAGE } from '../../constants/ErrorMessage';
import { INFO_MESSAGE } from '../../constants/InfoMessage';
import './LoginPage.css';

const LoginPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHoveringInfo, setIsHoveringInfo] = useState(false);
  const { toasts, showError, showInfo, removeToast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!repoUrl || !token) {
      setError(ERROR_MESSAGE.INVALID_LOGIN_INPUT);
      return;
    }

    setIsLoading(true);

    try {
      const { user, owner, repo } = await GitHubAuthService.authenticate(token, repoUrl);

      login(user, token, repoUrl, owner, repo);
      showInfo(INFO_MESSAGE.LOGIN_SUCCESS);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate('/editor');
    } catch (error) {
      showError(ERROR_MESSAGE.LOGIN_FAIL_HEAD);
      setError(error.message || ERROR_MESSAGE.LOGIN_FAIL_DESCRIPTION);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`login-page ${isModalOpen || isHoveringInfo ? 'modal-open' : ''}`}>
        <div className="login-card">
          <h1 className="login-title">morning page 🌞</h1>

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
          
          <button 
            className="login-info-link"
            onClick={() => setIsModalOpen(true)}
            onMouseEnter={() => setIsHoveringInfo(true)}
            onMouseLeave={() => !isModalOpen && setIsHoveringInfo(false)}
          >
            모닝페이지란?
          </button>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setIsHoveringInfo(false);
      }}>
        <div className="modal-info-content">
          <h2 className="modal-info-title">프롤로그</h2>
          <p className="modal-info-text">
            20살 때 처음 타투이스트로 일을 시작했습니다. 1인 1도안이라는 암묵적인 규칙 속에서 늘 창조성에 대한 갈망이 있었습니다. 
            22살, 줄리아 카메론의 『아티스트 웨이』를 처음 마주했고, 공책에서 노션으로, 노션에서 옵시디언으로 옮겨가며 이어온 저의 기록 여정을 함께 나누고자 합니다.
          </p>
          <p className="modal-info-text">
            바쁜 사회 속 별것도 아닌 하찮은 생각들을 얼마나 떠나보냈나요?<br/>
            수치적인 것, 현실적인 것, 실용적인 것, 이곳에서는 당신을 옥죄는 검열관 따위는 존재하지 않습니다.<br/>
            현실에서 잠시 벗어나, 내면 깊숙한 곳의 순수한 생각들과 이야기해 보세요.
          </p>

          <h2 className="modal-info-title">줄리아 카메론의 『아티스트 웨이』 모닝페이지</h2>
          <p className="modal-info-text">
            모닝페이지는 줄리아 카메론의 『아티스트 웨이』에서 소개된 창조성 회복 훈련입니다. 저자는 10년이 넘는 기간 동안 꾸준히 실천해왔으며, 전 세계 수많은 아티스트들도 이 방법을 자신의 작업 과정에 적용하고 있습니다.
          </p>
          <ul className="modal-info-list">
            <li>잘못 쓴 모닝 페이지란 없다.</li>
            <li>모닝페이지는 창조성 회복의 실마리가 되는 도구이다.</li>
            <li>모닝페이지에 다른 선택의 여지는 없다. 모닝페이지를 거르거나 줄이면 안 된다.</li>
            <li>세 쪽을 가득 채울 때까지 무슨 말이든 쓰는 것이다.</li>
          </ul>
          <blockquote className="modal-info-quote">
            "모닝페이지는 밝은 내용일 수도 있지만 부정적인 내용일 수도 있고, 내용이 조각조각 끊어지기도 하며 자기 연민에 빠지기도 한다. 똑같은 이야기를 되풀이할 때도 있고, 과장된 내용일 수도 있으며, 유치하기도 하고 과격하거나 아니면 침착한 내용인 경우도 있다. 심지어 자신이 바보같이 느껴지는 내용일 수도 있다. 하지만 어떤 것이든 괜찮다. 피곤하든, 심술이 낫든, 마음이 산만해졌든, 스트레스틑 받았든 그런 것이 무슨 상관인가? 모닝 페이지가 당신의 내면에 있는 어린 아티스트를 키워줄 것이다. 그러니 매일 모닝페이지를 쓰는 걸 잊지 말자."
          </blockquote>
        </div>
      </Modal>
    </>
  );
};

export default LoginPage;
