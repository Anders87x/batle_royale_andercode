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
    this.createWallDecorations();
    this.createGuildExhibit();
    this.createWaitingArea();
    this.createTrainingArea();
  }

  createAtlasFrames() {
    const texture = this.scene.textures.get("lobby-interior");

    // Único recorte del atlas que conservamos por ahora:
    // el esqueleto del dragón. Quitamos los recortes aproximados
    // que estaban generando objetos cortados o superpuestos.
    // Ampliamos ligeramente el recorte para incluir la parte final
    // de la cola que quedaba fuera del frame anterior.
    texture.add("dragon-skeleton", 0, 128, 0, 240, 88);
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

    graphics.fillStyle(0x5c3a2e, 1);

    for (const x of [44, 360, 720, 1080, WORLD_WIDTH - 60]) {
      graphics.fillRect(x, 0, 16, 176);
    }

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

  createWallDecorations() {
    const windowPositions = [210, 430, 1010, 1230];

    windowPositions.forEach((x) => {
      this.drawWindow(x, 78);
    });

    this.drawBanner(610, 78, "A");
    this.drawBanner(830, 78, "C");

    this.drawShield(525, 88);
    this.drawShield(915, 88);

    this.drawWeaponRack(105, 118);
    this.drawWeaponRack(WORLD_WIDTH - 105, 118);
  }

  drawWindow(x, y) {
    const g = this.scene.add.graphics().setDepth(-5);

    // Marco de madera.
    g.fillStyle(0x4b3128, 1);
    g.fillRoundedRect(x - 34, y - 46, 68, 92, 8);

    // Piedra clara alrededor.
    g.fillStyle(0xd7b17f, 1);
    g.fillRoundedRect(x - 28, y - 40, 56, 80, 7);

    // Cristal.
    g.fillStyle(0x6f90a9, 1);
    g.fillRoundedRect(x - 20, y - 31, 40, 62, 6);

    // Brillo del cristal.
    g.fillStyle(0x9fc1d6, 0.72);
    g.fillRect(x - 14, y - 25, 8, 50);

    // Divisiones.
    g.lineStyle(4, 0x554052, 0.95);
    g.lineBetween(x, y - 31, x, y + 31);
    g.lineBetween(x - 20, y, x + 20, y);

    // Remate superior tipo arco.
    g.lineStyle(4, 0x4b3128, 1);
    g.strokeRoundedRect(x - 34, y - 46, 68, 92, 8);
  }

  drawBanner(x, y, letter) {
    const g = this.scene.add.graphics().setDepth(-4);

    g.fillStyle(0x56314f, 1);
    g.fillRect(x - 25, y - 42, 50, 76);

    g.fillStyle(0xe4b449, 1);
    g.fillTriangle(
      x - 25,
      y + 34,
      x,
      y + 54,
      x + 25,
      y + 34
    );

    g.lineStyle(3, 0xe8c56e, 0.95);
    g.strokeRect(x - 25, y - 42, 50, 76);

    this.scene.add
      .text(x, y - 4, letter, {
        fontFamily: "Arial",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#f8dc83",
      })
      .setOrigin(0.5)
      .setDepth(-3);
  }

  drawShield(x, y) {
    const g = this.scene.add.graphics().setDepth(-4);

    g.fillStyle(0x4d566f, 1);
    g.fillTriangle(
      x - 23,
      y - 25,
      x + 23,
      y - 25,
      x,
      y + 29
    );

    g.fillStyle(0x7986a8, 1);
    g.fillTriangle(
      x - 16,
      y - 18,
      x + 16,
      y - 18,
      x,
      y + 18
    );

    g.lineStyle(3, 0xe0bd67, 0.9);
    g.lineBetween(x, y - 20, x, y + 17);
    g.lineBetween(x - 15, y - 5, x + 15, y - 5);
  }

  drawWeaponRack(x, y) {
    const g = this.scene.add.graphics().setDepth(-4);

    g.fillStyle(0x583a2e, 1);
    g.fillRoundedRect(x - 42, y - 29, 84, 58, 7);

    g.lineStyle(4, 0x30211f, 1);
    g.strokeRoundedRect(x - 42, y - 29, 84, 58, 7);

    // Espadas cruzadas.
    g.lineStyle(5, 0xb8c5cf, 1);
    g.lineBetween(x - 23, y + 17, x + 20, y - 18);
    g.lineBetween(x + 23, y + 17, x - 20, y - 18);

    g.lineStyle(5, 0x8b603a, 1);
    g.lineBetween(x - 28, y + 22, x - 17, y + 11);
    g.lineBetween(x + 28, y + 22, x + 17, y + 11);

    g.lineStyle(3, 0xe0b75b, 1);
    g.lineBetween(x - 29, y + 9, x - 17, y + 21);
    g.lineBetween(x + 29, y + 9, x + 17, y + 21);
  }

  createGuildExhibit() {
    const centerX = WORLD_WIDTH / 2;

    this.scene.add
      .text(centerX, 112, "GUILD HALL · ANDERCODE", {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#3a2430",
        backgroundColor: "#f2d6a2ee",
        padding: {
          x: 18,
          y: 9,
        },
      })
      .setOrigin(0.5)
      .setDepth(10);

    const platform = this.scene.add.graphics().setDepth(-2);

    platform.fillStyle(0x6a4334, 0.95);
    platform.fillRoundedRect(centerX - 285, 210, 570, 195, 24);

    platform.lineStyle(4, 0x3f2b2a, 0.95);
    platform.strokeRoundedRect(centerX - 285, 210, 570, 195, 24);

    platform.fillStyle(0x5a3940, 0.38);
    platform.fillEllipse(centerX, 315, 500, 130);

    this.scene.add
      .image(centerX, 302, "lobby-interior", "dragon-skeleton")
      .setScale(2.05)
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

    // Toda la exhibición bloquea el paso para evitar atravesar
    // el esqueleto y reforzar la sensación de escenario físico.
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
