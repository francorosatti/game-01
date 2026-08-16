import Phaser from "phaser";
import { TILE_SIZE, COLORS, GEM_COUNT } from "../config/gameConfig";
import { GameState } from "../state/GameState";
import { loadSnakeEnabled } from "../state/preferences";

function makeRectTexture(scene: Phaser.Scene, key: string, size: number, color: number): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color);
  g.fillRect(0, 0, size, size);
  g.generateTexture(key, size, size);
  g.destroy();
}

function makeCircleTexture(scene: Phaser.Scene, key: string, size: number, color: number): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(color);
  g.fillCircle(size / 2, size / 2, size / 2);
  g.generateTexture(key, size, size);
  g.destroy();
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    makeRectTexture(this, "wall", TILE_SIZE, COLORS.wall);
    makeCircleTexture(this, "gem", TILE_SIZE * 0.6, COLORS.gem);
    makeRectTexture(this, "exit-locked", TILE_SIZE, COLORS.exitLocked);
    makeRectTexture(this, "exit-open", TILE_SIZE, COLORS.exitOpen);
    makeCircleTexture(this, "player", TILE_SIZE * 0.8, COLORS.player);
    makeRectTexture(this, "snake", TILE_SIZE * 0.8, COLORS.snake);

    const gameState = new GameState(GEM_COUNT);
    gameState.snakeEnabled = loadSnakeEnabled();
    this.registry.set("gameState", gameState);

    this.scene.start("MenuScene");
  }
}
