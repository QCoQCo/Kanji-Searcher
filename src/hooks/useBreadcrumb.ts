import { useState, useCallback } from 'react';
import type { BreadcrumbItem } from '../components/Breadcrumb';

export function useBreadcrumb() {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

  // 브레드크럼에 새 항목 추가
  const addBreadcrumbItem = useCallback((
    query: string, 
    type: 'manual' | 'word-click' | 'kanji-click',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourceData?: any
  ) => {
    const newItem: BreadcrumbItem = {
      id: `${Date.now()}-${Math.random()}`,
      label: generateLabel(query, type, sourceData),
      query,
      type,
      timestamp: Date.now(),
    };

    setBreadcrumbItems(prev => {
      // 같은 쿼리가 이미 있으면 제거하고 새로 추가 (최신으로 이동)
      const filtered = prev.filter(item => item.query !== query);
      return [...filtered, newItem];
    });
  }, []);

  // 브레드크럼 항목 클릭 처리
  const navigateToBreadcrumbItem = useCallback((item: BreadcrumbItem) => {
    // 선택된 항목 이후의 모든 항목 제거
    setBreadcrumbItems(prev => {
      const itemIndex = prev.findIndex(breadcrumb => breadcrumb.id === item.id);
      return prev.slice(0, itemIndex + 1);
    });
    
    return item;
  }, []);

  // 브레드크럼 초기화
  const clearBreadcrumb = useCallback(() => {
    setBreadcrumbItems([]);
  }, []);

  // 마지막 항목 제거 (뒤로가기)
  const goBack = useCallback(() => {
    setBreadcrumbItems(prev => prev.slice(0, -1));
    return breadcrumbItems[breadcrumbItems.length - 2] || null;
  }, [breadcrumbItems]);

  return {
    breadcrumbItems,
    addBreadcrumbItem,
    navigateToBreadcrumbItem,
    clearBreadcrumb,
    goBack,
  };
}

// 브레드크럼 라벨 생성 헬퍼 함수
function generateLabel(
  query: string, 
  type: 'manual' | 'word-click' | 'kanji-click',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sourceData?: any
): string {
  switch (type) {
    case 'manual':
      return `"${query}"`;
    case 'word-click': {
      const wordReading = sourceData?.japanese?.[0]?.reading;
      const wordText = sourceData?.japanese?.[0]?.word;
      const displayWord = wordText || wordReading;
      return `${displayWord} → ${query}`;
    }
    case 'kanji-click':
      return `한자: ${query}`;
    default:
      return query;
  }
} 