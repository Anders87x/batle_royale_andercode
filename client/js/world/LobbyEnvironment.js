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
    this.createDragonCenterpiece();
    this.createWaitingArea();
    this.createTrainingArea();
  }

  createAtlasFrames() {
    const interior = this.scene.textures.get("lobby-interior");

    // Dragón del atlas Interior_objects.png.
    // Lo dividimos en dos piezas para excluir las escaleras
    // y otros sprites que comparten el mismo sector del atlas.
    interior.add("dragon-main", 0, 192, 0, 144, 96);
    interior.add("dragon-tail", 0, 304, 48, 80, 48);
  }

  drawRoom() {
    const graphics = this.scene.add.graphics().setDepth(-30);

    // Piso de madera.
    graphics.fillStyle(0x8a5a3b, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    for (let y = 184; y < WORLD_HEIGHT; y += 32) {
      const alternate = Math.floor(y / 32) % 2 === 0;

      graphics.fillStyle(alternate ? 0x986544 : 0x855538, 1);
      graphics.fillRect(40, y, WORLD_WIDTH - 80, 32);

      graphics.lineStyle(2, 0x6e432e, 0.65);
      graphics.lineBetween(40, y, WORLD_WIDTH - 40, y);

      const offset = alternate ? 0 : 48;

      for (let x = 40 + offset; x < WORLD_WIDTH - 40; x += 96) {
        graphics.lineBetween(x, y, x, y + 32);
      }
    }

    // Pared superior limpia, sin decoración.
    graphics.fillStyle(0xd9b37c, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, 184);

    graphics.fillStyle(0xb48659, 1);
    graphics.fillRect(0, 136, WORLD_WIDTH, 48);

    graphics.fillStyle(0x66506a, 1);
    graphics.fillRect(0, 136, WORLD_WIDTH, 8);

    // Bordes del mapa.
    graphics.fillStyle(0x4a332d, 1);
    graphics.fillRect(0, 0, 40, WORLD_HEIGHT);
    graphics.fillRect(WORLD_WIDTH - 40, 0, 40, WORLD_HEIGHT);
    graphics.fillRect(0, WORLD_HEIGHT - 32, WORLD_WIDTH, 32);

    // Colisiones del perímetro.
    this.addBlocker(WORLD_WIDTH / 2, 88, WORLD_WIDTH, 176);
    this.addBlocker(20, WORLD_HEIGHT / 2, 40, WORLD_HEIGHT);
    this.addBlocker(WORLD_WIDTH - 20, WORLD_HEIGHT / 2, 40, WORLD_HEIGHT);
    this.addBlocker(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT - 16,
      WORLD_WIDTH,
      32
    );
  }

  createDragonCenterpiece() {
    const centerX = WORLD_WIDTH / 2;
    const centerY = 330;

    // Base sobria para destacar al dragón sin llenar el escenario.
    const platform = this.scene.add.graphics().setDepth(-4);

    platform.fillStyle(0x5b3d38, 0.9);
    platform.fillRoundedRect(
      centerX - 260,
      centerY - 115,
      520,
      230,
      28
    );

    platform.lineStyle(4, 0x3d2927, 0.95);
    platform.strokeRoundedRect(
      centerX - 260,
      centerY - 115,
      520,
      230,
      28
    );

    platform.fillStyle(0x6d4a45, 0.45);
    platform.fillEllipse(centerX, centerY + 8, 430, 135);

    // Cuerpo principal.
    this.scene.add
      .image(
        centerX - 210,
        centerY - 108,
        "lobby-interior",
        "dragon-main"
      )
      .setOrigin(0, 0)
      .setScale(2)
      .setDepth(1);

    // Cola.
    this.scene.add
      .image(
        centerX + 78,
        centerY - 12,
        "lobby-interior",
        "dragon-tail"
      )
      .setOrigin(0, 0)
      .setScale(2)
      .setDepth(1);

    // Zona física del dragón.
    this.addBlocker(centerX, centerY + 5, 500, 190);
  }

  createWaitingArea() {
    const centerX = 470;
    const centerY = 675;

    const floor = this.scene.add.graphics().setDepth(-6);

    floor.fillStyle(0x65445f, 0.22);
    floor.fillCircle(centerX, centerY, 135);

    floor.lineStyle(4, 0xe7b34a, 0.7);
    floor.strokeCircle(centerX, centerY, 135);

    floor.lineStyle(2, 0xf3d28a, 0.35);
    floor.strokeCircle(centerX, centerY, 108);

    this.scene.add
      .text(centerX, centerY - 168, "ZONA DE ESPERA", {
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
  }

  createTrainingArea() {
    const x = 1085;
    const y = 660;
    const width = 320;
    const height = 245;

    const area = this.scene.add.graphics().setDepth(-5);

    area.fillStyle(0x243447, 0.15);
    area.fillRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      22
    );

    area.lineStyle(3, 0x7897b7, 0.65);
    area.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      22
    );

    this.scene.add
      .text(x, y - height / 2 - 26, "ZONA DE ENTRENAMIENTO", {
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
