import { useState, useCallback, useEffect } from 'react';
import { convertRomaji, convertRomajiToHiragana } from '../utils/romaji';

export interface VirtualKeyboardState {
    isVisible: boolean;
    inputBuffer: string;
    convertedText: string;
    activeKey: string | null; // 현재 활성화된 키 추적
}

// 확정된 텍스트와 미확정 로마지 버퍼는 항상 함께 바뀌므로 하나의 state로 관리
interface InputState {
    convertedText: string;
    inputBuffer: string;
}

const EMPTY_INPUT: InputState = { convertedText: '', inputBuffer: '' };

export function useVirtualKeyboard() {
    const [isVisible, setIsVisible] = useState(false);
    const [input, setInput] = useState<InputState>(EMPTY_INPUT);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const { convertedText, inputBuffer } = input;

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
        setInput((prev) => {
            // 확정 가능한 부분만 변환하고, 미완성 꼬리('k', 'sh', 'n' 등)는 버퍼에 남김
            const result = convertRomaji(prev.inputBuffer + char);
            return {
                convertedText: prev.convertedText + result.converted,
                inputBuffer: result.remaining,
            };
        });
    }, []);

    const addToBuffer = useCallback(
        (char: string) => {
            handleAddToBuffer(char);
        },
        [handleAddToBuffer]
    );

    const handleBackspace = useCallback(() => {
        setInput((prev) =>
            prev.inputBuffer.length > 0
                ? { ...prev, inputBuffer: prev.inputBuffer.slice(0, -1) }
                : { ...prev, convertedText: prev.convertedText.slice(0, -1) }
        );
    }, []);

    const backspace = useCallback(() => {
        handleBackspace();
    }, [handleBackspace]);

    const clear = useCallback(() => {
        setInput(EMPTY_INPUT);
    }, []);

    const handleSpace = useCallback(() => {
        setInput((prev) =>
            prev.inputBuffer.length > 0
                ? {
                      // 버퍼의 내용을 강제로 확정 변환하여 추가
                      convertedText: prev.convertedText + convertRomajiToHiragana(prev.inputBuffer),
                      inputBuffer: '',
                  }
                : { ...prev, convertedText: prev.convertedText + ' ' }
        );
    }, []);

    const space = useCallback(() => {
        handleSpace();
    }, [handleSpace]);

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
            } else if (event.key.length === 1 && /^[a-zA-Z-]$/.test(event.key)) {
                // 알파벳과 장음(-)만 처리
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
    }, [isVisible, activeKey, handleAddToBuffer, handleBackspace, handleSpace]);

    const getCurrentText = useCallback(() => {
        return convertedText + inputBuffer;
    }, [convertedText, inputBuffer]);

    const getFullText = useCallback(() => {
        return convertedText + convertRomajiToHiragana(inputBuffer);
    }, [convertedText, inputBuffer]);

    const setText = useCallback((text: string) => {
        setInput({ convertedText: text, inputBuffer: '' });
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
