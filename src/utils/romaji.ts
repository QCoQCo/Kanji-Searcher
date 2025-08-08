// 로마지 -> 히라가나 변환 시스템
// 효율적이고 체계적인 구조로 개선

// 기본 모음 매핑
const VOWELS: Record<string, string> = {
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お'
};

// 자음 + 모음 조합 매핑
const CONSONANT_VOWEL_COMBINATIONS: Record<string, Record<string, string>> = {
  'k': { 'a': 'か', 'i': 'き', 'u': 'く', 'e': 'け', 'o': 'こ' },
  'g': { 'a': 'が', 'i': 'ぎ', 'u': 'ぐ', 'e': 'げ', 'o': 'ご' },
  's': { 'a': 'さ', 'i': 'し', 'u': 'す', 'e': 'せ', 'o': 'そ' },
  'z': { 'a': 'ざ', 'i': 'じ', 'u': 'ず', 'e': 'ぜ', 'o': 'ぞ' },
  't': { 'a': 'た', 'i': 'ち', 'u': 'つ', 'e': 'て', 'o': 'と' },
  'd': { 'a': 'だ', 'i': 'ぢ', 'u': 'づ', 'e': 'で', 'o': 'ど' },
  'n': { 'a': 'な', 'i': 'に', 'u': 'ぬ', 'e': 'ね', 'o': 'の' },
  'h': { 'a': 'は', 'i': 'ひ', 'u': 'ふ', 'e': 'へ', 'o': 'ほ' },
  'b': { 'a': 'ば', 'i': 'び', 'u': 'ぶ', 'e': 'べ', 'o': 'ぼ' },
  'p': { 'a': 'ぱ', 'i': 'ぴ', 'u': 'ぷ', 'e': 'ぺ', 'o': 'ぽ' },
  'm': { 'a': 'ま', 'i': 'み', 'u': 'む', 'e': 'め', 'o': 'も' },
  'r': { 'a': 'ら', 'i': 'り', 'u': 'る', 'e': 'れ', 'o': 'ろ' },
  'w': { 'a': 'わ', 'i': 'ゐ', 'u': '', 'e': 'ゑ', 'o': 'を' }
};

// 특수 조합 매핑
const SPECIAL_COMBINATIONS: Record<string, string> = {
  'fu': 'ふ',
  'dji': 'ぢ',
  'dzu': 'づ',
  'xtu': 'っ',
  'ya': 'や',
  'yu': 'ゆ',
  'yo': 'よ',
  'ji': 'じ',
  'n': 'ん'
};

// 조합 문자 규칙 (きゃ, きゅ, きょ 등)
const COMBINATION_RULES: Record<string, Record<string, string>> = {
  'k': { 'ya': 'きゃ', 'yu': 'きゅ', 'yo': 'きょ' },
  'g': { 'ya': 'ぎゃ', 'yu': 'ぎゅ', 'yo': 'ぎょ' },
  's': { 'ya': 'しゃ', 'yu': 'しゅ', 'yo': 'しょ' },
  'j': { 'ya': 'じゃ', 'yu': 'じゅ', 'yo': 'じょ' },
  't': { 'ya': 'ちゃ', 'yu': 'ちゅ', 'yo': 'ちょ' },
  'n': { 'ya': 'にゃ', 'yu': 'にゅ', 'yo': 'にょ' },
  'h': { 'ya': 'ひゃ', 'yu': 'ひゅ', 'yo': 'ひょ' },
  'b': { 'ya': 'びゃ', 'yu': 'びゅ', 'yo': 'びょ' },
  'p': { 'ya': 'ぴゃ', 'yu': 'ぴゅ', 'yo': 'ぴょ' },
  'm': { 'ya': 'みゃ', 'yu': 'みゅ', 'yo': 'みょ' },
  'r': { 'ya': 'りゃ', 'yu': 'りゅ', 'yo': 'りょ' }
};

// 성능 최적화를 위한 통합 매핑 (캐시)
let INTEGRATED_MAP: Record<string, string> | null = null;

// 통합 매핑 생성 함수
function buildIntegratedMap(): Record<string, string> {
  if (INTEGRATED_MAP) return INTEGRATED_MAP;
  
  const map: Record<string, string> = { ...VOWELS, ...SPECIAL_COMBINATIONS };
  
  // 자음 + 모음 조합 추가
  Object.entries(CONSONANT_VOWEL_COMBINATIONS).forEach(([consonant, vowelMap]) => {
    Object.entries(vowelMap).forEach(([vowel, hiragana]) => {
      if (hiragana) {
        map[consonant + vowel] = hiragana;
      }
    });
  });
  
  // 조합 문자 추가
  Object.entries(COMBINATION_RULES).forEach(([consonant, combinationMap]) => {
    Object.entries(combinationMap).forEach(([combination, hiragana]) => {
      map[consonant + combination] = hiragana;
    });
  });
  
  INTEGRATED_MAP = map;
  return map;
}

export interface ConversionResult {
  converted: string;
  remaining: string;
}

export class RomajiConverter {
  private static instance: RomajiConverter;
  private integratedMap: Record<string, string>;
  
  private constructor() {
    this.integratedMap = buildIntegratedMap();
  }
  
  static getInstance(): RomajiConverter {
    if (!RomajiConverter.instance) {
      RomajiConverter.instance = new RomajiConverter();
    }
    return RomajiConverter.instance;
  }
  
  /**
   * 로마지를 히라가나로 변환
   */
  convertRomajiToHiragana(input: string): ConversionResult {
    let result = '';
    let remaining = input.toLowerCase();
    
    while (remaining.length > 0) {
      let matched = false;
      
      // 가장 긴 매칭을 우선으로 시도 (3글자, 2글자, 1글자 순)
      for (let len = Math.min(3, remaining.length); len >= 1; len--) {
        const substr = remaining.substring(0, len);
        if (this.integratedMap[substr]) {
          result += this.integratedMap[substr];
          remaining = remaining.substring(len);
          matched = true;
          break;
        }
      }
      
      // 매칭되지 않은 경우 첫 글자를 그대로 추가
      if (!matched) {
        result += remaining[0];
        remaining = remaining.substring(1);
      }
    }
    
    return { converted: result, remaining: '' };
  }
  
  /**
   * 부분 매칭 확인 (자동완성용)
   */
  isPartialMatch(input: string): boolean {
    const lower = input.toLowerCase();
    return Object.keys(this.integratedMap).some(key => 
      key.startsWith(lower) && key !== lower
    );
  }
  
  /**
   * 자동완성 제안 목록 반환
   */
  getCompletions(input: string): string[] {
    const lower = input.toLowerCase();
    return Object.keys(this.integratedMap)
      .filter(key => key.startsWith(lower) && key !== lower)
      .slice(0, 5); // 최대 5개 완성 제안
  }
  
  /**
   * 특정 로마지가 완전한 히라가나로 변환 가능한지 확인
   */
  isValidRomaji(input: string): boolean {
    return this.integratedMap[input.toLowerCase()] !== undefined;
  }
  
  /**
   * 히라가나로 변환 가능한 모든 로마지 목록 반환
   */
  getAllValidRomaji(): string[] {
    return Object.keys(this.integratedMap);
  }
  
  /**
   * 캐시 초기화 (테스트용)
   */
  clearCache(): void {
    INTEGRATED_MAP = null;
    this.integratedMap = buildIntegratedMap();
  }
}

// 기존 함수들과의 호환성을 위한 래퍼 함수들
const converter = RomajiConverter.getInstance();

export function convertRomajiToHiragana(input: string): ConversionResult {
  return converter.convertRomajiToHiragana(input);
}

export function isPartialMatch(input: string): boolean {
  return converter.isPartialMatch(input);
}

export function getCompletions(input: string): string[] {
  return converter.getCompletions(input);
} 