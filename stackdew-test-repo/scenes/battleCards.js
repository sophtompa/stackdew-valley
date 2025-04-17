import { database } from "/src/dummydata.js";

export default class battleCardScene extends Phaser.Scene {
  constructor() {
    super({ key: "battleCardScene" });
  }

  preload() {
    this.load.image("playerCard", "../assets/cardDesign.png");
    this.load.image("enemyCard", "../assets/cardDesign.png");
  }

  create() {
    const { centerX, centerY } = this.cameras.main;
    const cardOffset = 200;

    const playerDevling = database[0];

    const enemyDevling = {
      name: "EnemyDevling",
      stats: this.generateEnemyStats(playerDevling),
    };

    // Draw cards
    this.add.image(centerX - cardOffset, centerY, "playerCard");
    this.add.image(centerX + cardOffset, centerY, "enemyCard");

    console.log("Player Devling:", playerDevling);
    console.log("Enemy Devling:", enemyDevling);

    this.add.text(10, 10, "???", { fontSize: 32, font: '"Press Start 2P"' });
  }

  generateEnemyStats(playerDevling) {
    const randStats = {};

    for (const key in playerDevling) {
      const value = playerDevling[key];

      if (typeof value === "number") {
        const change = Phaser.Math.Between(-1, 1);
        randStats[key] = Math.max(0, value + change);

        console.log(
          `Stat: ${key}, Original: ${value}, Change: ${change}, New: ${randStats[key]}`
        );
      }
    }

    console.log("New Enemy Stats:", randStats);
    return randStats;
  }
}
