import Phaser from "phaser";

export default class ComputerScene extends Phaser.Scene {
  constructor() {
    super("ComputerScene");
  }

  //DOM inout field has been added inside this cene and have disabled keyboard input
  //Minigames, tasks, etc that player needs to do to gain teaching material perhaps
  //feedback, etc to add for the player

  //may only pop up for player to recieve teaching material and not when player is getting new devlings?
  create() {
    this.add.text(50, 50, "ZE COMPUTER", { fontSize: "32px", fill: "#0f0" });

    const input = this.add.dom(400, 300, "input", {
      type: "text",
      fontSize: "20px",
      width: "400px",
    });

    input.setOrigin(0.5);

    //no need to click
    input.node.focus();

    this.input.keyboard.enabled = false;

    //ordinary event listen for this
    input.node.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const answer = input.node.value.trim();
        if (answer === "haha") {
          this.scene.start("firstFloor");
        } else {
          input.node.value = "";
        }
      }
    });
  }
}
