const Phaser = window.Phaser;

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const LOBBY_WIDTH = 1440;
export const ARENA_X = 1600;
export const ARENA_WIDTH = 1440;
export const WORLD_WIDTH = 3200;
export const WORLD_HEIGHT = 900;

export const FRAME_SIZE = 64;
export const PLAYER_SPEED = 180;
export const SHOW_HITBOX_DEBUG = false;

export const ABILITIES = {
  attack1: {
    label: "Ataque normal",
    keyLabel: "LMB / SPACE",
    damage: 25,
    cooldown: 800,
    impactDelay: 250,
  },
  attack2: {
    label: "Embestida",
    keyLabel: "Q",
    damage: 35,
    cooldown: 4000,
    impactDelay: 100,
    dashSpeed: 650,
    dashDuration: 230,
    range: 220,
  },
  attack3: {
    label: "Giro 360°",
    keyLabel: "E",
    damage: 30,
    cooldown: 7000,
    impactDelay: 170,
    radius: 115,
  },
};

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
