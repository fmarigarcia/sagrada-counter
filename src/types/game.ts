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

export type PublicScoringType =
  | 'rowColorVariety'
  | 'colColorVariety'
  | 'rowShadeVariety'
  | 'colShadeVariety'
  | 'lightShades'
  | 'mediumShades'
  | 'deepShades'
  | 'shadeVariety'
  | 'colorVariety'
  | 'colorDiagonals';

export interface PublicObjective {
  id: string;
  nameKey: string;
  descriptionKey: string;
  vpPerUnit: number;
  scoringType: PublicScoringType;
}

export interface PrivateObjective {
  id: string;
  nameKey: string;
  color: DiceColor;
}

export interface AnalysisPlacement {
  row: number;
  col: number;
  color: DiceColor;
  value: DiceValue;
}
