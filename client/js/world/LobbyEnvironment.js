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
    this.createGuildArea();
    this.createWaitingArea();
    this.createTrainingArea();
    this.createAmbientCharacters();
  }

  createAtlasFrames() {
    const texture = this.scene.textures.get("lobby-interior");

    // Recortes aproximados del atlas Interior_objects.png.
    // Los mantenemos como frames separados para poder reutilizarlos
    // sin alterar el archivo original guardado en docs.
    texture.add("dragon-skeleton", 0, 128, 0, 192, 112);
    texture.add("guild-desk", 0, 192, 176, 128, 48);
    texture.add("round-rug", 0, 0, 208, 80, 80);
    texture.add("notice-board-a", 0, 0, 112, 64, 80);
    texture.add("notice-board-b", 0, 64, 112, 64, 80);
    texture.add("guild-banner", 0, 160, 304, 64, 64);
    texture.add("plant-a", 0, 240, 320, 32, 48);
    texture.add("plant-b", 0, 272, 320, 32, 48);
  }

  drawRoom() {
    const graphics = this.scene.add.graphics().setDepth(-20);

    // Piso principal.
    graphics.fillStyle(0x8a5a3b, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Franjas de madera.
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

    // Pared superior estilo guild hall.
    graphics.fillStyle(0xd7b07c, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, 176);

    graphics.fillStyle(0xb88759, 1);
    graphics.fillRect(0, 132, WORLD_WIDTH, 44);

    graphics.fillStyle(0x67506c, 1);
    graphics.fillRect(0, 132, WORLD_WIDTH, 8);

    // Laterales y zócalo inferior.
    graphics.fillStyle(0x4c342d, 1);
    graphics.fillRect(0, 0, 44, WORLD_HEIGHT);
    graphics.fillRect(WORLD_WIDTH - 44, 0, 44, WORLD_HEIGHT);
    graphics.fillRect(0, WORLD_HEIGHT - 36, WORLD_WIDTH, 36);

    // Columnas decorativas.
    graphics.fillStyle(0x5c3a2e, 1);

    for (const x of [44, 360, 720, 1080, WORLD_WIDTH - 60]) {
      graphics.fillRect(x, 0, 16, 176);
    }

    // Obstáculos físicos de los límites visuales.
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

  createGuildArea() {
    const centerX = WORLD_WIDTH / 2;

    const dragon = this.scene.add
      .image(centerX, 286, "lobby-interior", "dragon-skeleton")
      .setScale(2.25)
      .setDepth(0);

    this.scene.add
      .image(centerX, 222, "lobby-interior", "guild-desk")
      .setScale(2.1)
      .setDepth(2);

    const guildmaster = this.scene.add
      .sprite(centerX, 184, "guildmaster", 0)
      .setScale(2.2)
      .setDepth(4);

    this.scene.anims.create({
      key: "guildmaster-idle",
      frames: this.scene.anims.generateFrameNumbers("guildmaster", {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });

    guildmaster.play("guildmaster-idle");

    this.scene.add
      .image(centerX - 195, 135, "lobby-interior", "plant-a")
      .setScale(2)
      .setDepth(3);

    this.scene.add
      .image(centerX + 195, 135, "lobby-interior", "plant-b")
      .setScale(2)
      .setDepth(3);

    this.scene.add
      .image(170, 235, "lobby-interior", "notice-board-a")
      .setScale(2)
      .setDepth(2);

    this.scene.add
      .image(WORLD_WIDTH - 170, 235, "lobby-interior", "notice-board-b")
      .setScale(2)
      .setDepth(2);

    this.scene.add
      .text(centerX, 118, "GUILD HALL · ANDERCODE", {
        fontFamily: "Arial",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#3a2430",
        backgroundColor: "#f2d6a2cc",
        padding: {
          x: 16,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setDepth(6);

    // El escritorio es un obstáculo real.
    this.addBlocker(centerX, 245, 250, 92);

    // El esqueleto se usa como decoración y delimita visualmente
    // la zona del maestro del gremio.
    dragon.setAlpha(0.98);
  }

  createWaitingArea() {
    const centerX = 670;
    const centerY = 610;

    const floor = this.scene.add.graphics().setDepth(-5);

    floor.fillStyle(0x65445f, 0.28);
    floor.fillCircle(centerX, centerY, 155);

    floor.lineStyle(4, 0xe7b34a, 0.7);
    floor.strokeCircle(centerX, centerY, 155);

    floor.lineStyle(2, 0xf3d28a, 0.35);
    floor.strokeCircle(centerX, centerY, 125);

    this.scene.add
      .text(centerX, centerY - 190, "ZONA DE ESPERA", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffe3a0",
        backgroundColor: "#2a1726cc",
        padding: {
          x: 12,
          y: 7,
        },
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.scene.add
      .text(centerX, centerY + 188, "Aquí aparecerán los jugadores antes de iniciar la partida", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#f7ead8",
        backgroundColor: "#2a1726bb",
        padding: {
          x: 10,
          y: 6,
        },
      })
      .setOrigin(0.5)
      .setDepth(8);
  }

  createTrainingArea() {
    const baseX = 1090;
    const y = 720;

    this.scene.add
      .text(baseX + 110, 515, "ZONA DE ENTRENAMIENTO", {
        fontFamily: "Arial",
        fontSize: "19px",
        fontStyle: "bold",
        color: "#d9ecff",
        backgroundColor: "#172033cc",
        padding: {
          x: 12,
          y: 7,
        },
      })
      .setOrigin(0.5)
      .setDepth(8);

    const mannequinData = [
      { x: baseX, key: "mannequin-1", frame: 0, label: "Dummy A" },
      { x: baseX + 110, key: "mannequin-2", frame: 0, label: "Dummy B" },
      { x: baseX + 220, key: "mannequin-3", frame: 0, label: "Dummy C" },
    ];

    mannequinData.forEach((item) => {
      this.scene.add
        .sprite(item.x, y, item.key, item.frame)
        .setScale(2.5)
        .setDepth(3);

      this.scene.add
        .text(item.x, y + 58, item.label, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#d8e4ef",
          backgroundColor: "#111827aa",
          padding: {
            x: 7,
            y: 4,
          },
        })
        .setOrigin(0.5)
        .setDepth(6);

      this.addBlocker(item.x, y + 12, 46, 52);
    });

    // Marca visual del área.
    const area = this.scene.add.graphics().setDepth(-4);
    area.lineStyle(3, 0x7897b7, 0.55);
    area.strokeRoundedRect(baseX - 65, 565, 390, 235, 18);
  }

  createAmbientCharacters() {
    const fighterPositions = [
      { x: 240, y: 560, frame: 0 },
      { x: 330, y: 690, frame: 6 },
      { x: 420, y: 520, frame: 12 },
    ];

    fighterPositions.forEach((item) => {
      this.scene.add
        .sprite(item.x, item.y, "lobby-fighter", item.frame)
        .setScale(1.6)
        .setDepth(2);
    });

    const fire = this.scene.add
      .sprite(260, 650, "lobby-fire", 0)
      .setScale(2)
      .setDepth(1);

    this.scene.anims.create({
      key: "lobby-fire-loop",
      frames: this.scene.anims.generateFrameNumbers("lobby-fire", {
        start: 0,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    fire.play("lobby-fire-loop");

    this.scene.add
      .image(260, 650, "lobby-interior", "round-rug")
      .setScale(2.2)
      .setDepth(0);
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
