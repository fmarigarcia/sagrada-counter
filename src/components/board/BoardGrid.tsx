import React from 'react';
import type { BoardState } from '../../types/game';
import BoardCell from './BoardCell';

interface BoardGridProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
}

const BoardGrid: React.FC<BoardGridProps> = ({ board, onCellClick }) => {
  return (
    <div className="grid grid-cols-5 gap-2 rounded-2xl bg-gray-100 p-3">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <BoardCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            onCellClick={onCellClick}
          />
        )),
      )}
    </div>
  );
};

export default BoardGrid;
