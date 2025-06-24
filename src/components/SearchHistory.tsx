import React, { useState, useRef } from 'react';
import './SearchHistory.css';
import type { SearchHistoryItem } from '../hooks/useSearchHistory';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
  onClear: () => void;
  onToggleFavorite: (query: string) => void;
  getFrequentItems: () => SearchHistoryItem[];
  getFavorites: () => SearchHistoryItem[];
  onRemove: (query: string) => void;
  onExport: () => void;
  onImport: (file: File, mergeMode: 'replace' | 'merge') => Promise<boolean>;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  history, 
  onSelect, 
  onClear, 
  onToggleFavorite,
  getFrequentItems,
  getFavorites,
  onRemove,
  onExport,
  onImport
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'frequent' | 'favorites'>('recent');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kanji': return '🔸';
      case 'mixed': return '📝';
      case 'word': return '💭';
      default: return '🔍';
    }
  };

  const renderHistoryItem = (item: SearchHistoryItem, index: number) => (
    <li key={`${item.query}-${index}`} className="history-item">
      <button 
        className="history-item-btn"
        onClick={() => onSelect(item.query)}
        title={`검색: ${item.query} (${item.frequency}회 검색)`}
      >
        <div className="item-main">
          <span className="item-icon">{getTypeIcon(item.type)}</span>
          <span className="item-query">{item.query}</span>
          {item.frequency > 1 && (
            <span className="item-frequency">×{item.frequency}</span>
          )}
        </div>
        <div className="item-meta">
          <span className="item-timestamp">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>
      </button>
      <div className="item-actions">
        <button
          className={`favorite-btn ${item.isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.query);
          }}
          title={item.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          {item.isFavorite ? '⭐' : '☆'}
        </button>
        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.query);
          }}
          title="검색 기록에서 삭제"
        >
          ✕
        </button>
      </div>
    </li>
  );

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'frequent': return getFrequentItems();
      case 'favorites': return getFavorites();
      default: return history.slice(0, 10);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const success = await onImport(file, importMode);
    if (success) {
      alert(`검색 기록을 성공적으로 ${importMode === 'merge' ? '병합' : '대체'}했습니다.`);
    }
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="search-history">
      <div className="search-history-header">
        <h3>🕐 검색 기록</h3>
        <div className="header-controls">
          <button className="toggle-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? '펼치기' : '접기'}
          </button>
          {!collapsed && (
            <>
              <div className="import-export-controls">
                <button className="export-btn" onClick={onExport} title="검색 기록 내보내기">
                  📤 내보내기
                </button>
                <button className="import-btn" onClick={handleImportClick} title="검색 기록 가져오기">
                  📥 가져오기
                </button>
                <select 
                  className="import-mode-select"
                  value={importMode} 
                  onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                  title="가져오기 모드"
                >
                  <option value="merge">병합</option>
                  <option value="replace">대체</option>
                </select>
              </div>
              <button className="clear-btn" onClick={onClear}>전체 삭제</button>
            </>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {!collapsed && (
        <div className="search-history-content">
          <div className="history-tabs">
            <button 
              className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              🕒 최근
            </button>
            <button 
              className={`tab-btn ${activeTab === 'frequent' ? 'active' : ''}`}
              onClick={() => setActiveTab('frequent')}
            >
              🔥 인기
            </button>
            <button 
              className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              ⭐ 즐겨찾기
            </button>
          </div>
          
          <div className="search-history-list">
            {getCurrentItems().length > 0 ? (
              <ul>
                {getCurrentItems().map(renderHistoryItem)}
              </ul>
            ) : (
              <div className="empty-state">
                {activeTab === 'favorites' ? (
                  <>
                    <div className="empty-icon">⭐</div>
                    <p>즐겨찾기한 검색어가 없습니다</p>
                    <small>⭐ 버튼을 눌러 자주 사용하는 검색어를 저장하세요</small>
                  </>
                ) : activeTab === 'frequent' ? (
                  <>
                    <div className="empty-icon">🔥</div>
                    <p>자주 검색한 항목이 없습니다</p>
                    <small>같은 검색어를 여러 번 사용하면 여기에 표시됩니다</small>
                  </>
                ) : (
                  <>
                    <div className="empty-icon">🔍</div>
                    <p>검색 기록이 없습니다</p>
                    <small>검색을 시작하면 여기에 기록이 남습니다</small>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistory; 