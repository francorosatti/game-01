import type { Cell, RoomGrid } from "./types";
import { TileType } from "./types";

function key(cell: Cell): string {
  return `${cell.row},${cell.col}`;
}

export function floodFillReachable(grid: RoomGrid, start: Cell): Set<string> {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const queue: Cell[] = [start];
  visited.add(key(start));

  const deltas = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const d of deltas) {
      const next: Cell = { row: cur.row + d.row, col: cur.col + d.col };
      if (
        next.row >= 0 &&
        next.row < rows &&
        next.col >= 0 &&
        next.col < cols &&
        !visited.has(key(next)) &&
        grid[next.row][next.col] !== TileType.WALL
      ) {
        visited.add(key(next));
        queue.push(next);
      }
    }
  }

  return visited;
}

export function isReachable(reachable: Set<string>, cell: Cell): boolean {
  return reachable.has(key(cell));
}
