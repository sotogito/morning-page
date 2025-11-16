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
        에디터
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
    </nav>
  );
};

export default TabNavigation;

