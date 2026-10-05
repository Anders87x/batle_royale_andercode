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
    this.createReferenceLayout();
    this.createWaitingArea();
    this.createTrainingArea();
  }

  createAtlasFrames() {
    const interior = this.scene.textures.get("lobby-interior");

    // Recortes tomados del atlas Interior_objects.png (384x384).
    // El dragón se divide en cuerpo y cola para no incluir las escaleras
    // que comparten espacio con él dentro del atlas.
    interior.add("dragon-body", 0, 176, 0, 144, 96);
    interior.add("dragon-tail", 0, 320, 64, 64, 32);

    interior.add("notice-board-left", 0, 64, 192, 64, 64);
    interior.add("notice-board-right", 0, 192, 192, 64, 64);

    interior.add("guild-desk", 0, 192, 256, 96, 64);
    interior.add("guild-rug", 0, 0, 208, 80, 80);

    interior.add("guild-banner", 0, 224, 320, 32, 64);
    interior.add("plant-left", 0, 256, 320, 32, 64);
    interior.add("plant-right", 0, 288, 320, 32, 64);

    interior.add("bookshelf-left", 0, 256, 96, 64, 96);
    interior.add("bookshelf-right", 0, 320, 96, 64, 96);
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

    // Pared superior limpia.
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

  createReferenceLayout() {
    const centerX = WORLD_WIDTH / 2;

    // Tableros laterales.
    this.addDecoration(
      170,
      72,
      "notice-board-left",
      2,
      1
    );

    this.addDecoration(
      WORLD_WIDTH - 298,
      72,
      "notice-board-right",
      2,
      1
    );

    // Banner central.
    this.addDecoration(
      centerX - 32,
      30,
      "guild-banner",
      2,
      2
    );

    // Plantas a ambos lados del banner.
    this.addDecoration(
      centerX - 170,
      44,
      "plant-left",
      2,
      2
    );

    this.addDecoration(
      centerX + 106,
      44,
      "plant-right",
      2,
      2
    );

    // Alfombra y escritorio como en la referencia.
    this.addDecoration(
      centerX - 80,
      184,
      "guild-rug",
      2,
      -2
    );

    this.addDecoration(
      centerX - 96,
      176,
      "guild-desk",
      2,
      3
    );

    // Dragón construido en dos piezas.
    const dragonX = centerX - 235;
    const dragonY = 172;

    this.addDecoration(
      dragonX,
      dragonY,
      "dragon-body",
      2,
      1
    );

    this.addDecoration(
      dragonX + 288,
      dragonY + 128,
      "dragon-tail",
      2,
      1
    );

    // Libreros discretos en los extremos.
    this.addDecoration(
      44,
      70,
      "bookshelf-left",
      1,
      1
    );

    this.addDecoration(
      WORLD_WIDTH - 108,
      70,
      "bookshelf-right",
      1,
      1
    );

    // Evita atravesar el escritorio y el dragón.
    this.addBlocker(centerX, 268, 520, 205);
  }

  addDecoration(x, y, frame, scale = 1, depth = 0) {
    return this.scene.add
      .image(x, y, "lobby-interior", frame)
      .setOrigin(0, 0)
      .setScale(scale)
      .setDepth(depth);
  }

  createWaitingArea() {
    const centerX = 505;
    const centerY = 660;

    const floor = this.scene.add.graphics().setDepth(-6);

    floor.fillStyle(0x65445f, 0.22);
    floor.fillCircle(centerX, centerY, 140);

    floor.lineStyle(4, 0xe7b34a, 0.7);
    floor.strokeCircle(centerX, centerY, 140);

    floor.lineStyle(2, 0xf3d28a, 0.35);
    floor.strokeCircle(centerX, centerY, 112);

    this.scene.add
      .text(centerX, centerY - 174, "ZONA DE ESPERA", {
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
    const y = 645;
    const width = 320;
    const height = 250;

    const area = this.scene.add.graphics().setDepth(-5);

    area.fillStyle(0x243447, 0.15);
    area.fillRoundedRect(x - width / 2, y - height / 2, width, height, 22);

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
