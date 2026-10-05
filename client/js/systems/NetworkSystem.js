import { RemotePlayer } from "../entities/RemotePlayer.js";

export class NetworkSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.socket = null;
    this.remotePlayers = new Map();
    this.lastStateSentAt = 0;
    this.sendInterval = 50;

    if (typeof window.io !== "function") {
      console.warn(
        "Socket.IO no está disponible. El juego continuará en modo local."
      );
      return;
    }

    this.socket = window.io();
    this.configureSocket();
    this.configureLocalEvents();
  }

  configureSocket() {
    this.socket.on("players:self", (state) => {
      this.player.setSpawnPosition(
        state.x,
        state.y,
        true
      );
    });

    this.socket.on("players:init", (players) => {
      players.forEach((state) => {
        this.createOrUpdateRemote(state);
      });
    });

    this.socket.on("player:joined", (state) => {
      this.createOrUpdateRemote(state);
    });

    this.socket.on("player:state", (state) => {
      this.createOrUpdateRemote(state);
    });

    this.socket.on("player:attack", (payload) => {
      const remote = this.createOrUpdateRemote(payload);
      remote?.playAttack(
        payload.abilityName,
        payload
      );
    });

    this.socket.on("player:health", (payload) => {
      if (payload.id === this.socket.id) {
        return;
      }

      const remote = this.remotePlayers.get(payload.id);
      remote?.setHealth(
        payload.hp,
        payload.isDead
      );
    });

    this.socket.on("player:damaged", ({ amount, hp }) => {
      this.player.takeDamage(amount, {
        sync: false,
        authoritativeHp: hp,
      });
    });

    this.socket.on("player:left", ({ id }) => {
      const remote = this.remotePlayers.get(id);

      if (!remote) {
        return;
      }

      remote.destroy();
      this.remotePlayers.delete(id);
    });
  }

  configureLocalEvents() {
    this.scene.events.on(
      "local-player-attack",
      (abilityName) => {
        this.socket?.emit("player:attack", {
          abilityName,
        });
      }
    );

    this.scene.events.on(
      "local-player-health",
      ({ hp }) => {
        this.socket?.emit("player:health", {
          hp,
        });
      }
    );
  }

  createOrUpdateRemote(state) {
    if (
      !state?.id ||
      state.id === this.socket?.id
    ) {
      return null;
    }

    let remote = this.remotePlayers.get(state.id);

    if (!remote) {
      remote = new RemotePlayer(
        this.scene,
        state
      );

      this.remotePlayers.set(
        state.id,
        remote
      );
    } else {
      remote.applyState(state);
    }

    return remote;
  }

  update() {
    this.remotePlayers.forEach((remote) => {
      remote.update();
    });

    if (!this.socket?.connected) {
      return;
    }

    if (
      this.scene.time.now - this.lastStateSentAt <
      this.sendInterval
    ) {
      return;
    }

    this.lastStateSentAt = this.scene.time.now;

    const body = this.player.sprite.body;
    const moving = Boolean(
      body &&
      (Math.abs(body.velocity.x) > 1 ||
        Math.abs(body.velocity.y) > 1)
    );

    this.socket.emit("player:state", {
      x: this.player.sprite.x,
      y: this.player.sprite.y,
      facing: this.player.facing,
      moving,
    });
  }
}
