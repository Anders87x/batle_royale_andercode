import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from "../config/game-config.js";

export class LobbyEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.blockers = [];

    this.createAtlasFrames();
    this.drawRoom();
    this.createSpriteDecorations();
    this.createGuildExhibit();
    this.createWaitingArea();
    this.createTrainingArea();
  }

  createAtlasFrames() {
    const interior = this.scene.textures.get("lobby-interior");
    const walls = this.scene.textures.get("lobby-walls");

    interior.add("dragon-skeleton", 0, 176, 0, 208, 96);
    interior.add("notice-board", 0, 0, 192, 64, 64);
    interior.add("bookshelf", 0, 256, 96, 64, 96);
    interior.add("bookshelf-alt", 0, 320, 96, 64, 96);
    interior.add("weapon-display", 0, 288, 192, 64, 64);
    interior.add("guild-banner", 0, 192, 320, 64, 64);
    interior.add("weapon-rack", 0, 0, 320, 64, 64);

    walls.add("guild-wall-strip", 0, 0, 64, 288, 64);
  }

  drawRoom() {
    const graphics = this.scene.add.graphics().setDepth(-20);

    graphics.fillStyle(0x8a5a3b, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    for (let y = 176; y < WORLD_HEIGHT; y += 32) {
      const alternate = Math.floor(y / 32) % 2 === 0;

      graphics.fillStyle(alternate ? 0x9a6846 : 0x865638, 1);
      graphics.fillRect(44, y, WORLD_WIDTH - 88, 32);

      graphics.lineStyle(2, 0x6f442f, 0.65);
      graphics.lineBetween(44, y, WORLD_WIDTH - 44, y);

      const offset = alternate ? 0 : 48;

      for (let x = 44 + offset; x < WORLD_WIDTH - 44; x += 96) {
        graphics.lineBetween(x, y, x, y + 32);
      }
    }

    graphics.fillStyle(0xd7b07c, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, 176);

    graphics.fillStyle(0xb88759, 1);
    graphics.fillRect(0, 132, WORLD_WIDTH, 44);

    graphics.fillStyle(0x67506c, 1);
    graphics.fillRect(0, 132, WORLD_WIDTH, 8);

    graphics.fillStyle(0x4c342d, 1);
    graphics.fillRect(0, 0, 44, WORLD_HEIGHT);
    graphics.fillRect(WORLD_WIDTH - 44, 0, 44, WORLD_HEIGHT);
    graphics.fillRect(0, WORLD_HEIGHT - 36, WORLD_WIDTH, 36);

    this.addBlocker(WORLD_WIDTH / 2, 86, WORLD_WIDTH, 172);
    this.addBlocker(22, WORLD_HEIGHT / 2, 44, WORLD_HEIGHT);
    this.addBlocker(WORLD_WIDTH - 22, WORLD_HEIGHT / 2, 44, WORLD_HEIGHT);
    this.addBlocker(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT - 18,
      WORLD_WIDTH,
      36
    );
  }

  createSpriteDecorations() {
    // Módulos reales del pack, alineados a grilla y sin escalas fraccionarias.
    const wallY = 72;
    const wallStarts = [144, 432, 720, 1008];

    wallStarts.forEach((x) => {
      this.addDecoration(
        x,
        wallY,
        "lobby-walls",
        "guild-wall-strip",
        1,
        -5
      );
    });

    this.addDecoration(
      64,
      72,
      "lobby-interior",
      "bookshelf",
      1,
      -2
    );

    this.addDecoration(
      1312,
      72,
      "lobby-interior",
      "bookshelf-alt",
      1,
      -2
    );

    this.addDecoration(
      208,
      96,
      "lobby-interior",
      "notice-board",
      1,
      -1
    );

    this.addDecoration(
      1168,
      96,
      "lobby-interior",
      "weapon-display",
      1,
      -1
    );

    this.addDecoration(
      688,
      80,
      "lobby-interior",
      "guild-banner",
      1,
      0
    );

    this.addDecoration(
      48,
      104,
      "lobby-interior",
      "weapon-rack",
      1,
      -1
    );

    this.addDecoration(
      1328,
      104,
      "lobby-interior",
      "weapon-rack",
      1,
      -1,
      true
    );
  }

  addDecoration(
    x,
    y,
    texture,
    frame,
    scale = 1,
    depth = 0,
    flipX = false
  ) {
    return this.scene.add
      .image(x, y, texture, frame)
      .setOrigin(0, 0)
      .setScale(scale)
      .setDepth(depth)
      .setFlipX(flipX);
  }

  createGuildExhibit() {
    const centerX = WORLD_WIDTH / 2;

    const platform = this.scene.add.graphics().setDepth(-2);

    platform.fillStyle(0x6a4334, 0.95);
    platform.fillRoundedRect(centerX - 285, 210, 570, 195, 24);

    platform.lineStyle(4, 0x3f2b2a, 0.95);
    platform.strokeRoundedRect(centerX - 285, 210, 570, 195, 24);

    platform.fillStyle(0x5a3940, 0.38);
    platform.fillEllipse(centerX, 315, 500, 130);

    this.scene.add
      .image(centerX, 302, "lobby-interior", "dragon-skeleton")
      .setScale(2)
      .setDepth(1);

    this.scene.add
      .text(centerX, 392, "TROFEO DEL GREMIO", {
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#f7e0b3",
        backgroundColor: "#2d1c22cc",
        padding: {
          x: 10,
          y: 6,
        },
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.addBlocker(centerX, 310, 530, 170);
  }

  createWaitingArea() {
    const centerX = 545;
    const centerY = 650;

    const floor = this.scene.add.graphics().setDepth(-5);

    floor.fillStyle(0x65445f, 0.28);
    floor.fillCircle(centerX, centerY, 145);

    floor.lineStyle(4, 0xe7b34a, 0.78);
    floor.strokeCircle(centerX, centerY, 145);

    floor.lineStyle(2, 0xf3d28a, 0.42);
    floor.strokeCircle(centerX, centerY, 115);

    this.scene.add
      .text(centerX, centerY - 178, "ZONA DE ESPERA", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffe3a0",
        backgroundColor: "#2a1726dd",
        padding: {
          x: 12,
          y: 7,
        },
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.scene.add
      .text(
        centerX,
        centerY + 178,
        "Los jugadores aparecerán aquí antes de iniciar la partida",
        {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#f7ead8",
          backgroundColor: "#2a1726cc",
          padding: {
            x: 10,
            y: 6,
          },
        }
      )
      .setOrigin(0.5)
      .setDepth(8);
  }

  createTrainingArea() {
    const x = 1085;
    const y = 625;
    const width = 310;
    const height = 275;

    const area = this.scene.add.graphics().setDepth(-4);

    area.fillStyle(0x243447, 0.18);
    area.fillRoundedRect(x - width / 2, y - height / 2, width, height, 22);

    area.lineStyle(3, 0x7897b7, 0.72);
    area.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      22
    );

    this.scene.add
      .text(x, y - height / 2 - 28, "ZONA DE ENTRENAMIENTO", {
        fontFamily: "Arial",
        fontSize: "19px",
        fontStyle: "bold",
        color: "#d9ecff",
        backgroundColor: "#172033dd",
        padding: {
          x: 12,
          y: 7,
        },
      })
      .setOrigin(0.5)
      .setDepth(8);
  }

  addBlocker(x, y, width, height) {
    const blocker = this.scene.add
      .rectangle(x, y, width, height, 0x000000, 0)
      .setDepth(-1);

    this.scene.physics.add.existing(blocker, true);
    this.blockers.push(blocker);

    return blocker;
  }

  getBlockers() {
    return this.blockers;
  }
}
