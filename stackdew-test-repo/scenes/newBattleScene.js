import { database } from "/src/dummydata.js";
import { enemyDevlings } from "../src/enemyDevlingData";

export default class newBattleScene extends Phaser.Scene {
  constructor() {
    super("newBattleScene");
  }

  preload() {
    // Just use a solid color for now
    this.load.image("background", "../assets/overworldsophie.png"); // Replace with an actual placeholder if needed
  }

  create() {
    const cam = this.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;

    this.add
      .image(0, 0, "background")
      .setOrigin(0)
      .setDepth(-1)
      .setDisplaySize(cam.width, cam.height);

    // Grab dummy data
    this.playerDevling = database[0];
    this.enemyDevling = enemyDevlings[0];

    this.usedStats = [];
    this.playerLives = 3;
    this.enemyLives = 3;
    this.statKeys = Object.keys(this.playerDevling);
    this.currentStatIndex = 0;
    this.isRoundActive = false;

    this.playerLivesText = this.add.text(20, 20, `Player Lives: ${this.playerLives}`, {
      fontSize: "14px",
      fontFamily: '"Press Start 2P"',
      fill: "#00ff00",
    });

    this.enemyLivesText = this.add.text(cam.width - 180, 20, `Enemy Lives: ${this.enemyLives}`, {
      fontSize: "14px",
      fontFamily: '"Press Start 2P"',
      fill: "#ff0000",
    });

    this.roundCounterText = this.add
      .text(centerX, 50, "ROUND ONE", {
        fontSize: "16px",
        fontFamily: '"Press Start 2P"',
        fill: "#ffffff",
      })
      .setOrigin(0.5, 0);

    this.statText = this.add.text(centerX, centerY, "", {
      fontSize: "16px",
      fontFamily: "monospace",
      fill: "#ffffff",
    }).setOrigin(0.5);

    this.input.keyboard.on("keydown-LEFT", () => this.navigateStat(-1));
    this.input.keyboard.on("keydown-RIGHT", () => this.navigateStat(1));
    this.input.keyboard.on("keydown-SPACE", () => this.compareStatValues());

    this.displayCurrentStat();
  }

  navigateStat(dir) {
    const total = this.statKeys.length;
    this.currentStatIndex = (this.currentStatIndex + dir + total) % total;
    this.displayCurrentStat();
  }

  displayCurrentStat() {
    const stat = this.statKeys[this.currentStatIndex];
    const player = this.playerDevling[stat];
    this.statText.setText(`> ${stat.toUpperCase()} — ${player}`);
  }

  compareStatValues() {
    const stat = this.statKeys[this.currentStatIndex];
    if (this.usedStats.includes(stat)) return;

    this.usedStats.push(stat);
    const player = this.playerDevling[stat];
    const enemy = this.enemyDevling.stats[stat];
    let result = "draw";

    if (player > enemy) {
      result = `${this.playerDevling.name} wins`;
      this.enemyLives--;
    } else if (player < enemy) {
      result = `${this.enemyDevling.name} wins`;
      this.playerLives--;
    }

    this.updateLivesText();

    const resultText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 100,
      `${stat.toUpperCase()} — ${result.toUpperCase()}`,
      {
        fontSize: "16px",
        fontFamily: "monospace",
        fill: "#ffff00",
      }
    ).setOrigin(0.5);

    const gameOver =
      this.playerLives === 0 ||
      this.enemyLives === 0 ||
      this.usedStats.length >= 3;

    if (gameOver) {
      this.time.delayedCall(2000, () => {
        resultText.setText(
          this.playerLives > this.enemyLives
            ? `${this.playerDevling.name} wins the match`
            : `${this.enemyDevling.name} wins the match`
        );
        this.time.delayedCall(2000, () => this.scene.start("overworldScene"));
      });
    } else {
      this.time.delayedCall(3000, () => resultText.destroy());
    }
  }

  updateLivesText() {
    this.playerLivesText.setText(`Player Lives: ${this.playerLives}`);
    this.enemyLivesText.setText(`Enemy Lives: ${this.enemyLives}`);
  }
}
