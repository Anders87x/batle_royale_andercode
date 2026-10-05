import { BASE_GAME_CONFIG } from "./config/game-config.js";
import { GameScene } from "./scenes/GameScene.js";

const Phaser = window.Phaser;

const landingPage =
  document.getElementById("landing-page");

const gamePage =
  document.getElementById("game-page");

const entryOverlay =
  document.getElementById("player-entry");

const entryForm =
  document.getElementById("player-entry-form");

const nameInput =
  document.getElementById("player-name");

const errorText =
  document.getElementById("player-name-error");

const openEntryButtons =
  document.querySelectorAll(".js-open-entry");

const closeEntryButtons =
  document.querySelectorAll(".js-close-entry");

let gameStarted = false;

function normalizeName(value) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 16);
}

function openEntry() {
  if (gameStarted) {
    return;
  }

  entryOverlay?.classList.remove("is-hidden");
  document.body.style.overflow = "hidden";

  window.setTimeout(() => {
    nameInput?.focus();
  }, 80);
}

function closeEntry() {
  if (gameStarted) {
    return;
  }

  entryOverlay?.classList.add("is-hidden");
  document.body.style.overflow = "";
  errorText.textContent = "";
}

function startGame(playerName) {
  if (gameStarted) {
    return;
  }

  gameStarted = true;
  window.PLAYER_NAME = playerName;

  entryOverlay?.classList.add("is-hidden");
  landingPage?.classList.add("is-hidden");
  gamePage?.classList.remove("is-hidden");
  document.body.style.overflow = "";

  window.scrollTo({
    top: 0,
    behavior: "instant",
  });

  new Phaser.Game({
    ...BASE_GAME_CONFIG,
    scene: [GameScene],
  });
}

openEntryButtons.forEach((button) => {
  button.addEventListener(
    "click",
    openEntry
  );
});

closeEntryButtons.forEach((button) => {
  button.addEventListener(
    "click",
    closeEntry
  );
});

entryForm?.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const playerName =
      normalizeName(
        nameInput?.value || ""
      );

    if (playerName.length < 2) {
      errorText.textContent =
        "Escribe un nombre de al menos 2 caracteres.";
      nameInput?.focus();
      return;
    }

    errorText.textContent = "";
    startGame(playerName);
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      !entryOverlay?.classList.contains(
        "is-hidden"
      )
    ) {
      closeEntry();
    }
  }
);
