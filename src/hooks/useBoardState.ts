import { useCallback, useState } from 'react';
import type { BoardState, Cell, CellRestriction, Die, WindowPattern } from '../types/game';

const createEmptyBoard = (restrictions?: CellRestriction[][]): BoardState =>
  Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 5 }, (_, col): Cell => ({
      restriction: restrictions?.[row]?.[col] ?? { type: 'none' },
      die: null,
    })),
  );

interface UseBoardStateReturn {
  board: BoardState;
  setDie: (row: number, col: number, die: Die | null) => void;
  loadPattern: (pattern: WindowPattern) => void;
  reset: () => void;
}

const useBoardState = (): UseBoardStateReturn => {
  const [board, setBoard] = useState<BoardState>(() => createEmptyBoard());
  const [currentPattern, setCurrentPattern] = useState<WindowPattern | null>(null);

  const setDie = useCallback((row: number, col: number, die: Die | null): void => {
    setBoard((prev) =>
      prev.map((boardRow, rowIndex) =>
        boardRow.map((cell, colIndex) =>
          rowIndex === row && colIndex === col ? { ...cell, die } : cell,
        ),
      ),
    );
  }, []);

  const loadPattern = useCallback((pattern: WindowPattern): void => {
    setCurrentPattern(pattern);
    setBoard(createEmptyBoard(pattern.grid));
  }, []);

  const reset = useCallback((): void => {
    setBoard(createEmptyBoard(currentPattern?.grid));
  }, [currentPattern]);

  return {
    board,
    setDie,
    loadPattern,
    reset,
  };
};

export default useBoardState;
