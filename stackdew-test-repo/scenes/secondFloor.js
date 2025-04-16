import Phaser from "phaser";
import Player from "../src/player.js";

export default class secondFloor extends Phaser.Scene {
  constructor() {
    super("secondFloor");
  }

  preload() {
    this.load.tilemapTiledJSON("theSecondFloor", "assets/theSecondFloor.JSON");
    this.load.image("theSecondFloor", "assets/theSecondFloor.png");
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

    const map = this.make.tilemap({ key: "theSecondFloor" });

    const tilesets = map.addTilesetImage("theSecondFloor", "theSecondFloor");

    const mapLayer = map.createLayer("Tile Layer 1", tilesets, 0, 0);

    mapLayer.setPosition(0, -300);

    mapLayer.setCollisionByProperty({ collide: true });

    // debugging the collisions
    mapLayer.renderDebug(this.add.graphics(), {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100),
    });

    this.player = new Player(this, 300, 300, "playerSheet");

    this.physics.add.collider(this.player, mapLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  moveScene() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start("firstFloor");
    });
  }

  update() {
    this.player.update();

    const playerBounds = new Phaser.Geom.Rectangle(
      this.player.x - this.player.width / 2,
      this.player.y - this.player.height / 2,
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
