import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  FRAME_SIZE,
} from "../config/game-config.js";
import { createSwordsmanAnimations } from "../animations/swordsmanAnimations.js";
import { Player } from "../entities/Player.js";
import { TrainingDummy } from "../entities/TrainingDummy.js";
import { CombatSystem } from "../systems/CombatSystem.js";
import { CombatEffectSystem } from "../systems/CombatEffectSystem.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { AbilityHud } from "../ui/AbilityHud.js";
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
      new TrainingDummy(this, {
        x: 1175,
        y: 650,
        textureKey: "mannequin-3",
        name: "Dummy C",
      }),
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

    this.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) {
        this.combatSystem.requestAbility("attack1");
      }
    });

    this.configureCamera();
    this.createInstructions();
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

  createInstructions() {
    this.add
      .text(
        18,
        18,
        "WASD mover | LMB/SPACE ataque | Q embestida | E giro",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#000000aa",
          padding: {
            x: 10,
            y: 6,
          },
        }
      )
      .setScrollFactor(0)
      .setDepth(100);
  }

  update() {
    this.player.update();
    this.combatSystem.update();

    if (this.player.wantsToAttack()) {
      this.combatSystem.requestAbility("attack1");
    }

    if (this.player.wantsSkill2()) {
      this.combatSystem.requestAbility("attack2");
    }

    if (this.player.wantsSkill3()) {
      this.combatSystem.requestAbility("attack3");
    }

    this.abilityHud.update();
  }
}
