export class SafeZoneSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.phase = "lobby";
    this.zone = null;

    this.graphics =
      this.scene.add
        .graphics()
        .setDepth(4);

    this.warningText =
      this.scene.add
        .text(
          480,
          105,
          "",
          {
            fontFamily: "Arial",
            fontSize: "22px",
            fontStyle: "bold",
            color: "#fee2e2",
            backgroundColor: "#7f1d1ddd",
            padding: {
              x: 14,
              y: 8,
            },
          }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(430)
        .setVisible(false);
  }

  applyMatchState(state) {
    this.phase =
      state?.phase || "lobby";

    this.zone =
      state?.zone || null;

    if (
      this.phase !== "playing" ||
      !this.zone?.active
    ) {
      this.graphics.clear();
      this.warningText.setVisible(false);
    }
  }

  getRadius() {
    if (!this.zone?.active) {
      return 0;
    }

    const now = Date.now();
    const {
      startRadius,
      endRadius,
      shrinkStartsAt,
      shrinkEndsAt,
    } = this.zone;

    if (
      !shrinkStartsAt ||
      now <= shrinkStartsAt
    ) {
      return startRadius;
    }

    if (
      !shrinkEndsAt ||
      now >= shrinkEndsAt
    ) {
      return endRadius;
    }

    const progress =
      (now - shrinkStartsAt) /
      (shrinkEndsAt - shrinkStartsAt);

    return (
      startRadius +
      (endRadius - startRadius) *
        Math.max(
          0,
          Math.min(1, progress)
        )
    );
  }

  isPlayerOutside(radius) {
    if (
      !this.player ||
      this.player.isDead ||
      !this.zone?.active
    ) {
      return false;
    }

    const dx =
      this.player.sprite.x -
      this.zone.centerX;

    const dy =
      this.player.sprite.y -
      this.zone.centerY;

    return (
      Math.hypot(dx, dy) >
      radius
    );
  }

  update() {
    this.graphics.clear();

    if (
      this.phase !== "playing" ||
      !this.zone?.active
    ) {
      this.warningText.setVisible(false);
      return;
    }

    const radius =
      this.getRadius();

    this.graphics.fillStyle(
      0x67e8f9,
      0.035
    );

    this.graphics.fillCircle(
      this.zone.centerX,
      this.zone.centerY,
      radius
    );

    this.graphics.lineStyle(
      7,
      0x67e8f9,
      0.95
    );

    this.graphics.strokeCircle(
      this.zone.centerX,
      this.zone.centerY,
      radius
    );

    this.graphics.lineStyle(
      2,
      0xffffff,
      0.75
    );

    this.graphics.strokeCircle(
      this.zone.centerX,
      this.zone.centerY,
      Math.max(
        0,
        radius - 6
      )
    );

    const outside =
      this.isPlayerOutside(radius);

    const damageActive =
      !this.zone.damageStartsAt ||
      Date.now() >=
        this.zone.damageStartsAt;

    this.warningText
      .setText(
        damageActive
          ? `FUERA DE LA ZONA · -${this.zone.damage} HP/s`
          : "PROTECCIÓN INICIAL"
      )
      .setVisible(
        outside &&
        damageActive
      );
  }
}
