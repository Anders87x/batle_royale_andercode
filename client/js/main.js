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

const gamePlayerName =
  document.getElementById("game-player-name");

const gameShell =
  document.getElementById("game-shell");

const gameLoading =
  document.getElementById("game-loading");

const gameHelpButton =
  document.getElementById("game-help-button");

const gameHelpPanel =
  document.getElementById("game-help-panel");

const gameHelpClose =
  document.getElementById("game-help-close");

const gameHelpBackdrop =
  document.getElementById("game-help-backdrop");

const gameFullscreenButton =
  document.getElementById("game-fullscreen-button");

const gameExitButton =
  document.getElementById("game-exit-button");

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

function hideGameLoaderWhenReady() {
  const gameContainer =
    document.getElementById("game");

  if (!gameContainer) {
    return;
  }

  const markReady = () => {
    if (
      gameContainer.querySelector("canvas")
    ) {
      window.setTimeout(() => {
        gameLoading?.classList.add(
          "is-ready"
        );
      }, 320);

      return true;
    }

    return false;
  };

  if (markReady()) {
    return;
  }

  const observer =
    new MutationObserver(() => {
      if (markReady()) {
        observer.disconnect();
      }
    });

  observer.observe(
    gameContainer,
    {
      childList: true,
    }
  );

  window.setTimeout(() => {
    gameLoading?.classList.add(
      "is-ready"
    );

    observer.disconnect();
  }, 5000);
}

function openGameHelp() {
  gameHelpPanel?.classList.add(
    "is-open"
  );

  gameHelpPanel?.setAttribute(
    "aria-hidden",
    "false"
  );

  gameHelpBackdrop?.classList.remove(
    "is-hidden"
  );
}

function closeGameHelp() {
  gameHelpPanel?.classList.remove(
    "is-open"
  );

  gameHelpPanel?.setAttribute(
    "aria-hidden",
    "true"
  );

  gameHelpBackdrop?.classList.add(
    "is-hidden"
  );
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await gameShell?.requestFullscreen();
  } catch (error) {
    console.warn(
      "No se pudo activar pantalla completa:",
      error
    );
  }
}

function updateFullscreenLabel() {
  const label =
    gameFullscreenButton?.querySelector(
      "span:last-child"
    );

  if (!label) {
    return;
  }

  label.textContent =
    document.fullscreenElement
      ? "Salir de pantalla completa"
      : "Pantalla completa";
}

function startGame(playerName) {
  if (gameStarted) {
    return;
  }

  gameStarted = true;
  window.PLAYER_NAME = playerName;

  if (gamePlayerName) {
    gamePlayerName.textContent =
      playerName;
  }

  entryOverlay?.classList.add("is-hidden");
  landingPage?.classList.add("is-hidden");
  gamePage?.classList.remove("is-hidden");
  document.body.classList.add("game-mode");
  document.body.style.overflow = "";

  window.scrollTo({
    top: 0,
    behavior: "instant",
  });

  hideGameLoaderWhenReady();

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
    if (event.key !== "Escape") {
      return;
    }

    if (
      gameHelpPanel?.classList.contains(
        "is-open"
      )
    ) {
      closeGameHelp();
      return;
    }

    if (
      !entryOverlay?.classList.contains(
        "is-hidden"
      )
    ) {
      closeEntry();
    }
  }
);


gameHelpButton?.addEventListener(
  "click",
  openGameHelp
);

gameHelpClose?.addEventListener(
  "click",
  closeGameHelp
);

gameHelpBackdrop?.addEventListener(
  "click",
  closeGameHelp
);

gameFullscreenButton?.addEventListener(
  "click",
  toggleFullscreen
);

document.addEventListener(
  "fullscreenchange",
  updateFullscreenLabel
);

gameExitButton?.addEventListener(
  "click",
  () => {
    window.location.reload();
  }
);
