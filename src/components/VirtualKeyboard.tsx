import React from 'react';
import './VirtualKeyboard.css';

interface VirtualKeyboardProps {
    isVisible: boolean;
    inputBuffer: string;
    convertedText: string;
    activeKey: string | null;
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
    onClear: () => void;
    onSpace: () => void;
    onClose: () => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    isVisible,
    inputBuffer,
    convertedText,
    activeKey,
    onKeyPress,
    onBackspace,
    onClear,
    onSpace,
    onClose,
}) => {
    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ];

    const handleKeyClick = (key: string) => {
        onKeyPress(key);
    };

    if (!isVisible) return null;

    return (
        <div className='keyboard-overlay'>
            <div className='keyboard-container'>
                <div className='keyboard-header'>
                    <div className='keyboard-display'>
                        <span className='converted-text'>{convertedText}</span>
                        <span className='input-buffer'>{inputBuffer}</span>
                        <span className='cursor'>|</span>
                    </div>
                    <button className='keyboard-close' onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className='keyboard-info'>
                    <p>💡 물리 키보드로도 입력할 수 있습니다! (ESC키로 종료)</p>
                </div>

                <div className='keyboard-keys'>
                    {keyboardLayout.map((row, rowIndex) => (
                        <div key={rowIndex} className='keyboard-row'>
                            {row.map((key) => (
                                <button
                                    key={key}
                                    className={`keyboard-key ${
                                        activeKey === key ? 'keyboard-key-active' : ''
                                    }`}
                                    onClick={() => handleKeyClick(key)}
                                >
                                    {key.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    ))}

                    <div className='keyboard-row keyboard-bottom-row'>
                        <button
                            className={`keyboard-key keyboard-key-wide ${
                                activeKey === ' ' ? 'keyboard-key-active' : ''
                            }`}
                            onClick={onSpace}
                        >
                            SPACE
                        </button>
                        <button
                            className={`keyboard-key ${
                                activeKey === 'backspace' ? 'keyboard-key-active' : ''
                            }`}
                            onClick={onBackspace}
                        >
                            ⌫
                        </button>
                        <button className='keyboard-key' onClick={onClear}>
                            CLEAR
                        </button>
                        <button className='keyboard-key keyboard-done' onClick={onClose}>
                            완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualKeyboard;
