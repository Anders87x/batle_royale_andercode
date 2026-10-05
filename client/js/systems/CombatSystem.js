import {
  ATTACK_DAMAGE,
  ATTACK_IMPACT_DELAY,
} from "../config/game-config.js";

const Phaser = window.Phaser;

export class CombatSystem {
  constructor(scene, player, enemy) {
    this.scene = scene;
    this.player = player;
    this.enemy = enemy;
  }

  startAttack() {
    const started = this.player.beginAttack();

    if (!started) {
      return;
    }

    this.scene.time.delayedCall(ATTACK_IMPACT_DELAY, () => {
      if (this.player.isAttacking) {
        this.applyAttackHit();
      }
    });
  }

  applyAttackHit() {
    if (!this.enemy.alive) {
      return;
    }

    const attackHitbox = this.getAttackHitbox();
    this.showHitboxDebug(attackHitbox);

    const enemyHurtbox = this.enemy.getHurtbox();

    const didHit = Phaser.Geom.Rectangle.Overlaps(
      attackHitbox,
      enemyHurtbox
    );

    if (!didHit) {
      return;
    }

    this.enemy.takeDamage(ATTACK_DAMAGE);
  }

  getAttackHitbox() {
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

  showHitboxDebug(hitbox) {
    const debugBox = this.scene.add
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

    this.scene.time.delayedCall(130, () => {
      debugBox.destroy();
    });
  }
}
