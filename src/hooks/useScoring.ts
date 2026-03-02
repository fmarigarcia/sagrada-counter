import { useMemo } from 'react';
import type { BoardState, PrivateObjective, PublicObjective, ScoreBreakdown } from '../types/game';

const DICE_COLORS = ['red', 'yellow', 'green', 'blue', 'purple'] as const;
const DICE_VALUES = [1, 2, 3, 4, 5, 6] as const;

const useScoring = (
  board: BoardState,
  selectedPublic: PublicObjective[],
  selectedPrivate: PrivateObjective | null,
  favorTokens: number,
): ScoreBreakdown | null =>
  useMemo(() => {
    if (selectedPrivate === null) {
      return null;
    }

    const dice = board.flatMap((row) => row.map((cell) => cell.die).filter((die) => die !== null));

    const countRowsWithUnique = (field: 'color' | 'value'): number =>
      board.reduce((total, row) => {
        const rowDice = row.map((cell) => cell.die);
        if (rowDice.some((die) => die === null)) {
          return total;
        }
        const values = rowDice
          .filter((die): die is NonNullable<typeof die> => die !== null)
          .map((die) => die[field]);
        return new Set(values).size === values.length ? total + 1 : total;
      }, 0);

    const countColsWithUnique = (field: 'color' | 'value'): number =>
      board[0].reduce((total, _, colIndex) => {
        const colDice = board.map((row) => row[colIndex].die);
        if (colDice.some((die) => die === null)) {
          return total;
        }
        const values = colDice
          .filter((die): die is NonNullable<typeof die> => die !== null)
          .map((die) => die[field]);
        return new Set(values).size === values.length ? total + 1 : total;
      }, 0);

    const valueCounts = DICE_VALUES.reduce(
      (counts, value) => ({ ...counts, [value]: dice.filter((die) => die.value === value).length }),
      {} as Record<number, number>,
    );

    const colorCounts = DICE_COLORS.reduce(
      (counts, color) => ({ ...counts, [color]: dice.filter((die) => die.color === color).length }),
      {} as Record<string, number>,
    );

    const scoreForObjective = (objective: PublicObjective): number => {
      switch (objective.scoringType) {
        case 'rowColorVariety':
          return objective.vpPerUnit * countRowsWithUnique('color');
        case 'colColorVariety':
          return objective.vpPerUnit * countColsWithUnique('color');
        case 'rowShadeVariety':
          return objective.vpPerUnit * countRowsWithUnique('value');
        case 'colShadeVariety':
          return objective.vpPerUnit * countColsWithUnique('value');
        case 'lightShades':
          return objective.vpPerUnit * Math.min(valueCounts[1], valueCounts[2]);
        case 'mediumShades':
          return objective.vpPerUnit * Math.min(valueCounts[3], valueCounts[4]);
        case 'deepShades':
          return objective.vpPerUnit * Math.min(valueCounts[5], valueCounts[6]);
        case 'shadeVariety':
          return objective.vpPerUnit * Math.min(...DICE_VALUES.map((value) => valueCounts[value]));
        case 'colorVariety':
          return objective.vpPerUnit * Math.min(...DICE_COLORS.map((color) => colorCounts[color]));
        case 'colorDiagonals':
          return board.reduce(
            (total, row, rowIndex) =>
              total +
              row.reduce((rowTotal, cell, colIndex) => {
                if (cell.die === null) {
                  return rowTotal;
                }
                const hasMatchingDiagonal = [
                  [rowIndex - 1, colIndex - 1],
                  [rowIndex - 1, colIndex + 1],
                  [rowIndex + 1, colIndex - 1],
                  [rowIndex + 1, colIndex + 1],
                ].some(([checkRow, checkCol]) => board[checkRow]?.[checkCol]?.die?.color === cell.die?.color);
                return hasMatchingDiagonal ? rowTotal + objective.vpPerUnit : rowTotal;
              }, 0),
            0,
          );
      }
    };

    const publicScores = selectedPublic.map((objective) => ({
      objective,
      vp: scoreForObjective(objective),
    }));

    const privateScore = dice
      .filter((die) => die.color === selectedPrivate.color)
      .reduce((total, die) => total + die.value, 0);

    const openSpaces = board.flatMap((row) => row).filter((cell) => cell.die === null).length;
    const openSpacePenalty = -openSpaces;
    const publicTotal = publicScores.reduce((total, score) => total + score.vp, 0);
    const total = publicTotal + privateScore + favorTokens + openSpacePenalty;

    return {
      publicObjectives: publicScores,
      privateObjective: { objective: selectedPrivate, vp: privateScore },
      favorTokens,
      openSpacePenalty,
      total,
    };
  }, [board, favorTokens, selectedPrivate, selectedPublic]);

export default useScoring;
