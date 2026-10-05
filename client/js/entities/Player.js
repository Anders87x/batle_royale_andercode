import { PLAYER_SPEED } from "../config/game-config.js";

const Phaser = window.Phaser;

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.facing = "down";
    this.isAttacking = false;

    this.sprite = scene.physics.add
      .sprite(x, y, "swordsman-idle", 0)
      .setScale(2)
      .setCollideWorldBounds(true);

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
    this.stopMovement();

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

  stopMovement() {
    this.sprite.setVelocity(0, 0);
  }

  update() {
    if (this.isAttacking) {
      this.stopMovement();
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
      this.stopMovement();
      this.sprite.play(`idle-${this.facing}`, true);
      return;
    }

    this.syncFacingFromInput();

    const magnitude = Math.hypot(moveX, moveY);
    moveX /= magnitude;
    moveY /= magnitude;

    this.sprite.setVelocity(
      moveX * PLAYER_SPEED,
      moveY * PLAYER_SPEED
    );

    this.sprite.play(`walk-${this.facing}`, true);
  }
}
