export type DiceColor = 'red' | 'yellow' | 'green' | 'blue' | 'purple';
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface Die {
  color: DiceColor;
  value: DiceValue;
}

export type CellRestriction =
  | { type: 'color'; value: DiceColor }
  | { type: 'value'; value: DiceValue }
  | { type: 'none' };

export interface Cell {
  restriction: CellRestriction;
  die: Die | null;
}

export type BoardState = Cell[][];

export interface WindowPattern {
  id: string;
  name: string;
  difficulty: number;
  grid: CellRestriction[][];
}
