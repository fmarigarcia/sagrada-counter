import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BoardGrid from './components/board/BoardGrid';
import DiePicker from './components/board/DiePicker';
import WindowPatternSelector from './components/board/WindowPatternSelector';
import windowPatterns from './data/windowPatterns.json';
import useBoardState from './hooks/useBoardState';
import type { Die, WindowPattern } from './types/game';

interface SelectedCell {
  row: number;
  col: number;
}

const App: React.FC = () => {
  const { t } = useTranslation();
  const patterns = windowPatterns as WindowPattern[];
  const [selectedPatternId, setSelectedPatternId] = useState<string>(patterns[0].id);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const { board, setDie, loadPattern, reset } = useBoardState();

  useEffect(() => {
    const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId);
    if (selectedPattern) {
      loadPattern(selectedPattern);
    }
  }, [loadPattern, patterns, selectedPatternId]);

  const handlePatternSelect = (patternId: string): void => {
    setSelectedPatternId(patternId);
  };

  const handleDieConfirm = (die: Die | null): void => {
    if (!selectedCell) {
      return;
    }
    setDie(selectedCell.row, selectedCell.col, die);
  };

  const selectedDie =
    selectedCell === null ? null : board[selectedCell.row][selectedCell.col]?.die ?? null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-4 shadow">
        <header>
          <h1 className="text-center text-2xl font-bold text-indigo-700">{t('header.title')}</h1>
          <p className="text-center text-sm text-gray-500">F1 · {t('steps.board')}</p>
        </header>
        <WindowPatternSelector
          patterns={patterns}
          selectedPatternId={selectedPatternId}
          onPatternSelect={handlePatternSelect}
        />
        <BoardGrid board={board} onCellClick={(row, col) => setSelectedCell({ row, col })} />
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
        >
          {t('board.clearAllDice')}
        </button>
      </div>
      {selectedCell && (
        <DiePicker
          initialDie={selectedDie}
          onConfirm={handleDieConfirm}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
};

export default App;
