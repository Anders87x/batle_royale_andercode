import {
  ENEMY_MAX_HP,
  ENEMY_FACING,
} from "../config/game-config.js";

const Phaser = window.Phaser;

export class Enemy {
  constructor(scene, x, y) {
    this.scene = scene;
    this.spawnX = x;
    this.spawnY = y;
    this.maxHp = ENEMY_MAX_HP;
    this.hp = ENEMY_MAX_HP;
    this.facing = ENEMY_FACING;
    this.alive = true;

    this.sprite = scene.physics.add
      .sprite(x, y, "swordsman-idle", 0)
      .setScale(2)
      .setImmovable(true);

    this.sprite.setPushable(false);
    this.sprite.play(`idle-${this.facing}`);

    this.label = scene.add
      .text(x, y - 76, "", {
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

    this.hpBarBackground = scene.add
      .rectangle(x - 40, y - 52, 80, 8, 0x111827, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x94a3b8, 1)
      .setDepth(10);

    this.hpBar = scene.add
      .rectangle(x - 40, y - 52, 80, 8, 0x22c55e, 1)
      .setOrigin(0, 0.5)
      .setDepth(11);

    this.updateHud();
  }

  getHurtbox() {
    const width = 46;
    const height = 58;

    return new Phaser.Geom.Rectangle(
      this.sprite.x - width / 2,
      this.sprite.y - height / 2 + 8,
      width,
      height
    );
  }

  takeDamage(amount) {
    if (!this.alive) {
      return;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.showDamageText(amount);
    this.updateHud();

    if (this.hp === 0) {
      this.playDeath();
      return;
    }

    this.playHurt();
  }

  showDamageText(amount) {
    const damageText = this.scene.add
      .text(this.sprite.x, this.sprite.y - 64, `-${amount}`, {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#fecaca",
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 26,
      alpha: 0,
      duration: 500,
      onComplete: () => damageText.destroy(),
    });
  }

  playHurt() {
    const hurtAnimationKey = `hurt-${this.facing}`;

    this.sprite.play(hurtAnimationKey, true);

    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation) => {
        if (animation.key === hurtAnimationKey && this.alive) {
          this.sprite.play(`idle-${this.facing}`, true);
        }
      }
    );
  }

  playDeath() {
    this.alive = false;
    this.updateHud();

    // El cuerpo muerto deja de bloquear el paso.
    this.sprite.body.enable = false;

    const deathAnimationKey = `death-${this.facing}`;
    this.sprite.play(deathAnimationKey, true);

    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation) => {
        if (animation.key !== deathAnimationKey) {
          return;
        }

        this.scene.time.delayedCall(900, () => {
          this.reset();
        });
      }
    );
  }

  reset() {
    this.hp = this.maxHp;
    this.alive = true;

    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.sprite.body.enable = true;
    this.sprite.setVelocity(0, 0);
    this.sprite.setVisible(true);
    this.sprite.play(`idle-${this.facing}`, true);

    this.updateHud();
  }

  updateHud() {
    if (!this.alive) {
      this.label.setText("Enemigo · ELIMINADO");
      this.hpBar.setScale(0, 1);
      return;
    }

    this.label.setText(`Enemigo · ${this.hp} HP`);
    this.hpBar.setScale(this.hp / this.maxHp, 1);
  }
}
