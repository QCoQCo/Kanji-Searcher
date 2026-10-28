import { useState, useCallback } from 'react';
import type { BreadcrumbItem, SearchSource, WordData } from '../types/kanji';

// 검색 경로에 남기는 최대 항목 수 (오래된 것부터 제거)
const MAX_BREADCRUMB_ITEMS = 10;

export function useBreadcrumb() {
    const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

    // 브레드크럼에 새 항목 추가
    const addBreadcrumbItem = useCallback(
        (query: string, type: SearchSource, sourceData?: WordData, wordResults?: WordData[]) => {
            const newItem: BreadcrumbItem = {
                id: `${Date.now()}-${Math.random()}`,
                label: generateLabel(query, type, sourceData),
                query,
                type,
                word: sourceData,
                wordResults,
                timestamp: Date.now(),
            };

            setBreadcrumbItems((prev) => {
                const last = prev[prev.length - 1];
                // 직전 항목과 같은 검색(종류+검색어)이면 새로 쌓지 않고 최신 정보로 교체 (id는 유지)
                if (last && last.type === type && last.query === query) {
                    return [...prev.slice(0, -1), { ...newItem, id: last.id }];
                }
                // 그 외에는 지나온 경로를 그대로 두고 뒤에 추가, 최대 개수를 넘으면 오래된 것부터 제거
                return [...prev, newItem].slice(-MAX_BREADCRUMB_ITEMS);
            });
        },
        []
    );

    // 브레드크럼 항목 클릭 처리
    const navigateToBreadcrumbItem = useCallback((item: BreadcrumbItem) => {
        // 선택된 항목 이후의 모든 항목 제거
        setBreadcrumbItems((prev) => {
            const itemIndex = prev.findIndex((breadcrumb) => breadcrumb.id === item.id);
            return prev.slice(0, itemIndex + 1);
        });

        return item;
    }, []);

    // 브레드크럼 초기화
    const clearBreadcrumb = useCallback(() => {
        setBreadcrumbItems([]);
    }, []);

    return {
        breadcrumbItems,
        addBreadcrumbItem,
        navigateToBreadcrumbItem,
        clearBreadcrumb,
    };
}

// 브레드크럼 라벨 생성 헬퍼 함수
function generateLabel(query: string, type: SearchSource, sourceData?: WordData): string {
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
