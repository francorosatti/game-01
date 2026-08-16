import Phaser from "phaser";
import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from "./config/gameConfig";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: ROOM_COLS * TILE_SIZE,
  height: ROOM_ROWS * TILE_SIZE,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene],
};

new Phaser.Game(config);
