export type Color = string;

export interface TubeData {
  id: number;
  colors: Color[];
  capacity: number;
}

export interface MoveHistory {
  from: number;
  to: number;
  color: Color;
  count: number;
}
