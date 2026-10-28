import type React from 'react';

/**
 * role="button"인 요소에서 Enter/Space를 클릭처럼 처리
 * 요소 안의 다른 버튼에서 올라온 키 입력은 무시 (그 버튼의 동작과 겹치지 않도록)
 */
export function handleActivationKey(event: React.KeyboardEvent, action: () => void): void {
    if (event.target !== event.currentTarget) return;

    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); // Space로 페이지가 스크롤되지 않도록
        action();
    }
}
