// 로마지 -> 히라가나 변환
// 앞에서부터 가장 긴 매칭을 우선 변환하고, 아직 확정할 수 없는 꼬리(예: 'k', 'sh', 'n')는 remaining으로 남긴다.

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);

// 요음(ゃゅょ) 조합을 만드는 헬퍼: prefix + ya/yu/yo
const withYoon = (prefix: string, base: string): Record<string, string> => ({
    [`${prefix}a`]: `${base}ゃ`,
    [`${prefix}u`]: `${base}ゅ`,
    [`${prefix}o`]: `${base}ょ`,
});

const ROMAJI_MAP: Record<string, string> = {
    // 모음
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',

    // か행
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    ...withYoon('ky', 'き'),
    ...withYoon('gy', 'ぎ'),

    // さ행
    sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
    za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    ...withYoon('sy', 'し'),
    ...withYoon('sh', 'し'),
    she: 'しぇ',
    ...withYoon('zy', 'じ'),
    ...withYoon('jy', 'じ'),
    ...withYoon('j', 'じ'),
    je: 'じぇ',

    // た행
    ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
    da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    ...withYoon('ty', 'ち'),
    ...withYoon('cy', 'ち'),
    ...withYoon('ch', 'ち'),
    che: 'ちぇ',
    ...withYoon('dy', 'ぢ'),

    // な행
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
    ...withYoon('ny', 'に'),

    // は행
    ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
    pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
    ...withYoon('hy', 'ひ'),
    ...withYoon('by', 'び'),
    ...withYoon('py', 'ぴ'),

    // ま행
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
    ...withYoon('my', 'み'),

    // や행
    ya: 'や', yu: 'ゆ', yo: 'よ',

    // ら행
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
    ...withYoon('ry', 'り'),

    // わ행
    wa: 'わ', wi: 'うぃ', we: 'うぇ', wo: 'を',
    vu: 'ゔ',

    // 작은 글자 (x- / l- 접두)
    xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ',
    la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ',
    xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ',
    lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ',
    xtu: 'っ', xtsu: 'っ', ltu: 'っ', ltsu: 'っ',
    xwa: 'ゎ', lwa: 'ゎ',

    // 기호
    '-': 'ー',
};

const ROMAJI_KEYS = Object.keys(ROMAJI_MAP);
const MAX_KEY_LENGTH = Math.max(...ROMAJI_KEYS.map((key) => key.length));

const isVowel = (ch: string | undefined) => ch !== undefined && VOWELS.has(ch);
const isConsonant = (ch: string | undefined) => ch !== undefined && /^[a-z]$/.test(ch) && !isVowel(ch);

// 더 입력하면 매핑이 완성될 수 있는 접두어인지 ('k', 'sh', 'xt' 등)
const isIncompletePrefix = (text: string) =>
    ROMAJI_KEYS.some((key) => key.length > text.length && key.startsWith(text));

export interface ConversionResult {
    converted: string; // 확정된 히라가나
    remaining: string; // 아직 확정할 수 없는 로마지 꼬리
}

/**
 * 로마지를 히라가나로 변환
 * @param final true면 남은 꼬리까지 모두 확정 (예: 끝의 'n' → 'ん')
 */
export function convertRomaji(input: string, final = false): ConversionResult {
    const text = input.toLowerCase();
    let converted = '';
    let i = 0;

    while (i < text.length) {
        const ch = text[i];
        const next = text[i + 1];

        // ん 처리
        if (ch === 'n') {
            if (next === undefined) {
                // 'na', 'ni'… 가 될 수 있으므로 대기
                if (!final) break;
                converted += 'ん';
                i += 1;
                continue;
            }
            if (next === 'n') {
                const after = text[i + 2];
                if (after === undefined) {
                    // 'nn' 다음에 모음이 오면 'ん + な행', 자음이 오면 'ん'으로 갈리므로 대기
                    if (!final) break;
                    converted += 'ん';
                    i += 2;
                    continue;
                }
                converted += 'ん';
                // konnichiha: 'nn' + 모음/y → 두 번째 n은 다음 음절 (ん + に)
                // shinnbun:   'nn' + 자음   → 'nn' 전체가 ん
                i += isVowel(after) || after === 'y' ? 1 : 2;
                continue;
            }
            if (!isVowel(next) && next !== 'y') {
                // 'n' + 자음 (kanji, tenki) → ん
                converted += 'ん';
                i += 1;
                continue;
            }
        }

        // 촉음: 같은 자음 반복 (kk, tt, ss …) 또는 'tch' → っ
        if (isConsonant(ch) && ch !== 'n' && (next === ch || (ch === 't' && next === 'c'))) {
            converted += 'っ';
            i += 1;
            continue;
        }

        // 가장 긴 매칭 우선
        let matched = false;
        for (let len = Math.min(MAX_KEY_LENGTH, text.length - i); len >= 1; len--) {
            const hiragana = ROMAJI_MAP[text.slice(i, i + len)];
            if (hiragana) {
                converted += hiragana;
                i += len;
                matched = true;
                break;
            }
        }
        if (matched) continue;

        // 아직 완성되지 않은 입력이면 대기
        if (!final && isIncompletePrefix(text.slice(i))) break;

        // 변환할 수 없는 문자는 그대로 출력 (확정 시 남은 'n'은 ん)
        converted += ch === 'n' ? 'ん' : ch;
        i += 1;
    }

    return { converted, remaining: text.slice(i) };
}

/**
 * 로마지 전체를 히라가나로 확정 변환 (남는 꼬리 없음)
 */
export function convertRomajiToHiragana(input: string): string {
    return convertRomaji(input, true).converted;
}
