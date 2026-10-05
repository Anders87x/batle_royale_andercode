const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FRAME_SIZE = 64;
const PLAYER_SPEED = 180;

const ATTACK_DAMAGE = 25;
const ATTACK_IMPACT_DELAY = 250;
const DUMMY_MAX_HP = 100;

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

// El spritesheet de Attack usa un orden lateral distinto al de Idle/Walk:
// fila 0 = frente / abajo
// fila 1 = izquierda
// fila 2 = derecha
// fila 3 = espalda / arriba
const ATTACK_DIRECTIONS = {
  down: 0,
  right: 2,
  left: 1,
  up: 3,
};

// Este spritesheet tiene una particularidad:
// abajo, derecha e izquierda usan 12 frames de Idle,
// pero la fila de espalda / arriba solo contiene 4 frames.
const IDLE_FRAMES_BY_DIRECTION = {
  down: 12,
  right: 12,
  left: 12,
  up: 4,
};

const IDLE_COLUMNS = 12;
const WALK_FRAMES_PER_DIRECTION = 6;
const ATTACK_FRAMES_PER_DIRECTION = 8;

let player;
let movementKeys;
let attackKey;
let facing = "down";
let isAttacking = false;

let dummy;
let dummyHp = DUMMY_MAX_HP;
let dummyAlive = true;
let dummyLabel;
let dummyHpBar;

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

  this.load.spritesheet(
    "swordsman-attack",
    "/assets/characters/swordsman/attack.png",
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
    const attackRow = ATTACK_DIRECTIONS[direction];
    const attackStart = attackRow * ATTACK_FRAMES_PER_DIRECTION;

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

    scene.anims.create({
      key: `attack-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-attack", {
        start: attackStart,
        end: attackStart + ATTACK_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 14,
      repeat: 0,
    });
  });
}

function updateFacingFromKeys() {
  if (movementKeys.up.isDown) {
    facing = "up";
  } else if (movementKeys.down.isDown) {
    facing = "down";
  } else if (movementKeys.left.isDown) {
    facing = "left";
  } else if (movementKeys.right.isDown) {
    facing = "right";
  }
}

function getAttackHitbox() {
  const horizontalWidth = 110;
  const horizontalHeight = 76;
  const verticalWidth = 76;
  const verticalHeight = 110;
  const offset = 80;

  switch (facing) {
    case "up":
      return new Phaser.Geom.Rectangle(
        player.x - verticalWidth / 2,
        player.y - offset - verticalHeight / 2,
        verticalWidth,
        verticalHeight
      );

    case "down":
      return new Phaser.Geom.Rectangle(
        player.x - verticalWidth / 2,
        player.y + offset - verticalHeight / 2,
        verticalWidth,
        verticalHeight
      );

    case "left":
      return new Phaser.Geom.Rectangle(
        player.x - offset - horizontalWidth / 2,
        player.y - horizontalHeight / 2,
        horizontalWidth,
        horizontalHeight
      );

    case "right":
    default:
      return new Phaser.Geom.Rectangle(
        player.x + offset - horizontalWidth / 2,
        player.y - horizontalHeight / 2,
        horizontalWidth,
        horizontalHeight
      );
  }
}

function showHitboxDebug(scene, hitbox) {
  const debugBox = scene.add
    .rectangle(
      hitbox.centerX,
      hitbox.centerY,
      hitbox.width,
      hitbox.height,
      0xfacc15,
      0.18
    )
    .setStrokeStyle(2, 0xfde047, 0.95)
    .setDepth(20);

  scene.time.delayedCall(130, () => {
    debugBox.destroy();
  });
}

function updateDummyHud() {
  if (!dummyAlive) {
    dummyLabel.setText("Muñeco de prueba · DERROTADO");
    dummyHpBar.setScale(0, 1);
    return;
  }

  dummyLabel.setText(`Muñeco de prueba · ${dummyHp} HP`);
  dummyHpBar.setScale(dummyHp / DUMMY_MAX_HP, 1);
}

function showDamageText(scene, amount) {
  const damageText = scene.add
    .text(dummy.x, dummy.y - 48, `-${amount}`, {
      fontFamily: "Arial",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#fecaca",
    })
    .setOrigin(0.5)
    .setDepth(30);

  scene.tweens.add({
    targets: damageText,
    y: damageText.y - 26,
    alpha: 0,
    duration: 500,
    onComplete: () => damageText.destroy(),
  });
}

function resetDummy() {
  dummyHp = DUMMY_MAX_HP;
  dummyAlive = true;
  dummy.setFillStyle(0x64748b, 1);
  dummy.setStrokeStyle(3, 0xcbd5e1, 1);
  updateDummyHud();
}

function applyAttackHit(scene) {
  if (!dummyAlive) {
    return;
  }

  const attackHitbox = getAttackHitbox();
  showHitboxDebug(scene, attackHitbox);

  const dummyBounds = dummy.getBounds();
  const didHit = Phaser.Geom.Rectangle.Overlaps(
    attackHitbox,
    dummyBounds
  );

  if (!didHit) {
    return;
  }

  dummyHp = Math.max(0, dummyHp - ATTACK_DAMAGE);

  dummy.setFillStyle(0xef4444, 1);
  showDamageText(scene, ATTACK_DAMAGE);
  updateDummyHud();

  scene.time.delayedCall(120, () => {
    if (dummyAlive) {
      dummy.setFillStyle(0x64748b, 1);
    }
  });

  if (dummyHp === 0) {
    dummyAlive = false;
    dummy.setFillStyle(0x334155, 1);
    dummy.setStrokeStyle(3, 0x475569, 1);
    updateDummyHud();

    scene.time.delayedCall(1400, () => {
      resetDummy();
    });
  }
}

function startAttack(scene) {
  if (isAttacking) {
    return;
  }

  isAttacking = true;

  const attackAnimationKey = `attack-${facing}`;

  player.play(attackAnimationKey, true);

  // El daño no ocurre al pulsar el botón, sino en el momento
  // aproximado en el que el mandoble atraviesa la zona frontal.
  scene.time.delayedCall(ATTACK_IMPACT_DELAY, () => {
    if (isAttacking) {
      applyAttackHit(scene);
    }
  });

  player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation) => {
    if (animation.key !== attackAnimationKey) {
      return;
    }

    isAttacking = false;
    player.play(`idle-${facing}`, true);
  });
}

function createTrainingDummy(scene) {
  dummy = scene.add
    .rectangle(
      GAME_WIDTH / 2 + 125,
      GAME_HEIGHT / 2,
      46,
      64,
      0x64748b,
      1
    )
    .setStrokeStyle(3, 0xcbd5e1, 1);

  dummyLabel = scene.add
    .text(dummy.x, dummy.y - 62, "", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: {
        x: 8,
        y: 4,
      },
    })
    .setOrigin(0.5);

  scene.add
    .rectangle(dummy.x - 40, dummy.y - 40, 80, 8, 0x111827, 1)
    .setOrigin(0, 0.5)
    .setStrokeStyle(1, 0x94a3b8, 1);

  dummyHpBar = scene.add
    .rectangle(dummy.x - 40, dummy.y - 40, 80, 8, 0x22c55e, 1)
    .setOrigin(0, 0.5);

  updateDummyHud();
}

function create() {
  createDirectionalAnimations(this);
  createTrainingDummy(this);

  player = this.add.sprite(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    "swordsman-idle",
    0
  );

  player.setScale(2);
  player.play("idle-down");

  movementKeys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  attackKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );

  this.input.on("pointerdown", (pointer) => {
    if (pointer.leftButtonDown()) {
      startAttack(this);
    }
  });

  this.add
    .text(
      18,
      18,
      "WASD: mover | Click izq. o SPACE: atacar | Ataque 1 = 25 daño",
      {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#ffffff",
        backgroundColor: "#00000088",
        padding: {
          x: 10,
          y: 6,
        },
      }
    )
    .setDepth(30);

  this.add
    .text(
      18,
      52,
      "El rectángulo amarillo muestra la hitbox únicamente en el momento del impacto.",
      {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#cbd5e1",
        backgroundColor: "#00000066",
        padding: {
          x: 8,
          y: 5,
        },
      }
    )
    .setDepth(30);
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

  if (isMoving && !isAttacking) {
    updateFacingFromKeys();
  }

  if (Phaser.Input.Keyboard.JustDown(attackKey)) {
    startAttack(this);
  }

  if (isAttacking) {
    return;
  }

  if (!isMoving) {
    player.play(`idle-${facing}`, true);
    return;
  }

  const magnitude = Math.hypot(moveX, moveY);
  moveX /= magnitude;
  moveY /= magnitude;

  const seconds = delta / 1000;

  player.x += moveX * PLAYER_SPEED * seconds;
  player.y += moveY * PLAYER_SPEED * seconds;

  const margin = 42;

  player.x = Phaser.Math.Clamp(player.x, margin, GAME_WIDTH - margin);
  player.y = Phaser.Math.Clamp(player.y, margin, GAME_HEIGHT - margin);

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
