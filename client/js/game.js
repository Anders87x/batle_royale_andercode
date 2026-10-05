const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FRAME_SIZE = 64;
const PLAYER_SPEED = 180;

const ATTACK_DAMAGE = 25;
const ATTACK_IMPACT_DELAY = 250;
const ENEMY_MAX_HP = 100;
const ENEMY_FACING = "left";

// Orden real de las filas del pack de CraftPix:
// fila 0 = frente / abajo
// fila 1 = izquierda
// fila 2 = derecha
// fila 3 = espalda / arriba
const DIRECTIONS = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

// Idle tiene una particularidad:
// abajo, izquierda y derecha usan 12 frames,
// pero arriba / espalda solo contiene 4 frames reales.
const IDLE_FRAMES_BY_DIRECTION = {
  down: 12,
  left: 12,
  right: 12,
  up: 4,
};

const IDLE_COLUMNS = 12;
const WALK_FRAMES_PER_DIRECTION = 6;
const ATTACK_FRAMES_PER_DIRECTION = 8;
const HURT_FRAMES_PER_DIRECTION = 5;
const DEATH_FRAMES_PER_DIRECTION = 7;

let player;
let movementKeys;
let attackKey;
let facing = "down";
let isAttacking = false;

let enemy;
let enemyHp = ENEMY_MAX_HP;
let enemyAlive = true;
let enemyLabel;
let enemyHpBar;

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

  this.load.spritesheet(
    "swordsman-hurt",
    "/assets/characters/swordsman/hurt.png",
    {
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
    }
  );

  this.load.spritesheet(
    "swordsman-death",
    "/assets/characters/swordsman/death.png",
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
    const attackStart = row * ATTACK_FRAMES_PER_DIRECTION;
    const hurtStart = row * HURT_FRAMES_PER_DIRECTION;
    const deathStart = row * DEATH_FRAMES_PER_DIRECTION;

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

    scene.anims.create({
      key: `hurt-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-hurt", {
        start: hurtStart,
        end: hurtStart + HURT_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: `death-${direction}`,
      frames: scene.anims.generateFrameNumbers("swordsman-death", {
        start: deathStart,
        end: deathStart + DEATH_FRAMES_PER_DIRECTION - 1,
      }),
      frameRate: 10,
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

// La textura mide 64x64, pero gran parte es transparente.
// Por eso no usamos enemy.getBounds() como zona de daño.
// Esta caja representa aproximadamente el cuerpo visible.
function getEnemyHurtbox() {
  const width = 46;
  const height = 58;

  return new Phaser.Geom.Rectangle(
    enemy.x - width / 2,
    enemy.y - height / 2 + 8,
    width,
    height
  );
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

function updateEnemyHud() {
  if (!enemyAlive) {
    enemyLabel.setText("Enemigo · ELIMINADO");
    enemyHpBar.setScale(0, 1);
    return;
  }

  enemyLabel.setText(`Enemigo · ${enemyHp} HP`);
  enemyHpBar.setScale(enemyHp / ENEMY_MAX_HP, 1);
}

function showDamageText(scene, amount) {
  const damageText = scene.add
    .text(enemy.x, enemy.y - 64, `-${amount}`, {
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

function resetEnemy() {
  enemyHp = ENEMY_MAX_HP;
  enemyAlive = true;
  enemy.setVisible(true);
  enemy.play(`idle-${ENEMY_FACING}`, true);
  updateEnemyHud();
}

function playEnemyHurt() {
  enemy.play(`hurt-${ENEMY_FACING}`, true);

  enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation) => {
    if (
      animation.key === `hurt-${ENEMY_FACING}` &&
      enemyAlive
    ) {
      enemy.play(`idle-${ENEMY_FACING}`, true);
    }
  });
}

function playEnemyDeath(scene) {
  enemyAlive = false;
  updateEnemyHud();

  const deathAnimationKey = `death-${ENEMY_FACING}`;
  enemy.play(deathAnimationKey, true);

  enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation) => {
    if (animation.key !== deathAnimationKey) {
      return;
    }

    // Dejamos el cuerpo en el último frame un instante antes de reaparecer.
    scene.time.delayedCall(900, () => {
      resetEnemy();
    });
  });
}

function applyAttackHit(scene) {
  if (!enemyAlive) {
    return;
  }

  const attackHitbox = getAttackHitbox();
  showHitboxDebug(scene, attackHitbox);

  const enemyHurtbox = getEnemyHurtbox();
  const didHit = Phaser.Geom.Rectangle.Overlaps(
    attackHitbox,
    enemyHurtbox
  );

  if (!didHit) {
    return;
  }

  enemyHp = Math.max(0, enemyHp - ATTACK_DAMAGE);

  showDamageText(scene, ATTACK_DAMAGE);
  updateEnemyHud();

  if (enemyHp === 0) {
    playEnemyDeath(scene);
    return;
  }

  playEnemyHurt();
}

function startAttack(scene) {
  if (isAttacking) {
    return;
  }

  isAttacking = true;

  const attackAnimationKey = `attack-${facing}`;

  player.play(attackAnimationKey, true);

  // El daño ocurre cuando el mandoble entra en la zona de impacto,
  // no en el instante exacto en que se pulsa el botón.
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

function createTrainingEnemy(scene) {
  enemy = scene.add.sprite(
    GAME_WIDTH / 2 + 125,
    GAME_HEIGHT / 2,
    "swordsman-idle",
    0
  );

  enemy.setScale(2);
  enemy.play(`idle-${ENEMY_FACING}`);

  enemyLabel = scene.add
    .text(enemy.x, enemy.y - 76, "", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: {
        x: 8,
        y: 4,
      },
    })
    .setOrigin(0.5)
    .setDepth(10);

  scene.add
    .rectangle(enemy.x - 40, enemy.y - 52, 80, 8, 0x111827, 1)
    .setOrigin(0, 0.5)
    .setStrokeStyle(1, 0x94a3b8, 1)
    .setDepth(10);

  enemyHpBar = scene.add
    .rectangle(enemy.x - 40, enemy.y - 52, 80, 8, 0x22c55e, 1)
    .setOrigin(0, 0.5)
    .setDepth(11);

  updateEnemyHud();
}

function create() {
  createDirectionalAnimations(this);

  player = this.add.sprite(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    "swordsman-idle",
    0
  );

  player.setScale(2);
  player.play("idle-down");

  createTrainingEnemy(this);

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
      "Golpea al Swordsman enemigo: Hurt con daño y Death al llegar a 0 HP.",
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
