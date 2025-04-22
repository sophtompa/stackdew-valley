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
    
    this.add.image(centerX - cardOffset, centerY, "playerCard");
    this.add.image(centerX + cardOffset, centerY, "enemyCard");

  const placeForText = [];
  const statIndex = 0;

  this.devlingStats = Object.keys(playerDevling).filter(stat =>
    typeof playerDevling[stat] === 'number'
  )

let playerStatDistance = centerY - 4; 

for (const [key, value] of Object.entries(playerDevling)) {
if(typeof value === "number"){
  this.add.text(centerX / 2, playerStatDistance,  `${key}: ${value}`, { fontSize: 32, font: '"Press Start 2P"', fill: this.placeForText ? "green" : "black"} );
  playerStatDistance += 40
}
}

let enemyStatDistance = centerY + 6;

for (const [key, value] of Object.entries(enemyDevling.stats)) {
  if(typeof value === "number"){
    this.add.text(centerX * 1.3 + 20, enemyStatDistance,  `${key}: ${value}`, { fontSize: 32, font: '"Press Start 2P"', color: "black"});
    enemyStatDistance += 36;
  }
  }
    // Draw cards


    console.log("Player Devling:", playerDevling);
    console.log("Enemy Devling:", enemyDevling);

    
  }

  update() {

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
