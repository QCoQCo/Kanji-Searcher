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

// kanjiapi.dev /v1/kanji/{char} 응답 (사용하는 필드만)
export interface KanjiApiResponse {
    kanji: string;
    kun_readings?: string[];
    on_readings?: string[];
    meanings?: string[];
    jlpt?: number | null;
    stroke_count?: number;
}

// 검색 소스 타입
export type SearchSource = 'manual' | 'word-click' | 'kanji-click';

// 브레드크럼 아이템 타입
export interface BreadcrumbItem {
    id: string;
    label: string;
    query: string;
    type: SearchSource;
    timestamp: number;
}
