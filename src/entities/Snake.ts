import Phaser from "phaser";
import { SNAKE_SPEED, SNAKE_TURN_CHANCE } from "../config/gameConfig";
import type { Cell, RoomGrid } from "../generation/types";
import { TileType } from "../generation/types";
import { tileCenter } from "../utils/tileCenter";

const DIRECTIONS: Cell[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

function isFloor(grid: RoomGrid, row: number, col: number): boolean {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return false;
  return grid[row][col] !== TileType.WALL;
}

// Snake moves along the same 4-directional grid the room generator and
// player use, so it can never wander into a wall tile.
export class Snake {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private grid: RoomGrid;
  private row: number;
  private col: number;
  private direction: Cell;

  constructor(scene: Phaser.Scene, grid: RoomGrid, startRow: number, startCol: number) {
    this.grid = grid;
    this.row = startRow;
    this.col = startCol;

    const { x, y } = tileCenter(startRow, startCol);
    this.sprite = scene.physics.add.sprite(x, y, "snake");

    this.direction = this.pickDirection(null);
    this.applyVelocity();
  }

  update(): void {
    const target = tileCenter(this.row + this.direction.row, this.col + this.direction.col);
    const dx = target.x - this.sprite.x;
    const dy = target.y - this.sprite.y;

    if (dx * dx + dy * dy > 4) return;

    this.row += this.direction.row;
    this.col += this.direction.col;
    this.sprite.setPosition(target.x, target.y);

    const canContinueStraight = isFloor(this.grid, this.row + this.direction.row, this.col + this.direction.col);
    if (!canContinueStraight || Math.random() < SNAKE_TURN_CHANCE) {
      const reverse: Cell = { row: -this.direction.row, col: -this.direction.col };
      this.direction = this.pickDirection(reverse);
    }
    this.applyVelocity();
  }

  private pickDirection(exclude: Cell | null): Cell {
    const options = DIRECTIONS.filter((d) => isFloor(this.grid, this.row + d.row, this.col + d.col));
    const preferred = exclude ? options.filter((d) => d.row !== exclude.row || d.col !== exclude.col) : options;
    const pool = preferred.length > 0 ? preferred : options;
    return pool[Math.floor(Math.random() * pool.length)] ?? { row: 0, col: 0 };
  }

  private applyVelocity(): void {
    this.sprite.setVelocity(this.direction.col * SNAKE_SPEED, this.direction.row * SNAKE_SPEED);
  }
}
