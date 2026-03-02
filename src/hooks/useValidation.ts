import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BoardState, ValidationError } from '../types/game';

const ORTHOGONAL_DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

const ADJACENT_DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

const useValidation = (board: BoardState): ValidationError[] => {
  const { t } = useTranslation();

  return useMemo(() => {
    const errors: ValidationError[] = [];
    const seen = new Set<string>();

    const addError = (row: number, col: number, rule: ValidationError['rule']): void => {
      const key = `${row}-${col}-${rule}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      errors.push({ row, col, rule, message: t(`validation.${rule}`) });
    };

    const placedDice = board.flatMap((row, rowIndex) =>
      row.flatMap((cell, colIndex) => (cell.die === null ? [] : [{ row: rowIndex, col: colIndex }])),
    );

    if (placedDice.length === 1) {
      const [{ row, col }] = placedDice;
      const isEdgeCell = row === 0 || row === board.length - 1 || col === 0 || col === board[0].length - 1;
      if (!isEdgeCell) {
        addError(row, col, 'P1');
      }
    }

    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board[row].length; col += 1) {
        const cell = board[row][col];
        if (cell.die === null) {
          continue;
        }
        const die = cell.die;

        if (placedDice.length > 1) {
          const hasAdjacentDie = ADJACENT_DIRECTIONS.some(
            ([rowDelta, colDelta]) => board[row + rowDelta]?.[col + colDelta]?.die !== null,
          );
          if (!hasAdjacentDie) {
            addError(row, col, 'P2');
          }
        }

        if (cell.restriction.type === 'color' && die.color !== cell.restriction.value) {
          addError(row, col, 'P3');
        }
        if (cell.restriction.type === 'value' && die.value !== cell.restriction.value) {
          addError(row, col, 'P4');
        }

        ORTHOGONAL_DIRECTIONS.forEach(([rowDelta, colDelta]) => {
          const adjacentDie = board[row + rowDelta]?.[col + colDelta]?.die;
          if (adjacentDie === undefined || adjacentDie === null) {
            return;
          }
          if (adjacentDie.color === die.color) {
            addError(row, col, 'P5');
          }
          if (adjacentDie.value === die.value) {
            addError(row, col, 'P6');
          }
        });
      }
    }

    return errors;
  }, [board, t]);
};

export default useValidation;
