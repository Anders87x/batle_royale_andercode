const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const CLIENT_PATH = path.join(__dirname, "..", "client");

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

app.get("/", (_req, res) => {
  res.sendFile(path.join(CLIENT_PATH, "index.html"));
});

app.use(express.static(CLIENT_PATH));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSpawn(index) {
  return {
    x: 545 + (index % 4) * 90,
    y: 650 + Math.floor(index / 4) * 90,
  };
}

function sanitizeFacing(facing) {
  return ["up", "down", "left", "right"].includes(facing)
    ? facing
    : "down";
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
  const spawn = getSpawn(players.size);

  const player = {
    id: socket.id,
    x: spawn.x,
    y: spawn.y,
    facing: "down",
    moving: false,
    hp: 100,
    isDead: false,
    cooldownEnds: {
      attack1: 0,
      attack2: 0,
      attack3: 0,
    },
  };

  players.set(socket.id, player);

  socket.emit("players:self", player);
  socket.emit(
    "players:init",
    Array.from(players.values()).filter(
      (item) => item.id !== socket.id
    )
  );

  socket.broadcast.emit("player:joined", player);

  socket.on("player:state", (state = {}) => {
    const current = players.get(socket.id);

    if (!current) {
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

    current.facing = sanitizeFacing(state.facing);
    current.moving = Boolean(state.moving);

    socket.broadcast.emit("player:state", {
      id: socket.id,
      x: current.x,
      y: current.y,
      facing: current.facing,
      moving: current.moving,
      hp: current.hp,
      isDead: current.isDead,
    });
  });

  socket.on("player:health", ({ hp } = {}) => {
    const current = players.get(socket.id);

    if (!current || !Number.isFinite(hp)) {
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

    if (!attacker || !ability || attacker.isDead) {
      return;
    }

    const now = Date.now();

    if (now < attacker.cooldownEnds[abilityName]) {
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

    players.forEach((target, targetId) => {
      if (
        targetId === socket.id ||
        target.isDead ||
        !attackHits(attacker, target, abilityName)
      ) {
        return;
      }

      target.hp = Math.max(0, target.hp - ability.damage);
      target.isDead = target.hp <= 0;

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
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    socket.broadcast.emit("player:left", {
      id: socket.id,
    });
  });
});

server.listen(PORT, () => {
  console.log(
    `AnderCode Battle Royale ejecutándose en http://localhost:${PORT}`
  );
});
