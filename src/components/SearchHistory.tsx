import React, { useState } from 'react';
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
      <div className="search-history-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>최근 검색어</h3>
        <div>
          <button onClick={() => setCollapsed(c => !c)} style={{ marginRight: 8 }}>
            {collapsed ? '펼치기' : '접기'}
          </button>
          {!collapsed && <button onClick={onClear}>기록 삭제</button>}
        </div>
      </div>
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
  );
};

export default SearchHistory; 