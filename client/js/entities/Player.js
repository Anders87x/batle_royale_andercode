import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SPEED,
} from "../config/game-config.js";

const Phaser = window.Phaser;

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.facing = "down";
    this.isAttacking = false;

    this.sprite = scene.add
      .sprite(x, y, "swordsman-idle", 0)
      .setScale(2);

    this.sprite.play("idle-down");

    this.movementKeys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.attackKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  hasMovementInput() {
    return (
      this.movementKeys.left.isDown ||
      this.movementKeys.right.isDown ||
      this.movementKeys.up.isDown ||
      this.movementKeys.down.isDown
    );
  }

  syncFacingFromInput() {
    if (this.movementKeys.up.isDown) {
      this.facing = "up";
    } else if (this.movementKeys.down.isDown) {
      this.facing = "down";
    } else if (this.movementKeys.left.isDown) {
      this.facing = "left";
    } else if (this.movementKeys.right.isDown) {
      this.facing = "right";
    }
  }

  wantsToAttack() {
    return Phaser.Input.Keyboard.JustDown(this.attackKey);
  }

  beginAttack() {
    if (this.isAttacking) {
      return false;
    }

    this.syncFacingFromInput();
    this.isAttacking = true;

    const attackAnimationKey = `attack-${this.facing}`;
    this.sprite.play(attackAnimationKey, true);

    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation) => {
        if (animation.key !== attackAnimationKey) {
          return;
        }

        this.isAttacking = false;
        this.sprite.play(`idle-${this.facing}`, true);
      }
    );

    return true;
  }

  update(delta) {
    if (this.isAttacking) {
      return;
    }

    let moveX = 0;
    let moveY = 0;

    if (this.movementKeys.left.isDown) {
      moveX -= 1;
    }

    if (this.movementKeys.right.isDown) {
      moveX += 1;
    }

    if (this.movementKeys.up.isDown) {
      moveY -= 1;
    }

    if (this.movementKeys.down.isDown) {
      moveY += 1;
    }

    const isMoving = moveX !== 0 || moveY !== 0;

    if (!isMoving) {
      this.sprite.play(`idle-${this.facing}`, true);
      return;
    }

    this.syncFacingFromInput();

    const magnitude = Math.hypot(moveX, moveY);
    moveX /= magnitude;
    moveY /= magnitude;

    const seconds = delta / 1000;

    this.sprite.x += moveX * PLAYER_SPEED * seconds;
    this.sprite.y += moveY * PLAYER_SPEED * seconds;

    const margin = 42;

    this.sprite.x = Phaser.Math.Clamp(
      this.sprite.x,
      margin,
      GAME_WIDTH - margin
    );

    this.sprite.y = Phaser.Math.Clamp(
      this.sprite.y,
      margin,
      GAME_HEIGHT - margin
    );

    this.sprite.play(`walk-${this.facing}`, true);
  }
}
