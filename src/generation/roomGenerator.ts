import type { Cell, GeneratedRoom, RoomGrid } from "./types";
import { TileType } from "./types";
import { floodFillReachable, isReachable } from "./pathfinding";

function createBorderedGrid(cols: number, rows: number): RoomGrid {
  const grid: RoomGrid = [];
  for (let row = 0; row < rows; row++) {
    const line: TileType[] = [];
    for (let col = 0; col < cols; col++) {
      const isBorder = row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
      line.push(isBorder ? TileType.WALL : TileType.FLOOR);
    }
    grid.push(line);
  }
  return grid;
}

function scatterInteriorWalls(grid: RoomGrid, density: number): void {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let row = 1; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      if (Math.random() < density) {
        grid[row][col] = TileType.WALL;
      }
    }
  }
}

function pickRandomFloorCell(grid: RoomGrid, excluding: Set<string>): Cell | null {
  const rows = grid.length;
  const cols = grid[0].length;
  const maxTries = rows * cols * 4;
  for (let i = 0; i < maxTries; i++) {
    const row = 1 + Math.floor(Math.random() * (rows - 2));
    const col = 1 + Math.floor(Math.random() * (cols - 2));
    const k = `${row},${col}`;
    if (grid[row][col] === TileType.FLOOR && !excluding.has(k)) {
      return { row, col };
    }
  }
  return null;
}

function buildEmptyRoom(cols: number, rows: number, gemCount: number): GeneratedRoom {
  const grid = createBorderedGrid(cols, rows);
  const used = new Set<string>();

  const playerStart = pickRandomFloorCell(grid, used)!;
  used.add(`${playerStart.row},${playerStart.col}`);

  const exitPos = pickRandomFloorCell(grid, used)!;
  used.add(`${exitPos.row},${exitPos.col}`);

  const gemPositions: Cell[] = [];
  for (let i = 0; i < gemCount; i++) {
    const gem = pickRandomFloorCell(grid, used)!;
    used.add(`${gem.row},${gem.col}`);
    gemPositions.push(gem);
  }

  grid[exitPos.row][exitPos.col] = TileType.EXIT;
  for (const gem of gemPositions) {
    grid[gem.row][gem.col] = TileType.GEM;
  }

  return { grid, playerStart, exitPos, gemPositions };
}

export function generateRoom(
  cols: number,
  rows: number,
  gemCount: number,
  wallDensity: number,
  maxAttempts: number,
): GeneratedRoom {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid = createBorderedGrid(cols, rows);
    scatterInteriorWalls(grid, wallDensity);

    const used = new Set<string>();

    const playerStart = pickRandomFloorCell(grid, used);
    if (!playerStart) continue;
    used.add(`${playerStart.row},${playerStart.col}`);

    const exitPos = pickRandomFloorCell(grid, used);
    if (!exitPos) continue;
    used.add(`${exitPos.row},${exitPos.col}`);

    const gemPositions: Cell[] = [];
    let gemPickFailed = false;
    for (let i = 0; i < gemCount; i++) {
      const gem = pickRandomFloorCell(grid, used);
      if (!gem) {
        gemPickFailed = true;
        break;
      }
      used.add(`${gem.row},${gem.col}`);
      gemPositions.push(gem);
    }
    if (gemPickFailed) continue;

    const reachable = floodFillReachable(grid, playerStart);
    const targets = [...gemPositions, exitPos];
    const allReachable = targets.every((t) => isReachable(reachable, t));

    if (allReachable) {
      grid[exitPos.row][exitPos.col] = TileType.EXIT;
      for (const gem of gemPositions) {
        grid[gem.row][gem.col] = TileType.GEM;
      }
      return { grid, playerStart, exitPos, gemPositions };
    }
  }

  return buildEmptyRoom(cols, rows, gemCount);
}
