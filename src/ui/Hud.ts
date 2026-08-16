import Phaser from "phaser";

export class Hud {
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(8, 8, "", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#00000080",
      padding: { x: 6, y: 4 },
    });
    this.text.setScrollFactor(0);
    this.text.setDepth(1000);
  }

  update(levelNumber: number, gemsCollected: number, totalGems: number): void {
    this.text.setText(`Level: ${levelNumber}\nGems: ${gemsCollected}/${totalGems}`);
  }
}
