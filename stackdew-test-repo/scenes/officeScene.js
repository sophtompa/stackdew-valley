import Phaser from 'phaser';
import DialogueManager from '../src/dialogueManager.js';
import renderInventory from '../src/renderInventory.js';
import { userInventory } from '../src/dummydata.js';

export default class officeScene extends Phaser.Scene {
	constructor() {
		super('officeScene');
	}

	preload() {
		this.load.image('dummyOfficeMap', 'assets/dummyOfficeMap.png');
		this.load.audio('speechSound', '../assets/speechSound.wav');
	}

	create() {
		this.dialogue = new DialogueManager(this);
		this.renderInventory = new renderInventory(this);
		this.renderInventory.render(userInventory);

		const centerX = this.cameras.main.centerX;
		const centerY = this.cameras.main.centerY;

		// Add and center the image
		const officeImage = this.add
			.image(centerX, centerY + 120, 'dummyOfficeMap')
			.setOrigin(0.5);

		// Optional: Scale image to fit more of the screen
		const scaleX = this.cameras.main.width / officeImage.width;
		const scaleY = this.cameras.main.height / officeImage.height;
		const scale = Math.min(scaleX * 2.2, scaleY * 1.6);

		officeImage.setScale(scale);

		// Fade in effect
		this.cameras.main.fadeIn(1000, 0, 0, 0);

		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		this.dialogue.startDialogue(
			[
				{
					text: `This feature is under construction.`,
					speaker: '',
					color: '#1f451c',
				},
				{
					text: `Please come back at a later date to see how your Devlings have flourished.`,
					speaker: '',
					color: '#1f451c',
				},
				{
					text: `I love my job.`,
					speaker: 'left',
					color: '#1f451c',
					x: 260,
					y: 40,
				},
				{
					text: `Thanks CorthNoders!`,
					speaker: 'left',
					color: '#1f451c',
					x: 260,
					y: 40,
				},
			],
			null,
			220,
			365
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
			this.scene.start('overworldScene', { from: 'officeScene' });
			this.input.keyboard.enabled = true;
		});
	}
}
