export class GameState {
  levelNumber = 1;
  gemsCollected = 0;
  readonly totalGemsPerLevel: number;
  exitUnlocked = false;

  constructor(totalGemsPerLevel: number) {
    this.totalGemsPerLevel = totalGemsPerLevel;
  }

  resetForNewLevel(): void {
    this.gemsCollected = 0;
    this.exitUnlocked = false;
  }

  collectGem(): void {
    this.gemsCollected++;
    if (this.gemsCollected >= this.totalGemsPerLevel) {
      this.exitUnlocked = true;
    }
  }
}
