import { CombatEffectSystem } from "../systems/CombatEffectSystem.js";

const Phaser = window.Phaser;

export class RemotePlayer {
  constructor(scene, state) {
    this.scene = scene;
    this.id = state.id;
    this.facing = state.facing || "down";
    this.targetX = state.x;
    this.targetY = state.y;
    this.moving = false;
    this.isAttacking = false;
    this.actionName = null;
    this.hp = state.hp ?? 100;
    this.maxHp = 100;
    this.isDead = Boolean(state.isDead);

    this.sprite = scene.add
      .sprite(state.x, state.y, "swordsman-idle", 0)
      .setScale(2)
      .setTint(0x93c5fd)
      .setAlpha(0.88)
      .setDepth(12);

    this.label = scene.add
      .text(state.x, state.y - 76, "JUGADOR", {
        fontFamily: "Arial",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#bfdbfe",
        backgroundColor: "#0f172acc",
        padding: {
          x: 6,
          y: 3,
        },
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.hpBackground = scene.add
      .rectangle(state.x - 32, state.y - 55, 64, 6, 0x111827, 1)
      .setOrigin(0, 0.5)
      .setDepth(49);

    this.hpBar = scene.add
      .rectangle(state.x - 32, state.y - 55, 64, 6, 0x3b82f6, 1)
      .setOrigin(0, 0.5)
      .setDepth(50);

    this.effects = new CombatEffectSystem(scene, this);

    this.applyState(state);
  }

  applyState(state) {
    if (Number.isFinite(state.x)) {
      this.targetX = state.x;
    }

    if (Number.isFinite(state.y)) {
      this.targetY = state.y;
    }

    if (state.facing) {
      this.facing = state.facing;
    }

    if (typeof state.moving === "boolean") {
      this.moving = state.moving;
    }

    if (Number.isFinite(state.hp)) {
      this.setHealth(state.hp, Boolean(state.isDead));
    }
  }

  setHealth(hp, isDead = hp <= 0) {
    const wasDead = this.isDead;
    this.hp = Math.max(0, Math.min(this.maxHp, hp));
    this.isDead = isDead;

    if (this.isDead && !wasDead) {
      this.isAttacking = false;
      this.actionName = null;
      this.sprite.setAngle(0);
      this.sprite.play(`death-${this.facing}`, true);
    }

    if (!this.isDead && wasDead) {
      this.sprite.setAngle(0);
      this.sprite.play(`idle-${this.facing}`, true);
    }

    this.hpBar.setScale(this.hp / this.maxHp, 1);
  }

  playAttack(abilityName, state = {}) {
    if (this.isDead) {
      return;
    }

    this.applyState(state);
    this.isAttacking = true;
    this.actionName = abilityName;

    this.sprite.play(`attack-${this.facing}`, true);

    if (abilityName === "attack1") {
      this.effects.playAttack1(this.getAttack1Hitbox());
    } else if (abilityName === "attack2") {
      this.effects.playDashAttack();
    } else if (abilityName === "attack3") {
      this.effects.playSpinAttack();

      this.scene.tweens.add({
        targets: this.sprite,
        angle: 360,
        duration: 360,
        ease: "Linear",
        onComplete: () => this.sprite.setAngle(0),
      });
    }

    this.scene.time.delayedCall(560, () => {
      if (this.isDead) {
        return;
      }

      this.isAttacking = false;
      this.actionName = null;
      this.sprite.setAngle(0);
      this.sprite.play(`idle-${this.facing}`, true);
    });
  }

  getAttack1Hitbox() {
    const horizontalWidth = 110;
    const horizontalHeight = 76;
    const verticalWidth = 76;
    const verticalHeight = 110;
    const offset = 80;
    const { x, y } = this.sprite;

    switch (this.facing) {
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

  update() {
    if (!this.isDead) {
      this.sprite.x = Phaser.Math.Linear(
        this.sprite.x,
        this.targetX,
        0.28
      );

      this.sprite.y = Phaser.Math.Linear(
        this.sprite.y,
        this.targetY,
        0.28
      );

      if (!this.isAttacking) {
        const animation = this.moving
          ? `walk-${this.facing}`
          : `idle-${this.facing}`;

        this.sprite.play(animation, true);
      }
    }

    this.label.setPosition(
      this.sprite.x,
      this.sprite.y - 76
    );

    this.hpBackground.setPosition(
      this.sprite.x - 32,
      this.sprite.y - 55
    );

    this.hpBar.setPosition(
      this.sprite.x - 32,
      this.sprite.y - 55
    );
  }

  destroy() {
    this.sprite.destroy();
    this.label.destroy();
    this.hpBackground.destroy();
    this.hpBar.destroy();
  }
}
