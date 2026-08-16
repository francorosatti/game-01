import Phaser from "phaser";
import {
  TILE_SIZE,
  ROOM_COLS,
  ROOM_ROWS,
  GEM_COUNT,
  WALL_DENSITY,
  MAX_GEN_ATTEMPTS,
  COLORS,
} from "../config/gameConfig";
import { generateRoom } from "../generation/roomGenerator";
import { TileType } from "../generation/types";
import { Player } from "../entities/Player";
import { GameState } from "../state/GameState";
import { Hud } from "../ui/Hud";

function tileCenter(row: number, col: number): { x: number; y: number } {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
}

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private player!: Player;
  private hud!: Hud;
  private exitSprite!: Phaser.Physics.Arcade.Sprite;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private gemsGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.gameState = this.registry.get("gameState") as GameState;
    this.gameState.resetForNewLevel();

    this.cameras.main.setBackgroundColor(COLORS.background);

    const room = generateRoom(ROOM_COLS, ROOM_ROWS, GEM_COUNT, WALL_DENSITY, MAX_GEN_ATTEMPTS);

    const worldWidth = ROOM_COLS * TILE_SIZE;
    const worldHeight = ROOM_ROWS * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.wallsGroup = this.physics.add.staticGroup();
    this.gemsGroup = this.physics.add.staticGroup();

    for (let row = 0; row < room.grid.length; row++) {
      for (let col = 0; col < room.grid[row].length; col++) {
        if (room.grid[row][col] === TileType.WALL) {
          const { x, y } = tileCenter(row, col);
          this.wallsGroup.create(x, y, "wall");
        }
      }
    }

    for (const gem of room.gemPositions) {
      const { x, y } = tileCenter(gem.row, gem.col);
      this.gemsGroup.create(x, y, "gem");
    }

    const exitCenter = tileCenter(room.exitPos.row, room.exitPos.col);
    this.exitSprite = this.physics.add.staticSprite(exitCenter.x, exitCenter.y, "exit-locked");

    const startCenter = tileCenter(room.playerStart.row, room.playerStart.col);
    this.player = new Player(this, startCenter.x, startCenter.y);

    this.hud = new Hud(this);
    this.hud.update(this.gameState.levelNumber, this.gameState.gemsCollected, this.gameState.totalGemsPerLevel);

    this.physics.add.collider(this.player.sprite, this.wallsGroup);
    this.physics.add.overlap(
      this.player.sprite,
      this.gemsGroup,
      (_player, gem) => this.onGemCollected(gem as Phaser.Physics.Arcade.Sprite),
      undefined,
      this,
    );
    this.physics.add.overlap(this.player.sprite, this.exitSprite, () => this.onExitReached(), undefined, this);
  }

  update(): void {
    this.player.update();
  }

  private onGemCollected(gem: Phaser.Physics.Arcade.Sprite): void {
    gem.destroy();
    this.gameState.collectGem();
    this.hud.update(this.gameState.levelNumber, this.gameState.gemsCollected, this.gameState.totalGemsPerLevel);

    if (this.gameState.exitUnlocked) {
      this.exitSprite.setTexture("exit-open");
    }
  }

  private onExitReached(): void {
    if (!this.gameState.exitUnlocked) return;
    this.gameState.levelNumber++;
    this.scene.restart();
  }
}
