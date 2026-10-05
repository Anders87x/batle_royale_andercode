import {
  ARENA_X,
  ARENA_WIDTH,
  WORLD_HEIGHT,
} from "../config/game-config.js";

// Frames usados por las capas "bricks" y "darker_surface"
// del TMX original. Aquí ya están convertidos de GID a frame (GID - 1).
const STONE_FLOOR_FRAMES = [
  521, 523, 525, 527, 529,
  934, 978, 980, 1004, 1005,
  1006, 1012, 1037, 1038,
];

const DARK_FLOOR_FRAMES = [
  1468, 1469, 1470, 1471, 1472,
  1494, 1495, 1496, 1520, 1521,
  1522, 1523, 1524,
];

const GROUND_SCALE = 2;
const GROUND_STEP = 16 * GROUND_SCALE;

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
    // Base real del tileset. El GID 55 del TMX corresponde al frame 54.
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

    // El frame 54 es intencionalmente liso. En el mapa original,
    // el aspecto rocoso aparece al combinarlo con capas de ladrillos
    // y superficies oscuras. Recreamos esa composición aquí.
    this.paintDarkPatch(
      1900,
      520,
      145,
      105
    );

    this.paintDarkPatch(
      2630,
      345,
      150,
      95
    );

    this.paintDarkPatch(
      2290,
      735,
      170,
      80
    );

    this.paintDarkPatch(
      2760,
      690,
      105,
      75
    );

    this.paintStonePath();
    this.paintSecondaryStonePath();

    const graphics =
      this.scene.add
        .graphics()
        .setDepth(-27);

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

  paintGroundTile(
    x,
    y,
    frame,
    depth = -28,
    alpha = 1
  ) {
    this.scene.add
      .image(
        x,
        y,
        "undead-ground-rocks",
        frame
      )
      .setScale(
        GROUND_SCALE
      )
      .setAlpha(alpha)
      .setDepth(depth);
  }

  paintDarkPatch(
    centerX,
    centerY,
    radiusX,
    radiusY
  ) {
    let row = 0;

    for (
      let y =
        centerY - radiusY;
      y <=
        centerY + radiusY;
      y += GROUND_STEP
    ) {
      let column = 0;

      for (
        let x =
          centerX - radiusX;
        x <=
          centerX + radiusX;
        x += GROUND_STEP
      ) {
        const dx =
          (x - centerX) /
          radiusX;

        const dy =
          (y - centerY) /
          radiusY;

        if (
          dx * dx +
            dy * dy >
          1
        ) {
          column += 1;
          continue;
        }

        const frame =
          DARK_FLOOR_FRAMES[
            (
              row * 5 +
              column * 7
            ) %
              DARK_FLOOR_FRAMES.length
          ];

        this.paintGroundTile(
          x,
          y,
          frame,
          -29,
          0.92
        );

        column += 1;
      }

      row += 1;
    }
  }

  paintStonePath() {
    let index = 0;

    for (
      let x =
        ARENA_X + 105;
      x <=
        ARENA_X +
          ARENA_WIDTH -
          105;
      x += GROUND_STEP
    ) {
      const centerY =
        455 +
        Math.sin(
          (
            x -
            ARENA_X
          ) /
            125
        ) *
          42;

      [-GROUND_STEP, 0, GROUND_STEP].forEach(
        (
          offsetY,
          lane
        ) => {
          const frame =
            STONE_FLOOR_FRAMES[
              (
                index +
                lane * 3
              ) %
                STONE_FLOOR_FRAMES.length
            ];

          this.paintGroundTile(
            x,
            centerY +
              offsetY,
            frame,
            -28,
            1
          );
        }
      );

      index += 1;
    }
  }

  paintSecondaryStonePath() {
    let index = 0;

    for (
      let y = 145;
      y <=
        WORLD_HEIGHT - 120;
      y += GROUND_STEP
    ) {
      const centerX =
        ARENA_X +
        ARENA_WIDTH / 2 +
        Math.sin(
          y / 105
        ) *
          38;

      [-GROUND_STEP, 0].forEach(
        (
          offsetX,
          lane
        ) => {
          const frame =
            STONE_FLOOR_FRAMES[
              (
                index * 2 +
                lane
              ) %
                STONE_FLOOR_FRAMES.length
            ];

          this.paintGroundTile(
            centerX +
              offsetX,
            y,
            frame,
            -28,
            0.95
          );
        }
      );

      index += 1;
    }
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
