import Phaser from "phaser";
import { PLAYER_SPEED } from "../config/gameConfig";

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;
  }

  update(): void {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    // 4-directional movement: only one axis moves at a time, matching the
    // 4-directional BFS reachability check used during room generation.
    if (left) {
      this.sprite.setVelocity(-PLAYER_SPEED, 0);
    } else if (right) {
      this.sprite.setVelocity(PLAYER_SPEED, 0);
    } else if (up) {
      this.sprite.setVelocity(0, -PLAYER_SPEED);
    } else if (down) {
      this.sprite.setVelocity(0, PLAYER_SPEED);
    } else {
      this.sprite.setVelocity(0, 0);
    }
  }
}
