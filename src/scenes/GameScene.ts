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
import { floodFillReachable } from "../generation/pathfinding";
import { Player } from "../entities/Player";
import { Snake } from "../entities/Snake";
import { GameState } from "../state/GameState";
import { Hud } from "../ui/Hud";
import { tileCenter } from "../utils/tileCenter";

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private player!: Player;
  private snake?: Snake;
  private hud!: Hud;
  private gameOverText!: Phaser.GameObjects.Text;
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

    this.snake = undefined;
    if (this.gameState.snakeEnabled) {
      const occupied = new Set<string>([
        `${room.playerStart.row},${room.playerStart.col}`,
        `${room.exitPos.row},${room.exitPos.col}`,
        ...room.gemPositions.map((g) => `${g.row},${g.col}`),
      ]);
      const reachable = floodFillReachable(room.grid, room.playerStart);
      const snakeCandidates = Array.from(reachable)
        .filter((k) => !occupied.has(k))
        .map((k) => {
          const [row, col] = k.split(",").map(Number);
          return { row, col };
        });
      const snakeStart =
        snakeCandidates.length > 0
          ? snakeCandidates[Math.floor(Math.random() * snakeCandidates.length)]
          : room.playerStart;
      this.snake = new Snake(this, room.grid, snakeStart.row, snakeStart.col);
    }

    this.hud = new Hud(this);
    this.hud.update(this.gameState.levelNumber, this.gameState.gemsCollected, this.gameState.totalGemsPerLevel);

    this.gameOverText = this.add
      .text(worldWidth / 2, worldHeight / 2, "GAME OVER\nPress any key to restart", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        backgroundColor: "#000000cc",
        padding: { x: 14, y: 12 },
      })
      .setOrigin(0.5)
      .setDepth(2000)
      .setVisible(false);

    this.physics.add.collider(this.player.sprite, this.wallsGroup);
    this.physics.add.overlap(
      this.player.sprite,
      this.gemsGroup,
      (_player, gem) => this.onGemCollected(gem as Phaser.Physics.Arcade.Sprite),
      undefined,
      this,
    );
    this.physics.add.overlap(this.player.sprite, this.exitSprite, () => this.onExitReached(), undefined, this);
    if (this.snake) {
      this.physics.add.overlap(this.player.sprite, this.snake.sprite, () => this.onSnakeTouch(), undefined, this);
    }
  }

  update(): void {
    if (this.gameState.gameOver) return;
    this.player.update();
    this.snake?.update();
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

  private onSnakeTouch(): void {
    if (this.gameState.gameOver) return;
    this.gameState.loseGame();
    this.physics.pause();
    this.gameOverText.setVisible(true);
    this.input.keyboard!.once("keydown", () => {
      this.gameState.levelNumber = 1;
      this.scene.restart();
    });
  }
}
