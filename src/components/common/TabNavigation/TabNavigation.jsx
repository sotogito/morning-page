import { Link, useLocation } from 'react-router-dom';
import cx from 'classnames';
import './TabNavigation.css';

const TabNavigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="tab-navigation">
      <Link
        to="/editor"
        className={cx('tab-button', { active: isActive('/editor') })}
      >
        작성하기
      </Link>

      <Link
        to="/favorites"
        className={cx('tab-button', { active: isActive('/favorites') })}
      >
        즐겨찾기
      </Link>

      <Link
        to="/statistics"
        className={cx('tab-button', { active: isActive('/statistics') })}
      >
        통계
      </Link>

      <a
        href="https://excellent-patient-a36.notion.site/2b4bf457247980f8b429d7af3f14b96a?source=copy_link"
        target="_blank"
        rel="noopener noreferrer"
        className="tab-button"
      >
        공지사항
      </a>
    </nav>
  );
};

export default TabNavigation;

