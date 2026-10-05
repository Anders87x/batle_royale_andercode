import { TrainingDummy } from "./TrainingDummy.js";

const Phaser = window.Phaser;

export class TrainingEnemy extends TrainingDummy {
  constructor(scene, options, player) {
    super(scene, options);

    this.player = player;
    this.enabled = true;
    this.speed = 82;
    this.detectionRange = 360;
    this.attackRange = 82;
    this.attackDamage = 12;
    this.attackCooldown = 1250;
    this.nextAttackAt = 0;
    this.isEnemyAttacking = false;
    this.stunnedUntil = 0;

    this.sprite.setImmovable(false);
    this.sprite.setPushable(false);
    this.label.setText(
      `${this.name} · HOSTIL`
    );
  }

  setEnabled(enabled) {
    if (this.enabled === enabled) {
      return;
    }

    this.enabled = enabled;

    if (!enabled) {
      this.sprite.setVelocity(0, 0);
      this.isEnemyAttacking = false;
      this.sprite.clearTint();
    }
  }

  takeDamage(
    amount,
    knockbackDirection = null,
    knockbackStrength = 0
  ) {
    this.stunnedUntil =
      this.scene.time.now + 260;

    this.sprite.setVelocity(0, 0);

    return super.takeDamage(
      amount,
      knockbackDirection,
      knockbackStrength
    );
  }

  update() {
    super.update();

    if (
      !this.enabled ||
      !this.alive
    ) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    if (this.player.isDead) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    if (
      this.isEnemyAttacking ||
      this.scene.time.now <
        this.stunnedUntil
    ) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    const dx =
      this.player.sprite.x -
      this.sprite.x;

    const dy =
      this.player.sprite.y -
      this.sprite.y;

    const distance =
      Math.hypot(dx, dy);

    if (
      distance >
      this.detectionRange
    ) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    if (
      distance <=
        this.attackRange &&
      this.scene.time.now >=
        this.nextAttackAt
    ) {
      this.attackPlayer();
      return;
    }

    if (
      distance <=
      this.attackRange
    ) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    this.sprite.setVelocity(
      (dx / distance) * this.speed,
      (dy / distance) * this.speed
    );
  }

  attackPlayer() {
    if (!this.enabled) {
      return;
    }

    this.isEnemyAttacking = true;

    this.nextAttackAt =
      this.scene.time.now +
      this.attackCooldown;

    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(0xff7777);

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2.72,
      scaleY: 2.72,
      duration: 90,
      yoyo: true,
      ease: "Quad.easeOut",
    });

    this.scene.time.delayedCall(
      150,
      () => {
        if (
          !this.enabled ||
          !this.alive ||
          this.player.isDead
        ) {
          return;
        }

        const distance =
          Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            this.player.sprite.x,
            this.player.sprite.y
          );

        if (
          distance <=
          this.attackRange + 18
        ) {
          this.player.takeDamage(
            this.attackDamage
          );

          this.scene.cameras.main.shake(
            100,
            0.0035
          );
        }
      }
    );

    this.scene.time.delayedCall(
      310,
      () => {
        if (this.alive) {
          this.sprite.clearTint();
        }

        this.isEnemyAttacking = false;
      }
    );
  }

  reset() {
    super.reset();

    this.isEnemyAttacking = false;
    this.nextAttackAt =
      this.scene.time.now + 700;
    this.stunnedUntil = 0;

    this.label.setText(
      `${this.name} · HOSTIL`
    );
  }

  updateHud() {
    if (!this.alive) {
      super.updateHud();
      return;
    }

    this.label.setText(
      `${this.name} · HOSTIL · ${this.hp} HP`
    );

    this.hpBar.setScale(
      this.hp / this.maxHp,
      1
    );
  }
}
