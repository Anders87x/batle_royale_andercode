const Phaser = window.Phaser;

const EFFECTS = {
  attack1: {
    animationKey: "fx-attack1",
    texturePrefix: "fx-attack1-",
    frameCount: 8,
    frameRate: 30,
    scale: 0.28,
    offset: 72,
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

  playAttack1() {
    const effect = EFFECTS.attack1;
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
