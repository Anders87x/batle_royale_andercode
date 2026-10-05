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
    this.createFurniture();
    this.createWaitingArea();
    this.createTrainingArea();
  }

  createAtlasFrames() {
    const interior = this.scene.textures.get("lobby-interior");

    // Objetos rectangulares y fáciles de aislar del atlas Interior_objects.png.
    interior.add("bookshelf-a", 0, 192, 96, 48, 64);
    interior.add("bookshelf-b", 0, 256, 96, 48, 64);

    interior.add("notice-board-a", 0, 48, 160, 48, 64);
    interior.add("notice-board-b", 0, 96, 160, 48, 64);

    interior.add("desk-a", 0, 192, 224, 64, 32);
    interior.add("desk-b", 0, 288, 224, 64, 32);

    interior.add("weapon-shelf", 0, 304, 160, 64, 64);
    interior.add("bench-a", 0, 80, 224, 48, 24);
    interior.add("bench-b", 0, 128, 224, 48, 24);

    interior.add("rug", 0, 0, 224, 64, 96);
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

    // Pared superior deliberadamente limpia.
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

    // Colisiones del perímetro y de la pared.
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

  createFurniture() {
    // Libreros sobre la pared.
    this.addFurniture(
      90,
      55,
      "bookshelf-a",
      2,
      1
    );

    this.addFurniture(
      WORLD_WIDTH - 186,
      55,
      "bookshelf-b",
      2,
      1
    );

    // Tableros centrales.
    this.addFurniture(
      350,
      55,
      "notice-board-a",
      2,
      1
    );

    this.addFurniture(
      WORLD_WIDTH - 446,
      55,
      "notice-board-b",
      2,
      1
    );

    // Estante de armas.
    this.addFurniture(
      WORLD_WIDTH - 300,
      70,
      "weapon-shelf",
      1.5,
      1
    );

    // Zona de reunión con alfombra y dos escritorios.
    const meetingX = WORLD_WIDTH / 2;

    this.addFurniture(
      meetingX - 64,
      245,
      "rug",
      2,
      -2
    );

    this.addFurniture(
      meetingX - 230,
      260,
      "desk-a",
      2,
      2
    );

    this.addFurniture(
      meetingX + 102,
      260,
      "desk-b",
      2,
      2
    );

    // Bancos delante de los escritorios.
    this.addFurniture(
      meetingX - 195,
      355,
      "bench-a",
      2,
      1
    );

    this.addFurniture(
      meetingX + 115,
      355,
      "bench-b",
      2,
      1
    );

    // Los escritorios son objetos físicos.
    this.addBlocker(meetingX - 166, 292, 128, 55);
    this.addBlocker(meetingX + 166, 292, 128, 55);
  }

  addFurniture(x, y, frame, scale = 1, depth = 0) {
    return this.scene.add
      .image(x, y, "lobby-interior", frame)
      .setOrigin(0, 0)
      .setScale(scale)
      .setDepth(depth);
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
