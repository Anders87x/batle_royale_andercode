import {
  ARENA_X,
  ARENA_WIDTH,
  WORLD_HEIGHT,
} from "../config/game-config.js";

export class ArenaEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.blockers = [];

    this.drawArena();
  }

  drawArena() {
    const graphics =
      this.scene.add.graphics().setDepth(-29);

    graphics.fillStyle(
      0x23352f,
      1
    );

    graphics.fillRect(
      ARENA_X,
      0,
      ARENA_WIDTH,
      WORLD_HEIGHT
    );

    for (
      let y = 40;
      y < WORLD_HEIGHT - 40;
      y += 64
    ) {
      const alternate =
        Math.floor(y / 64) % 2 === 0;

      graphics.fillStyle(
        alternate
          ? 0x2d443b
          : 0x2a3e36,
        1
      );

      graphics.fillRect(
        ARENA_X + 40,
        y,
        ARENA_WIDTH - 80,
        64
      );

      graphics.lineStyle(
        1,
        0x182721,
        0.55
      );

      graphics.lineBetween(
        ARENA_X + 40,
        y,
        ARENA_X + ARENA_WIDTH - 40,
        y
      );
    }

    graphics.lineStyle(
      4,
      0x7b8f79,
      0.8
    );

    graphics.strokeRect(
      ARENA_X + 40,
      40,
      ARENA_WIDTH - 80,
      WORLD_HEIGHT - 80
    );

    graphics.fillStyle(
      0x101916,
      1
    );

    graphics.fillRect(
      ARENA_X,
      0,
      40,
      WORLD_HEIGHT
    );

    graphics.fillRect(
      ARENA_X + ARENA_WIDTH - 40,
      0,
      40,
      WORLD_HEIGHT
    );

    graphics.fillRect(
      ARENA_X,
      0,
      ARENA_WIDTH,
      40
    );

    graphics.fillRect(
      ARENA_X,
      WORLD_HEIGHT - 40,
      ARENA_WIDTH,
      40
    );

    this.scene.add
      .text(
        ARENA_X + ARENA_WIDTH / 2,
        78,
        "ARENA BATTLE ROYALE",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          fontStyle: "bold",
          color: "#d1fae5",
          backgroundColor: "#0f1f19cc",
          padding: {
            x: 14,
            y: 8,
          },
        }
      )
      .setOrigin(0.5)
      .setDepth(-10);

    this.addBlocker(
      ARENA_X + 20,
      WORLD_HEIGHT / 2,
      40,
      WORLD_HEIGHT
    );

    this.addBlocker(
      ARENA_X + ARENA_WIDTH - 20,
      WORLD_HEIGHT / 2,
      40,
      WORLD_HEIGHT
    );

    this.addBlocker(
      ARENA_X + ARENA_WIDTH / 2,
      20,
      ARENA_WIDTH,
      40
    );

    this.addBlocker(
      ARENA_X + ARENA_WIDTH / 2,
      WORLD_HEIGHT - 20,
      ARENA_WIDTH,
      40
    );
  }

  addBlocker(
    x,
    y,
    width,
    height
  ) {
    const blocker =
      this.scene.add
        .rectangle(
          x,
          y,
          width,
          height,
          0x000000,
          0
        )
        .setDepth(-1);

    this.scene.physics.add.existing(
      blocker,
      true
    );

    this.blockers.push(
      blocker
    );

    return blocker;
  }

  getBlockers() {
    return this.blockers;
  }
}
