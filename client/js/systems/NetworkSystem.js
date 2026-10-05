import { RemotePlayer } from "../entities/RemotePlayer.js";
import { MatchHud } from "../ui/MatchHud.js";
import { SafeZoneSystem } from "./SafeZoneSystem.js";

export class NetworkSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.socket = null;
    this.remotePlayers = new Map();
    this.lastStateSentAt = 0;
    this.sendInterval = 50;
    this.connectedPlayers = 1;

    this.matchState = {
      phase: "lobby",
      countdownEndsAt: null,
      winnerId: null,
      returnToLobbyAt: null,
      minPlayers: 2,
      zone: {
        active: false,
      },
      players: [],
    };

    this.createStatusHud();

    this.matchHud =
      new MatchHud(
        scene,
        this
      );

    this.safeZoneSystem =
      new SafeZoneSystem(
        scene,
        player
      );

    this.configureReadyInput();

    if (
      typeof window.io !==
      "function"
    ) {
      this.setStatus(
        "SIN SOCKET.IO",
        0xef4444
      );

      console.warn(
        "Socket.IO no está disponible. El juego continuará en modo local."
      );

      return;
    }

    this.socket = window.io({
      transports: [
        "websocket",
        "polling",
      ],
    });

    this.configureSocket();
    this.configureLocalEvents();
  }

  createStatusHud() {
    this.statusText =
      this.scene.add
        .text(
          942,
          18,
          "MULTIJUGADOR: CONECTANDO...",
          {
            fontFamily: "Arial",
            fontSize: "13px",
            fontStyle: "bold",
            color: "#fde68a",
            backgroundColor:
              "#0f172acc",
            padding: {
              x: 10,
              y: 6,
            },
          }
        )
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(400);
  }

  setStatus(
    label,
    color
  ) {
    this.statusText
      .setText(label)
      .setColor(
        `#${color
          .toString(16)
          .padStart(6, "0")}`
      );
  }

  configureReadyInput() {
    this.scene.input.keyboard.on(
      "keydown-R",
      (event) => {
        if (event.repeat) {
          return;
        }

        this.toggleReady();
      }
    );
  }

  configureSocket() {
    this.socket.on(
      "connect",
      () => {
        this.setStatus(
          "MULTIJUGADOR: CONECTADO · sincronizando...",
          0x86efac
        );

        this.socket.emit(
          "players:sync"
        );
      }
    );

    this.socket.on(
      "connect_error",
      (error) => {
        this.setStatus(
          "MULTIJUGADOR: ERROR DE CONEXIÓN",
          0xf87171
        );

        console.error(
          "Error Socket.IO:",
          error.message
        );
      }
    );

    this.socket.on(
      "disconnect",
      () => {
        this.setStatus(
          "MULTIJUGADOR: DESCONECTADO",
          0xf87171
        );
      }
    );

    this.socket.on(
      "players:count",
      (count) => {
        this.connectedPlayers =
          count;

        this.setStatus(
          `MULTIJUGADOR: CONECTADO · ${count} jugador${count === 1 ? "" : "es"}`,
          count > 1
            ? 0x4ade80
            : 0xfacc15
        );
      }
    );

    this.socket.on(
      "match:state",
      (state) => {
        const previousPhase =
          this.matchState.phase;

        this.matchState =
          state;

        this.matchHud.applyState(
          state
        );

        this.safeZoneSystem
          .applyMatchState(
            state
          );

        state.players.forEach(
          (playerState) => {
            if (
              playerState.id ===
              this.socket.id
            ) {
              return;
            }

            this.createOrUpdateRemote(
              playerState
            );
          }
        );

        if (
          previousPhase !==
            "playing" &&
          state.phase ===
            "playing"
        ) {
          this.scene.events.emit(
            "match-started"
          );
        }

        if (
          previousPhase !==
            "lobby" &&
          state.phase ===
            "lobby"
        ) {
          this.scene.events.emit(
            "match-returned-to-lobby"
          );
        }
      }
    );

    this.socket.on(
      "match:ready-ack",
      ({ ready }) => {
        this.setLocalReadyState(
          Boolean(ready)
        );
      }
    );

    this.socket.on(
      "match:players-reset",
      (states) => {
        states.forEach(
          (state) => {
            if (
              state.id ===
              this.socket.id
            ) {
              this.applySelfReset(
                state
              );

              return;
            }

            const remote =
              this.createOrUpdateRemote(
                state
              );

            remote?.reset(
              state
            );
          }
        );
      }
    );

    this.socket.on(
      "players:self",
      (state) => {
        this.applySelfState(
          state
        );
      }
    );

    this.socket.on(
      "players:init",
      (players) => {
        const activeIds =
          new Set();

        players.forEach(
          (state) => {
            activeIds.add(
              state.id
            );

            this.createOrUpdateRemote(
              state
            );
          }
        );

        this.remotePlayers.forEach(
          (
            remote,
            id
          ) => {
            if (
              !activeIds.has(
                id
              )
            ) {
              remote.destroy();

              this.remotePlayers.delete(
                id
              );
            }
          }
        );
      }
    );

    this.socket.on(
      "player:joined",
      (state) => {
        this.createOrUpdateRemote(
          state
        );
      }
    );

    this.socket.on(
      "player:state",
      (state) => {
        this.createOrUpdateRemote(
          state
        );
      }
    );

    this.socket.on(
      "player:attack",
      (payload) => {
        const remote =
          this.createOrUpdateRemote(
            payload
          );

        remote?.playAttack(
          payload.abilityName,
          payload
        );
      }
    );

    this.socket.on(
      "player:health",
      (payload) => {
        if (
          payload.id ===
          this.socket.id
        ) {
          return;
        }

        const remote =
          this.remotePlayers.get(
            payload.id
          );

        remote?.setHealth(
          payload.hp,
          payload.isDead
        );
      }
    );

    this.socket.on(
      "player:damaged",
      ({
        amount,
        hp,
        source,
      }) => {
        this.player.takeDamage(
          amount,
          {
            sync: false,
            authoritativeHp:
              hp,
          }
        );

        if (
          source ===
          "zone"
        ) {
          this.scene.cameras.main.shake(
            90,
            0.0025
          );
        }
      }
    );

    this.socket.on(
      "player:hit-confirm",
      () => {
        this.scene.cameras.main.shake(
          55,
          0.0015
        );
      }
    );

    this.socket.on(
      "player:left",
      ({ id }) => {
        const remote =
          this.remotePlayers.get(
            id
          );

        if (!remote) {
          return;
        }

        remote.destroy();

        this.remotePlayers.delete(
          id
        );
      }
    );
  }

  configureLocalEvents() {
    this.scene.events.on(
      "local-player-attack",
      (abilityName) => {
        this.socket?.emit(
          "player:attack",
          {
            abilityName,
          }
        );
      }
    );

    this.scene.events.on(
      "local-player-health",
      ({ hp }) => {
        this.socket?.emit(
          "player:health",
          {
            hp,
          }
        );
      }
    );
  }

  applySelfState(state) {
    this.player.setSpawnPosition(
      state.x,
      state.y,
      true
    );

    this.player.facing =
      state.facing || "down";

    this.player.hp =
      Number.isFinite(
        state.hp
      )
        ? state.hp
        : 100;

    if (
      state.isDead &&
      !this.player.isDead
    ) {
      this.player.die(
        false,
        false
      );
    }

    if (
      !state.isDead &&
      this.player.isDead
    ) {
      this.player.respawn(
        false
      );

      this.player.hp =
        Number.isFinite(
          state.hp
        )
          ? state.hp
          : 100;
    }
  }

  applySelfReset(state) {
    this.player.setSpawnPosition(
      state.x,
      state.y,
      false
    );

    this.player.facing =
      state.facing || "down";

    this.player.respawn(
      false
    );

    this.player.hp =
      state.hp ?? 100;
  }

  createOrUpdateRemote(
    state
  ) {
    if (
      !state?.id ||
      state.id ===
        this.socket?.id
    ) {
      return null;
    }

    let remote =
      this.remotePlayers.get(
        state.id
      );

    if (!remote) {
      remote =
        new RemotePlayer(
          this.scene,
          state
        );

      const collider =
        this.scene.physics.add.collider(
          this.player.sprite,
          remote.sprite
        );

      remote.setCollider(
        collider
      );

      this.remotePlayers.set(
        state.id,
        remote
      );
    } else {
      remote.applyState(
        state
      );
    }

    return remote;
  }

  setLocalReadyState(
    ready
  ) {
    if (!this.socket?.id) {
      return;
    }

    this.matchState = {
      ...this.matchState,
      players:
        this.matchState.players.map(
          (player) =>
            player.id ===
            this.socket.id
              ? {
                  ...player,
                  ready,
                }
              : player
        ),
    };

    this.matchHud.applyState(
      this.matchState
    );
  }

  toggleReady() {
    if (
      !this.socket?.connected ||
      ![
        "lobby",
        "countdown",
      ].includes(
        this.matchState.phase
      )
    ) {
      return;
    }

    const self =
      this.matchState.players.find(
        (player) =>
          player.id ===
          this.socket.id
      );

    const nextReady =
      !Boolean(
        self?.ready
      );

    this.setLocalReadyState(
      nextReady
    );

    this.socket.emit(
      "match:ready",
      {
        ready: nextReady,
      }
    );
  }

  getPhase() {
    return (
      this.matchState.phase
    );
  }

  isMatchPlaying() {
    return (
      this.matchState.phase ===
      "playing"
    );
  }

  update() {
    this.matchHud.update();

    this.safeZoneSystem.update();

    this.remotePlayers.forEach(
      (remote) => {
        remote.update();
      }
    );

    if (
      !this.socket?.connected
    ) {
      return;
    }

    if (
      this.scene.time.now -
        this.lastStateSentAt <
      this.sendInterval
    ) {
      return;
    }

    this.lastStateSentAt =
      this.scene.time.now;

    const body =
      this.player.sprite.body;

    const moving =
      Boolean(
        body &&
          body.enable &&
          (
            Math.abs(
              body.velocity.x
            ) > 1 ||
            Math.abs(
              body.velocity.y
            ) > 1
          )
      );

    this.socket.emit(
      "player:state",
      {
        x:
          this.player
            .sprite.x,
        y:
          this.player
            .sprite.y,
        facing:
          this.player.facing,
        moving,
      }
    );
  }
}
