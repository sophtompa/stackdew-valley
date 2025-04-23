import Phaser from 'phaser';
import DialogueManager from '../src/dialogueManager.js';

export default class loreScene extends Phaser.Scene {
	constructor() {
		super('loreScene');
	}
	preload() {
		this.load.audio('speechSound', '../assets/speechSound.wav');
		this.load.spritesheet('playerSheet', 'assets/rose.png', {
			frameWidth: 32,
			frameHeight: 65,
		});
	}
	create() {
		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);

		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		this.anims.create({
			key: 'roseIdle', // Name of your animation
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 130,
				end: 135,
			}),
			frameRate: 3, // Adjust speed as needed
			repeat: -1, // -1 = infinite loop
		});

		const rose = this.add.sprite(200, 170, 'playerSheet');

		rose.setScale(2.5);
		rose.play('roseIdle');
		this.sound.volume = 0.2;

		this.dialogue.startDialogue(
			[
				{
					text: `You are Rose, a tutor at coding bootcamp CorthNoders. Your work from home job involves imparting knowledge to your bootcamp students, affectionately known as Devlings.`,
					speaker: '',
					color: '#1f451c',
					x: 350,
					y: 120,
				},
				{
					text: `Welcome ... to StackDew Valley.`,
					speaker: '',
					color: '#1f451c',
					x: 350,
					y: 160,
				},
			],
			() => {
				this.time.delayedCall(1000, () => {
					this.moveScene('firstFloor');
				});
			},
			350,
			160
		);
	}

	update() {}

	moveScene(target) {
		this.input.keyboard.enabled = false;
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		this.time.delayedCall(1000, () => {
			this.scene.start(target);
			this.input.keyboard.enabled = true;
		});
	}
}
