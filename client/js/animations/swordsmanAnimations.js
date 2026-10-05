import {
  DIRECTIONS,
  IDLE_FRAMES_BY_DIRECTION,
  IDLE_COLUMNS,
  WALK_FRAMES_PER_DIRECTION,
  ATTACK_FRAMES_PER_DIRECTION,
  HURT_FRAMES_PER_DIRECTION,
  DEATH_FRAMES_PER_DIRECTION,
} from "../config/game-config.js";

export function createSwordsmanAnimations(scene) {
  Object.entries(DIRECTIONS).forEach(([direction, row]) => {
    const idleStart = row * IDLE_COLUMNS;
    const idleFrameCount = IDLE_FRAMES_BY_DIRECTION[direction];
    const walkStart = row * WALK_FRAMES_PER_DIRECTION;
    const attackStart = row * ATTACK_FRAMES_PER_DIRECTION;
    const hurtStart = row * HURT_FRAMES_PER_DIRECTION;
    const deathStart = row * DEATH_FRAMES_PER_DIRECTION;

    scene.anims.create({
      key: `idle-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-idle", {
        start: idleStart,
        end: idleStart + idleFrameCount - 1,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: `walk-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-walk", {
        start: walkStart,
        end: walkStart + WALK_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: `attack-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-attack", {
        start: attackStart,
        end: attackStart + ATTACK_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 14,
      repeat: 0,
    });

    scene.anims.create({
      key: `hurt-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-hurt", {
        start: hurtStart,
        end: hurtStart + HURT_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: `death-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-death", {
        start: deathStart,
        end: deathStart + DEATH_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 10,
      repeat: 0,
    });
  });
}
