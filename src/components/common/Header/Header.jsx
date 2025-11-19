import './Header.css';

const Header = ({ username = 'username', repository = 'repository' }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">
          Morning Page
          <img
            src="/images/logo_sun.png"
            alt="morning page logo"
            className="header-logo-image"
          />
        </h1>
      </div>
      <div className="header-right">
        <div className="header-repo">
          <span className="header-repo-username">{username}</span>
          <span className="header-repo-separator"> / </span>
          <span className="header-repo-name">{repository}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
