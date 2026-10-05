const Phaser = window.Phaser;

export class MatchHud {
  constructor(scene, networkSystem) {
    this.scene = scene;
    this.networkSystem = networkSystem;
    this.state = {
      phase: "lobby",
      countdownEndsAt: null,
      winnerId: null,
      returnToLobbyAt: null,
      minPlayers: 2,
      players: [],
    };

    this.create();
  }

  create() {
    this.panel = this.scene.add
      .rectangle(
        480,
        16,
        330,
        72,
        0x0f172a,
        0.9
      )
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, 0x475569, 0.9)
      .setScrollFactor(0)
      .setDepth(410);

    this.titleText = this.scene.add
      .text(480, 27, "LOBBY", {
        fontFamily: "Arial",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(411);

    this.detailText = this.scene.add
      .text(480, 51, "", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#cbd5e1",
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(411);

    this.countdownText = this.scene.add
      .text(480, 185, "", {
        fontFamily: "Arial",
        fontSize: "74px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#0f172a",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500)
      .setVisible(false);

    this.resultText = this.scene.add
      .text(480, 195, "", {
        fontFamily: "Arial",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        backgroundColor: "#0f172add",
        padding: {
          x: 24,
          y: 14,
        },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(501)
      .setVisible(false);
  }

  applyState(state) {
    this.state = {
      ...this.state,
      ...state,
    };
  }

  update() {
    const {
      phase,
      players,
      minPlayers,
      countdownEndsAt,
      winnerId,
      returnToLobbyAt,
    } = this.state;

    const playerCount = players.length;
    const readyCount = players.filter(
      (player) => player.ready
    ).length;

    const aliveCount = players.filter(
      (player) => !player.isDead
    ).length;

    const selfId =
      this.networkSystem.socket?.id;

    const self = players.find(
      (player) => player.id === selfId
    );

    this.countdownText.setVisible(false);
    this.resultText.setVisible(false);

    if (phase === "countdown") {
      const remaining = Math.max(
        0,
        (countdownEndsAt - Date.now()) / 1000
      );

      const number = Math.max(
        1,
        Math.ceil(remaining)
      );

      this.titleText.setText(
        "TODOS LISTOS"
      );

      this.detailText.setText(
        "La batalla comienza..."
      );

      this.countdownText
        .setText(number.toString())
        .setVisible(true);

      return;
    }

    if (phase === "playing") {
      this.titleText.setText(
        "BATALLA EN CURSO"
      );

      this.detailText.setText(
        `Vivos: ${aliveCount} / ${playerCount}`
      );

      return;
    }

    if (phase === "finished") {
      const seconds = Math.max(
        0,
        Math.ceil(
          (returnToLobbyAt - Date.now()) / 1000
        )
      );

      const won =
        winnerId &&
        winnerId === selfId;

      this.titleText.setText(
        "PARTIDA FINALIZADA"
      );

      this.detailText.setText(
        `Volviendo al lobby en ${seconds}s`
      );

      this.resultText
        .setText(
          won
            ? "VICTORIA"
            : winnerId
              ? "ELIMINADO"
              : "SIN GANADOR"
        )
        .setVisible(true);

      return;
    }

    this.titleText.setText(
      `LOBBY · ${playerCount} jugador${playerCount === 1 ? "" : "es"}`
    );

    if (playerCount < minPlayers) {
      this.detailText.setText(
        `Esperando rival · mínimo ${minPlayers}`
      );
      return;
    }

    this.detailText.setText(
      self?.ready
        ? `LISTO ✓ · ${readyCount}/${playerCount} · R para cancelar`
        : `Listos: ${readyCount}/${playerCount} · pulsa R para LISTO`
    );
  }
}
