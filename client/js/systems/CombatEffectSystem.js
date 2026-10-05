const Phaser = window.Phaser;

const EFFECTS = {
  attack1: {
    animationKey: "fx-attack1",
    texturePrefix: "fx-attack1-",
    frameCount: 8,
    frameRate: 30,
    scale: 0.27,
    startOffset: 44,
    endOffset: 82,
    travelDuration: 190,
    originX: 0.58,
    originY: 0.56,
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
    const effect = EFFECTS.attack1;
    const direction = this.player.getFacingVector();
    const angle = this.getDirectionAngle();

    // Estela suave que coincide exactamente con el alcance real.
    // No es la hitbox de debug: es feedback visual de gameplay.
    const rangeGlow = this.scene.add
      .rectangle(
        hitbox.centerX,
        hitbox.centerY,
        hitbox.width,
        hitbox.height,
        0x38bdf8,
        0.08
      )
      .setStrokeStyle(2, 0x7dd3fc, 0.28)
      .setDepth(31)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: rangeGlow,
      alpha: { from: 0, to: 1 },
      duration: 55,
      yoyo: true,
      hold: 35,
      onComplete: () => rangeGlow.destroy(),
    });

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

    // El corte sale desde el mandoble hacia el límite real del ataque.
    this.scene.tweens.add({
      targets: sprite,
      x: endX,
      y: endY,
      scaleX: effect.scale * 1.08,
      scaleY: effect.scale * 1.08,
      duration: effect.travelDuration,
      ease: "Quad.easeOut",
    });

    this.scene.cameras.main.shake(55, 0.0012);

    sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => sprite.destroy()
    );
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
