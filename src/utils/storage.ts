/**
 * localStorage 읽기/쓰기 유틸
 * 저장값이 깨졌거나(JSON 파싱 실패) 저장소 접근이 막힌 경우(사생활 보호 모드 등)에도 앱이 죽지 않도록 함
 */

/**
 * 배열 데이터를 읽어서 각 항목을 정규화해 반환 (normalize가 null을 반환한 항목은 제외)
 * 값이 없거나 읽을 수 없으면 빈 배열
 */
export function readStorageArray<T>(key: string, normalize: (item: unknown) => T | null): T[] {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return [];

        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            console.warn(`Ignoring invalid data in localStorage key "${key}"`);
            return [];
        }
        return parsed.map(normalize).filter((item): item is T => item !== null);
    } catch (error) {
        console.warn(`Failed to read localStorage key "${key}":`, error);
        return [];
    }
}

export function writeStorage(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // 용량 초과·접근 차단 시에도 화면 동작은 유지
        console.warn(`Failed to write localStorage key "${key}":`, error);
    }
}

export function removeStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`Failed to remove localStorage key "${key}":`, error);
    }
}
