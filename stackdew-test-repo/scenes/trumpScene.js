import { database } from "/src/dummydata.js";
import { enemyDevlings } from "../src/enemyDevlingData";
import DevlingHead from "../src/devlinghead";
import { preloadBattleAssets } from "./utils/battleAssets";
import { createDevlings } from "./utils/createDevlings";
import { devilingCardDesign, playerStatDesign } from "./utils/cardUI";
import { inputControls } from "./utils/input";
import { createHealthBars } from "./utils/Healthbars";

export default class trumpBattle extends Phaser.Scene {
  constructor() {
    super("trumpBattle");
  }

  preload() {
    preloadBattleAssets(this, database, enemyDevlings);
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

    this.vsImage = this.add.image(centerX, centerY, "vsImage");
    this.vsImage.setAlpha(0);
    this.swishSound = this.sound.add("swish");

    this.boss = database[6];
    this.bigBoss = new DevlingHead(this, centerX + 10, centerY - 250, this.boss)
      .setScale(3)
      .setFlipX(true);

    this.usedStats = [];
    this.playerLives = 3;
    this.enemyLives = 3;
    this.isRoundActive = false;
    this.isFirstRound = true;

    //healthbars
    this.playerHealthBar = createHealthBars(this, 100, 50);
    this.enemyHealthBar = createHealthBars(this, cam.width - 100, 50);
    this.enemyHealthBar.flipX = true;

    //===CHOSEN PLAYER & ENEMY DEVLING===
    const { playerDevling, enemyDevling } = createDevlings(
      this,
      database,
      enemyDevlings
    );
    this.enemyDevling = enemyDevling;
    this.playerDevling = playerDevling;

    this.nameSounds = {
      playerName: this.sound.add(`${this.playerDevling.name}Sound`),
      vsSound: this.sound.add("vsSound"),
      enemyName: this.sound.add(`${this.enemyDevling.name}Sound`),
    };

    //==DEVLING CARDS==
    const {
      playerCardName,
      enemyCard,
      enemyCardName,
      questionMarks,
      enemyCardStat,
    } = devilingCardDesign(this, this.playerDevling, this.enemyDevling);
    this.enemyCard = enemyCard;
    this.playerCardName = playerCardName;
    this.enemyCardName = enemyCardName;
    this.questionMarks = questionMarks;
    this.enemyCardStat = enemyCardStat;

    //===HEADS===
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
      .setFlipX(true);

    //==STATS & NAV SETUP==

    const { statTextList, statKeys, currentStatIndex } = playerStatDesign(
      this,
      this.playerDevling,
      centerX,
      centerY + 75
    );

    this.statTextList = statTextList;
    this.statKeys = statKeys;
    this.currentStatIndex = currentStatIndex;

    //==KEYBOARD CONTROLS==

    inputControls(this);

    //==ROUNDS; COUNTER & IMG & SETUP==

    this.roundOneImg = this.add.image(centerX, centerY, "roundOneImg");
    this.roundOneImg.setAlpha(0);

    this.tweens.add({
      targets: this.roundOneImg,
      alpha: 1,
      scale: 1.5,
      duration: 500,
      ease: "Power2",
      delay: 5000,
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: this.roundOneImg,
            alpha: 0,
            scale: 1,
            ease: "Power2",
            onComplete: () => {
              // this.sound.play("roundOne");
              this.roundOneImg.destroy();
            },
          });
        });
      },
    });

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

    this.startNextRound();
  }

  startNextRound() {
    const roundNumber = this.usedStats.length + 1;
    const roundSound = this.roundSounds[roundNumber];

    if (!roundSound) return;

    this.isRoundActive = true;

    if (this.isFirstRound) {
      this.isFirstRound = false;

      this.nameSounds.playerName.play();

      this.time.delayedCall(this.nameSounds.playerName.duration * 1000, () => {
        this.vsImage.setAlpha(1);
        this.nameSounds.vsSound.play();

        this.tweens.add({
          targets: this.vsImage,
          scale: 1.5,
          alpha: 0,
          duration: 1000,
          onComplete: () => this.vsImage.setAlpha(0),
        });

        // after VS sound, play enemy name
        this.time.delayedCall(this.nameSounds.vsSound.duration * 1000, () => {
          this.nameSounds.enemyName.play();

          this.time.delayedCall(
            this.nameSounds.enemyName.duration * 1000,
            () => {
              roundSound.play();

              this.time.delayedCall(roundSound.duration * 1000, () => {
                this.flipEnemyCardToBack();
                this.isRoundActive = false;
              });
            }
          );
        });
      });
    } else {
      roundSound.play();

      this.time.delayedCall(roundSound.duration * 1000, () => {
        this.isRoundActive = false;
      });
    }
  }

  ///
  ///
  /// ==METHODS==
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
        this.playerHead.playAnimation("win");
        this.enemyHead.playAnimation("lose");
        result = ` ${this.devlingName} win`;

        this.enemyLives--;
      } else if (player < enemy) {
        this.playerHead.playAnimation("lose");
        this.enemyHead.playAnimation("win");

        result = "Enemy win";
        this.playerLives--;
      }

      //visual cue for used stats
      const usedText = this.statTextList[this.currentStatIndex];
      usedText.name.setColor("gray").setTint(0x888888).setAlpha(0.5);
      usedText.lvl.setColor("gray").setTint(0x888888).setAlpha(0.5);

      //results of each match and what stat
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
          -resultText.setText(
            this.playerLives > this.enemyLives
              ? `${this.devlingName} wins the match`
              : "Enemy devling wins the match"
          );
          this.time.delayedCall(2000, () => this.scene.start("overworldScene"));
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
        this.enemyCardStat.setText(`${this.enemyDevling[stat]}`).setAlpha(1);

        this.enemyCardName
          .setText(this.enemyDevling.name.toUpperCase())
          .setAlpha(1);
        this.enemyCardStat
          .setText(`${this.enemyDevling.stats[stat]}`)
          .setAlpha(1);

        this.enemyHead.setAlpha(1);

        this.tweens.add({
          targets: this.enemyCard,
          scaleX: 0.8,
          duration: 300,
          onComplete: () => {
            this.swishSound.play();
            if (cb) cb();
          },
        });
      },
    });
  }

  flipCardBack(cb) {
    //TOGETHER
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

  updateHealthBars() {
    const getHeathBarSprite = (lives) => {
      if (lives === 3) return "healthFull";
      if (lives === 2) return "healthMid";
      return "healthLow";
    };

    this.playerHealthBar.setTexture(getHeathBarSprite(this.playerLives));
    this.enemyHealthBar.setTexture(getHeathBarSprite(this.enemyLives));
  }
}