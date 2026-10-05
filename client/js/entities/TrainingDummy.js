const Phaser = window.Phaser;

export class TrainingDummy {
  constructor(scene, { x, y, textureKey, name }) {
    this.scene = scene;
    this.spawnX = x;
    this.spawnY = y;
    this.textureKey = textureKey;
    this.name = name;
    this.maxHp = 100;
    this.hp = 100;
    this.alive = true;
    this.hurtAnimationKey = `${textureKey}-hurt`;

    this.createAnimation();

    this.sprite = scene.physics.add
      .sprite(x, y, textureKey, 0)
      .setScale(2.5)
      .setImmovable(true);

    this.sprite.setPushable(false);
    this.sprite.body.setSize(18, 20, false);
    this.sprite.body.setOffset(7, 10);

    this.label = scene.add
      .text(x, y - 64, "", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#111827cc",
        padding: {
          x: 8,
          y: 4,
        },
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.hpBarBackground = scene.add
      .rectangle(x - 36, y - 44, 72, 7, 0x111827, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x94a3b8, 1)
      .setDepth(19);

    this.hpBar = scene.add
      .rectangle(x - 36, y - 44, 72, 7, 0x22c55e, 1)
      .setOrigin(0, 0.5)
      .setDepth(20);

    this.updateHud();
  }

  createAnimation() {
    if (this.scene.anims.exists(this.hurtAnimationKey)) {
      return;
    }

    this.scene.anims.create({
      key: this.hurtAnimationKey,
      frames: this.scene.anims.generateFrameNumbers(this.textureKey, {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });
  }

  update() {
    this.syncHudPosition();
  }

  syncHudPosition() {
    this.label.setPosition(
      this.sprite.x,
      this.sprite.y - 64
    );

    this.hpBarBackground.setPosition(
      this.sprite.x - 36,
      this.sprite.y - 44
    );

    this.hpBar.setPosition(
      this.sprite.x - 36,
      this.sprite.y - 44
    );
  }

  getHurtbox() {
    return new Phaser.Geom.Rectangle(
      this.sprite.x - 24,
      this.sprite.y - 28,
      48,
      58
    );
  }

  takeDamage(amount, knockbackDirection = null, knockbackStrength = 0) {
    if (!this.alive) {
      return false;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.showDamageText(amount);
    this.updateHud();

    if (knockbackDirection && knockbackStrength > 0) {
      this.applyKnockback(
        knockbackDirection,
        knockbackStrength
      );
    }

    if (this.hp === 0) {
      this.knockOut();
      return true;
    }

    this.sprite.play(this.hurtAnimationKey, true);
    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation) => {
        if (animation.key === this.hurtAnimationKey && this.alive) {
          this.sprite.setFrame(0);
        }
      }
    );

    return true;
  }

  applyKnockback(direction, strength) {
    const length = Math.hypot(direction.x, direction.y);

    if (length === 0) {
      return;
    }

    const dx = (direction.x / length) * strength;
    const dy = (direction.y / length) * strength;

    this.scene.tweens.killTweensOf(this.sprite);

    this.scene.tweens.add({
      targets: this.sprite,
      x: `+=${dx}`,
      y: `+=${dy}`,
      duration: 115,
      ease: "Quad.easeOut",
    });
  }

  showDamageText(amount) {
    const damageText = this.scene.add
      .text(this.sprite.x, this.sprite.y - 74, `-${amount}`, {
        fontFamily: "Arial",
        fontSize: "19px",
        fontStyle: "bold",
        color: "#fecaca",
      })
      .setOrigin(0.5)
      .setDepth(40);

    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 24,
      alpha: 0,
      duration: 500,
      onComplete: () => damageText.destroy(),
    });
  }

  knockOut() {
    this.alive = false;
    this.sprite.body.enable = false;
    this.sprite.setTint(0x666666);
    this.sprite.setAlpha(0.45);
    this.updateHud();

    this.scene.time.delayedCall(1200, () => {
      this.reset();
    });
  }

  reset() {
    this.hp = this.maxHp;
    this.alive = true;

    this.scene.tweens.killTweensOf(this.sprite);

    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.syncHudPosition();

    this.sprite.body.enable = true;
    this.sprite.clearTint();
    this.sprite.setAlpha(1);
    this.sprite.setFrame(0);

    this.updateHud();
  }

  updateHud() {
    if (!this.alive) {
      this.label.setText(`${this.name} · FUERA`);
      this.hpBar.setScale(0, 1);
      return;
    }

    this.label.setText(`${this.name} · ${this.hp} HP`);
    this.hpBar.setScale(this.hp / this.maxHp, 1);
  }
}
