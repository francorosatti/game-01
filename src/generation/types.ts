export const TileType = {
  FLOOR: 0,
  WALL: 1,
  GEM: 2,
  EXIT: 3,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

export type RoomGrid = TileType[][];

export interface Cell {
  row: number;
  col: number;
}

export interface GeneratedRoom {
  grid: RoomGrid;
  playerStart: Cell;
  exitPos: Cell;
  gemPositions: Cell[];
}
