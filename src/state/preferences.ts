const SNAKE_ENABLED_KEY = "gemRoom.snakeEnabled";

export function loadSnakeEnabled(): boolean {
  const stored = localStorage.getItem(SNAKE_ENABLED_KEY);
  return stored === null ? true : stored === "true";
}

export function saveSnakeEnabled(enabled: boolean): void {
  localStorage.setItem(SNAKE_ENABLED_KEY, String(enabled));
}
