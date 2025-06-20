// 로마지 -> 히라가나 변환 맵핑
const romajiMap: Record<string, string> = {
  // 기본 문자
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'ta': 'た', 'chi': 'ち', 'tu': 'つ', 'te': 'て', 'to': 'と',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を',
  'n': 'ん',
  
  // 조합 문자 (きゃ, きゅ, きょ 등)
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'sya': 'しゃ', 'syu': 'しゅ', 'syo': 'しょ',
  'jya': 'じゃ', 'jyu': 'じゅ', 'jyo': 'じょ',
  'tya': 'ちゃ', 'tyu': 'ちゅ', 'tyo': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  
  // 특수 조합
  'fu': 'ふ',
  'dji': 'ぢ',
  'dzu': 'づ',
  'xtu': 'っ',
};

export interface ConversionResult {
  converted: string;
  remaining: string;
}

export function convertRomajiToHiragana(input: string): ConversionResult {
  let result = '';
  let remaining = input.toLowerCase();
  
  while (remaining.length > 0) {
    let matched = false;
    
    // 가장 긴 매칭을 우선으로 시도 (3글자, 2글자, 1글자 순)
    for (let len = Math.min(3, remaining.length); len >= 1; len--) {
      const substr = remaining.substring(0, len);
      if (romajiMap[substr]) {
        result += romajiMap[substr];
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

export function isPartialMatch(input: string): boolean {
  const lower = input.toLowerCase();
  return Object.keys(romajiMap).some(key => key.startsWith(lower) && key !== lower);
}

export function getCompletions(input: string): string[] {
  const lower = input.toLowerCase();
  return Object.keys(romajiMap)
    .filter(key => key.startsWith(lower) && key !== lower)
    .slice(0, 5); // 최대 5개 완성 제안
} 