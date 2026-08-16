import { TILE_SIZE } from "../config/gameConfig";

export function tileCenter(row: number, col: number): { x: number; y: number } {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
}
