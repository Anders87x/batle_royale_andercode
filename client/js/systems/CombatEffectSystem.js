const Phaser = window.Phaser;

const EFFECTS = {
  attack1Primary: {
    animationKey: "fx-attack1-primary",
    texturePrefix: "fx-attack1-",
    frameCount: 8,
    frameRate: 30,
    scale: 0.25,
    startOffset: 42,
    endOffset: 72,
    travelDuration: 150,
    originX: 0.58,
    originY: 0.56,
  },
  attack1Secondary: {
    animationKey: "fx-attack1-secondary",
    texturePrefix: "fx-attack1-",
    frameCount: 8,
    frameRate: 34,
    scale: 0.18,
    delay: 105,
    nearEdgeInset: 18,
  },
  attack2: {
    animationKey: "fx-attack2",
    texturePrefix: "fx-attack2-",
    frameCount: 8,
    frameRate: 32,
    scale: 0.42,
    offset: 62,
    travel: 145,
  },
  attack3: {
    animationKey: "fx-attack3",
    texturePrefix: "fx-attack3-",
    frameCount: 10,
    frameRate: 30,
    scale: 0.42,
  },
};

export class CombatEffectSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.createAnimations();
  }

  createAnimations() {
    Object.values(EFFECTS).forEach((effect) => {
      if (this.scene.anims.exists(effect.animationKey)) {
        return;
      }

      const frames = Array.from(
        { length: effect.frameCount },
        (_, index) => ({
          key: `${effect.texturePrefix}${index + 1}`,
        })
      );

      this.scene.anims.create({
        key: effect.animationKey,
        frames,
        frameRate: effect.frameRate,
        repeat: 0,
      });
    });
  }

  playAttack1(hitbox) {
    this.playAttack1Primary();
    this.playAttack1Secondary(hitbox);
  }

  playAttack1Primary() {
    const effect = EFFECTS.attack1Primary;
    const direction = this.player.getFacingVector();
    const angle = this.getDirectionAngle();

    const startX =
      this.player.sprite.x + direction.x * effect.startOffset;
    const startY =
      this.player.sprite.y + direction.y * effect.startOffset;

    const endX =
      this.player.sprite.x + direction.x * effect.endOffset;
    const endY =
      this.player.sprite.y + direction.y * effect.endOffset;

    const sprite = this.scene.add
      .sprite(
        startX,
        startY,
        `${effect.texturePrefix}1`
      )
      .setOrigin(effect.originX, effect.originY)
      .setScale(effect.scale)
      .setAngle(angle)
      .setDepth(35);

    sprite.play(effect.animationKey);

    this.scene.tweens.add({
      targets: sprite,
      x: endX,
      y: endY,
      scaleX: effect.scale * 1.06,
      scaleY: effect.scale * 1.06,
      duration: effect.travelDuration,
      ease: "Quad.easeOut",
    });

    sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => sprite.destroy()
    );
  }

  playAttack1Secondary(hitbox) {
    const effect = EFFECTS.attack1Secondary;
    const direction = this.player.getFacingVector();
    const angle = this.getDirectionAngle();

    this.scene.time.delayedCall(effect.delay, () => {
      if (
        !this.player.isAttacking ||
        this.player.actionName !== "attack1"
      ) {
        return;
      }

      const position = this.getAttack1EdgePosition(
        hitbox,
        direction,
        effect.nearEdgeInset
      );

      const sprite = this.scene.add
        .sprite(
          position.x,
          position.y,
          `${effect.texturePrefix}1`
        )
        .setScale(effect.scale * 0.82)
        .setAngle(angle)
        .setAlpha(0.72)
        .setDepth(36);

      sprite.play(effect.animationKey);

      this.scene.tweens.add({
        targets: sprite,
        scaleX: effect.scale,
        scaleY: effect.scale,
        alpha: { from: 0.45, to: 0.78 },
        duration: 120,
        ease: "Quad.easeOut",
      });

      sprite.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        () => sprite.destroy()
      );
    });

    this.scene.time.delayedCall(180, () => {
      if (
        this.player.isAttacking &&
        this.player.actionName === "attack1"
      ) {
        this.scene.cameras.main.shake(55, 0.0012);
      }
    });
  }

  getAttack1EdgePosition(hitbox, direction, inset) {
    if (direction.x > 0) {
      return {
        x: hitbox.right - inset,
        y: hitbox.centerY,
      };
    }

    if (direction.x < 0) {
      return {
        x: hitbox.left + inset,
        y: hitbox.centerY,
      };
    }

    if (direction.y > 0) {
      return {
        x: hitbox.centerX,
        y: hitbox.bottom - inset,
      };
    }

    return {
      x: hitbox.centerX,
      y: hitbox.top + inset,
    };
  }

  playDashAttack() {
    const effect = EFFECTS.attack2;
    const direction = this.player.getFacingVector();
    const angle = this.getDirectionAngle();

    const sprite = this.scene.add
      .sprite(
        this.player.sprite.x + direction.x * effect.offset,
        this.player.sprite.y + direction.y * effect.offset,
        `${effect.texturePrefix}1`
      )
      .setScale(effect.scale)
      .setAngle(angle)
      .setDepth(35);

    sprite.play(effect.animationKey);

    this.scene.tweens.add({
      targets: sprite,
      x: sprite.x + direction.x * effect.travel,
      y: sprite.y + direction.y * effect.travel,
      duration: 230,
      ease: "Quad.easeOut",
    });

    this.scene.cameras.main.shake(90, 0.0025);

    sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => sprite.destroy()
    );
  }

  playSpinAttack() {
    const effect = EFFECTS.attack3;

    const sprite = this.scene.add
      .sprite(
        this.player.sprite.x,
        this.player.sprite.y,
        `${effect.texturePrefix}1`
      )
      .setScale(effect.scale)
      .setDepth(35);

    sprite.play(effect.animationKey);

    this.scene.tweens.add({
      targets: sprite,
      angle: 360,
      duration: 330,
      ease: "Linear",
    });

    this.scene.cameras.main.shake(110, 0.0035);

    sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => sprite.destroy()
    );
  }

  getDirectionAngle() {
    switch (this.player.facing) {
      case "down":
        return 90;
      case "left":
        return 180;
      case "up":
        return -90;
      case "right":
      default:
        return 0;
    }
  }
}
