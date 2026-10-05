export class CollisionSystem {
  constructor(scene, player, targets = [], blockers = []) {
    this.scene = scene;
    this.player = player;
    this.targets = targets;
    this.blockers = blockers;

    this.configurePlayerBody();
    this.createColliders();
  }

  configurePlayerBody() {
    this.player.sprite.body.setSize(22, 20, false);
    this.player.sprite.body.setOffset(21, 32);
  }

  createColliders() {
    this.targetColliders = this.targets.map((target) =>
      this.scene.physics.add.collider(
        this.player.sprite,
        target.sprite
      )
    );

    this.environmentColliders = this.blockers.map((blocker) =>
      this.scene.physics.add.collider(
        this.player.sprite,
        blocker
      )
    );
  }
}
