import React from 'react';
import type { BoardState, ValidationError } from '../../types/game';
import BoardCell from './BoardCell';

interface BoardGridProps {
  board: BoardState;
  errors: ValidationError[];
  onCellClick: (row: number, col: number) => void;
}

const BoardGrid: React.FC<BoardGridProps> = ({ board, errors, onCellClick }) => {
  const errorCells = new Set(errors.map((error) => `${error.row}-${error.col}`));

  return (
    <div className="grid grid-cols-5 gap-2 rounded-2xl bg-gray-100 p-3">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <BoardCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            hasError={errorCells.has(`${rowIndex}-${colIndex}`)}
            onCellClick={onCellClick}
          />
        )),
      )}
    </div>
  );
};

export default BoardGrid;
