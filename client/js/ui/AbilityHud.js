import {
  ABILITIES,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../config/game-config.js";

const ICONS = {
  attack1: {
    texture: "ability-icon-attack1",
    key: "LMB",
  },
  attack2: {
    texture: "ability-icon-attack2",
    key: "Q",
  },
  attack3: {
    texture: "ability-icon-attack3",
    key: "E",
  },
};

export class AbilityHud {
  constructor(scene, combatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
    this.items = {};

    this.create();
  }

  create() {
    const names = ["attack1", "attack2", "attack3"];
    const iconSize = 64;
    const gap = 10;
    const margin = 18;
    const totalWidth =
      names.length * iconSize + (names.length - 1) * gap;

    const startX = GAME_WIDTH - margin - totalWidth;
    const y = GAME_HEIGHT - margin - iconSize;

    names.forEach((name, index) => {
      const iconConfig = ICONS[name];
      const x = startX + index * (iconSize + gap);

      const frame = this.scene.add
        .rectangle(
          x - 3,
          y - 3,
          iconSize + 6,
          iconSize + 6,
          0x111827,
          0.96
        )
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xe2e8f0, 0.8)
        .setScrollFactor(0)
        .setDepth(200);

      const icon = this.scene.add
        .image(
          x + iconSize / 2,
          y + iconSize / 2,
          iconConfig.texture
        )
        .setDisplaySize(iconSize, iconSize)
        .setScrollFactor(0)
        .setDepth(201);

      const cooldownOverlay = this.scene.add
        .rectangle(
          x,
          y,
          iconSize,
          iconSize,
          0x020617,
          0.7
        )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(202)
        .setVisible(false);

      const cooldownText = this.scene.add
        .text(
          x + iconSize / 2,
          y + iconSize / 2,
          "",
          {
            fontFamily: "Arial",
            fontSize: "22px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#020617",
            strokeThickness: 4,
          }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(204)
        .setVisible(false);

      const keyBackground = this.scene.add
        .rectangle(
          x + 4,
          y + 4,
          iconConfig.key === "LMB" ? 30 : 22,
          18,
          0x020617,
          0.88
        )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(205);

      const keyText = this.scene.add
        .text(
          x + 8,
          y + 6,
          iconConfig.key,
          {
            fontFamily: "Arial",
            fontSize: "11px",
            fontStyle: "bold",
            color: "#ffffff",
          }
        )
        .setScrollFactor(0)
        .setDepth(206);

      this.items[name] = {
        frame,
        icon,
        cooldownOverlay,
        cooldownText,
        keyBackground,
        keyText,
      };
    });
  }

  update() {
    Object.entries(this.items).forEach(([name, item]) => {
      const state = this.combatSystem.getCooldownState(name);

      if (state.ready) {
        item.icon.clearTint();
        item.icon.setAlpha(1);
        item.frame.setStrokeStyle(2, 0xe2e8f0, 0.8);
        item.cooldownOverlay.setVisible(false);
        item.cooldownText.setVisible(false);
        return;
      }

      item.icon.setTint(0x777777);
      item.icon.setAlpha(0.55);
      item.frame.setStrokeStyle(2, 0x64748b, 0.65);

      item.cooldownOverlay
        .setVisible(true)
        .setScale(1, 1 - state.progress);

      const seconds = state.remaining / 1000;
      const label =
        seconds >= 10
          ? Math.ceil(seconds).toString()
          : seconds.toFixed(1);

      item.cooldownText
        .setText(label)
        .setVisible(true);
    });
  }
}
