import React from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  id: string;
  label: string;
  query: string;
  type: 'manual' | 'word-click' | 'kanji-click';
  timestamp: number;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick: (item: BreadcrumbItem) => void;
  onClear: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onItemClick, onClear }) => {
  if (items.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'manual': return '🔍';
      case 'word-click': return '📖';
      case 'kanji-click': return '🔸';
      default: return '🔍';
    }
  };

  return (
    <div className="breadcrumb-container">
      <div className="breadcrumb-header">
        <span className="breadcrumb-title">🗂️ 검색 경로</span>
        <button className="breadcrumb-clear-btn" onClick={onClear} title="검색 경로 초기화">
          ✕
        </button>
      </div>
      
      <div className="breadcrumb-trail">
        <div className="breadcrumb-item home-item">
          <span className="breadcrumb-icon">🏠</span>
          <span className="breadcrumb-label">홈</span>
        </div>
        
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="breadcrumb-separator">›</div>
            <button
              className={`breadcrumb-item ${index === items.length - 1 ? 'current' : ''}`}
              onClick={() => onItemClick(item)}
              title={`${item.query} (${new Date(item.timestamp).toLocaleTimeString()})`}
            >
              <span className="breadcrumb-icon">{getIcon(item.type)}</span>
              <span className="breadcrumb-label">{item.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb; 