import './Header.css';

const Header = ({ username = 'username', repository = 'repository' }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">morning page</h1>
      </div>
      <div className="header-right">
        <span className="header-repo">
          {username} / {repository}
        </span>
      </div>
    </header>
  );
};

export default Header;

