import Phaser from "phaser";
import Player from "../src/player.js";

export default class battleScene extends Phaser.Scene {
  constructor() {
    super("battleScene");
  }

  preload() {
    this.load.tilemapTiledJSON("dummyBattleMap", "assets/dummyBattleMap.json");
    this.load.image("dummyBattleMap", "assets/dummyBattleMap.png");
    this.load.spritesheet("playerSheet", "assets/dummy.png", {
      frameWidth: 32,
      frameHeight: 61,
    });
  }

  create() {
    this.doorTrigger = this.physics.add.sprite(350, 640, null);
    this.doorTrigger.setSize(110, 25);
    this.doorTrigger.setVisible(false);
    this.doorTriggered = false;

    const map = this.make.tilemap({ key: "dummyBattleMap" });

    const tilesets = map.addTilesetImage("dummyBattleMap", "dummyBattleMap");

    const mapLayer = map.createLayer("Tile Layer 1", tilesets, 0, 0);
    mapLayer.setScale(0.6);
    this.player = new Player(this, 300, 300, "playerSheet");

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  moveScene() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start("overworldScene");
    });
  }

  update() {
    this.player.update();

    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - this.player.width / 2,
      this.player.y - this.player.height / 5,
      this.player.width,
      this.player.height
    );

    const isOverlapping = Phaser.Geom.Intersects.RectangleToRectangle(
      playerBounds,
      this.doorTrigger.getBounds()
    );

    if (isOverlapping && !this.doorTriggered) {
      this.doorTriggered = true;
      this.moveScene();
    } else if (!isOverlapping && this.doorTriggered) {
      this.doorTriggered = false;
    }
  }
}
