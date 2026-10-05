import {
  LOBBY_WIDTH,
  WORLD_HEIGHT,
} from "../config/game-config.js";

export class LobbyEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.blockers = [];

    this.drawRoom();
  }

  drawRoom() {
    const graphics =
      this.scene.add.graphics().setDepth(-30);

    graphics.fillStyle(0x8a5a3b, 1);
    graphics.fillRect(
      0,
      0,
      LOBBY_WIDTH,
      WORLD_HEIGHT
    );

    for (
      let y = 184;
      y < WORLD_HEIGHT;
      y += 32
    ) {
      const alternate =
        Math.floor(y / 32) % 2 === 0;

      graphics.fillStyle(
        alternate
          ? 0x986544
          : 0x855538,
        1
      );

      graphics.fillRect(
        40,
        y,
        LOBBY_WIDTH - 80,
        32
      );

      graphics.lineStyle(
        2,
        0x6e432e,
        0.65
      );

      graphics.lineBetween(
        40,
        y,
        LOBBY_WIDTH - 40,
        y
      );

      const offset =
        alternate ? 0 : 48;

      for (
        let x = 40 + offset;
        x < LOBBY_WIDTH - 40;
        x += 96
      ) {
        graphics.lineBetween(
          x,
          y,
          x,
          y + 32
        );
      }
    }

    graphics.fillStyle(
      0xd9b37c,
      1
    );

    graphics.fillRect(
      0,
      0,
      LOBBY_WIDTH,
      184
    );

    graphics.fillStyle(
      0xb48659,
      1
    );

    graphics.fillRect(
      0,
      136,
      LOBBY_WIDTH,
      48
    );

    graphics.fillStyle(
      0x66506a,
      1
    );

    graphics.fillRect(
      0,
      136,
      LOBBY_WIDTH,
      8
    );

    graphics.fillStyle(
      0x4a332d,
      1
    );

    graphics.fillRect(
      0,
      0,
      40,
      WORLD_HEIGHT
    );

    graphics.fillRect(
      LOBBY_WIDTH - 40,
      0,
      40,
      WORLD_HEIGHT
    );

    graphics.fillRect(
      0,
      WORLD_HEIGHT - 32,
      LOBBY_WIDTH,
      32
    );

    this.addBlocker(
      LOBBY_WIDTH / 2,
      88,
      LOBBY_WIDTH,
      176
    );

    this.addBlocker(
      20,
      WORLD_HEIGHT / 2,
      40,
      WORLD_HEIGHT
    );

    this.addBlocker(
      LOBBY_WIDTH - 20,
      WORLD_HEIGHT / 2,
      40,
      WORLD_HEIGHT
    );

    this.addBlocker(
      LOBBY_WIDTH / 2,
      WORLD_HEIGHT - 16,
      LOBBY_WIDTH,
      32
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
