import { BASE_GAME_CONFIG } from "./config/game-config.js";
import { GameScene } from "./scenes/GameScene.js";

const Phaser = window.Phaser;

const entryOverlay =
  document.getElementById("player-entry");

const entryForm =
  document.getElementById("player-entry-form");

const nameInput =
  document.getElementById("player-name");

const errorText =
  document.getElementById("player-name-error");

let gameStarted = false;

function normalizeName(value) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 16);
}

function startGame(playerName) {
  if (gameStarted) {
    return;
  }

  gameStarted = true;
  window.PLAYER_NAME = playerName;

  entryOverlay?.classList.add("is-hidden");

  new Phaser.Game({
    ...BASE_GAME_CONFIG,
    scene: [GameScene],
  });
}

entryForm?.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const playerName =
      normalizeName(
        nameInput?.value || ""
      );

    if (
      playerName.length < 2
    ) {
      errorText.textContent =
        "Escribe un nombre de al menos 2 caracteres.";
      nameInput?.focus();
      return;
    }

    errorText.textContent = "";
    startGame(playerName);
  }
);

window.addEventListener(
  "load",
  () => {
    nameInput?.focus();
  }
);
