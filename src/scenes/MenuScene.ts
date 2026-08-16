import Phaser from "phaser";
import { ROOM_COLS, TILE_SIZE, COLORS } from "../config/gameConfig";
import { GameState } from "../state/GameState";
import { saveSnakeEnabled } from "../state/preferences";

export class MenuScene extends Phaser.Scene {
  private gameState!: GameState;
  private toggleText!: Phaser.GameObjects.Text;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.gameState = this.registry.get("gameState") as GameState;
    this.cameras.main.setBackgroundColor(COLORS.background);

    const centerX = (ROOM_COLS * TILE_SIZE) / 2;

    this.add
      .text(centerX, 90, "GEM ROOM", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.toggleText = this.add
      .text(centerX, 170, this.toggleLabel(), {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#00000080",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.toggleText.on("pointerdown", () => this.toggleSnake());

    this.add
      .text(centerX, 230, "Press ENTER to start", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.startGame());

    this.input.keyboard!.on("keydown-S", () => this.toggleSnake());
    this.input.keyboard!.on("keydown-ENTER", () => this.startGame());
    this.input.keyboard!.on("keydown-SPACE", () => this.startGame());
  }

  private toggleLabel(): string {
    return `Snake: ${this.gameState.snakeEnabled ? "ON" : "OFF"}  (press S to toggle)`;
  }

  private toggleSnake(): void {
    this.gameState.snakeEnabled = !this.gameState.snakeEnabled;
    saveSnakeEnabled(this.gameState.snakeEnabled);
    this.toggleText.setText(this.toggleLabel());
  }

  private startGame(): void {
    this.scene.start("GameScene");
  }
}
