import type { JLPTLevel } from '../types/kanji';

/**
 * Jisho/로컬 데이터의 JLPT 태그('jlpt-n5')를 앱에서 쓰는 레벨('N5')로 변환
 * 알 수 없는 형식이면 null
 */
export function normalizeJLPT(tag: string): JLPTLevel | null {
    const match = /^(?:jlpt-)?n([1-5])$/i.exec(tag.trim());
    return match ? (`N${match[1]}` as JLPTLevel) : null;
}

/**
 * 단어의 JLPT 태그 목록 중 하나라도 주어진 레벨에 포함되는지 확인
 */
export function matchesJLPTLevels(tags: string[] | undefined, levels: string[]): boolean {
    if (!tags) return false;
    return tags.some((tag) => {
        const level = normalizeJLPT(tag);
        return level !== null && levels.includes(level);
    });
}

/**
 * 화면 표시용 JLPT 라벨 ('jlpt-n5' → 'N5', 알 수 없는 형식은 원문 그대로)
 */
export function formatJLPT(tag: string): string {
    return normalizeJLPT(tag) ?? tag;
}
