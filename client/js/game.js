const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FRAME_SIZE = 64;
const PLAYER_SPEED = 180;

// El pack de CraftPix está organizado en 4 filas:
// fila 0 = frente / abajo
// fila 1 = derecha
// fila 2 = izquierda
// fila 3 = espalda / arriba
const DIRECTIONS = {
  down: 0,
  right: 1,
  left: 2,
  up: 3,
};

// Este spritesheet tiene una particularidad:
// abajo, derecha e izquierda usan 12 frames de Idle,
// pero la fila de espalda / arriba solo contiene 4 frames.
// Los demás cuadros de esa fila están vacíos.
const IDLE_FRAMES_BY_DIRECTION = {
  down: 12,
  right: 12,
  left: 12,
  up: 4,
};

const IDLE_COLUMNS = 12;
const WALK_FRAMES_PER_DIRECTION = 6;

let player;
let movementKeys;
let facing = "down";

function preload() {
  this.load.spritesheet(
    "swordsman-idle",
    "/assets/characters/swordsman/idle.png",
    {
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
    }
  );

  this.load.spritesheet(
    "swordsman-walk",
    "/assets/characters/swordsman/walk.png",
    {
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
    }
  );
}

function createDirectionalAnimations(scene) {
  Object.entries(DIRECTIONS).forEach(([direction, row]) => {
    const idleStart = row * IDLE_COLUMNS;
    const idleFrameCount = IDLE_FRAMES_BY_DIRECTION[direction];
    const walkStart = row * WALK_FRAMES_PER_DIRECTION;

    scene.anims.create({
      key: `idle-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-idle", {
        start: idleStart,
        end: idleStart + idleFrameCount - 1,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: `walk-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-walk", {
        start: walkStart,
        end: walkStart + WALK_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
  });
}

function create() {
  createDirectionalAnimations(this);

  player = this.add.sprite(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    "swordsman-idle",
    0
  );

  // El sprite original es pixel art de 64x64.
  // Lo ampliamos sin suavizado para verlo mejor durante las pruebas.
  player.setScale(2);
  player.play("idle-down");

  movementKeys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  this.add
    .text(18, 18, "WASD: mover personaje", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: {
        x: 10,
        y: 6,
      },
    })
    .setDepth(10);
}

function update(_time, delta) {
  let moveX = 0;
  let moveY = 0;

  if (movementKeys.left.isDown) {
    moveX -= 1;
  }

  if (movementKeys.right.isDown) {
    moveX += 1;
  }

  if (movementKeys.up.isDown) {
    moveY -= 1;
  }

  if (movementKeys.down.isDown) {
    moveY += 1;
  }

  const isMoving = moveX !== 0 || moveY !== 0;

  if (!isMoving) {
    player.play(`idle-${facing}`, true);
    return;
  }

  // Normalizamos el vector para que moverse en diagonal
  // no sea más rápido que moverse en línea recta.
  const magnitude = Math.hypot(moveX, moveY);
  moveX /= magnitude;
  moveY /= magnitude;

  const seconds = delta / 1000;

  player.x += moveX * PLAYER_SPEED * seconds;
  player.y += moveY * PLAYER_SPEED * seconds;

  // Evitamos que el personaje salga del área visible.
  const margin = 42;

  player.x = Phaser.Math.Clamp(player.x, margin, GAME_WIDTH - margin);
  player.y = Phaser.Math.Clamp(player.y, margin, GAME_HEIGHT - margin);

  // Para las diagonales usamos como dirección visual
  // el eje que el jugador está pulsando verticalmente primero.
  if (movementKeys.up.isDown) {
    facing = "up";
  } else if (movementKeys.down.isDown) {
    facing = "down";
  } else if (movementKeys.left.isDown) {
    facing = "left";
  } else if (movementKeys.right.isDown) {
    facing = "right";
  }

  player.play(`walk-${facing}`, true);
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#111827",
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload,
    create,
    update,
  },
};

new Phaser.Game(config);
