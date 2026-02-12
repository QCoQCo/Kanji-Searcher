export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export interface KanjiData {
    kanji: string;
    readings: {
        kun: string[];
        on: string[];
    };
    meanings: string[];
    jlpt: JLPTLevel | null;
    stroke_count: number;
    related_words: {
        word: string;
        reading: string;
        meanings: string[];
    }[];
}

// Jisho API 응답 타입들
export interface JapaneseReading {
    word?: string;
    reading: string;
}

export interface Sense {
    english_definitions: string[];
    parts_of_speech?: string[];
    tags?: string[];
    info?: string[];
}

export interface WordData {
    japanese: JapaneseReading[];
    senses: Sense[];
    jlpt?: string[];
    tags?: string[];
}

export interface JishoApiResponse {
    data: WordData[];
    meta?: {
        status: number;
    };
}

// 검색 소스 타입
export type SearchSource = 'manual' | 'word-click' | 'kanji-click';

// 브레드크럼 아이템 타입
export interface BreadcrumbItem {
    query: string;
    type: SearchSource;
    wordData?: WordData;
    timestamp: number;
}
