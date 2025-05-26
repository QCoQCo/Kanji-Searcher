import React from 'react';
import type { JLPTLevel } from '../types/kanji';

interface JLPTFilterProps {
  selectedLevels: Record<JLPTLevel, boolean>;
  onLevelChange: (level: JLPTLevel, checked: boolean) => void;
}

const JLPT_LEVELS: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];

const JLPTFilter: React.FC<JLPTFilterProps> = ({ selectedLevels, onLevelChange }) => {
  return (
    <div className="jlpt-filter">
      {JLPT_LEVELS.map(level => (
        <label key={level}>
          <input
            type="checkbox"
            checked={selectedLevels[level]}
            onChange={e => onLevelChange(level, e.target.checked)}
          />
          {level}
        </label>
      ))}
    </div>
  );
};

export default JLPTFilter; 