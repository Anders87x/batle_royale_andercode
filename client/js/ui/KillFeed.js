export class KillFeed {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.maxItems = 4;
  }

  add({
    killerName,
    victimName,
    source,
  }) {
    const text =
      source === "zone"
        ? `${victimName} cayó fuera de la zona`
        : `${killerName} eliminó a ${victimName}`;

    const item = this.scene.add
      .text(
        942,
        58 + this.items.length * 30,
        text,
        {
          fontFamily: "Arial",
          fontSize: "13px",
          fontStyle: "bold",
          color: "#ffffff",
          backgroundColor: "#0f172add",
          padding: {
            x: 9,
            y: 6,
          },
        }
      )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(440);

    this.items.push(item);
    this.reflow();

    while (
      this.items.length >
      this.maxItems
    ) {
      const oldest =
        this.items.shift();
      oldest?.destroy();
    }

    this.scene.time.delayedCall(
      4500,
      () => {
        const index =
          this.items.indexOf(item);

        if (index >= 0) {
          this.items.splice(
            index,
            1
          );
          item.destroy();
          this.reflow();
        }
      }
    );
  }

  reflow() {
    this.items.forEach(
      (item, index) => {
        item.setPosition(
          942,
          58 + index * 30
        );
      }
    );
  }

  clear() {
    this.items.forEach(
      (item) => item.destroy()
    );

    this.items = [];
  }
}
