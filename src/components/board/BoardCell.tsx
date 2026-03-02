import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Cell, DiceColor } from '../../types/game';

interface BoardCellProps {
  cell: Cell;
  row: number;
  col: number;
  hasError: boolean;
  onCellClick: (row: number, col: number) => void;
}

const colorClassMap: Record<DiceColor, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const BoardCell: React.FC<BoardCellProps> = ({ cell, row, col, hasError, onCellClick }) => {
  const { t } = useTranslation();
  const restrictionColor =
    cell.restriction.type === 'color'
      ? colorClassMap[cell.restriction.value]
      : 'bg-white border border-gray-200';

  return (
    <button
      type="button"
      onClick={() => onCellClick(row, col)}
      className={`relative aspect-square rounded-xl border bg-white p-2 shadow-sm ${
        hasError ? 'border-red-500 ring-1 ring-red-300' : 'border-gray-300'
      }`}
      aria-label={t('board.cellAria', { row: row + 1, col: col + 1 })}
    >
      <div className="absolute left-1 top-1">
        {cell.restriction.type === 'value' ? (
          <span className="text-xs font-semibold text-gray-500">{cell.restriction.value}</span>
        ) : (
          <span className={`block h-3 w-3 rounded-full ${restrictionColor}`} />
        )}
      </div>
      {cell.die && (
        <span
          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${colorClassMap[cell.die.color]}`}
        >
          {cell.die.value}
        </span>
      )}
    </button>
  );
};

export default BoardCell;
