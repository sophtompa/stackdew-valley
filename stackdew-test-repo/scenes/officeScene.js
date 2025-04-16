import Phaser from "phaser";

export default class officeScene extends Phaser.Scene {
  constructor() {
    super("officeScene");
  }
  //similar scene ould be added for player resting, switch map to show character in bed perhaps
  preload() {
    this.load.tilemapTiledJSON("dummyOfficeMap", "assets/dummyOfficeMap.json");
    this.load.image("dummyOfficeMap", "assets/dummyOfficeMap.png");
  }

  create() {
    const map = this.make.tilemap({ key: "dummyOfficeMap" });
    const tileset = map.addTilesetImage("dummyOfficeMap", "dummyOfficeMap");
    const mapLayer = map.createLayer("Tile Layer 1", tileset, 0, 0);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    //SPACE key for the scene transitions, player not actively in scene
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.moveScene();
    }
  }

  moveScene() {
    this.input.keyboard.enabled = false;
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start("overworldScene");
      this.input.keyboard.enabled = true;
    });
  }
}
