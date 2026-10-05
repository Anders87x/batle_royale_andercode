import {
  ABILITIES,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../config/game-config.js";

export class AbilityHud {
  constructor(scene, combatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
    this.items = {};

    this.create();
  }

  create() {
    const names = ["attack1", "attack2", "attack3"];
    const panelWidth = 205;
    const gap = 12;
    const totalWidth =
      names.length * panelWidth + (names.length - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const y = GAME_HEIGHT - 74;

    names.forEach((name, index) => {
      const ability = ABILITIES[name];
      const x = startX + index * (panelWidth + gap);

      const background = this.scene.add
        .rectangle(
          x,
          y,
          panelWidth,
          56,
          0x0f172a,
          0.9
        )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(200);

      const keyText = this.scene.add
        .text(x + 10, y + 7, ability.keyLabel, {
          fontFamily: "Arial",
          fontSize: "13px",
          fontStyle: "bold",
          color: "#f8fafc",
        })
        .setScrollFactor(0)
        .setDepth(201);

      const labelText = this.scene.add
        .text(x + 10, y + 25, ability.label, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#cbd5e1",
        })
        .setScrollFactor(0)
        .setDepth(201);

      const statusText = this.scene.add
        .text(x + panelWidth - 10, y + 8, "LISTO", {
          fontFamily: "Arial",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(201);

      const barBackground = this.scene.add
        .rectangle(
          x + 10,
          y + 47,
          panelWidth - 20,
          5,
          0x334155,
          1
        )
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(201);

      const bar = this.scene.add
        .rectangle(
          x + 10,
          y + 47,
          panelWidth - 20,
          5,
          0xe2e8f0,
          1
        )
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(202);

      this.items[name] = {
        background,
        keyText,
        labelText,
        statusText,
        barBackground,
        bar,
      };
    });
  }

  update() {
    Object.entries(this.items).forEach(([name, item]) => {
      const state = this.combatSystem.getCooldownState(name);

      item.bar.setScale(state.progress, 1);

      if (state.ready) {
        item.statusText.setText("LISTO");
        return;
      }

      item.statusText.setText(
        `${(state.remaining / 1000).toFixed(1)}s`
      );
    });
  }
}
