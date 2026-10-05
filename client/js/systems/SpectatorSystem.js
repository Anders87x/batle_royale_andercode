export class SpectatorSystem {
  constructor(
    scene,
    player,
    networkSystem
  ) {
    this.scene = scene;
    this.player = player;
    this.networkSystem =
      networkSystem;

    this.active = false;
    this.targetId = null;

    this.label = this.scene.add
      .text(
        480,
        492,
        "",
        {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffffff",
          backgroundColor: "#0f172add",
          padding: {
            x: 12,
            y: 7,
          },
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(470)
      .setVisible(false);

    this.scene.input.keyboard.on(
      "keydown-TAB",
      (event) => {
        event.preventDefault();

        if (!this.active) {
          return;
        }

        this.cycleTarget();
      }
    );
  }

  getAliveTargets() {
    const selfId =
      this.networkSystem
        .socket?.id;

    return this.networkSystem
      .matchState.players
      .filter(
        (state) =>
          state.id !== selfId &&
          !state.isDead &&
          this.networkSystem
            .remotePlayers
            .has(state.id)
      );
  }

  getTargetName() {
    const targetState =
      this.networkSystem
        .matchState.players
        .find(
          (state) =>
            state.id ===
            this.targetId
        );

    return (
      targetState?.name ||
      null
    );
  }

  followTarget(targetId) {
    const remote =
      this.networkSystem
        .remotePlayers
        .get(targetId);

    if (!remote) {
      return;
    }

    this.active = true;
    this.targetId = targetId;

    this.scene.cameras.main
      .stopFollow();

    this.scene.cameras.main
      .startFollow(
        remote.sprite,
        true,
        0.12,
        0.12
      );

    this.updateLabel();
  }

  cycleTarget() {
    const targets =
      this.getAliveTargets();

    if (targets.length === 0) {
      return;
    }

    const currentIndex =
      targets.findIndex(
        (state) =>
          state.id ===
          this.targetId
      );

    const nextIndex =
      currentIndex < 0
        ? 0
        : (
            currentIndex + 1
          ) % targets.length;

    this.followTarget(
      targets[nextIndex].id
    );
  }

  updateLabel() {
    const name =
      this.getTargetName();

    if (!this.active || !name) {
      this.label.setVisible(
        false
      );
      return;
    }

    this.label
      .setText(
        `ESPECTANDO: ${name} · TAB cambiar`
      )
      .setVisible(true);
  }

  stop() {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.targetId = null;
    this.label.setVisible(false);

    this.scene.cameras.main
      .stopFollow();

    this.scene.cameras.main
      .startFollow(
        this.player.sprite,
        true,
        0.1,
        0.1
      );
  }

  update() {
    const phase =
      this.networkSystem
        .matchState.phase;

    const shouldSpectate =
      (
        phase === "playing" ||
        phase === "finished"
      ) &&
      this.player.isDead;

    if (!shouldSpectate) {
      this.stop();
      return;
    }

    const targets =
      this.getAliveTargets();

    if (targets.length === 0) {
      this.label
        .setText(
          "ESPECTADOR · esperando resultado"
        )
        .setVisible(true);

      return;
    }

    const targetStillAlive =
      targets.some(
        (state) =>
          state.id ===
          this.targetId
      );

    if (!targetStillAlive) {
      this.followTarget(
        targets[0].id
      );
      return;
    }

    this.active = true;
    this.updateLabel();
  }
}
