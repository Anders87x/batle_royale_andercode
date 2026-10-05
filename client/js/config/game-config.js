const Phaser = window.Phaser;

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const FRAME_SIZE = 64;
export const PLAYER_SPEED = 180;

export const ATTACK_DAMAGE = 25;
export const ATTACK_IMPACT_DELAY = 250;

export const ENEMY_MAX_HP = 100;
export const ENEMY_FACING = "left";

export const DIRECTIONS = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

export const IDLE_FRAMES_BY_DIRECTION = {
  down: 12,
  left: 12,
  right: 12,
  up: 4,
};

export const IDLE_COLUMNS = 12;
export const WALK_FRAMES_PER_DIRECTION = 6;
export const ATTACK_FRAMES_PER_DIRECTION = 8;
export const HURT_FRAMES_PER_DIRECTION = 5;
export const DEATH_FRAMES_PER_DIRECTION = 7;

export const BASE_GAME_CONFIG = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#111827",
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 0,
      },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
