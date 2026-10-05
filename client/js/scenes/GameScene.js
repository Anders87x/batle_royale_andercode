import {
  GAME_WIDTH,
  GAME_HEIGHT,
  FRAME_SIZE,
} from "../config/game-config.js";
import { createSwordsmanAnimations } from "../animations/swordsmanAnimations.js";
import { Player } from "../entities/Player.js";
import { Enemy } from "../entities/Enemy.js";
import { CombatSystem } from "../systems/CombatSystem.js";

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
  }

  create() {
    createSwordsmanAnimations(this);

    this.player = new Player(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2
    );

    this.enemy = new Enemy(
      this,
      GAME_WIDTH / 2 + 125,
      GAME_HEIGHT / 2
    );

    this.combatSystem = new CombatSystem(
      this,
      this.player,
      this.enemy
    );

    this.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) {
        this.combatSystem.startAttack();
      }
    });

    this.createInstructions();
  }

  createInstructions() {
    this.add
      .text(
        18,
        18,
        "WASD: mover | Click izq. o SPACE: atacar | Ataque 1 = 25 daño",
        {
          fontFamily: "Arial",
          fontSize: "17px",
          color: "#ffffff",
          backgroundColor: "#00000088",
          padding: {
            x: 10,
            y: 6,
          },
        }
      )
      .setDepth(30);

    this.add
      .text(
        18,
        52,
        "Golpea al Swordsman enemigo: Hurt con daño y Death al llegar a 0 HP.",
        {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#cbd5e1",
          backgroundColor: "#00000066",
          padding: {
            x: 8,
            y: 5,
          },
        }
      )
      .setDepth(30);
  }

  update(_time, delta) {
    this.player.update(delta);

    if (this.player.wantsToAttack()) {
      this.combatSystem.startAttack();
    }
  }
}
