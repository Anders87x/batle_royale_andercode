import {
  ARENA_X,
  ARENA_WIDTH,
  WORLD_HEIGHT,
} from "../config/game-config.js";

const OBSTACLES = [
  {
    key: "undead-tree",
    x: 1745,
    y: 135,
    scale: 1.15,
    body: [46, 34, 20],
  },
  {
    key: "undead-tree",
    x: 2895,
    y: 145,
    scale: 1.1,
    body: [44, 34, 18],
  },
  {
    key: "undead-tree",
    x: 1760,
    y: 790,
    scale: 1.15,
    body: [46, 34, 20],
  },
  {
    key: "undead-tree",
    x: 2890,
    y: 785,
    scale: 1.1,
    body: [44, 34, 18],
  },
  {
    key: "undead-broken-tree",
    x: 2220,
    y: 145,
    scale: 1.05,
    body: [100, 26, 6],
  },
  {
    key: "undead-broken-tree",
    x: 2440,
    y: 760,
    scale: 1.05,
    body: [100, 26, 6],
  },
  {
    key: "undead-rock",
    x: 1980,
    y: 180,
    scale: 1.1,
    body: [50, 38, 5],
  },
  {
    key: "undead-rock",
    x: 2660,
    y: 175,
    scale: 1,
    body: [46, 34, 5],
  },
  {
    key: "undead-rock",
    x: 1900,
    y: 705,
    scale: 1.05,
    body: [48, 36, 5],
  },
  {
    key: "undead-rock",
    x: 2760,
    y: 710,
    scale: 1.1,
    body: [50, 38, 5],
  },
  {
    key: "undead-ruin",
    x: 2040,
    y: 395,
    scale: 1.05,
    body: [74, 48, 18],
  },
  {
    key: "undead-ruin",
    x: 2610,
    y: 540,
    scale: 1.05,
    body: [74, 48, 18],
  },
  {
    key: "undead-lich",
    x: 2320,
    y: 450,
    scale: 0.82,
    body: [120, 58, 28],
  },
  {
    key: "undead-skulls",
    x: 2180,
    y: 315,
    scale: 0.9,
    body: [62, 38, 10],
  },
  {
    key: "undead-skulls",
    x: 2470,
    y: 595,
    scale: 0.9,
    body: [62, 38, 10],
  },
  {
    key: "undead-crystal",
    x: 2140,
    y: 585,
    scale: 1,
    body: [38, 30, 8],
  },
  {
    key: "undead-crystal",
    x: 2540,
    y: 320,
    scale: 1,
    body: [38, 30, 8],
  },
  {
    key: "undead-thorn",
    x: 1860,
    y: 470,
    scale: 0.9,
    body: [74, 34, 8],
  },
  {
    key: "undead-thorn",
    x: 2800,
    y: 440,
    scale: 0.9,
    body: [74, 34, 8],
  },
];

const DECORATIONS = [
  ["undead-grave", 1880, 335, 1],
  ["undead-grave", 1920, 355, 0.9],
  ["undead-grave", 1960, 330, 0.95],
  ["undead-grave", 2720, 545, 1],
  ["undead-grave", 2760, 565, 0.9],
  ["undead-grave", 2800, 540, 0.95],
  ["undead-plant", 2050, 690, 0.85],
  ["undead-plant", 2680, 285, 0.85],
  ["undead-plant", 2260, 650, 0.7],
  ["undead-plant", 2410, 250, 0.7],
  ["undead-grave", 2290, 290, 0.8],
  ["undead-grave", 2380, 625, 0.8],
];

export class ArenaEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.blockers = [];

    this.drawGround();
    this.createUndeadDecor();
    this.createBounds();
  }

  drawGround() {
    // El TMX original usa mayormente el GID 55 para el suelo.
    // Como el firstgid del tileset es 1, corresponde al frame 54.
    this.scene.add
      .tileSprite(
        ARENA_X,
        0,
        ARENA_WIDTH,
        WORLD_HEIGHT,
        "undead-ground-rocks",
        54
      )
      .setOrigin(0, 0)
      .setDepth(-30);

    // Variación visual encima del tile real para evitar que se vea
    // demasiado uniforme sin tapar el pixel art del suelo.
    const graphics =
      this.scene.add
        .graphics()
        .setDepth(-29);

    graphics.fillStyle(
      0x27322c,
      0.16
    );

    const darkPatches = [
      [1900, 520, 180, 85],
      [2620, 350, 180, 90],
      [2320, 720, 220, 72],
    ];

    darkPatches.forEach(
      ([x, y, width, height]) => {
        graphics.fillEllipse(
          x,
          y,
          width,
          height
        );
      }
    );

    graphics.lineStyle(
      4,
      0x1e2722,
      0.9
    );

    graphics.strokeRect(
      ARENA_X + 40,
      40,
      ARENA_WIDTH - 80,
      WORLD_HEIGHT - 80
    );

    this.scene.add
      .text(
        ARENA_X +
          ARENA_WIDTH / 2,
        72,
        "TIERRAS DE LOS NO MUERTOS",
        {
          fontFamily: "Arial",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#d8dfcf",
          backgroundColor:
            "#111713cc",
          padding: {
            x: 14,
            y: 8,
          },
        }
      )
      .setOrigin(0.5)
      .setDepth(-3);
  }

  createUndeadDecor() {
    OBSTACLES.forEach(
      ({
        key,
        x,
        y,
        scale,
        body,
      }) => {
        this.addObstacle(
          key,
          x,
          y,
          scale,
          body
        );
      }
    );

    DECORATIONS.forEach(
      ([key, x, y, scale]) => {
        this.scene.add
          .image(
            x,
            y,
            key
          )
          .setScale(scale)
          .setDepth(-4);
      }
    );
  }

  addObstacle(
    key,
    x,
    y,
    scale,
    [width, height, offsetY]
  ) {
    this.scene.add
      .image(
        x,
        y,
        key
      )
      .setScale(scale)
      .setDepth(-3);

    return this.addBlocker(
      x,
      y + offsetY,
      width,
      height
    );
  }

  createBounds() {
    this.addBlocker(
      ARENA_X + 20,
      WORLD_HEIGHT / 2,
      40,
      WORLD_HEIGHT
    );

    this.addBlocker(
      ARENA_X +
        ARENA_WIDTH -
        20,
      WORLD_HEIGHT / 2,
      40,
      WORLD_HEIGHT
    );

    this.addBlocker(
      ARENA_X +
        ARENA_WIDTH / 2,
      20,
      ARENA_WIDTH,
      40
    );

    this.addBlocker(
      ARENA_X +
        ARENA_WIDTH / 2,
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
