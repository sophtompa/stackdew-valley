import { database } from "/src/dummydata.js";
import { enemyDevlings } from "../src/enemyDevlingData";
import DevlingHead from "../src/devlingHead";
import Player from "../src/player";
import DialogueManager from "../src/dialogueManager";

export default class TrumpBattle extends Phaser.Scene {
  constructor() {
    super("trumpBattle");
  }

  preload() {
    //background image
    this.load.image("background", "../assets/battlewithapproach.png");

    this.load.image("playerCard", "../assets/cardDesign/cardFront.png");
    // this.load.image("enemyCard", "../assets/cardDesign.png");

    //player card image (front of card)
    this.load.image("front", "../assets/cardDesign/cardFront.png");
    // this.load.image("front", "../assets/cardFront.png");

    //enemy card images (back and front of card)
    this.load.image("enemyfront", "../assets/cardDesign/redCardFront.png");
    // this.load.image("enemyfront", "../assets/cardDesign/cardFront.png");
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

    this.load.image("roundOneImg", "../assets/roundOneImg.png");
    this.load.image("roundTwoImg", "../assets/roundTwoImg.png");
    this.load.image("finalRoundImg", "../assets/finalRoundImg.png");

    this.load.image("QuestionMarks", "../assets/cardQuestionMarks.png");

    this.load.audio("speechSound", "../assets/speechSound.wav");

    database.forEach((devling) => {
      if (!devling.sprite || !devling.nameSound) return;
      this.load.audio(`${devling.name}Sound`, devling.nameSound);
    });

    enemyDevlings.forEach((devling) => {
      if (!devling.sprite || !devling.nameSound) return;
      this.load.audio(`${devling.name}Sound`, devling.nameSound);
    });

    this.load.audio("backgroundMusic", "../assets/sounds/backgroundMusic.mp3");
  }

  create() {
    //initialise dialogue manager
    this.dialogue = new DialogueManager(this);
    this.isDialogueRunning = false;

    this.anims.create({
      key: "flame",
      frames: this.anims.generateFrameNumbers("fire", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    const flame1 = this.add.sprite(47, 329, "fire");
    const flame2 = this.add.sprite(750, 41, "fire");
    flame1.play("flame").setScale(2.5).setFrame(3);
    flame2.play("flame").setScale(2.5);

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

    this.playerSprite = new Player(
      this,
      centerX - 20,
      centerY - 10,
      "playerSheet",
      false
    );
    //this.playerSprite.setScale(2);

    this.add.image(0, 0, "background").setOrigin(0).setDepth(-1);

    this.playerSprite.anims.play("standing");
    this.playerSprite.anims.setCurrentFrame(
      this.playerSprite.anims.currentAnim.frames[2]
    );

    this.mitchSprite = new Player(
      this,
      centerX + 80,
      centerY - 10,
      "mitchSheet",
      false
    );
    //this.mitchSprite.setScale(2);
    this.mitchSprite.flipX = true;
    this.mitchSprite.anims.play("mitchStanding");
    this.mitchSprite.anims.setCurrentFrame(
      this.mitchSprite.anims.currentAnim.frames[3]
    );

    this.bossSprite = new Player(
      this,
      centerX + 30,
      centerY - 200,
      "bossSheet",
      false
    );
    //this.bossSprite.setScale(2);
    this.bossSprite.flipX = true;

    this.bossSprite.play("bossStanding");

    this.questionMarks = this.add
      .image(centerX + 209, centerY + 117, "QuestionMarks")

      .setScale(0.6)
      .setDepth(3);

    this.vsImage = this.add.image(centerX + 30, centerY + 30, "vsImage");
    this.vsImage.setAlpha(0);
    this.vsImage.setDepth(100);

    this.usedStats = [];
    this.playerLives = 3;
    this.enemyLives = 3;
    this.isRoundActive = false;
    this.isFirstRound = true;

    this.isFlipping = false;

    //==CHOSEN PLAYER & ENEMY DEVLING
    this.playerDevling = database[0];
    this.enemyDevling = enemyDevlings[2];

    //
    //==HEALTHBAR=
    this.playerHealthBar = this.createHealthBar(100, 50);
    this.enemyHealthBar = this.createHealthBar(cam.width - 100, 50);
    this.enemyHealthBar.flipX = true;

    this.playerHealthBar.originalX = this.playerHealthBar.x;
    this.playerHealthBar.originalY = this.playerHealthBar.y;

    this.enemyHealthBar.originalX = this.enemyHealthBar.x;
    this.enemyHealthBar.originalY = this.enemyHealthBar.y;

    //VERTICAL DISTANCE FOR PLAYER CARD
    let statY = centerY + 73;

    //==PLAYER DEVLING CARD==
    this.add.image(centerX - 160, centerY + 50, "front").setScale(0.9);

    this.playerHead = new DevlingHead(
      this,
      centerX - 155,
      centerY - 6,
      this.playerDevling
    );
    this.playerHead.setScale(2);

    this.enemyHead = new DevlingHead(
      this,
      centerX + 205,
      centerY - 6,
      this.enemyDevling
    )
      .setScale(2)
      .setFlipX(true)
      .setDepth(1);

    //NAME
    this.playerCardName = this.playerDevling.name;
    console.log(this.devlingName);

    //NAME TEXT
    this.playerCardName = this.add
      .text(
        centerX - 158,
        centerY + 55,
        this.playerDevling.name.toUpperCase(),
        this.cardTextStyle()
      )
      .setOrigin(0.5);

    //
    //==ENEMY DEVLING CARD==
    this.enemyCard = this.add
      .image(centerX + 210, centerY + 50, "enemyfront")
      .setScale(0.9)
      .setOrigin(0.5);

    // ENEMY NAME

    this.enemyCardName = this.add
      .text(
        centerX + 210,
        centerY + 55,
        this.enemyDevling.name.toUpperCase(),
        this.cardTextStyle()
      )
      .setOrigin(0.5);

    //ENEMY STAT TEXT
    this.enemyCardStat = this.add
      .text(centerX + 210, centerY + 100, "", this.cardStatStyle())
      .setOrigin(0.5)
      .setAlpha(0);

    this.nameSounds = {
      playerName: this.sound.add(`${this.playerDevling.name}Sound`),
      vsSound: this.sound.add("vsSound"),
      enemyName: this.sound.add(`${this.enemyDevling.name}Sound`),
    };

    //
    //==STATS & NAV SETUP==
    this.statKeys = Object.keys(this.playerDevling).filter(
      (objKey) => typeof this.playerDevling[objKey] === "number"
    );

    this.statTextList = [];
    this.currentStatIndex = 0;

    this.statKeys.forEach((stat, i) => {
      //NAME COLUMN
      const nameText = this.add.text(centerX / 2.4, statY, stat.toUpperCase(), {
        fontSize: "10px",
        fontFamily: '"Press Start 2P"',
        fill: i === this.currentStatIndex ? "green" : "black",
      });

      //LVL COLUMN
      const lvlText = this.add.text(
        centerX - 152,
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

    this.startNextRound();
  }

  startNextRound() {
    const roundNumber = this.usedStats.length + 1;
    const roundSound = this.roundSounds[roundNumber];

    if (!roundSound) return;

    this.isRoundActive = true;

    const roundImageMap = {
      1: "roundOneImg",
      2: "roundTwoImg",
      3: "finalRoundImg",
    };

    const imageKey = roundImageMap[roundNumber];

    if (this.isFirstRound) {
      this.isFirstRound = false;

      const { playerName, vsSound, enemyName } = this.nameSounds;

      playerName.play();
      this.playerHead.playAnimation("win");

      this.time.delayedCall(playerName.duration * 1000, () => {
        this.vsImage.setAlpha(1);
        vsSound.play();

        this.tweens.add({
          targets: this.vsImage,
          scale: 1.5,
          alpha: 0,
          duration: 1000,
          onComplete: () => this.vsImage.setAlpha(0),
        });

        this.time.delayedCall(vsSound.duration * 1000, () => {
          enemyName.play();
          this.enemyHead.playAnimation("win");

          this.time.delayedCall(enemyName.duration * 1000, () => {
            this.showRoundTransition(imageKey, roundSound.key);

            roundSound.play();

            this.time.delayedCall(roundSound.duration * 1000, () => {
              this.flipEnemyCardToBack();
              this.isRoundActive = false;
            });
          });
        });
      });
    } else {
      this.showRoundTransition(imageKey, roundSound.key);
      roundSound.play();
      // this.roundImages = this.add
      //   .image(centerY + 15, imageKey)
      //   .setScale(0.9)
      //   .setOrigin(0.5);

      this.time.delayedCall(roundSound.duration * 1000, () => {
        this.isRoundActive = false;
      });
    }
  }

  cardTextStyle() {
    return {
      fontSize: "15px",
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
      fontSize: "60px",
      fontFamily: '"Press Start 2P"',
      fill: color,
    };
  }

  showRoundTransition(imageKey, soundKey) {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const roundImg = this.add
      .image(centerX, centerY + 10, imageKey)
      .setAlpha(0)
      .setDepth(2);

    // Play sound
    this.sound.play(soundKey);

    this.tweens.add({
      targets: roundImg,
      alpha: 1,
      scale: 1.5,
      duration: 500,
      ease: "Power2",
      delay: 500,
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: roundImg,
            alpha: 0,
            scale: 1,
            duration: 500,
            ease: "Power2",
            onComplete: () => roundImg.destroy(),
          });
        });
      },
    });
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
        this.playerHead.playAnimation("win");
        this.enemyHead.playAnimation("lose");
        //this.bigBoss.playAnimation('talk');

        result = `  ${this.playerDevling.name} wins!`;
        // this.dialogue.startDialogue(
        // 	[
        // 		{
        // 			text: `${this.devlingName} wins!`,
        // 			speaker: '',
        // 			color: '#1f451c',
        // 		},
        // 	],
        // 	null,
        // 	315,
        // 	350
        // );

        this.enemyLives--;
        this.shakeHealthBar(this.enemyHealthBar);
      } else if (player < enemy) {
        this.playerHead.playAnimation("lose");
        this.enemyHead.playAnimation("win");
        // this.bigBoss.playAnimation("talk");

        result = `${this.enemyDevling.name} wins!`;
        this.playerLives--;
        this.shakeHealthBar(this.playerHealthBar);
        this.cameras.main.shake(100, 0.005);
      }

      const usedText = this.statTextList[this.currentStatIndex];
      usedText.name.setColor("gray").setTint(0x888888).setAlpha(0.5);
      usedText.lvl.setColor("gray").setTint(0x888888).setAlpha(0.5);

      const resultText = "";
      // this.add.text(
      // 	this.cameras.main.centerX - 100,
      // 	this.cameras.main.height - 100,
      // 	`${stat.toUpperCase()} — ${result.toUpperCase()}`,
      // 	{
      // 		fontSize: '16px',
      // 		fontFamily: 'Press Start 2P',
      // 		fill: '#ffff00',
      // 	}
      // );

      this.dialogue.startDialogue(
        [
          {
            text: `${stat.toUpperCase()} — ${result}`,
            speaker: "",
            color: "#1f451c",
          },
        ],
        null,
        270,
        350
      );

      this.updateHealthBars();

      const playerDevlingWins = 3 - this.enemyLives;
      const enemyDevlingWins = 3 - this.playerLives;

      const gameOver =
        playerDevlingWins === 2 ||
        enemyDevlingWins === 2 ||
        this.usedStats.length >= 3;

      // if (gameOver) {
      // 	this.time.delayedCall(2000, () => {
      // 		resultText.setText(
      // 			this.playerLives > this.enemyLives
      // 				? `Your devling has been hired.`
      // 				: `Mitch's devling has been hired`
      // 		);

      // if (gameOver) {
      // 	this.time.delayedCall(2000, () => {
      // 		resultText.setText(
      // 			this.playerLives > this.enemyLives
      // 				? this.dialogue.startDialogue(
      // 						[
      // 							{
      // 								text: `Congratulations! ${this.playerDevling.name} has been hired!`,
      // 								speaker: '',
      // 								color: '#1f451c',
      // 							},
      // 						],
      // 						null,
      // 						200,
      // 						350
      // 				  )
      // 				: this.dialogue.startDialogue(
      // 						[
      // 							{
      // 								text: `Unfortunately, ${this.enemyDevling.name} has been hired!`,
      // 								speaker: '',
      // 								color: '#1f451c',
      // 							},
      // 						],
      // 						null,
      // 						200,
      // 						350
      // 				  )
      // 		);
      // 		this.time.delayedCall(2000, () => this.moveScene('overworldScene'));
      // 	});
      // } else {
      // 	this.time.delayedCall(4000, () => {
      // 		//resultText.destroy();
      // 		this.flipCardBack(() => this.startNextRound());
      // 	});
      // }

      if (gameOver) {
        this.time.delayedCall(2500, () => {
          if (this.playerLives > this.enemyLives) {
            const announceName = this.playerDevling.name.toUpperCase();
            this.dialogue.startDialogue(
              [
                {
                  text: `  YAY! ${announceName} GOT THE JOB!!!`,
                  speaker: "",
                  color: "#1f451c",
                  X: 230,
                  Y: 350,
                },
              ],
              null,
              260,
              350
            );
          } else {
            this.dialogue.startDialogue(
              [
                {
                  text: `Unfortunately, ${this.enemyDevling.name} has been hired!`,
                  speaker: "",
                  color: "#1f451c",
                },
              ],
              null,
              200,
              350
            );
          }

          this.time.delayedCall(2000, () => this.moveScene("overworldScene"));
        });
      } else {
        this.time.delayedCall(4000, () => {
          this.flipCardBack(() => this.startNextRound());
        });
      }
    });
  }

  shakeHealthBar(bar) {
    this.tweens.add({
      targets: bar,
      x: bar.x + Phaser.Math.Between(-5, 5),
      y: bar.y + Phaser.Math.Between(-5, 5),
      duration: 50,
      yoyo: true,
      repeat: 4,
      ease: "Sine.easeInOut",
      onComplete: () => {
        bar.setPosition(bar.originalX, bar.originalY);
      },
    });
  }

  flipCard(stat, cb) {
    this.isFlipping = true;
    this.enemyHead.setAlpha(0);

    //hide text before flip ends
    this.enemyCardStat.setAlpha(0);
    this.enemyCardName.setAlpha(0);

    this.tweens.add({
      targets: this.enemyCard,
      scaleX: 0,
      duration: 300,
      onComplete: () => {
        this.enemyCard.setTexture("enemyfront");
        this.enemyCardName.setText(this.enemyDevling.name.toUpperCase());
        this.enemyCardStat.setText(`${this.enemyDevling.stats[stat]}`);
        this.enemyHead.setAlpha(0); // Ensure it's hidden before fade-in

        // Flip back first
        this.tweens.add({
          targets: this.enemyCard,
          scaleX: 0.9,
          duration: 300,
          onComplete: () => {
            // Now fade in text and head AFTER flip completes
            this.tweens.add({
              targets: [this.enemyCardStat, this.enemyCardName, this.enemyHead],
              alpha: 1,
              duration: 300,
              onComplete: () => {
                this.isFlipping = false;
                cb();
              },
            });
          },
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
          scaleX: 0.9,
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
          scaleX: 0.9,
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
      .setScale(0.6);
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

  // transitionToNextScene() {
  //   // Clear any existing objects and reload the spritesheets
  //   this.scene.start("newScene"); // or use other transition logic

  //   // Force reloading the sprite and animation by recreating them
  //   this.scene.events.once("shutdown", () => {
  //     // Clear the sprite or animation if necessary
  //     this.playerHead.destroy();
  //     this.enemyHead.destroy();
  //   });
  // }

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
