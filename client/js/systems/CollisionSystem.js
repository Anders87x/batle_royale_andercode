export class CollisionSystem {
  constructor(scene, player, enemy, blockers = []) {
    this.scene = scene;
    this.player = player;
    this.enemy = enemy;
    this.blockers = blockers;

    this.configureBodies();
    this.createColliders();
  }

  configureBodies() {
    // El sprite mide 64x64, pero el cuerpo visual ocupa solo una parte.
    // Usamos una caja pequeña alrededor de los pies/cuerpo para que
    // los personajes puedan acercarse sin chocar con píxeles transparentes.
    this.player.sprite.body.setSize(22, 20, false);
    this.player.sprite.body.setOffset(21, 32);

    this.enemy.sprite.body.setSize(22, 20, false);
    this.enemy.sprite.body.setOffset(21, 32);

    this.enemy.sprite.setImmovable(true);
    this.enemy.sprite.setPushable(false);
  }

  createColliders() {
    this.playerEnemyCollider = this.scene.physics.add.collider(
      this.player.sprite,
      this.enemy.sprite
    );

    this.environmentColliders = this.blockers.map((blocker) =>
      this.scene.physics.add.collider(
        this.player.sprite,
        blocker
      )
    );
  }
}
