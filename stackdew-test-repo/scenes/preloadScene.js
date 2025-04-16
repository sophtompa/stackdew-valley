import Phaser from "phaser";

export default class preloadScene extends Phaser.Scene {
  constructor() {
    super("preloadScene");
  }

  preload() {
    this.load.image("logo", "./assets/CN logo.png");
  }

  create() {
    this.add.image(400, 300, "logo");
    this.add.text(20, 550, "Overworld Test Project", {
      fontSize: "32px",
      fill: "#fff",
    });

    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.time.delayedCall(1000);
      this.moveScene();
    }
  }

  moveScene() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("secondFloor");
    });
  }
}
