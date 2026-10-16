/**
 * 일본어 텍스트에서 한자를 추출하는 유틸리티 함수들
 */

import type { WordData } from '../types/kanji';

// 한자: Unicode Script=Han (CJK 통합 한자 + 확장 영역 + 々, 〇)
// 주의: /g 정규식은 .test()에서 lastIndex 상태가 남으므로 판정용과 추출용을 분리한다
const KANJI_REGEX = /\p{Script=Han}/u;
const KANJI_REGEX_GLOBAL = /\p{Script=Han}/gu;
const ONLY_KANJI_REGEX = /^\p{Script=Han}+$/u;

/**
 * 단일 문자가 한자인지 확인
 */
export function isKanji(char: string): boolean {
    return KANJI_REGEX.test(char);
}

/**
 * 텍스트가 한자로만 이루어져 있는지 확인
 */
export function isOnlyKanji(text: string): boolean {
    return ONLY_KANJI_REGEX.test(text);
}

/**
 * 텍스트에서 모든 한자 문자를 배열로 추출
 */
export function extractKanjiFromText(text: string): string[] {
    if (!text) return [];

    const matches = text.match(KANJI_REGEX_GLOBAL);
    return matches || [];
}

/**
 * 텍스트에서 중복 제거된 고유한 한자들을 추출
 */
export function getUniqueKanji(text: string): string[] {
    const kanjiArray = extractKanjiFromText(text);
    return [...new Set(kanjiArray)];
}

/**
 * 텍스트에서 한자들을 하나의 문자열로 결합 (중복 제거)
 */
export function getUniqueKanjiString(text: string): string {
    return getUniqueKanji(text).join('');
}

/**
 * 일본어 단어 객체에서 한자 추출 (Jisho API 응답 형태)
 */
export function extractKanjiFromWordObject(wordObj: WordData | null | undefined): string {
    // 외부 API 데이터라 형식이 어긋날 수 있으므로 런타임 검사는 유지
    if (!wordObj || !Array.isArray(wordObj.japanese)) {
        return '';
    }

    let kanjiText = '';

    for (const jpItem of wordObj.japanese) {
        // word가 있으면 word에서 한자 추출 (우선순위), 없으면 reading에서 추출
        const text = jpItem?.word || jpItem?.reading;
        if (typeof text === 'string') {
            kanjiText += text;
        }
    }

    return getUniqueKanjiString(kanjiText);
}

/**
 * 텍스트에 한자가 포함되어 있는지 확인
 */
export function hasKanji(text: string): boolean {
    return KANJI_REGEX.test(text);
}

/**
 * 한자 개수 계산
 */
export function countKanji(text: string): number {
    return extractKanjiFromText(text).length;
}

/**
 * 한자와 비한자 문자 분리
 */
export function separateKanjiAndNonKanji(text: string): {
    kanji: string[];
    nonKanji: string;
} {
    const kanji = extractKanjiFromText(text);
    const nonKanji = text.replace(KANJI_REGEX_GLOBAL, '');

    return { kanji, nonKanji };
}
