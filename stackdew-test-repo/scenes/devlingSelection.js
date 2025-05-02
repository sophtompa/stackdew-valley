import { database } from "/src/dummydata.js";
import { enemyDevlings } from "../src/enemyDevlingData";
import DevlingHead from "../src/devlingHead";
import Player from "../src/player";
import DialogueManager from "../src/dialogueManager";
import { userInventory } from "../src/dummydata";

export default class DevlingSelection extends Phaser.Scene {
  constructor() {
    super("devlingSelection");
  }

  preload() {
    //background image
    this.load.image("background", "../assets/battlewithapproach.png");
    this.load.image("playerCard", "../assets/cardDesign/cardFront.png");

    //player card image (front of card)
    this.load.image("front", "../assets/cardDesign/cardFront.png");

    //enemy card images (back and front of card)
    this.load.image("enemyfront", "../assets/cardDesign/redCardFront.png");

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

    this.load.audio("backgroundMusic", "../assets/sounds/backgroundMusic.mp3");

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
    this.dialogue = new DialogueManager(this);
    this.isDialogueRunning = false;

    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.2,
    });

    const cam = this.cameras.main;
    const centerX = cam.centerX;
    const centerY = cam.centerY;
    this.enemyDevling = enemyDevlings[2];

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

    //filtering
    this.grownDevlings = database.filter(
      (devling) => devling.isGrown === true && devling.hasBattled === false
    );
    this.currentDevlingIndex = 0;

    //first by default
    this.playerDevling = this.grownDevlings[this.currentDevlingIndex];

    //show head and name
    this.playerHead = new DevlingHead(
      this,
      centerX - 155,
      centerY - 6,
      this.playerDevling
    ).setScale(2);

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
      (objKey) =>
        typeof this.playerDevling[objKey] === "number" &&
        objKey !== "plantX" &&
        objKey !== "plantY"
    );

    this.statTextList = [];
    this.currentStatIndex = 0;

    this.statKeys.forEach((stat, i) => {
      //NAME COLUMN
      const nameText = this.add.text(centerX / 2.4, statY, stat.toUpperCase(), {
        fontSize: "10px",
        fontFamily: '"Press Start 2P"',
        fill: "black",
      });

      //LVL COLUMN
      const lvlText = this.add.text(
        centerX - 152,
        statY,
        `   LVL${this.playerDevling[stat]}`,
        {
          fontSize: "10px",
          fontFamily: '"Press Start 2P"',
          fill: "black",
        }
      );

      this.statTextList.push({ name: nameText, lvl: lvlText });
      statY += 15;
    });

    // Set up input keys to switch devlings
    this.input.keyboard.on("keydown-LEFT", () => {
      this.sound.play("nav");
      this.switchDevling(-1);
    });

    this.input.keyboard.on("keydown-RIGHT", () => {
      this.sound.play("nav");
      this.switchDevling(1);
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      this.sound.play("select");
      this.startBattle();
    });

    //update the sprite & name UI
    this.updatePlayerDevlingInfo = (centerX, centerY) => {
      this.playerHead.destroy();
      this.playerHead = new DevlingHead(
        this,
        centerX - 155,
        centerY - 6,
        this.playerDevling
      ).setScale(2);

      this.playerCardName.setText(this.playerDevling.name.toUpperCase());

      //stats update
      this.statTextList.forEach((stat, i) => {
        stat.lvl.setText(`   LVL${this.playerDevling[this.statKeys[i]]}`);
      });
    };

    this.switchDevling = (direction) => {
      this.currentDevlingIndex += direction;
      if (this.currentDevlingIndex < 0) {
        this.currentDevlingIndex = this.grownDevlings.length - 1;
      } else if (this.currentDevlingIndex >= this.grownDevlings.length) {
        this.currentDevlingIndex = 0;
      }
      this.playerDevling = this.grownDevlings[this.currentDevlingIndex];
      this.updatePlayerDevlingInfo(centerX, centerY); //for updating the heads, stats and name
    };

    //only start battle when devling is selected
    this.startBattle = () => {
      if (this.hasSelectedDevling) return;
      this.hasSelectedDevling = true;

      const name = this.playerDevling.name;

      const userIndex = userInventory.findIndex(
        (devling) => devling.name === name
      );
      if (userIndex !== -1) {
        userInventory.splice(userIndex, 1);
      }

      const dbIndex = database.findIndex((devling) => devling.name === name);
      if (dbIndex !== -1) {
        database[dbIndex].hasBattled = "true";
      }
      // this.hasSelectedDevling = false;
      this.time.delayedCall(2000, () => {
        this.scene.start("trumpBattle", {
          playerDevling: this.playerDevling,
          // userInventory: this.userInventory,
        });
      });
    };
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

  createHealthBar(x, y) {
    const healthBarSprite = this.add
      .image(x, y, "healthFull")
      .setOrigin(0.5)
      .setScale(0.6);
    return healthBarSprite;
  }
}
