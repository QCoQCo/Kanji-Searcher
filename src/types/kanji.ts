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