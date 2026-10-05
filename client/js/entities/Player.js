import { PLAYER_SPEED } from "../config/game-config.js";

const Phaser = window.Phaser;

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.facing = "down";
    this.isAttacking = false;
    this.isHurt = false;
    this.isDead = false;
    this.actionName = null;
    this.forcedVelocity = null;

    this.maxHp = 100;
    this.hp = this.maxHp;

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

    this.skill2Key = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Q
    );

    this.skill3Key = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
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

  wantsSkill2() {
    return Phaser.Input.Keyboard.JustDown(this.skill2Key);
  }

  wantsSkill3() {
    return Phaser.Input.Keyboard.JustDown(this.skill3Key);
  }

  canAct() {
    return !this.isDead && !this.isHurt;
  }

  beginAttack(actionName = "attack1") {
    if (this.isAttacking || !this.canAct()) {
      return false;
    }

    this.syncFacingFromInput();
    this.isAttacking = true;
    this.actionName = actionName;
    this.forcedVelocity = null;
    this.stopMovement();

    const attackAnimationKey = `attack-${this.facing}`;
    this.sprite.play(attackAnimationKey, true);

    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation) => {
        if (animation.key !== attackAnimationKey) {
          return;
        }

        this.finishAction();
      }
    );

    return true;
  }

  finishAction() {
    if (this.isDead || this.isHurt) {
      return;
    }

    this.isAttacking = false;
    this.actionName = null;
    this.forcedVelocity = null;
    this.stopMovement();
    this.sprite.setAngle(0);
    this.sprite.play(`idle-${this.facing}`, true);
  }

  takeDamage(amount) {
    if (this.isDead) {
      return false;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.isAttacking = false;
    this.actionName = null;
    this.forcedVelocity = null;
    this.stopMovement();
    this.sprite.setAngle(0);

    if (this.hp === 0) {
      this.die();
      return true;
    }

    this.isHurt = true;
    const hurtAnimationKey = `hurt-${this.facing}`;
    this.sprite.play(hurtAnimationKey, true);

    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation) => {
        if (
          animation.key !== hurtAnimationKey ||
          this.isDead
        ) {
          return;
        }

        this.isHurt = false;
        this.sprite.play(`idle-${this.facing}`, true);
      }
    );

    return true;
  }

  die() {
    this.isDead = true;
    this.isHurt = false;
    this.isAttacking = false;
    this.actionName = null;
    this.forcedVelocity = null;
    this.stopMovement();

    if (this.sprite.body) {
      this.sprite.body.enable = false;
    }

    this.sprite.play(`death-${this.facing}`, true);
  }

  heal(amount) {
    if (this.isDead) {
      return;
    }

    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  setForcedVelocity(x, y) {
    this.forcedVelocity = { x, y };
    this.sprite.setVelocity(x, y);
  }

  clearForcedVelocity() {
    this.forcedVelocity = null;
    this.stopMovement();
  }

  getFacingVector() {
    switch (this.facing) {
      case "up":
        return { x: 0, y: -1 };
      case "down":
        return { x: 0, y: 1 };
      case "left":
        return { x: -1, y: 0 };
      case "right":
      default:
        return { x: 1, y: 0 };
    }
  }

  stopMovement() {
    this.sprite.setVelocity(0, 0);
  }

  update() {
    if (this.isDead || this.isHurt) {
      this.stopMovement();
      return;
    }

    if (this.isAttacking) {
      if (this.forcedVelocity) {
        this.sprite.setVelocity(
          this.forcedVelocity.x,
          this.forcedVelocity.y
        );
      } else {
        this.stopMovement();
      }

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
