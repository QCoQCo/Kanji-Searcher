import { useState, useCallback } from 'react';
import { convertRomajiToHiragana, isPartialMatch } from '../utils/romaji';

export interface VirtualKeyboardState {
  isVisible: boolean;
  inputBuffer: string;
  convertedText: string;
}

export function useVirtualKeyboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [inputBuffer, setInputBuffer] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const toggleKeyboard = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const showKeyboard = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideKeyboard = useCallback(() => {
    setIsVisible(false);
  }, []);

  const addToBuffer = useCallback((char: string) => {
    setInputBuffer(prev => {
      const newBuffer = prev + char;
      const result = convertRomajiToHiragana(newBuffer);
      
      // 부분 매칭이 있는 경우 버퍼를 유지
      if (isPartialMatch(newBuffer)) {
        return newBuffer;
      }
      
      // 완전 변환된 경우 변환된 텍스트를 추가하고 버퍼 초기화
      if (result.converted) {
        setConvertedText(prevConverted => prevConverted + result.converted);
        return result.remaining;
      }
      
      return newBuffer;
    });
  }, []);

  const backspace = useCallback(() => {
    if (inputBuffer.length > 0) {
      setInputBuffer(prev => prev.slice(0, -1));
    } else if (convertedText.length > 0) {
      setConvertedText(prev => prev.slice(0, -1));
    }
  }, [inputBuffer.length, convertedText.length]);

  const clear = useCallback(() => {
    setInputBuffer('');
    setConvertedText('');
  }, []);

  const space = useCallback(() => {
    if (inputBuffer.length > 0) {
      // 버퍼의 내용을 강제로 변환하여 추가
      const result = convertRomajiToHiragana(inputBuffer);
      setConvertedText(prev => prev + result.converted + (result.remaining || ''));
      setInputBuffer('');
    } else {
      setConvertedText(prev => prev + ' ');
    }
  }, [inputBuffer]);

  const getCurrentText = useCallback(() => {
    return convertedText + inputBuffer;
  }, [convertedText, inputBuffer]);

  const getFullText = useCallback(() => {
    const result = convertRomajiToHiragana(inputBuffer);
    return convertedText + result.converted + result.remaining;
  }, [convertedText, inputBuffer]);

  const setText = useCallback((text: string) => {
    setConvertedText(text);
    setInputBuffer('');
  }, []);

  return {
    isVisible,
    inputBuffer,
    convertedText,
    toggleKeyboard,
    showKeyboard,
    hideKeyboard,
    addToBuffer,
    backspace,
    clear,
    space,
    getCurrentText,
    getFullText,
    setText,
  };
} 