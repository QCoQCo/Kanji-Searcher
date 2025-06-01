import React, { useState } from 'react';
import './SearchHistory.css';
import type { SearchHistoryItem } from '../hooks/useSearchHistory';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="search-history">
      <div className="search-history-header">
        <h3>최근 검색어</h3>
        <div>
          <button className="toggle-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? '펼치기' : '접기'}
          </button>
          {!collapsed && <button onClick={onClear}>기록 삭제</button>}
        </div>
      </div>
      <div className="search-history-list">
        {!collapsed && (
          <ul>
            {history.map((item, index) => (
              <li key={index} onClick={() => onSelect(item.query)}>
                <span className="query">{item.query}</span>
                <span className="timestamp">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchHistory; 