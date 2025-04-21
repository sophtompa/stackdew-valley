import Phaser from "phaser";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super("titleScene")
    }
    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const titleText = this.add.text(centerX, centerY - 100, "StackDew Valley", {
            fontSize: "36px", 
            fill:"#FFFFFF"
        }).setOrigin(0.5);

        const madeBy = this.add.text(centerX - 165, centerY - 60, "made by the group of enthusiasts called:", {
            fontSize:"14px", 
            fill:"#FFFFFF"
        })

        const kenGit = this.add.text(centerX - 150, centerY, "Ken'Terria", {
            fontSize: "18px",
            fill: "#aaaaff",
        }).setOrigin(0.5).setInteractive();

        const tymurGit = this.add.text(centerX - 50, centerY, "Tymur", {
            fontSize: "18px",
            fill: "#aaaaff",
        }).setOrigin(0.5).setInteractive();

        const paulGit = this.add.text(centerX +  16, centerY, "Paul", {
            fontSize: "18px",
            fill: "#aaaaff",
        }).setOrigin(0.5).setInteractive();

        const chrisGit = this.add.text(centerX +  80, centerY, "Chris", {
            fontSize: "18px",
            fill: "#aaaaff",
        }).setOrigin(0.5).setInteractive();

        const sophieGit = this.add.text(centerX +  155, centerY, "Sophie", {
            fontSize: "18px",
            fill: "#aaaaff",
        }).setOrigin(0.5).setInteractive();
        
        const deanGit = this.add.text(centerX +  220, centerY, "Dean", {
            fontSize: "18px",
            fill: "#aaaaff",
        }).setOrigin(0.5).setInteractive();

        kenGit.on("pointerdown", () => {
            window.open("https://github.com/MuseOfCode", "_blank")
        });
        
        tymurGit.on("pointerdown", () => {
            window.open("https://github.com/papaparadox", "_blank")
        });

        paulGit.on("pointerdown", () => {
            window.open("https://github.com/testmango-sudo", "_blank")
        });

        chrisGit.on("pointerdown", () => {
            window.open("https://github.com/slightly76", "_blank")
        });
        
        sophieGit.on("pointerdown", () => {
            window.open("https://github.com/sophtompa", "_blank")
        }); 

        deanGit.on("pointerdown", () => {
            window.open("https://github.com/notyourimaginarycoder", "_blank")
        });

        this.add.text(centerX, centerY + 80, "Press SPACE to Start", {
            fontSize:"40px",
            fill:"#cccccc"
        }).setOrigin(0.5);

        this.input.keyboard.on("keydown-SPACE", () => {
            this.scene.start("firstFloor")
        });
    }
}