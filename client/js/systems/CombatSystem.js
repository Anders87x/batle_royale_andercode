import {
  ABILITIES,
  SHOW_HITBOX_DEBUG,
} from "../config/game-config.js";

const Phaser = window.Phaser;

export class CombatSystem {
  constructor(scene, player, targets = [], effects = null) {
    this.scene = scene;
    this.player = player;
    this.targets = targets;
    this.effects = effects;

    this.cooldownEnds = {
      attack1: 0,
      attack2: 0,
      attack3: 0,
    };
  }

  startAttack1() {
    if (!this.canUse("attack1")) {
      return false;
    }

    const started = this.player.beginAttack("attack1");

    if (!started) {
      return false;
    }

    this.startCooldown("attack1");

    // Calculamos una sola vez el área real del golpe para que
    // efecto visual y daño queden exactamente alineados.
    const attackHitbox = this.getAttack1Hitbox();

    this.effects?.playAttack1(attackHitbox);

    this.scene.time.delayedCall(
      ABILITIES.attack1.impactDelay,
      () => {
        if (
          this.player.isAttacking &&
          this.player.actionName === "attack1"
        ) {
          this.applyRectangleHit(
            attackHitbox,
            ABILITIES.attack1.damage,
            0xfacc15
          );
        }
      }
    );

    return true;
  }

  startDashAttack() {
    if (!this.canUse("attack2")) {
      return false;
    }

    const started = this.player.beginAttack("attack2");

    if (!started) {
      return false;
    }

    this.startCooldown("attack2");

    const direction = this.player.getFacingVector();
    const startX = this.player.sprite.x;
    const startY = this.player.sprite.y;

    this.effects?.playDashAttack();

    this.player.setForcedVelocity(
      direction.x * ABILITIES.attack2.dashSpeed,
      direction.y * ABILITIES.attack2.dashSpeed
    );

    this.scene.time.delayedCall(
      ABILITIES.attack2.impactDelay,
      () => {
        if (
          this.player.isAttacking &&
          this.player.actionName === "attack2"
        ) {
          this.applyRectangleHit(
            this.getDashHitbox(startX, startY, direction),
            ABILITIES.attack2.damage,
            0x38bdf8
          );
        }
      }
    );

    this.scene.time.delayedCall(
      ABILITIES.attack2.dashDuration,
      () => {
        if (this.player.actionName === "attack2") {
          this.player.clearForcedVelocity();
        }
      }
    );

    return true;
  }

  startSpinAttack() {
    if (!this.canUse("attack3")) {
      return false;
    }

    const started = this.player.beginAttack("attack3");

    if (!started) {
      return false;
    }

    this.startCooldown("attack3");
    this.effects?.playSpinAttack();

    this.scene.tweens.add({
      targets: this.player.sprite,
      angle: 360,
      duration: 360,
      ease: "Linear",
      onComplete: () => {
        this.player.sprite.setAngle(0);
      },
    });

    this.scene.time.delayedCall(
      ABILITIES.attack3.impactDelay,
      () => {
        if (
          this.player.isAttacking &&
          this.player.actionName === "attack3"
        ) {
          this.applyCircleHit(
            this.getSpinHitbox(),
            ABILITIES.attack3.damage
          );
        }
      }
    );

    return true;
  }

  canUse(abilityName) {
    return (
      !this.player.isAttacking &&
      this.scene.time.now >= this.cooldownEnds[abilityName]
    );
  }

  startCooldown(abilityName) {
    this.cooldownEnds[abilityName] =
      this.scene.time.now + ABILITIES[abilityName].cooldown;
  }

  getCooldownState(abilityName) {
    const ability = ABILITIES[abilityName];
    const remaining = Math.max(
      0,
      this.cooldownEnds[abilityName] - this.scene.time.now
    );

    return {
      ready: remaining <= 0,
      remaining,
      cooldown: ability.cooldown,
      progress:
        remaining <= 0
          ? 1
          : 1 - remaining / ability.cooldown,
    };
  }

  applyRectangleHit(hitbox, damage, color) {
    if (SHOW_HITBOX_DEBUG) {
      this.showRectangleDebug(hitbox, color);
    }

    this.targets.forEach((target) => {
      if (!target.alive) {
        return;
      }

      if (
        Phaser.Geom.Rectangle.Overlaps(
          hitbox,
          target.getHurtbox()
        )
      ) {
        target.takeDamage(damage);
      }
    });
  }

  applyCircleHit(hitbox, damage) {
    if (SHOW_HITBOX_DEBUG) {
      this.showCircleDebug(hitbox);
    }

    this.targets.forEach((target) => {
      if (!target.alive) {
        return;
      }

      if (this.circleIntersectsRectangle(hitbox, target.getHurtbox())) {
        target.takeDamage(damage);
      }
    });
  }

  circleIntersectsRectangle(circle, rect) {
    const nearestX = Phaser.Math.Clamp(
      circle.x,
      rect.left,
      rect.right
    );

    const nearestY = Phaser.Math.Clamp(
      circle.y,
      rect.top,
      rect.bottom
    );

    const dx = circle.x - nearestX;
    const dy = circle.y - nearestY;

    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }

  getAttack1Hitbox() {
    const horizontalWidth = 110;
    const horizontalHeight = 76;
    const verticalWidth = 76;
    const verticalHeight = 110;
    const offset = 80;

    const { x, y } = this.player.sprite;

    switch (this.player.facing) {
      case "up":
        return new Phaser.Geom.Rectangle(
          x - verticalWidth / 2,
          y - offset - verticalHeight / 2,
          verticalWidth,
          verticalHeight
        );

      case "down":
        return new Phaser.Geom.Rectangle(
          x - verticalWidth / 2,
          y + offset - verticalHeight / 2,
          verticalWidth,
          verticalHeight
        );

      case "left":
        return new Phaser.Geom.Rectangle(
          x - offset - horizontalWidth / 2,
          y - horizontalHeight / 2,
          horizontalWidth,
          horizontalHeight
        );

      case "right":
      default:
        return new Phaser.Geom.Rectangle(
          x + offset - horizontalWidth / 2,
          y - horizontalHeight / 2,
          horizontalWidth,
          horizontalHeight
        );
    }
  }

  getDashHitbox(startX, startY, direction) {
    const range = ABILITIES.attack2.range;
    const thickness = 72;

    if (direction.x !== 0) {
      return new Phaser.Geom.Rectangle(
        direction.x > 0 ? startX : startX - range,
        startY - thickness / 2,
        range,
        thickness
      );
    }

    return new Phaser.Geom.Rectangle(
      startX - thickness / 2,
      direction.y > 0 ? startY : startY - range,
      thickness,
      range
    );
  }

  getSpinHitbox() {
    return new Phaser.Geom.Circle(
      this.player.sprite.x,
      this.player.sprite.y,
      ABILITIES.attack3.radius
    );
  }

  showRectangleDebug(hitbox, color) {
    const debugBox = this.scene.add
      .rectangle(
        hitbox.centerX,
        hitbox.centerY,
        hitbox.width,
        hitbox.height,
        color,
        0.18
      )
      .setStrokeStyle(2, color, 0.95)
      .setDepth(30);

    this.scene.time.delayedCall(150, () => {
      debugBox.destroy();
    });
  }

  showCircleDebug(hitbox) {
    const debugCircle = this.scene.add
      .circle(
        hitbox.x,
        hitbox.y,
        hitbox.radius,
        0xfb923c,
        0.14
      )
      .setStrokeStyle(3, 0xfb923c, 0.95)
      .setDepth(30);

    this.scene.time.delayedCall(180, () => {
      debugCircle.destroy();
    });
  }
}
