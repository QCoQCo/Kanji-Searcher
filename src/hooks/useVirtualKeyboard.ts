import { useState, useCallback, useEffect } from 'react';
import { convertRomajiToHiragana, isPartialMatch } from '../utils/romaji';

export interface VirtualKeyboardState {
    isVisible: boolean;
    inputBuffer: string;
    convertedText: string;
    activeKey: string | null; // 현재 활성화된 키 추적
}

export function useVirtualKeyboard() {
    const [isVisible, setIsVisible] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');
    const [convertedText, setConvertedText] = useState('');
    const [activeKey, setActiveKey] = useState<string | null>(null);

    // 물리 키보드 이벤트 리스너
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 가상 키보드가 활성화되어 있을 때만 처리
            if (!isVisible) return;

            // 기본 동작 방지 (특정 키들만)
            if (event.key.length === 1 || ['Backspace', 'Space'].includes(event.key)) {
                event.preventDefault();
            }

            // 키 활성화 표시
            setActiveKey(event.key.toLowerCase());

            // 키 처리
            if (event.key === 'Backspace') {
                handleBackspace();
            } else if (event.key === ' ') {
                handleSpace();
            } else if (event.key === 'Escape') {
                setIsVisible(false);
            } else if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
                // 알파벳만 처리
                handleAddToBuffer(event.key.toLowerCase());
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (!isVisible) return;

            // 키 활성화 해제
            if (activeKey === event.key.toLowerCase()) {
                setActiveKey(null);
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [isVisible, activeKey]);

    const toggleKeyboard = useCallback(() => {
        setIsVisible((prev) => !prev);
    }, []);

    const showKeyboard = useCallback(() => {
        setIsVisible(true);
    }, []);

    const hideKeyboard = useCallback(() => {
        setIsVisible(false);
        setActiveKey(null);
    }, []);

    const handleAddToBuffer = useCallback((char: string) => {
        setInputBuffer((prev) => {
            const newBuffer = prev + char;
            const result = convertRomajiToHiragana(newBuffer);

            // 부분 매칭이 있는 경우 버퍼를 유지
            if (isPartialMatch(newBuffer)) {
                return newBuffer;
            }

            // 완전 변환된 경우 변환된 텍스트를 추가하고 버퍼 초기화
            if (result.converted) {
                setConvertedText((prevConverted) => prevConverted + result.converted);
                return result.remaining;
            }

            return newBuffer;
        });
    }, []);

    const addToBuffer = useCallback(
        (char: string) => {
            handleAddToBuffer(char);
        },
        [handleAddToBuffer]
    );

    const handleBackspace = useCallback(() => {
        if (inputBuffer.length > 0) {
            setInputBuffer((prev) => prev.slice(0, -1));
        } else if (convertedText.length > 0) {
            setConvertedText((prev) => prev.slice(0, -1));
        }
    }, [inputBuffer.length, convertedText.length]);

    const backspace = useCallback(() => {
        handleBackspace();
    }, [handleBackspace]);

    const clear = useCallback(() => {
        setInputBuffer('');
        setConvertedText('');
    }, []);

    const handleSpace = useCallback(() => {
        if (inputBuffer.length > 0) {
            // 버퍼의 내용을 강제로 변환하여 추가
            const result = convertRomajiToHiragana(inputBuffer);
            setConvertedText((prev) => prev + result.converted + (result.remaining || ''));
            setInputBuffer('');
        } else {
            setConvertedText((prev) => prev + ' ');
        }
    }, [inputBuffer]);

    const space = useCallback(() => {
        handleSpace();
    }, [handleSpace]);

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
        activeKey,
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
