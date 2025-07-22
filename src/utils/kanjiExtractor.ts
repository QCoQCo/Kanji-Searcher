/**
 * 일본어 텍스트에서 한자를 추출하는 유틸리티 함수들
 */

// 한자 유니코드 범위: 一-龯 (CJK Unified Ideographs) + 々 (iteration mark)
const KANJI_REGEX = /[一-龯々]/g;

/**
 * 단일 문자가 한자인지 확인
 */
export function isKanji(char: string): boolean {
  return /[一-龯々]/.test(char);
}

/**
 * 텍스트에서 모든 한자 문자를 배열로 추출
 */
export function extractKanjiFromText(text: string): string[] {
  if (!text) return [];
  
  const matches = text.match(KANJI_REGEX);
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractKanjiFromWordObject(wordObj: any): string {
  if (!wordObj || typeof wordObj !== 'object') {
    return '';
  }
  
  let kanjiText = '';
  
  // japanese 배열에서 word 또는 reading 확인
  if (wordObj.japanese && Array.isArray(wordObj.japanese)) {
    for (const jpItem of wordObj.japanese) {
      if (jpItem && typeof jpItem === 'object') {
        // word가 있으면 word에서 한자 추출 (우선순위)
        if (jpItem.word && typeof jpItem.word === 'string') {
          kanjiText += jpItem.word;
        }
        // word가 없고 reading에 한자가 있으면 reading에서 추출
        else if (jpItem.reading && typeof jpItem.reading === 'string') {
          kanjiText += jpItem.reading;
        }
      }
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
  const nonKanji = text.replace(KANJI_REGEX, '');
  
  return { kanji, nonKanji };
} 