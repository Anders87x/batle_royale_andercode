import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  FRAME_SIZE,
} from "../config/game-config.js";
import { createSwordsmanAnimations } from "../animations/swordsmanAnimations.js";
import { Player } from "../entities/Player.js";
import { TrainingDummy } from "../entities/TrainingDummy.js";
import { TrainingEnemy } from "../entities/TrainingEnemy.js";
import { CombatSystem } from "../systems/CombatSystem.js";
import { CombatEffectSystem } from "../systems/CombatEffectSystem.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { NetworkSystem } from "../systems/NetworkSystem.js";
import { AbilityHud } from "../ui/AbilityHud.js";
import { PlayerHud } from "../ui/PlayerHud.js";
import { LobbyEnvironment } from "../world/LobbyEnvironment.js";

const Phaser = window.Phaser;

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.spritesheet(
      "swordsman-idle",
      "/assets/characters/swordsman/idle.png",
      {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      }
    );

    this.load.spritesheet(
      "swordsman-walk",
      "/assets/characters/swordsman/walk.png",
      {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      }
    );

    this.load.spritesheet(
      "swordsman-attack",
      "/assets/characters/swordsman/attack.png",
      {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      }
    );

    this.load.spritesheet(
      "swordsman-hurt",
      "/assets/characters/swordsman/hurt.png",
      {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      }
    );

    this.load.spritesheet(
      "swordsman-death",
      "/assets/characters/swordsman/death.png",
      {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      }
    );

    this.load.image(
      "lobby-interior",
      "/assets/lobby/interior_objects.png"
    );

    this.load.image(
      "ability-icon-attack1",
      "/assets/ui/abilities/attack1.png"
    );

    this.load.image(
      "ability-icon-attack2",
      "/assets/ui/abilities/attack2.png"
    );

    this.load.image(
      "ability-icon-attack3",
      "/assets/ui/abilities/attack3.png"
    );

    for (let i = 1; i <= 8; i += 1) {
      this.load.image(
        `fx-attack1-${i}`,
        `/assets/effects/attack1/${i}.png`
      );
    }

    for (let i = 1; i <= 10; i += 1) {
      this.load.image(
        `fx-attack2-${i}`,
        `/assets/effects/attack2/${i}.png`
      );

      this.load.image(
        `fx-attack3-${i}`,
        `/assets/effects/attack3/${i}.png`
      );
    }

    this.load.spritesheet(
      "mannequin-1",
      "/assets/lobby/mannequin_1.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      "mannequin-2",
      "/assets/lobby/mannequin_2.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      "mannequin-3",
      "/assets/lobby/mannequin_3.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
  }

  create() {
    createSwordsmanAnimations(this);

    this.physics.world.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT
    );

    this.lobby = new LobbyEnvironment(this);

    this.player = new Player(
      this,
      545,
      650
    );

    this.trainingEnemy = new TrainingEnemy(
      this,
      {
        x: 1175,
        y: 650,
        textureKey: "mannequin-3",
        name: "Dummy C",
      },
      this.player
    );

    this.trainingDummies = [
      new TrainingDummy(this, {
        x: 995,
        y: 650,
        textureKey: "mannequin-1",
        name: "Dummy A",
      }),
      new TrainingDummy(this, {
        x: 1085,
        y: 650,
        textureKey: "mannequin-2",
        name: "Dummy B",
      }),
      this.trainingEnemy,
    ];

    this.collisionSystem = new CollisionSystem(
      this,
      this.player,
      this.trainingDummies,
      this.lobby.getBlockers()
    );

    this.combatEffectSystem = new CombatEffectSystem(
      this,
      this.player
    );

    this.combatSystem = new CombatSystem(
      this,
      this.player,
      this.trainingDummies,
      this.combatEffectSystem
    );

    this.abilityHud = new AbilityHud(
      this,
      this.combatSystem
    );

    this.playerHud = new PlayerHud(
      this,
      this.player
    );

    this.networkSystem = new NetworkSystem(
      this,
      this.player
    );

    this.events.on(
      "player-died",
      () => this.handlePlayerDeath()
    );

    this.events.on(
      "match-started",
      () => {
        this.combatSystem.resetCooldowns();
      }
    );

    this.events.on(
      "match-returned-to-lobby",
      () => {
        this.combatSystem.resetCooldowns();
      }
    );

    this.input.on("pointerdown", (pointer) => {
      if (
        pointer.leftButtonDown() &&
        this.canUseCombat()
      ) {
        this.combatSystem.requestAbility("attack1");
      }
    });

    this.configureCamera();
  }

  configureCamera() {
    this.cameras.main.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT
    );

    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      0.1,
      0.1
    );

    this.cameras.main.setRoundPixels(true);
  }

  canUseCombat() {
    const phase =
      this.networkSystem?.getPhase?.() || "lobby";

    return (
      phase === "lobby" ||
      phase === "playing"
    );
  }

  handlePlayerDeath() {
    const phase =
      this.networkSystem?.getPhase?.() || "lobby";

    if (
      phase === "playing" ||
      phase === "finished"
    ) {
      return;
    }

    if (this.respawnPending) {
      return;
    }

    this.respawnPending = true;

    const message = this.add
      .text(
        480,
        220,
        "ELIMINADO\nReapareciendo...",
        {
          fontFamily: "Arial",
          fontSize: "30px",
          fontStyle: "bold",
          align: "center",
          color: "#ffffff",
          backgroundColor: "#7f1d1ddd",
          padding: {
            x: 20,
            y: 12,
          },
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);

    this.time.delayedCall(2500, () => {
      message.destroy();
      this.player.respawn();
      this.respawnPending = false;
    });
  }

  update() {
    this.player.update();

    const phase =
      this.networkSystem.getPhase();

    this.trainingEnemy.setEnabled(
      phase === "lobby"
    );

    this.trainingDummies.forEach((target) => {
      target.update?.();
    });

    this.combatSystem.update();
    this.networkSystem.update();

    if (
      this.canUseCombat() &&
      this.player.wantsToAttack()
    ) {
      this.combatSystem.requestAbility("attack1");
    }

    if (
      this.canUseCombat() &&
      this.player.wantsSkill2()
    ) {
      this.combatSystem.requestAbility("attack2");
    }

    if (
      this.canUseCombat() &&
      this.player.wantsSkill3()
    ) {
      this.combatSystem.requestAbility("attack3");
    }

    this.abilityHud.update();
    this.playerHud.update();
  }
}
