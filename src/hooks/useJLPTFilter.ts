import { useState } from 'react';
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
    setSelectedLevels(prev => ({ ...prev, [level]: checked }));
  };

  const getActiveLevels = () => JLPT_LEVELS.filter(level => selectedLevels[level]);

  return { selectedLevels, onLevelChange, getActiveLevels };
}; 