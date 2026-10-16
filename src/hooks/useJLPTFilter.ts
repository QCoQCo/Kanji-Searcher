import { useState, useCallback } from 'react';
import type { JLPTLevel } from '../types/kanji';

const JLPT_LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

export const useJLPTFilter = () => {
    const [selectedLevels, setSelectedLevels] = useState<Record<JLPTLevel, boolean>>({
        N1: true,
        N2: true,
        N3: true,
        N4: true,
        N5: true,
    });

    const onLevelChange = (level: JLPTLevel, checked: boolean) => {
        setSelectedLevels((prev) => ({ ...prev, [level]: checked }));
    };

    // 레벨이 바뀔 때만 새 함수를 만들어, 이를 의존하는 콜백(useSearch)이 매 렌더 재생성되지 않게 함
    const getActiveLevels = useCallback(
        () => JLPT_LEVELS.filter((level) => selectedLevels[level]),
        [selectedLevels]
    );

    return { selectedLevels, onLevelChange, getActiveLevels };
};
