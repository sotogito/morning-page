import { useState } from 'react';
import './TabNavigation.css';

const TabNavigation = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('editor');

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    onTabChange?.(tabName);
  };

  return (
    <nav className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
        onClick={() => handleTabClick('editor')}
      >
        에디터
      </button>
      <button
        className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
        onClick={() => handleTabClick('statistics')}
      >
        통계
      </button>
    </nav>
  );
};

export default TabNavigation;

