import { BASE_GAME_CONFIG } from "./config/game-config.js";
import { GameScene } from "./scenes/GameScene.js";

const Phaser = window.Phaser;

new Phaser.Game({
  ...BASE_GAME_CONFIG,
  scene: [GameScene],
});
