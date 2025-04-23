import { database } from "/src/dummydata.js";
import { enemyDevlings } from "../src/enemyDevlingData";
import DevlingHead from "../src/devlingHead";

export default class trumpBattle extends Phaser.Scene {
  constructor() {
    super("trumpBattle");
  }

  preload() {
    //background image
    this.load.image("background", "../assets/battleroof.png");

    this.load.image("playerCard", "../assets/cardDesign/cardFront.png");
    // this.load.image("enemyCard", "../assets/cardDesign.png");

    //player card image (front of card)
    this.load.image("front", "../assets/cardDesign/cardFront.png");
    // this.load.image("front", "../assets/cardFront.png");

    //enemy card images (back and front of card)
    // this.load.image("enemyfront", "../assets/cardDesign/redCardFront.png");
    this.load.image("enemyfront", "../assets/cardDesign/cardFront.png");
    this.load.image("enemyback", "../assets/cardDesign/redCardBack.png");

    //nav sounds
    this.load.audio("nav", "../assets/sounds/keypad.mp3");
    this.load.audio("select", "../assets/sounds/select1.mp3");
    this.load.audio("error", "../assets/sounds/keypadReject.mp3");

    this.load.audio("roundOne", "../assets/sounds/roundOne.mp3");
    this.load.audio("roundTwo", "../assets/sounds/roundtwo.mp3");
    this.load.audio("finalRound", "../assets/sounds/finalRound.mp3");

    this.load.image("healthFull", "../assets/health_full.png");
    this.load.image("healthMid", "../assets/health_mid.png");
    this.load.image("healthLow", "../assets/health_low.png");

    this.load.image("playerDevling", "../assets/heads/standingSprite.png");
    this.load.image("enemyDevling", "../assets/heads/standingSprite.png");
    this.load.image("vsImage", "../assets/vsimg.png");
    this.load.audio("vsSound", "../assets/sounds/vssound.mp3");
    this.load.audio("playerNameSound", "../assets/sounds/beccaSound.mp3");
    this.load.audio("enemyNameSound", "../assets/sounds/norbion.mp3");

    this.load.audio("backgroundMusic", "../assets/sounds/backgroundMusic.wav");
    this.load.image("roundOneImg", "../assets/roundOneImg.png");

    this.load.image("QuestionMarks", "../assets/questionMarks.png");

    database.forEach((devling) => {
      if (!devling.sprite) return;
      this.load.atlas(devling.name, devling.sprite);
    });

    enemyDevlings.forEach((devling) => {
      if (!devling.sprite) return;
      this.load.atlas(devling.name, devling.sprite);
    });
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

    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.2,
    });

    this.backgroundMusic.play();

    this.usedStats = [];
    this.playerLives = 3;
    this.enemyLives = 3;
    this.isRoundActive = false;
    this.isFirstRound = true;

    //==CHOSEN PLAYER & ENEMY DEVLING
    this.playerDevling = database[0];
    this.enemyDevling = enemyDevlings[0];

    //
    //==HEALTHBAR==
    this.playerHealthBar = this.createHealthBar(100, 50);
    this.enemyHealthBar = this.createHealthBar(cam.width - 100, 50);
    this.enemyHealthBar.flipX = true;

    //VERTICAL DISTANCE FOR PLAYER CARD
    let statY = centerY + 73;

    //==PLAYER DEVLING CARD==
    this.add.image(centerX - 150, centerY + 50, "front").setScale(0.9);

    this.playerHead = new DevlingHead(
      this,
      centerX / 1.6,
      centerY - 10,
      this.playerDevling
    );
    this.playerHead.setScale(2);

    this.enemyHead = new DevlingHead(
      this,
      centerX + 200,
      centerY - 10,
      this.enemyDevling
    )
      .setScale(2)
      .setFlipX(true)
      .setDepth(2);

    //NAME
    this.playerCardName = this.playerDevling.name;
    console.log(this.devlingName);

    //NAME TEXT
    this.playerCardName = this.add
      .text(
        centerX - 150,
        centerY + 55,
        this.playerDevling.name.toUpperCase(),
        this.cardTextStyle()
      )
      .setOrigin(0.5);

    //
    //==ENEMY DEVLING CARD==
    this.enemyCard = this.add
      .image(centerX + 200, centerY + 50, "enemyfront")
      .setScale(0.9)
      .setOrigin(0.5);

    // ENEMY NAME

    this.enemyCardName = this.add
      .text(
        centerX + 200,
        centerY + 55,
        this.enemyDevling.name.toUpperCase(),
        this.cardTextStyle()
      )
      .setOrigin(0.5);

    //ENEMY STAT TEXT
    this.enemyCardStat = this.add
      .text(centerX + 200, centerY + 100, "", this.cardStatStyle())
      .setOrigin(0.5)
      .setAlpha(0);

    //
    //==STATS & NAV SETUP==
    this.statKeys = Object.keys(this.playerDevling).filter(
      (objKey) => typeof this.playerDevling[objKey] === "number"
    );

    this.statTextList = [];
    this.currentStatIndex = 0;

    this.statKeys.forEach((stat, i) => {
      //NAME COLUMN
      const nameText = this.add.text(centerX / 2.3, statY, stat.toUpperCase(), {
        fontSize: "10px",
        fontFamily: '"Press Start 2P"',
        fill: i === this.currentStatIndex ? "green" : "black",
      });

      //LVL COLUMN
      const lvlText = this.add.text(
        centerX - 142,
        statY,
        `   LVL${this.playerDevling[stat]}`,
        {
          fontSize: "10px",
          fontFamily: '"Press Start 2P"',
          fill: i === this.currentStatIndex ? "green" : "black",
        }
      );

      this.statTextList.push({ name: nameText, lvl: lvlText });
      statY += 15;
    });

    //==KEYBOARD CONTROLS==
    this.input.keyboard.on("keydown-UP", () => {
      if (!this.isRoundActive) this.navigateStat(-1);
    });

    this.input.keyboard.on("keydown-DOWN", () => {
      if (!this.isRoundActive) this.navigateStat(1);
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      if (!this.isRoundActive) this.compareStatValues();
    });

    //==ROUNDS; COUNTER & SETUP==

    this.roundCounterText = this.add
      .text(centerX, 20, "ROUND ONE", {
        fontSize: "16px",
        fontFamily: '"Press Start 2P"',
        fill: "#fff",
      })
      .setOrigin(0.5, 0)
      .setAlpha(0);

    this.roundSounds = {
      1: this.sound.add("roundOne"),
      2: this.sound.add("roundTwo"),
      3: this.sound.add("finalRound"),
    };

    this.startNextRound = () => {
      const roundNumber = this.usedStats.length + 1;
      const sound = this.roundSounds[roundNumber];

      if (sound) {
        this.isRoundActive = true;
        sound.play();

        this.time.delayedCall(sound.duration * 1000, () => {
          this.flipEnemyCardToBack();
          this.isRoundActive = false;
        });
      }
    };

    this.startNextRound();
  }

  cardTextStyle() {
    return {
      fontSize: "12px",
      fontFamily: '"Press Start 2P"',
      fill: "black",
    };
  }

  cardStatStyle() {
    return {
      fontSize: "25px",
      fontFamily: '"Press Start 2P"',
      fill: "black",
    };
  }

  statTextStyle(color) {
    return {
      fontSize: "10px",
      fontFamily: '"Press Start 2P"',
      fill: color,
    };
  }

  navigateStat(dir) {
    this.sound.play("nav");

    const total = this.statKeys.length;
    this.currentStatIndex = (this.currentStatIndex + dir + total) % total;

    this.statTextList.forEach((pair, i) => {
      const isActive = i === this.currentStatIndex;

      pair.name.setColor(isActive ? "green" : "black");
      pair.lvl.setColor(isActive ? "green" : "black");
    });
  }

  compareStatValues() {
    const stat = this.statKeys[this.currentStatIndex];
    if (this.usedStats.includes(stat)) return this.sound.play("error");

    this.sound.play("select");
    this.usedStats.push(stat);
    this.isRoundActive = true;

    this.flipCard(stat, () => {
      const player = this.playerDevling[stat];
      const enemy = this.enemyDevling.stats[stat];
      let result = "draw";

      if (player > enemy) {
        result = ` ${this.devlingName} win`;

        this.enemyLives--;
      } else if (player < enemy) {
        result = "Enemy win";
        this.playerLives--;
      }

      const usedText = this.statTextList[this.currentStatIndex];
      usedText.name.setColor("gray").setTint(0x888888).setAlpha(0.5);
      usedText.lvl.setColor("gray").setTint(0x888888).setAlpha(0.5);

      const resultText = this.add.text(
        this.cameras.main.centerX - 100,
        this.cameras.main.height - 100,
        `${stat.toUpperCase()} — ${result.toUpperCase()}`,
        {
          fontSize: "16px",
          fontFamily: "Press Start 2P",
          fill: "#ffff00",
        }
      );

      this.updateHealthBars();

      const gameOver =
        this.playerLives === 0 ||
        this.enemyLives === 0 ||
        this.usedStats.length >= 3;

      if (gameOver) {
        this.time.delayedCall(2000, () => {
          resultText.setText(
            this.playerLives > this.enemyLives
              ? `${this.devlingName} wins the match`
              : "Enemy devling wins the match"
          );
          this.time.delayedCall(2000, () => this.moveScene("overworldScene"));
        });
      } else {
        this.time.delayedCall(4000, () => {
          resultText.destroy();
          this.flipCardBack(() => this.startNextRound());
        });
      }
    });
  }

  flipCard(stat, cb) {
    this.enemyHead.setAlpha(0);
    this.tweens.add({
      targets: this.enemyCard,
      scaleX: 0,
      duration: 300,
      onComplete: () => {
        this.enemyCard.setTexture("enemyfront");
        this.enemyCardStat.setText(`${this.enemyDevling.name}`).setAlpha(1);
        this.enemyCardName
          .setText(this.enemyDevling.name.toUpperCase())
          .setAlpha(1);
        this.enemyCardStat.setText(`${stat.toUpperCase()}`).setAlpha(1);
        this.enemyCardStat
          .setText(`${this.enemyDevling.stats[stat]}`)
          .setAlpha(1);

        this.enemyHead.setAlpha(1);

        this.tweens.add({
          targets: this.enemyCard,
          scaleX: 0.8,
          duration: 300,
          onComplete: cb,
        });
      },
    });
  }

  flipCardBack(cb) {
    this.tweens.add({
      targets: [
        this.enemyHead,
        this.enemyCardStat,
        this.enemyCardName,
        this.questionMarks,
      ],
      alpha: 0,
      duration: 200,
      ease: "Power1",
    });

    this.tweens.add({
      targets: this.enemyCard,
      scaleX: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.enemyCard.setTexture("enemyback");
        this.enemyCardStat.setText("");

        this.tweens.add({
          targets: this.enemyCard,
          scaleX: 0.8,
          duration: 300,
          ease: "Power2",
          onComplete: () => {
            cb?.();
            this.roundCounterText.setText(
              `Round: ${this.usedStats.length + 1}`
            );
          },
        });
      },
    });
  }

  flipEnemyCardToBack() {
    this.tweens.add({
      targets: [
        this.enemyHead,
        this.enemyCardStat,
        this.enemyCardName,
        this.questionMarks,
      ],
      alpha: 0,
      duration: 200,
      ease: "Power1",
    });

    this.tweens.add({
      targets: this.enemyCard,
      scaleX: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.enemyCard.setTexture("enemyback");

        this.tweens.add({
          targets: this.enemyCard,
          scaleX: 0.8,
          duration: 300,
          ease: "Power2",
        });
      },
    });
  }

  createHealthBar(x, y) {
    const healthBarSprite = this.add
      .image(x, y, "healthFull")
      .setOrigin(0.5)
      .setScale(0.5);
    return healthBarSprite;
  }

  updateHealthBars() {
    const getHeathBarSprite = (lives) => {
      if (lives === 3) return "healthFull";
      if (lives === 2) return "healthMid";
      return "healthLow";
    };

    this.playerHealthBar.setTexture(getHeathBarSprite(this.playerLives));
    this.enemyHealthBar.setTexture(getHeathBarSprite(this.enemyLives));
  }

  moveScene() {
    this.sound.stopAll();
    this.input.keyboard.enabled = false;
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start("overworldScene", { from: "trumpScene" });
      this.input.keyboard.enabled = true;
    });
  }
}
