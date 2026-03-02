import React from 'react';
import { useTranslation } from 'react-i18next';
import type { WindowPattern } from '../../types/game';

interface WindowPatternSelectorProps {
  patterns: WindowPattern[];
  selectedPatternId: string;
  onPatternSelect: (patternId: string) => void;
}

const WindowPatternSelector: React.FC<WindowPatternSelectorProps> = ({
  patterns,
  selectedPatternId,
  onPatternSelect,
}) => {
  const { t } = useTranslation();

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-700">{t('board.selectPattern')}</span>
      <select
        value={selectedPatternId}
        onChange={(event) => onPatternSelect(event.target.value)}
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
      >
        {patterns.map((pattern) => (
          <option key={pattern.id} value={pattern.id}>
            {pattern.name} ({pattern.difficulty})
          </option>
        ))}
      </select>
    </label>
  );
};

export default WindowPatternSelector;
