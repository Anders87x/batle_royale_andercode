const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const CLIENT_PATH = path.join(__dirname, "..", "client");

const MATCH_MIN_PLAYERS = 2;
const COUNTDOWN_MS = 3000;
const RETURN_TO_LOBBY_MS = 5000;

const WORLD_BOUNDS = {
  minX: 40,
  maxX: 1400,
  minY: 184,
  maxY: 868,
};

const ABILITIES = {
  attack1: {
    damage: 25,
    cooldown: 800,
  },
  attack2: {
    damage: 35,
    cooldown: 4000,
  },
  attack3: {
    damage: 30,
    cooldown: 7000,
  },
};

const players = new Map();

const match = {
  phase: "lobby",
  countdownEndsAt: null,
  winnerId: null,
  returnToLobbyAt: null,
};

let countdownTimer = null;
let returnToLobbyTimer = null;

app.get("/", (_req, res) => {
  res.sendFile(path.join(CLIENT_PATH, "index.html"));
});

app.use(express.static(CLIENT_PATH));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSpawn(index) {
  return {
    x: 545 + (index % 4) * 105,
    y: 650 + Math.floor(index / 4) * 95,
  };
}

function sanitizeFacing(facing) {
  return ["up", "down", "left", "right"].includes(facing)
    ? facing
    : "down";
}

function publicPlayer(player) {
  return {
    id: player.id,
    x: player.x,
    y: player.y,
    facing: player.facing,
    moving: player.moving,
    hp: player.hp,
    isDead: player.isDead,
    ready: player.ready,
  };
}

function getPublicPlayers() {
  return Array.from(players.values()).map(publicPlayer);
}

function getMatchState() {
  return {
    phase: match.phase,
    countdownEndsAt: match.countdownEndsAt,
    winnerId: match.winnerId,
    returnToLobbyAt: match.returnToLobbyAt,
    minPlayers: MATCH_MIN_PLAYERS,
    players: getPublicPlayers(),
  };
}

function broadcastMatchState() {
  io.emit("match:state", getMatchState());
  io.emit("players:count", players.size);
}

function broadcastPlayerReset() {
  io.emit("match:players-reset", getPublicPlayers());
}

function resetPlayerForRound(player, index) {
  const spawn = getSpawn(index);

  player.x = spawn.x;
  player.y = spawn.y;
  player.facing = "down";
  player.moving = false;
  player.hp = 100;
  player.isDead = false;
  player.cooldownEnds = {
    attack1: 0,
    attack2: 0,
    attack3: 0,
  };
}

function clearCountdownTimer() {
  if (countdownTimer) {
    clearTimeout(countdownTimer);
    countdownTimer = null;
  }
}

function clearReturnTimer() {
  if (returnToLobbyTimer) {
    clearTimeout(returnToLobbyTimer);
    returnToLobbyTimer = null;
  }
}

function cancelCountdown() {
  clearCountdownTimer();

  match.phase = "lobby";
  match.countdownEndsAt = null;
  match.winnerId = null;
  match.returnToLobbyAt = null;

  broadcastMatchState();
}

function allPlayersReady() {
  return (
    players.size >= MATCH_MIN_PLAYERS &&
    Array.from(players.values()).every(
      (player) => player.ready
    )
  );
}

function maybeStartCountdown() {
  if (match.phase === "playing" || match.phase === "finished") {
    return;
  }

  if (!allPlayersReady()) {
    if (match.phase === "countdown") {
      cancelCountdown();
    } else {
      broadcastMatchState();
    }

    return;
  }

  if (match.phase === "countdown") {
    return;
  }

  match.phase = "countdown";
  match.countdownEndsAt = Date.now() + COUNTDOWN_MS;
  match.winnerId = null;
  match.returnToLobbyAt = null;

  broadcastMatchState();

  countdownTimer = setTimeout(() => {
    countdownTimer = null;

    if (!allPlayersReady()) {
      cancelCountdown();
      return;
    }

    startMatch();
  }, COUNTDOWN_MS);
}

function startMatch() {
  clearCountdownTimer();
  clearReturnTimer();

  match.phase = "playing";
  match.countdownEndsAt = null;
  match.winnerId = null;
  match.returnToLobbyAt = null;

  Array.from(players.values()).forEach(
    (player, index) => {
      resetPlayerForRound(player, index);
      player.ready = false;
    }
  );

  broadcastPlayerReset();
  broadcastMatchState();
}

function finishMatch(winnerId) {
  if (match.phase !== "playing") {
    return;
  }

  match.phase = "finished";
  match.countdownEndsAt = null;
  match.winnerId = winnerId || null;
  match.returnToLobbyAt =
    Date.now() + RETURN_TO_LOBBY_MS;

  broadcastMatchState();

  clearReturnTimer();
  returnToLobbyTimer = setTimeout(() => {
    returnToLobbyTimer = null;
    returnToLobby();
  }, RETURN_TO_LOBBY_MS);
}

function returnToLobby() {
  clearCountdownTimer();
  clearReturnTimer();

  match.phase = "lobby";
  match.countdownEndsAt = null;
  match.winnerId = null;
  match.returnToLobbyAt = null;

  Array.from(players.values()).forEach(
    (player, index) => {
      resetPlayerForRound(player, index);
      player.ready = false;
    }
  );

  broadcastPlayerReset();
  broadcastMatchState();
}

function evaluateWinner() {
  if (match.phase !== "playing") {
    return;
  }

  const alivePlayers = Array.from(
    players.values()
  ).filter((player) => !player.isDead);

  if (alivePlayers.length <= 1) {
    finishMatch(
      alivePlayers.length === 1
        ? alivePlayers[0].id
        : null
    );
  }
}

function isInsideRect(px, py, rect, padding = 24) {
  return (
    px >= rect.x - padding &&
    px <= rect.x + rect.width + padding &&
    py >= rect.y - padding &&
    py <= rect.y + rect.height + padding
  );
}

function attackHits(attacker, target, abilityName) {
  const { x, y } = attacker;
  const facing = sanitizeFacing(attacker.facing);

  if (abilityName === "attack3") {
    const dx = target.x - x;
    const dy = target.y - y;

    return Math.hypot(dx, dy) <= 140;
  }

  if (abilityName === "attack2") {
    const range = 220;
    const thickness = 72;

    if (facing === "right") {
      return isInsideRect(target.x, target.y, {
        x,
        y: y - thickness / 2,
        width: range,
        height: thickness,
      });
    }

    if (facing === "left") {
      return isInsideRect(target.x, target.y, {
        x: x - range,
        y: y - thickness / 2,
        width: range,
        height: thickness,
      });
    }

    if (facing === "down") {
      return isInsideRect(target.x, target.y, {
        x: x - thickness / 2,
        y,
        width: thickness,
        height: range,
      });
    }

    return isInsideRect(target.x, target.y, {
      x: x - thickness / 2,
      y: y - range,
      width: thickness,
      height: range,
    });
  }

  const offset = 80;
  const horizontalWidth = 110;
  const horizontalHeight = 76;
  const verticalWidth = 76;
  const verticalHeight = 110;

  if (facing === "right") {
    return isInsideRect(target.x, target.y, {
      x: x + offset - horizontalWidth / 2,
      y: y - horizontalHeight / 2,
      width: horizontalWidth,
      height: horizontalHeight,
    });
  }

  if (facing === "left") {
    return isInsideRect(target.x, target.y, {
      x: x - offset - horizontalWidth / 2,
      y: y - horizontalHeight / 2,
      width: horizontalWidth,
      height: horizontalHeight,
    });
  }

  if (facing === "down") {
    return isInsideRect(target.x, target.y, {
      x: x - verticalWidth / 2,
      y: y + offset - verticalHeight / 2,
      width: verticalWidth,
      height: verticalHeight,
    });
  }

  return isInsideRect(target.x, target.y, {
    x: x - verticalWidth / 2,
    y: y - offset - verticalHeight / 2,
    width: verticalWidth,
    height: verticalHeight,
  });
}

io.on("connection", (socket) => {
  if (match.phase === "countdown") {
    cancelCountdown();
  }

  const spawn = getSpawn(players.size);
  const joinsAsSpectator =
    match.phase === "playing" ||
    match.phase === "finished";

  const player = {
    id: socket.id,
    x: spawn.x,
    y: spawn.y,
    facing: "down",
    moving: false,
    hp: joinsAsSpectator ? 0 : 100,
    isDead: joinsAsSpectator,
    ready: false,
    cooldownEnds: {
      attack1: 0,
      attack2: 0,
      attack3: 0,
    },
  };

  players.set(socket.id, player);

  console.log(
    `Jugador conectado: ${socket.id} · Total: ${players.size}`
  );

  socket.broadcast.emit(
    "player:joined",
    publicPlayer(player)
  );

  broadcastMatchState();

  socket.on("players:sync", () => {
    const current = players.get(socket.id);

    if (!current) {
      return;
    }

    socket.emit(
      "players:self",
      publicPlayer(current)
    );

    socket.emit(
      "players:init",
      Array.from(players.values())
        .filter((item) => item.id !== socket.id)
        .map(publicPlayer)
    );

    socket.emit("match:state", getMatchState());
    socket.emit("players:count", players.size);
  });

  socket.on("match:ready", ({ ready } = {}) => {
    const current = players.get(socket.id);

    if (
      !current ||
      !["lobby", "countdown"].includes(match.phase)
    ) {
      return;
    }

    current.ready = Boolean(ready);

    if (
      match.phase === "countdown" &&
      !current.ready
    ) {
      cancelCountdown();
      return;
    }

    maybeStartCountdown();
  });

  socket.on("player:state", (state = {}) => {
    const current = players.get(socket.id);

    if (!current || current.isDead) {
      return;
    }

    if (Number.isFinite(state.x)) {
      current.x = clamp(
        state.x,
        WORLD_BOUNDS.minX,
        WORLD_BOUNDS.maxX
      );
    }

    if (Number.isFinite(state.y)) {
      current.y = clamp(
        state.y,
        WORLD_BOUNDS.minY,
        WORLD_BOUNDS.maxY
      );
    }

    current.facing =
      sanitizeFacing(state.facing);
    current.moving = Boolean(state.moving);

    socket.broadcast.emit(
      "player:state",
      publicPlayer(current)
    );
  });

  socket.on("player:health", ({ hp } = {}) => {
    const current = players.get(socket.id);

    if (
      !current ||
      !Number.isFinite(hp) ||
      match.phase === "playing" ||
      match.phase === "finished"
    ) {
      return;
    }

    current.hp = clamp(Math.round(hp), 0, 100);
    current.isDead = current.hp <= 0;

    io.emit("player:health", {
      id: socket.id,
      hp: current.hp,
      isDead: current.isDead,
    });
  });

  socket.on("player:attack", ({ abilityName } = {}) => {
    const attacker = players.get(socket.id);
    const ability = ABILITIES[abilityName];

    if (
      match.phase !== "playing" ||
      !attacker ||
      !ability ||
      attacker.isDead
    ) {
      return;
    }

    const now = Date.now();

    if (
      now <
      attacker.cooldownEnds[abilityName]
    ) {
      return;
    }

    attacker.cooldownEnds[abilityName] =
      now + ability.cooldown;

    socket.broadcast.emit("player:attack", {
      id: socket.id,
      abilityName,
      x: attacker.x,
      y: attacker.y,
      facing: attacker.facing,
    });

    let hitAnyPlayer = false;

    players.forEach((target, targetId) => {
      if (
        targetId === socket.id ||
        target.isDead ||
        !attackHits(
          attacker,
          target,
          abilityName
        )
      ) {
        return;
      }

      target.hp = Math.max(
        0,
        target.hp - ability.damage
      );
      target.isDead = target.hp <= 0;
      hitAnyPlayer = true;

      io.to(targetId).emit("player:damaged", {
        amount: ability.damage,
        hp: target.hp,
        fromId: socket.id,
      });

      io.emit("player:health", {
        id: targetId,
        hp: target.hp,
        isDead: target.isDead,
      });
    });

    if (hitAnyPlayer) {
      socket.emit("player:hit-confirm", {
        abilityName,
      });

      broadcastMatchState();
      evaluateWinner();
    }
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);

    console.log(
      `Jugador desconectado: ${socket.id} · Total: ${players.size}`
    );

    socket.broadcast.emit("player:left", {
      id: socket.id,
    });

    if (players.size === 0) {
      returnToLobby();
      return;
    }

    if (match.phase === "playing") {
      broadcastMatchState();
      evaluateWinner();
    } else if (match.phase === "countdown") {
      cancelCountdown();
      maybeStartCountdown();
    } else {
      broadcastMatchState();
    }
  });
});

server.listen(PORT, () => {
  console.log(
    `AnderCode Battle Royale ejecutándose en http://localhost:${PORT}`
  );
});
