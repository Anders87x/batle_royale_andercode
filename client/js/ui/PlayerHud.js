export class PlayerHud {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.create();
    this.update();
  }

  create() {
    const x = 18;
    const y = 58;
    const width = 250;
    const height = 22;

    this.panel = this.scene.add
      .rectangle(
        x - 8,
        y - 28,
        width + 16,
        64,
        0x0f172a,
        0.88
      )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(180);

    this.nameText = this.scene.add
      .text(
        x,
        y - 20,
        this.player.name,
        {
          fontFamily: "Arial",
          fontSize: "13px",
          fontStyle: "bold",
          color: "#f8fafc",
        }
      )
      .setScrollFactor(0)
      .setDepth(181);

    this.hpBackground = this.scene.add
      .rectangle(
        x,
        y,
        width,
        height,
        0x2b1118,
        1
      )
      .setOrigin(0, 0)
      .setStrokeStyle(
        2,
        0xe2e8f0,
        0.55
      )
      .setScrollFactor(0)
      .setDepth(181);

    this.hpBar = this.scene.add
      .rectangle(
        x + 3,
        y + 3,
        width - 6,
        height - 6,
        0xdc2626,
        1
      )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(182);

    this.hpText = this.scene.add
      .text(
        x + width / 2,
        y + height / 2,
        "",
        {
          fontFamily: "Arial",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#111827",
          strokeThickness: 3,
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(183);
  }

  update() {
    const ratio = Math.max(
      0,
      this.player.hp /
        this.player.maxHp
    );

    this.nameText.setText(
      this.player.name ||
        "Jugador"
    );

    this.hpBar.setScale(
      ratio,
      1
    );

    this.hpText.setText(
      `${this.player.hp} / ${this.player.maxHp} HP`
    );
  }
}
